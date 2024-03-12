import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SystemService } from '@services/system.service';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Playlist } from '@app/shared';
import { RouterLink } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { PlaylistFormComponent } from '@modules/playlist-form/playlist-form.component';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class PlaylistsPage implements OnInit {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Saved playlists. */
  protected playlists: Playlist[] = [];

  /** Songs loading indicator. */
  protected loading = true;

  constructor(private readonly systemService: SystemService,
              private readonly modalController: ModalController) {
  }

  protected create(): void {
    this.modalController.create({
      component: PlaylistFormComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'auto-height-sheet',
    }).then((modal: HTMLIonModalElement): void => {
      modal.present().then();
    });
  }

  ngOnInit(): void {

    /** Load the playlists. */
    this.subscriptions.add(
      this.systemService.playlists.subscribe({
        next: (playlists: Playlist[]): void => {
          this.playlists = playlists;
          this.loading = false;
        },
      }),
    );
  }
}
