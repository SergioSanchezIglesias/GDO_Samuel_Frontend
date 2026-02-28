import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, tap } from 'rxjs';

import { API_URL } from '../../../core/config/api.config';
import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly router = inject(Router);

  onLogout(): void {
    this.http
      .post<void>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.tokenStorage.clearTokens();
          this.router.navigate(['/auth/login']);
        }),
        catchError(() => {
          this.tokenStorage.clearTokens();
          this.router.navigate(['/auth/login']);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
