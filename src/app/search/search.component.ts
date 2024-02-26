import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GetParams } from '@app/shared/interfaces/get-params';
import { SongYoutube } from '@app/shared/interfaces/song-youtube';
import { ApiService } from '@app/shared/services/api.service';
import { SystemService } from '@app/shared/services/system.service';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonRow,
  IonSearchbar,
  IonThumbnail,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, checkmark } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonButtons,
    IonSearchbar,
    IonContent,
    IonList,
    IonItem,
    ReactiveFormsModule,
    IonProgressBar,
    IonLabel,
    IonModal,
    IonGrid,
    IonRow,
    IonCol,
    IonThumbnail,
  ],
})
export class SearchComponent implements OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private subscriptionSearch: Subscription | undefined;
  private subscriptionDownload: Subscription | undefined;

  /** Search form control. */
  searchControl: FormControl<string | null> = new FormControl<string | null>(null);

  /** Api loading indicator. */
  loading = false;

  /** YouTube's songs that being searched. */
  songs: SongYoutube[] = [];

  /** Selected song to be shown in modal sheet. */
  songSelected!: SongYoutube;

  /** Api downloading indicator. */
  downloading = false;
  downloadingBuffer = 0.06;
  downloadingProgress = 0;

  constructor(private modalController: ModalController,
              private toastController: ToastController,
              private systemService: SystemService,
              private apiService: ApiService) {
    addIcons({ arrowBack, checkmark });
  }

  ngOnDestroy(): void {
    this.subscriptionSearch?.unsubscribe();
    this.subscriptionDownload?.unsubscribe();
  }

  closeModal(): void {
    this.modalController.dismiss().then();
  }

  openSheet(song: SongYoutube, modalSheet: IonModal): void {
    this.songSelected = song;
    modalSheet.present().then();
  }

  search(): void {
    const value: string | null = this.searchControl.value;
    if (value) {
      this.loading = true;
      this.searchControl.disable();
      this.subscriptionSearch?.unsubscribe();
      this.subscriptionSearch = this.apiService.search({ search: value }).subscribe({
        next: (songs: SongYoutube[]): void => {
          this.songs = songs;

          /** Mark the song if it's already downloaded. */
          for (const song of this.songs) {
            song.downloaded = this.systemService.songs.some((item: SongYoutube): boolean => (
              item.video_id === song.video_id
            ));
          }
          this.loading = false;
          this.searchControl.enable();
        },
        error: (): void => {
          this.toastController.create({
            message: 'Oops! Something went wrong. Please try again later.',
            duration: 5000,
          }).then((toast: HTMLIonToastElement): void => {
            toast.present().then();
          });
          this.loading = false;
          this.searchControl.enable();
        },
      });
    }
  }

  download(): void {
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
          this.systemService.saveFile(event.body as Blob, this.songSelected).subscribe({
            next: (saved: boolean): void => {
              if (saved) {
                this.toastController.create({
                  message: 'Party alert! Song downloaded. Let\'s ignite the dance floor!',
                  duration: 5000,
                }).then((toast: HTMLIonToastElement): void => {
                  toast.present().then();
                });
                this.downloading = false;
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
}
