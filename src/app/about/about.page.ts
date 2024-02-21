import { NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { AboutResource } from '@app/shared/interfaces/about-resource';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    NgForOf,
    IonIcon,
  ],
})
export class AboutPage {

  /** Resources related to the application. */
  protected readonly resources: AboutResource[] = [
    {
      label: 'Source Code',
      url: '#',
    },
    {
      label: 'Contact Us',
      url: '#',
    },
    {
      label: 'Feedback',
      url: '#',
    },
  ];
}
