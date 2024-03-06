import { Injectable, Injector } from '@angular/core';
import { Directory, Filesystem, WriteFileResult } from '@capacitor/filesystem';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { blobToBase64 } from '@functions/blob-to-base64';
import { Channel, Playlist, PlaylistPreference, Preference, Song, SongApi, SongPreference } from '@app/shared';
import { addItemToBs } from '@functions/add-item-to-bs';
import { generateUniqueString } from '@functions/generate-unique-string';

@Injectable({
  providedIn: 'root',
})
export class SystemService {

  /** Songs preference instance. */
  private readonly songsPreference = new Preference<SongPreference[]>('songs');

  /** Playlists preference instance. */
  private readonly playlistPreference = new Preference<PlaylistPreference[]>('playlists');

  /** Activation flag. */
  private activated = false;

  /** Songs behaviour subject. */
  public readonly songs = new BehaviorSubject<Song[]>([]);

  /** Playlists behaviour subject. */
  public readonly playlists = new BehaviorSubject<Playlist[]>([]);

  /** Channels behaviour subject. */
  public readonly channels = new BehaviorSubject<Channel[]>([]);

  constructor(private readonly toastController: ToastController,
              private readonly injector: Injector) {
  }

  /** Load playlists from preferences. */
  private async playlistsLoad(): Promise<void> {
    const playlists: PlaylistPreference[] = await this.playlistPreference.load() || [];
    this.playlists.next(playlists.map((item: PlaylistPreference): Playlist =>
      new Playlist(item, this.injector),
    ));
  }

  /** Load songs from preferences. */
  private async songsLoad(): Promise<void> {
    const songs: SongPreference[] = await this.songsPreference.load() || [];
    this.songs.next(songs.map((item: SongPreference): Song =>
      new Song(item, this.injector),
    ));
  }

  /** General app toast method. */
  public toast(message: string): void {
    this.toastController.create({
      message,
      duration: 2000,
    }).then((toast: HTMLIonToastElement): void => {
      toast.present().then();
    });
  }

  /**
   * Loads playlists and songs.
   * Handles references to each other.
   */
  public async activate(): Promise<void> {
    if (this.activated) {
      throw new Error('[SystemService] can not be activated twice.');
    }
    await this.songsLoad();
    await this.playlistsLoad();
    console.debug('[SystemService] activated.');
    this.songs.subscribe({
      next: (songs: Song[]): void => {
        this.channels.next(Channel.create(songs, this.injector));
      },
    });
  }

  /**
   * Save the downloaded song.
   *
   * - Save to disk
   * - Save to subject
   * - Save to preference
   *
   * @param blob Song data blob.
   * @param songApi Song API data.
   *
   * @returns Observable with true as data when succeeds.
   */
  public songSave(blob: Blob, songApi: SongApi): Observable<boolean> {
    const subject: Subject<boolean> = new Subject<boolean>();
    /** Convert to base64. */
    blobToBase64(blob).subscribe({
      next: (base64: string): void => {
        if (base64) {
          /** Save to disk. */
          Filesystem.writeFile({
            path: songApi.video_id,
            data: base64,
            directory: Directory.Data,
          }).then((file: WriteFileResult): void => {
            /** Convert to song class. */
            const song = new Song({ ...songApi, path: file.uri }, this.injector);
            /** Save to subject. */
            addItemToBs(this.songs, song);
            /** Save to preference. */
            song.save().then((status: boolean): void => {
              /** Show toast. */
              if (status) {
                this.toast(`Downloaded ${songApi.title}`);
              } else {
                this.toast(`Unable to download ${songApi.title}`);
              }
              subject.next(status);
              subject.complete();
            });
          }).catch((): void => {
            this.toast(`Unable to download ${songApi.title}`);
            subject.next(false);
            subject.complete();
          });
        }
      },
      error: (): void => {
        this.toast(`Unable to download ${songApi.title}`);
        subject.next(false);
        subject.complete();
      },
    });
    return subject;
  }

  /**
   * Create a new playlist with the given name.
   *
   * - Create instance
   * - Save to subject
   * - Save to preference
   *
   * @returns Newly create playlist.
   */
  public playlistCreate(name: string, songs: Song['id'][] = []): Playlist {
    /** Create instance. */
    const playlist = new Playlist({
      id: generateUniqueString(),
      songs,
      name,
    }, this.injector);
    /** Save to subject. */
    addItemToBs(this.playlists, playlist);
    /** Save to preference. */
    playlist.save().then((status: boolean): void => {
      /** Show toast. */
      if (status) {
        this.toast(`Created ${playlist.name}`);
      } else {
        this.toast(`Unable to create ${playlist.name}`);
      }
    });
    return playlist;
  }

  /** Save songs subject to preference. */
  public songsSave(): Promise<boolean> {
    return this.songsPreference.save(
      this.songs.value.map((item: Song): SongPreference => item.export),
    );
  }

  /** Save playlists subject to preference. */
  public playlistsSave(): Promise<boolean> {
    return this.playlistPreference.save(
      this.playlists.value.map((item: Playlist): PlaylistPreference => item.export),
    );
  }
}
