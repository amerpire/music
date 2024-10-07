import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Channel } from '@app/shared';
import { SystemService } from '@services/system.service';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader, IonRouterLink,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.page.html',
  styleUrls: ['./channels.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar,
    RouterLink,
    IonRouterLink,
  ],
})
export class ChannelsPage implements OnInit, OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Channels. */
  protected channels: Channel[] = [];

  /** Songs loading indicator. */
  protected loading = true;

  constructor(private readonly systemService: SystemService) {
  }

  ngOnInit(): void {

    /** Load the channels. */
    this.subscriptions.add(
      this.systemService.channels.subscribe({
        next: (channels: Channel[]): void => {
          this.channels = channels;
          this.loading = false;
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }

}
