import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

const INPUT_TYPE = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
} as const;

type InputType = (typeof INPUT_TYPE)[keyof typeof INPUT_TYPE];

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly errorMessage = input<string>('');
  readonly hint = input<string>('');

  readonly value = model<string>('');
}
