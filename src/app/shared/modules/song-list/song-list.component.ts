import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SrcHandlerDirective } from '@directives/src-handler.directive';
import { Playlist, Song } from '@app/shared';
import { PlayerService } from '@services/player.service';
import { Subscription } from 'rxjs';
import {
  ActionSheetController,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { SystemService } from '@services/system.service';
import { ActionSheetButton } from '@ionic/angular';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
    SrcHandlerDirective,
  ],
})
export class SongListComponent implements OnInit, OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Player's data. */
  protected playerSong: Song | null = this.playerService.song.value;

  /** Songs list. */
  @Input() songs: Song[] = [];

  /** Whether this is playlist view. */
  @Input() playlist!: Playlist;

  constructor(private readonly playerService: PlayerService,
              private readonly systemService: SystemService,
              private readonly actionSheetController: ActionSheetController,
              private readonly changeDetectorRef: ChangeDetectorRef) {
  }

  protected play(song: Song): void {
    this.playerService.play(song);
  }

  protected playlistAction(song: Song, add = true): void {
    this.actionSheetController.create({
      header: 'Playlists',
      buttons: this.systemService.playlists.value.map((playlist: Playlist): ActionSheetButton => {
        return {
          text: playlist.name,
          role: 'destructive',
          handler: (): void => {
            if (add) {
              playlist.add(song);
            } else {
              playlist.remove(song);
            }
            this.changeDetectorRef.detectChanges();
          },
        };
      }),
    }).then((action: HTMLIonActionSheetElement): void => {
      action.present().then();
    });
  }

  protected songActions(song: Song): void {

    /** Song actions. */
    const actions: ActionSheetButton[] = [
      {
        text: 'Add to playlist',
        role: 'destructive',
        icon: 'add',
        handler: (): void => {
          this.playlistAction(song);
        },
      },
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: (): void => {
          if (this.playerSong?.id === song.id) {
            this.playerService.destroy();
          }
          song.destroy().subscribe();
        },
      },
    ];

    /** Remove from playlist action, if the song has any playlist. */
    if (song.playlists.length) {
      actions.unshift({
        text: 'Remove from playlist',
        role: 'destructive',
        icon: 'remove',
        handler: (): void => {
          if (this.playlist) {
            this.playlist.remove(song);
          } else {
            this.playlistAction(song, false);
          }
        },
      });
    }
    this.actionSheetController.create({
      buttons: actions,
    }).then((action: HTMLIonActionSheetElement): void => {
      action.present().then();
    });
  }

  ngOnInit(): void {

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
