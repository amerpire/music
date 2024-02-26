import { Injectable } from '@angular/core';
import { SongYoutube } from '@app/shared/interfaces/song-youtube';
import { Directory, Filesystem, WriteFileResult } from '@capacitor/filesystem';
import { GetResult, Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemService {

  /** Saved songs. */
  readonly songs: BehaviorSubject<SongYoutube[] | null> = new BehaviorSubject<SongYoutube[] | null>(null);

  /** System storage directory name. */
  readonly storage: string = 'songs';

  loadSongs(): void {
    Preferences.get({ key: this.storage }).then((result: GetResult): void => {
      this.songs.next(result.value ? JSON.parse(result.value) : []);
    });
  }

  songDelete(song: SongYoutube): Observable<boolean> {
    const subject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Delete the blob file from file system. */
    const filename: string | undefined = song.path?.substring(song.path?.lastIndexOf('/') + 1);
    Filesystem.deleteFile({
      path: filename as string,
      directory: Directory.Data,
    }).then((): void => {

      /** Delete file data from storage. */
      const songs: SongYoutube[] | null = this.songs.value;
      if (songs) {
        this.songs.next(songs.filter((item: SongYoutube): boolean => item.video_id !== song.video_id));
      }

      Preferences.set({
        key: this.storage,
        value: JSON.stringify(this.songs.value),
      }).then((): void => {
        subject.next(true);
      });
    });
    return subject;
  }

  saveFile(blob: Blob, song: SongYoutube): Observable<boolean> {
    const subject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Convert the blob to base64. */
    this.convertBlobToBase64(blob).subscribe({
      next: (base64: string | null): void => {
        if (base64) {

          /** Then save the file into the system. */
          Filesystem.writeFile({
            path: `${song.title}.mp3`,
            data: base64,
            directory: Directory.Data,
          }).then((file: WriteFileResult): void => {

            /** Let's keep the saved file path for loading them later. */
            song.path = file.uri;
            song.downloaded = true;

            /** Add the saved song to songs. */
            if (this.songs.value) {
              this.songs.next([...this.songs.value, song]);
            }

            /** Finally update the system storage. */
            Preferences.set({
              key: this.storage,
              value: JSON.stringify(this.songs.value),
            }).then();
            subject.next(true);
          });
        }
      },
    });

    return subject;
  }

  convertBlobToBase64(blob: Blob): Observable<string | null> {
    const subject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    const reader: FileReader = new FileReader();
    reader.onerror = (): void => {
      subject.error(reader.error);
    };
    reader.onload = (): void => {
      subject.next(reader.result as string);
    };
    reader.readAsDataURL(blob);
    return subject;
  }
}
