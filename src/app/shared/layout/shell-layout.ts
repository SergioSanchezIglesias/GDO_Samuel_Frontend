import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BottomNavComponent } from './bottom-nav/bottom-nav';
import { TopNavComponent } from './top-nav/top-nav';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, BottomNavComponent, TopNavComponent],
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {}
