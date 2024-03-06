import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { SystemService } from '@services/system.service';
import { IonModal } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Playlist } from '@app/shared';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
  ],
})
export class PlaylistsPage implements OnInit {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Form sheet reference. */
  @ViewChild('formSheet') protected formSheet!: IonModal;

  /** Saved playlists. */
  protected playlists: Playlist[] = [];

  /** Songs loading indicator. */
  protected loading = true;

  protected formControl: FormControl<string> = new FormControl<string>(
    '',
    { validators: Validators.required, nonNullable: true },
  );

  constructor(private systemService: SystemService) {
    addIcons({
      add,
    });
  }

  protected openSheet(): void {
    this.formControl.reset();
    this.formSheet.present().then();
  }

  protected create(): void {
    this.systemService.playlistCreate(this.formControl.value);
    this.formSheet.dismiss().then();
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
