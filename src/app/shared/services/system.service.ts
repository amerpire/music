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
  songs: SongYoutube[] = [];

  /** System storage directory name. */
  readonly storage: string = 'songs';

  loadSongs(): Observable<SongYoutube[] | null> {
    const subject: BehaviorSubject<SongYoutube[] | null> = new BehaviorSubject<SongYoutube[] | null>(null);
    Preferences.get({ key: this.storage }).then((songs: GetResult): void => {
      this.songs = songs.value ? JSON.parse(songs.value) : [];
      subject.next(this.songs);
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
            this.songs.unshift(song);

            /** Finally update the system storage. */
            Preferences.set({
              key: this.storage,
              value: JSON.stringify(this.songs),
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
