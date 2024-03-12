import { Observable, Subject } from 'rxjs';
import { Injector } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { SystemService } from '@services/system.service';
import { removeItemFromBs } from '@functions/remove-item-from-bs';
import { Playlist } from '@app/shared';

/** Song API data structure. */
export interface SongApi {
  author: string;
  channel_id: string;
  time: string;
  thumbnail: string;
  title: string;
  video_id: string;
  view_count: string;
  /** UI properties. */
  downloaded?: boolean;
}

/** Song preference data structure. */
export interface SongPreference extends SongApi {
  path: string;
}

/**
 * From the Ghastly Eyrie I can see to the ends of the world,
 * and from this vantage point I declare with utter certainty
 * that this one is the Song class.
 */
export class Song {

  /** Injected system service instance. */
  private readonly systemService = this.injector.get(SystemService);

  /** @returns YouTube ID of this song. */
  public readonly id: string = this.init.video_id;

  /** @returns Playlist list that this song is a part of. */
  public playlists: Playlist[] = [];

  /** @returns export structure of this song. */
  public get export(): SongPreference {
    return this.init;
  }

  /**
   * @param init Initial data of song.
   * @param injector Injector instance.
   */
  constructor(public readonly init: SongPreference,
              private readonly injector: Injector) {
  }

  /** Generate value for {@link playlists}. */
  public generatePlaylists(): void {
    this.playlists = this.systemService.playlists.value.filter(
      (playlist: Playlist): boolean => playlist.songs.includes(this),
    );
  }

  /**
   * Destroy this song.
   *
   * - Delete song from disk
   * - Delete song from subject
   * - Delete song from preference
   */
  public destroy(): Observable<boolean> {
    const subject: Subject<boolean> = new Subject<boolean>();
    /** Delete song from disk. */
    Filesystem.deleteFile({
      path: this.id,
      directory: Directory.Data,
    }).then((): void => {
      /** Delete song from subject. */
      removeItemFromBs(this.systemService.songs, this);
      /** Remove from playlist. */
      this.playlists.forEach((playlist: Playlist): void => {
        playlist.remove(this, true, false);
      });
      /** Delete song from preference. */
      this.save();
      this.systemService.toast(`${this.init.title} deleted`);
    }).catch((): void => {
      this.systemService.toast(`Unable to delete ${this.init.title}`);
      subject.next(false);
      subject.complete();
    });
    return subject;
  }

  /** Save to preferences. */
  public save(): Promise<boolean> {
    return this.systemService.songsSave();
  }
}
