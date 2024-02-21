import { FormGroup } from '@angular/forms';

export interface FormData {
  loading: boolean;
  form: FormGroup;
  error?: {};
}
