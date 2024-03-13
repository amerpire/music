import { Injector } from '@angular/core';
import { SystemService } from '@services/system.service';
import { Song } from '@app/shared';
import { removeItemFromBs } from '@functions/remove-item-from-bs';

/** Playlist preference data structure. */
export interface PlaylistPreference {
  id: string;
  name: string;
  songs: Song['id'][];
}

/**
 * From the Ghastly Eyrie I can see to the ends of the world,
 * and from this vantage point I declare with utter certainty
 * that this one is the Playlist class.
 */
export class Playlist {

  /** Injected system service instance. */
  private readonly systemService: SystemService = this.injector.get(SystemService);

  /** Unique ID of this playlist. */
  public readonly id = this.init.id;

  /** Name of this playlist. */
  public name = this.init.name;

  /** List of songs part of this playlist. */
  public songs: Song[] = [];

  /** Thumbnails of songs part of this playlist. */
  public thumbnails: string[] = [];

  /** @returns export structure of this playlist. */
  public get export(): PlaylistPreference {
    return {
      id: this.id,
      name: this.name,
      songs: this.songs.map((item: Song): Song['id'] => item.id),
    };
  }

  constructor(private readonly init: PlaylistPreference,
              private readonly injector: Injector) {
    /** Initial generation of songs. */
    this.generateSongs();
  }

  /** Generate value for {@link songs}. */
  public generateSongs(): void {
    this.songs = this.init.songs.map((id: Song['id']): Song => {
      const song: Song | undefined = this.systemService.songs.value.find(
        (song: Song): boolean => song.id === id,
      );
      if (!song) {
        throw new Error(`[Playlist] failed to find song with ID ${id} in the subject.`);
      }
      song.playlists.push(this);
      return song;
    });
    this.generateThumbnails();
  }

  /**
   * Generate value for {@link thumbnails}.
   * Must be invoked whenever {@link songs} change.
   */
  public generateThumbnails(): void {
    this.thumbnails = this.songs.map((song: Song): string => song.init.thumbnail);
    if (!this.thumbnails.length) {
      this.thumbnails = ['/assets/playlist-default.svg'];
    }
  }

  /** Save to preferences. */
  public save(): Promise<boolean> {
    return this.systemService.playlistsSave();
  }

  /** Add the given song to this playlist. */
  public add(song: Song): void {
    this.songs.push(song);
    song.generatePlaylists();
    this.generateThumbnails();
    this.save();
    this.systemService.toast(`${song.init.title} added to ${this.name}`);
  }

  /**
   * Remove the given song index from this playlist.
   *
   * If index is not given, all instances of the song
   * will be deleted from the playlist.
   */
  public remove(song: Song, all = false, generate = true): void {
    if (!all) {
      this.songs.splice(this.songs.indexOf(song), 1);
    } else {
      this.songs = this.songs.filter((item: Song): boolean => item !== song);
    }
    if (generate) {
      song.generatePlaylists();
    }
    this.generateThumbnails();
    this.save();
  }

  /** Renames this playlist. */
  public rename(name: string): void {
    this.name = name;
    this.save();
  }

  /**
   * Destroy this playlist.
   *
   * - Delete playlist from subject
   * - Delete playlist from preference
   */
  public destroy(): void {
    /** Delete playlist from subject. */
    removeItemFromBs(this.systemService.playlists, this);
    /** Remove the playlist from the songs by generating their playlist. */
    for (const song of this.songs) {
      song.generatePlaylists();
    }
    /** Delete playlist from preference. */
    this.save();
    this.systemService.toast(`${this.name} deleted`);
  }
}
