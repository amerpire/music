import { Component, OnDestroy, OnInit } from '@angular/core';
import { SystemService } from '@services/system.service';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { SearchComponent } from '@modules/search/search.component';
import { Song } from '@app/shared';
import { SongListComponent } from '@modules/song-list/song-list.component';

@Component({
  selector: 'app-songs',
  templateUrl: 'songs.page.html',
  styleUrls: ['songs.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonSpinner,
    SongListComponent,
  ],
})
export class SongsPage implements OnInit, OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Saved songs. */
  protected songs: Song[] = [];

  /** Songs loading indicator. */
  protected loading = true;

  constructor(private readonly modalController: ModalController,
              private readonly systemService: SystemService) {
  }

  protected openSearchModal(): void {
    this.modalController.create({
      component: SearchComponent,
    }).then((modal: HTMLIonModalElement): void => {
      modal.present().then();
    });
  }

  ngOnInit(): void {

    /** Load the songs. */
    this.subscriptions.add(
      this.systemService.songs.subscribe({
        next: (songs: Song[]): void => {
          this.songs = songs;
          this.loading = false;
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
