import { Injectable } from '@angular/core';
import { Song } from '@app/shared';
import { ActionHandler, ActionHandlerOptions, MediaSession } from '@jofr/capacitor-media-session';
import { Media, MEDIA_STATUS, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UtilsService } from '@services/utils.service';
import { RangeCustomEvent } from '@ionic/angular';
import { SystemService } from '@services/system.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {

  private subscriptionPlayer: Subscription | undefined;

  /** Player song instance.  */
  private player!: MediaObject;

  /** Playing song. */
  readonly song = new BehaviorSubject<Song | null>(null);

  /** Whether the song is playing. */
  readonly isPlaying = new BehaviorSubject<boolean>(false);

  /** Progress control value. */
  readonly progressControl = new BehaviorSubject<number>(0);

  /** Player interval instance. */
  private playerInterval!: ReturnType<typeof setInterval>;

  /** Whether the progress control knob is moving. */
  private progressControlMoving = false;

  /** PLayer current progress in time (mm:ss). */
  readonly progressTime = new BehaviorSubject<string>('00:00');

  /** PLayer duration in time (mm:ss). */
  readonly durationTime = new BehaviorSubject<string>('00:00');

  constructor(private media: Media,
              private systemService: SystemService) {
  }

  initiate(song: Song): void {

    /** Set the song. */
    this.song.next(song);

    /** Initiate the player. */
    this.playerInitiate(song);

    /** Initiate the media session. */
    this.mediaSessionInitiate(song);
  }

  playerInitiate(song: Song): void {

    /** Stop the player initially anyway. */
    if (this.player) {
      this.player.stop();
    }

    /** Set and create the player. */
    this.player = this.media.create(song.init.path);

    /** Watch for the player status. */
    this.subscriptionPlayer?.unsubscribe();
    this.subscriptionPlayer = this.player.onStatusUpdate.subscribe({
      next: (status: MEDIA_STATUS): void => {
        /** Clear the interval initially. */
        clearInterval(this.playerInterval);

        /** Update the progress if the song is playing. */
        if (status === MEDIA_STATUS.RUNNING) {
          this.playerInterval = setInterval((): void => {
            this.player.getCurrentPosition().then((position: number): void => {

              /** Update the media session. */
              this.mediaSessionPositionState(position);

              /** Set the song duration time. */
              this.durationTime.next(UtilsService.secondsToTime(this.player.getDuration()));

              /** Set the player current progress if progress knob is not moving. */
              if (!this.progressControlMoving) {
                this.progressControl.next((position / this.player.getDuration()) * 100);
                this.progressTime.next(UtilsService.secondsToTime(position));
              }
            });
          }, 100);
        }

        /** {@link isPlaying} */
        this.isPlaying.next(status === MEDIA_STATUS.RUNNING);
        MediaSession.setPlaybackState({ playbackState: this.isPlaying.value ? 'playing' : 'paused' }).then();
      },
    });

    /** Play it. */
    this.player.play();
  }

  mediaSessionPositionState(position: number): void {
    MediaSession.setPositionState({
      duration: this.player.getDuration(),
      position: position,
    }).then();
  }

  mediaSessionInitiate(song: Song): void {

    /** Set the Metadata */
    const sizes: string[] = [
      '96x96',
      '128x128',
      '192x192',
      '256x256',
      '384x384',
      '512x512',
    ];
    MediaSession.setMetadata({
      title: song.init.title,
      artist: song.init.author,
      artwork: sizes.map((size: string): MediaImage => {
        return { src: song.init.thumbnail, sizes: size, type: 'image/png' };
      }),
    }).then();

    /** Set the handlers. */
    const handlers: { action: ActionHandlerOptions['action']; handler: ActionHandler; }[] = [
      {
        action: 'play',
        handler: (): void => {
          this.togglePlayer();
        },
      },
      {
        action: 'pause',
        handler: (): void => {
          this.togglePlayer();
        },
      },
      {
        action: 'previoustrack',
        handler: (): void => {
          this.changeTrack(false);
        },
      },
      {
        action: 'nexttrack',
        handler: (): void => {
          this.changeTrack(true);
        },
      },
      {
        action: 'stop',
        handler: (): void => {
          this.destroy();
        },
      },
      {
        action: 'seekto',
        handler: (action: { action: MediaSessionAction; seekTime?: number | null; }): void => {
          if (action.seekTime) {
            this.player.seekTo(action.seekTime * 1000);
          }
        },
      },
    ];
    for (const handler of handlers) {
      MediaSession.setActionHandler({ action: handler.action }, handler.handler).then();
    }

    /** Show it up. */
    MediaSession.setPlaybackState({ playbackState: 'playing' }).then();
  }

  destroy(): void {
    this.song.next(null);
    if (this.isPlaying.value) {
      this.player.stop();
    }
    MediaSession.setPlaybackState({ playbackState: 'none' }).then();
  }

  seekTo(event: RangeCustomEvent): void {
    if (event.detail.value === 0) {
      event.detail.value = 0.1;
    }
    this.player.seekTo((this.player.getDuration() * (Number(event.detail.value) / 100)) * 1000);
    this.toggleProgressControlStatus();
  }

  toggleProgressControlStatus(): void {
    this.progressControlMoving = !this.progressControlMoving;
  }

  updateProgressControl(progress: number): void {
    if (this.progressControlMoving) {
      this.progressTime.next(UtilsService.secondsToTime((this.player.getDuration() / 100) * progress));
    }
  }

  togglePlayer(): void {
    if (this.isPlaying.value) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  changeTrack(next: boolean): void {
    let change: number = -1;
    if (next) {
      change = 1;
    }

    /** Songs list. */
    const songs: Song[] = this.systemService.songs.value;

    /** If we have songs with playing song. */
    if (this.song.value) {
      const index: number = songs.findIndex((item: Song): boolean => (
        item.init.video_id === this.song.value?.init.video_id
      ));

      /** Go to next song. */
      if (next) {

        /** If current song is not the last song, play the next song. */
        if (index !== songs.length - 1) {
          this.playIndex(index + change);
        }

        /** If current song is the last song, play the first song of the list. */
        else {
          this.playIndex(0);
        }
      }

      /** Go to previous song. */
      else {

        /** If current song is not the first song, play the previous song. */
        if (index !== 0) {
          this.playIndex(index + change);
        }

        /** If current song is the first song, play the last song of the list. */
        else {
          this.playIndex(songs.length - 1);
        }
      }
    }
  }

  playIndex(index: number): void {

    /** List of songs. */
    const songs: Song[] = this.systemService.songs.value;

    /** If given index exists, play the song. */
    if (songs[index]) {
      this.initiate(songs[index]);
    }

    /** Otherwise, play the first song of the list. */
    else if (songs.length) {
      this.initiate(songs[0]);
    }
  }
}
