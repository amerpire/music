import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SrcHandlerDirective } from '@app/shared/directives/src-handler.directive';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RangeCustomEvent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Song } from '@app/shared';
import { IonButton, IonButtons, IonIcon, IonRange } from '@ionic/angular/standalone';
import { PlayerService } from '@services/player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  standalone: true,
  imports: [
    SrcHandlerDirective,
    ReactiveFormsModule,
    IonRange,
    IonButtons,
    IonButton,
    IonIcon,
  ],
})
export class PlayerComponent implements OnInit, OnDestroy {

  /** Subscription to destroy the observables to avoid unnecessary subscriptions. */
  private readonly subscriptions: Subscription = new Subscription();

  /** Player's data. */
  protected song: Song | null = this.playerService.song.value;
  protected isPlaying: boolean = this.playerService.isPlaying.value;
  protected progressTime: string = this.playerService.progressTime.value;
  protected durationTime: string = this.playerService.durationTime.value;

  /** Player current position in progress for UI range input. */
  protected progressControl: FormControl<number> = new FormControl<number>(
    this.playerService.progressControl.value,
    { nonNullable: true },
  );

  constructor(private readonly playerService: PlayerService,
              private readonly changeDetectorRef: ChangeDetectorRef) {
  }

  protected progressControlActive(): void {
    this.playerService.toggleProgressControlStatus();
  }

  protected seekTo(event: RangeCustomEvent): void {
    this.playerService.seekTo(event);
  }

  protected togglePlayer(): void {
    this.playerService.togglePlayer();
  }

  protected changeTrack(next: boolean): void {
    this.playerService.changeTrack(next);
  }

  ngOnInit(): void {

    /** Watch for the progress control value changes. */
    this.subscriptions.add(
      this.progressControl.valueChanges.subscribe({
        next: (progress: number): void => {
          this.playerService.updateProgressControl(progress);
        },
      }),
    );

    /** Watch for the progress control value changes. */
    this.subscriptions.add(
      this.playerService.progressControl.subscribe({
        next: (progress: number): void => {
          this.progressControl.setValue(progress);
          this.changeDetectorRef.detectChanges();
        },
      }),
    );

    /** Watch for the song value changes. */
    this.subscriptions.add(
      this.playerService.song.subscribe({
        next: (song: Song | null): void => {
          this.song = song;
          this.changeDetectorRef.detectChanges();
        },
      }),
    );

    /** Watch for the player status value changes. */
    this.subscriptions.add(
      this.playerService.isPlaying.subscribe({
        next: (isPlaying: boolean): void => {
          this.isPlaying = isPlaying;
          this.changeDetectorRef.detectChanges();
        },
      }),
    );

    /** Watch for the player progress time value changes. */
    this.subscriptions.add(
      this.playerService.progressTime.subscribe({
        next: (progressTime: string): void => {
          this.progressTime = progressTime;
          this.changeDetectorRef.detectChanges();
        },
      }),
    );

    /** Watch for the player duration time value changes. */
    this.subscriptions.add(
      this.playerService.durationTime.subscribe({
        next: (durationTime: string): void => {
          this.durationTime = durationTime;
          this.changeDetectorRef.detectChanges();
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
