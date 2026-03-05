export interface NavItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly requiredRole?: 'organizador' | 'usuario';
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Actividades', route: '/oraciones', icon: 'hand-heart' },
  { label: 'Retiros', route: '/retiros', icon: 'map-pin', requiredRole: 'organizador' },
  { label: 'Perfil', route: '/perfil', icon: 'user' },
] as const;
