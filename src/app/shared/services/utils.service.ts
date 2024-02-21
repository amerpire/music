import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  /** Returns "6" => "06". */
  static getDoubleDigits(input: number): string {
    return (input).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  }

  /** Returns "187" => "03:07". */
  static secondsToTime(input: number): string {
    const minutes: number = Math.floor(input / 60);
    const seconds: number = Math.floor(input - (minutes * 60));
    return `${UtilsService.getDoubleDigits(minutes)}:${UtilsService.getDoubleDigits(seconds)}`;
  }
}
