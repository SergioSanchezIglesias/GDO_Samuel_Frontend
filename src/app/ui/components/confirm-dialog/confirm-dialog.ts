import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Confirmar');
  readonly cancelLabel = input<string>('Cancelar');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
