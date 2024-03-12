import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  arrowBack,
  checkmark,
  disc,
  ellipsisHorizontal,
  ellipsisVertical,
  musicalNote,
  pause,
  pencil,
  play,
  playSkipBack,
  playSkipForward,
  remove,
  trash,
} from 'ionicons/icons';
import { Tab } from '@interfaces/tab';
import { SrcHandlerDirective } from '@app/shared/directives/src-handler.directive';
import { PlayerService } from '@services/player.service';
import { PlayerComponent } from '@modules/player/player.component';
import { IonicModule } from '@ionic/angular';
import { SystemService } from '@services/system.service';
import { Song } from '@app/shared';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonicModule,
    SrcHandlerDirective,
  ],
})
export class AppComponent implements OnInit {

  /** List of tab pages. */
  protected readonly tabs: Tab[] = [
    {
      tab: 'songs',
      icon: 'musical-note',
      name: 'Songs',
    },
    {
      tab: 'playlists',
      icon: 'disc',
      name: 'Playlists',
    },
  ];

  protected tabSelected: Tab = this.tabs[0];

  /** Player's data. */
  protected playerSong: Song | null = this.playerService.song.value;
  protected playerIsPlaying: boolean = this.playerService.isPlaying.value;
  protected playerProgressControl: number = this.playerService.progressControl.value;

  constructor(private readonly modalController: ModalController,
              private readonly changeDetectorRef: ChangeDetectorRef,
              private readonly systemService: SystemService,
              private readonly playerService: PlayerService) {

    /** Initialize the icons. */
    addIcons({
      add,
      trash,
      playSkipBack,
      playSkipForward,
      play,
      pause,
      ellipsisHorizontal,
      ellipsisVertical,
      musicalNote,
      disc,
      arrowBack,
      checkmark,
      pencil,
      remove,
    });
  }

  protected tabChange(event: { tab: string }): void {
    this.tabSelected = this.tabs.find((tab: Tab): boolean => tab.tab === event.tab) || this.tabs[0];
  }

  protected openPlayer(): void {
    this.modalController.create({
      component: PlayerComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
    }).then((modal: HTMLIonModalElement): void => {
      modal.present().then();
    });
  }

  protected togglePlayer(): void {
    this.playerService.togglePlayer();
  }

  ngOnInit(): void {

    /** Initiate the data from storage into memory initially. */
    this.systemService.activate();

    /** Watch for the song value changes. */
    this.playerService.song.subscribe({
      next: (data: Song | null): void => {
        this.playerSong = data;
        this.changeDetectorRef.detectChanges();
      },
    });

    /** Watch for the song status value changes. */
    this.playerService.isPlaying.subscribe({
      next: (data: boolean): void => {
        this.playerIsPlaying = data;
        this.changeDetectorRef.detectChanges();
      },
    });

    /** Watch for the player progress value changes. */
    this.playerService.progressControl.subscribe({
      next: (data: number): void => {
        this.playerProgressControl = data;
        this.changeDetectorRef.detectChanges();
      },
    });
  }
}
