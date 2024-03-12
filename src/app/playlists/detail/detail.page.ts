import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Playlist } from '@app/shared';
import { SystemService } from '@services/system.service';
import { SongListComponent } from '@modules/song-list/song-list.component';
import { PlaylistFormComponent } from '@modules/playlist-form/playlist-form.component';
import { ActionSheetController, ModalController } from '@ionic/angular/standalone';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    SongListComponent,
  ],
})
export class DetailPage {

  /** Selected playlist. */
  protected playlist!: Playlist;

  /** Find and set current playlist using id key from params. */
  @Input()
  set id(id: string) {
    const playlist: Playlist | undefined = this.systemService.playlists.value.find((item: Playlist): boolean => (
      item.id === id
    ));
    if (playlist) {
      this.playlist = playlist;
    }
  }

  constructor(private readonly systemService: SystemService,
              private readonly actionSheetController: ActionSheetController,
              private readonly location: Location,
              private readonly modalController: ModalController) {
  }

  protected actions(): void {
    this.actionSheetController.create({
      buttons: [
        {
          text: 'Rename',
          role: 'destructive',
          icon: 'pencil',
          handler: (): void => {
            this.modalController.create({
              component: PlaylistFormComponent,
              componentProps: {
                playlist: this.playlist,
              },
              initialBreakpoint: 1,
              breakpoints: [0, 1],
              cssClass: 'auto-height-sheet',
            }).then((modal: HTMLIonModalElement): void => {
              modal.present().then();
            });
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: (): void => {
            this.playlist.destroy();
            this.location.back();
          },
        },
      ],
    }).then((action: HTMLIonActionSheetElement): void => {
      action.present().then();
    });
  }
}
