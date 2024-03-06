import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SystemService } from '@services/system.service';
import { ActionSheetController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, ellipsisHorizontal, pause, play, playSkipBack, playSkipForward, trash } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { PlayerService } from '@services/player.service';
import { SrcHandlerDirective } from '@app/shared/directives/src-handler.directive';
import { SearchComponent } from '@modules/search/search.component';
import { IonicModule } from '@ionic/angular';
import { Song } from '@app/shared';

@Component({
  selector: 'app-songs',
  templateUrl: 'songs.page.html',
  styleUrls: ['songs.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    SrcHandlerDirective,
  ],
})
export class SongsPage implements OnInit, OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Player's data. */
  protected playerSong: Song | null = this.playerService.song.value;

  /** Saved songs. */
  protected songs: Song[] = [];

  /** Songs loading indicator. */
  protected loading = true;

  constructor(private readonly playerService: PlayerService,
              private readonly modalController: ModalController,
              private readonly changeDetectorRef: ChangeDetectorRef,
              private readonly actionSheetController: ActionSheetController,
              private readonly systemService: SystemService) {

    /** Initialize the icons. */
    addIcons({
      add,
      trash,
      playSkipBack,
      playSkipForward,
      play,
      pause,
      ellipsisHorizontal,
    });
  }

  protected play(song: Song): void {
    this.playerService.play(song);
  }

  protected openSearchModal(): void {
    this.modalController.create({
      component: SearchComponent,
    }).then((modal: HTMLIonModalElement): void => {
      modal.present().then();
    });
  }

  protected songActions(song: Song): void {
    this.actionSheetController.create({
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: (): void => {
          if (this.playerSong?.id === song.id) {
            this.playerService.destroy();
          }
          song.destroy().subscribe();
        },
      }],
    }).then((action: HTMLIonActionSheetElement): void => {
      action.present().then();
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

    /** Watch for the song value changes. */
    this.subscriptions.add(
      this.playerService.song.subscribe({
        next: (song: Song | null): void => {
          this.playerSong = song;
          this.changeDetectorRef.detectChanges();
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
