import { Observable, Subject } from 'rxjs';

/**
 * Convert blob to base64 string.
 * @returns base64 string of the given blob.
 * @param blob to convert to base64 string.
 */
export function blobToBase64(blob: Blob): Observable<string> {
  const subject = new Subject<string>();
  const reader = new FileReader();
  reader.onerror = (): void => {
    subject.error(reader.error);
  };
  reader.onload = (): void => {
    subject.next(String(reader.result));
  };
  reader.readAsDataURL(blob);
  return subject;
}
