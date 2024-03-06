import { Injectable } from '@angular/core';
import { Media, MEDIA_STATUS, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UtilsService } from '@app/shared/services/utils.service';
import { RangeCustomEvent } from '@ionic/angular';
import { SystemService } from '@services/system.service';
import { Song } from '@app/shared';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {

  private subscriptionPlayer: Subscription | undefined;

  /** Player song instance.  */
  private player!: MediaObject;

  /** Player interval instance. */
  private playerInterval!: ReturnType<typeof setInterval>;

  /** Whether the progress control knob is moving. */
  private progressControlMoving = false;

  /** Playing song. */
  readonly song = new BehaviorSubject<Song | null>(null);

  /** Whether the song is playing. */
  readonly isPlaying = new BehaviorSubject<boolean>(false);

  /** PLayer current progress in time (mm:ss). */
  readonly progressTime = new BehaviorSubject<string>('00:00');

  /** PLayer duration in time (mm:ss). */
  readonly durationTime = new BehaviorSubject<string>('00:00');

  /** Progress control value. */
  readonly progressControl = new BehaviorSubject<number>(0);

  constructor(private media: Media,
              private systemService: SystemService) {
  }

  play(song: Song): void {

    /** Stop the player initially anyway. */
    if (this.player) {
      this.player.stop();
    }

    /** Set the song. */
    this.song.next(song);

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

          /** Watch for the player current position every second to update the progress for the sake of UI. */
          this.playerInterval = setInterval((): void => {
            this.player.getCurrentPosition().then((position: number): void => {

              /** Set the song duration time. */
              this.durationTime.next(UtilsService.secondsToTime(this.player.getDuration()));

              /** Set the player current progress if progress knob is not moving. */
              if (!this.progressControlMoving) {
                this.progressControl.next((position / this.player.getDuration()) * 100);
                this.progressTime.next(UtilsService.secondsToTime(position));
              }
            });
          }, 1000);
        }

        /** {@link isPlaying} */
        this.isPlaying.next(status === MEDIA_STATUS.RUNNING);
      },
    });

    /** Play the song. */
    this.player.play();
  }

  playIndex(index: number): void {

    /** List of songs. */
    const songs: Song[] = this.systemService.songs.value;

    /** If given index exists, play the song. */
    if (songs[index]) {
      this.play(songs[index]);
    }

    /** Otherwise, play the first song of the list. */
    else if (songs.length) {
      this.play(songs[0]);
    }
  }

  destroy(): void {
    this.song.next(null);
    if (this.isPlaying.value) {
      this.player.stop();
    }
  }

  updateProgressControl(progress: number): void {
    if (this.progressControlMoving) {
      this.progressTime.next(UtilsService.secondsToTime((this.player.getDuration() / 100) * progress));
    }
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

  togglePlayer(): void {
    if (this.isPlaying.value) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }
}
