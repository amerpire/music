import { Playlist, Song } from '@app/shared';
import { forkJoin, Observable } from 'rxjs';
import { Injector } from '@angular/core';
import { SystemService } from '@services/system.service';

/**
 * From the Ghastly Eyrie I can see to the ends of the world,
 * and from this vantage point I declare with utter certainty
 * that this one is the Channel class.
 */
export class Channel {

  /** Create channel instances from the given songs. */
  public static create(songs: Song[], injector: Injector): Channel[] {
    const channels: Channel[] = [];
    for (const song of songs) {
      let channel: Channel | undefined = channels.find(
        (item: Channel): boolean => item.name === song.init.author,
      );
      if (!channel) {
        channel = new Channel(
          song.init.author,
          [],
          injector,
        );
        channels.push(channel);
      }
      channel.songs.push(song);
    }
    return channels;
  }

  /** Injected system service instance. */
  private readonly systemService: SystemService = this.injector.get(SystemService);

  /** Thumbnails of songs of this channel. */
  public readonly thumbnails: string[] = this.songs.map((song: Song): string => song.init.thumbnail);

  /**
   * @param name Name of this channel.
   * @param songs Songs of this channel.
   */
  protected constructor(public readonly name: string,
                        public readonly songs: Song[],
                        public readonly injector: Injector) {
  }

  /** Destroy all songs of this channel. */
  public destroy(): Observable<boolean[]> {
    return forkJoin(this.songs.map((song: Song): Observable<boolean> => song.destroy()));
  }

  /** Create a playlist from this channel. */
  public createPlaylist(): Playlist {
    return this.systemService.playlistCreate(
      this.name,
      this.songs.map((item: Song): Song['id'] => item.id),
    );
  }
}
