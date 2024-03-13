import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular/standalone';
import { SystemService } from '@services/system.service';
import { Playlist } from '@app/shared';

@Component({
  selector: 'app-playlist-form',
  templateUrl: './playlist-form.component.html',
  styleUrls: ['./playlist-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonInput,
  ],
})
export class PlaylistFormComponent implements OnInit {

  /** Form input reference. */
  @ViewChild('formInput') protected formInput!: IonInput;

  /** Form control of the name. */
  protected formControl: FormControl<string> = new FormControl<string>(
    '',
    { validators: Validators.required, nonNullable: true },
  );

  /** Given playlist for edit purpose. */
  @Input() playlist!: Playlist;

  constructor(private readonly systemService: SystemService,
              private readonly modalController: ModalController) {
  }

  protected save(): void {

    /** Do not continue if for is not valid. */
    if (!this.formControl.valid) {
      return;
    }

    /** If it's edit mode, then update the playlist. */
    if (this.playlist) {
      this.playlist.rename(this.formControl.value);
    }

    /** Otherwise create a new one. */
    else {
      this.systemService.playlistCreate(this.formControl.value);
    }

    /** And lastly, close the modal automatically. */
    this.modalController.dismiss().then();
  }

  ngOnInit(): void {

    /** Reset the form initially. */
    this.formControl.reset();

    /** Update the form if it's for edit purpose. */
    if (this.playlist) {
      this.formControl.setValue(this.playlist.name);
    }

    /** Focus on the form control initially. */
    setTimeout((): void => {
      this.formInput.setFocus();
    }, 150);
  }
}
