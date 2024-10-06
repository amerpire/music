import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Channel } from '@app/shared';
import { SystemService } from '@services/system.service';
import { SongListComponent } from '@modules/song-list/song-list.component';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    RouterLink,
    IonContent,
    SongListComponent,
  ],
})
export class DetailPage {

  /** Selected channel. */
  protected channel!: Channel;

  /** Find and set current channel using id key from params. */
  @Input()
  set id(id: string) {
    const channel: Channel | undefined = this.systemService.channels.value.find((item: Channel): boolean => (
      item.name === id
    ));
    if (channel) {
      this.channel = channel;
    }
  }

  constructor(private readonly systemService: SystemService) {
  }
}
