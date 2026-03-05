import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  HandHeart,
  LayoutDashboard,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  MapPin,
  User,
} from 'lucide-angular';

import { TokenStoragePort } from '../../../features/auth/domain/ports/token-storage.port';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ LayoutDashboard, HandHeart, MapPin, User }),
    },
  ],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  private readonly tokenStorage = inject(TokenStoragePort);

  readonly userRole = this.tokenStorage.userRole;

  readonly visibleNavItems = computed(() => {
    const role = this.userRole();
    return NAV_ITEMS.filter(
      (item) => item.requiredRole === undefined || item.requiredRole === role,
    );
  });
}
