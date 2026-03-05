import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TokenStoragePort } from '../../../features/auth/domain/ports/token-storage.port';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-top-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavComponent {
  private readonly tokenStorage = inject(TokenStoragePort);

  readonly userRole = this.tokenStorage.userRole;

  readonly visibleNavItems = computed(() => {
    const role = this.userRole();
    return NAV_ITEMS.filter(
      (item) => item.requiredRole === undefined || item.requiredRole === role,
    );
  });
}
