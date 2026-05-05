# Code Review Rules

## TypeScript
- Usar `const`/`let`, nunca `var`
- Preferir `interface` sobre `type` para estructuras
- Evitar `any`; usar `unknown` cuando el tipo no esté definido
- Activar `strict: true` en tsconfig

## Angular
- Usar componentes funcionales con `inject()` para dependencias
- Preferir `OnPush` change detection
- Usar `signal()` para estado local de componente
-命名: componentes en kebab-case, clases en PascalCase

## General
- Código auto-documentado; evitar comentarios innecesarios
- Mantener funciones pequeñas y con responsabilidad única
- Nombres descriptivos en español para commits (conventional commits)
- Tests unitarios para lógica de negocio