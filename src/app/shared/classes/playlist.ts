import { Injector } from '@angular/core';
import { SystemService } from '@services/system.service';
import { Song } from '@app/shared';

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
  }

  /**
   * Remove the given song index from this playlist.
   *
   * If index is not given, all instances of the song
   * will be deleted from the playlist.
   */
  public remove(song: Song, index: number, generate = true): void {
    if (index !== -1) {
      this.songs.splice(index, 1);
    } else {
      this.songs = this.songs.filter((item: Song): boolean => item !== song);
    }
    if (generate) {
      song.generatePlaylists();
    }
    this.generateThumbnails();
    this.save();
  }
}
