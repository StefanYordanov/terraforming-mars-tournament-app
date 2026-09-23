import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppState } from '../models/app-state.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:4000/api';

  public getState$(): Observable<{ state: AppState; canUndo: boolean; canRedo: boolean }> {
    return this.get('/state');
  }

  public saveState$(state: AppState): Observable<{ state: AppState; canUndo: boolean; canRedo: boolean }> {
    return this.post('/state', state);
  }

  public undoState$(): Observable<{ state: AppState; canUndo: boolean; canRedo: boolean }> {
    return this.put('/state/undo', {});
  }

  public redoState$(): Observable<{ state: AppState; canUndo: boolean; canRedo: boolean }> {
    return this.put('/state/redo', {});
  }

  private get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.API_BASE_URL + endpoint);
  }

  private post<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.post<T>(this.API_BASE_URL + endpoint, body);
  }

  private put<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.put<T>(this.API_BASE_URL + endpoint, body);
  }

  private delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.API_BASE_URL + endpoint);
  }
}