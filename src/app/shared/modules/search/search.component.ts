import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GetParams } from '@interfaces/get-params';
import { ApiService } from '@services/api.service';
import { SystemService } from '@services/system.service';
import { IonModal, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, checkmark } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { Song, SongApi } from '@app/shared';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
  ],
})
export class SearchComponent implements OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private subscriptionSearch: Subscription | undefined;
  private subscriptionDownload: Subscription | undefined;

  /** Search form control. */
  protected readonly searchControl: FormControl<string | null> = new FormControl<string | null>(null);

  /** Api loading indicator. */
  protected loading = false;

  /** YouTube's songs that being searched. */
  protected songs: SongApi[] = [];

  /** Selected song to be shown in modal sheet. */
  protected songSelected!: SongApi;

  /** Api downloading indicator. */
  protected downloading = false;
  protected downloadingBuffer = 0.06;
  protected downloadingProgress = 0;

  constructor(private modalController: ModalController,
              private toastController: ToastController,
              private systemService: SystemService,
              private apiService: ApiService) {
    addIcons({ arrowBack, checkmark });
  }

  private updateDownloadedStatus(): void {
    for (const song of this.songs) {
      song.downloaded = this.systemService.songs.value.some((item: Song): boolean => (
        item.id === song.video_id
      ));
    }
  }

  protected closeModal(): void {
    this.modalController.dismiss().then();
  }

  protected openSheet(song: SongApi, modalSheet: IonModal): void {
    this.songSelected = song;
    modalSheet.present().then();
  }

  protected search(): void {
    const value: string | null = this.searchControl.value;
    if (value) {
      this.loading = true;
      this.searchControl.disable();
      this.subscriptionSearch?.unsubscribe();
      this.subscriptionSearch = this.apiService.search({ search: value }).subscribe({
        next: (songs: SongApi[]): void => {
          /** Store API songs. */
          this.songs = songs;
          /** Update downloaded status. */
          this.updateDownloadedStatus();
          this.loading = false;
          this.searchControl.enable();
        },
        error: (): void => {
          this.toastController.create({
            message: 'Oops! Something went wrong. Please try again later.',
            duration: 2000,
          }).then((toast: HTMLIonToastElement): void => {
            toast.present().then();
          });
          this.loading = false;
          this.searchControl.enable();
        },
      });
    }
  }

  protected download(): void {
    this.downloading = true;
    this.downloadingBuffer = 0.06;
    this.downloadingProgress = 0;
    const params: GetParams = {
      url: `https://youtube.com/watch?v=${this.songSelected.video_id}`,
    };
    this.subscriptionDownload?.unsubscribe();
    this.subscriptionDownload = this.apiService.download(params).subscribe({
      next: (event: HttpEvent<Blob>): void => {

        /** Progress. */
        if (event.type === HttpEventType.DownloadProgress) {
          this.downloadingProgress = Math.round((100 * event.loaded) / (event.total || 0)) / 100;
          this.downloadingBuffer = this.downloadingProgress + 0.06;
        }

        /** Download file. */
        else if (event.type === HttpEventType.Response) {
          this.systemService.songSave(event.body as Blob, this.songSelected).subscribe({
            next: (saved: boolean): void => {
              if (saved) {
                this.downloading = false;
                /** Update downloaded status. */
                this.updateDownloadedStatus();
              }
            },
          });
        }
      },
      error: (): void => {
        this.downloading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptionSearch?.unsubscribe();
    this.subscriptionDownload?.unsubscribe();
  }
}
