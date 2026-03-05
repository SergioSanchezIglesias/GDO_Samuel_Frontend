import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-text-link',
  imports: [RouterLink],
  templateUrl: './text-link.html',
  styleUrl: './text-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextLinkComponent {
  readonly prefixText = input.required<string>();
  readonly actionText = input.required<string>();
  readonly route = input.required<string>();
}
