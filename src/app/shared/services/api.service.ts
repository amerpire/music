import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetParams } from '@app/shared/interfaces/get-params';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { SongApi } from '@app/shared';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  /** Base URL of API endpoints. */
  readonly base: string = `${environment.api}`;

  constructor(private http: HttpClient) {
  }

  download(params: GetParams): Observable<HttpEvent<Blob>> {
    return this.http.get(`${this.base}download`, {
      params,
      observe: 'events',
      reportProgress: true,
      responseType: 'blob',
    });
  }

  search(params: GetParams): Observable<SongApi[]> {
    return this.http.get<SongApi[]>(`${this.base}search`, { params });
  }
}
