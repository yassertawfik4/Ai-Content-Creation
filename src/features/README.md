# Feature module structure

Each product area owns its route pages, UI, stateful workflows, validation, and feature-only configuration.

```text
feature/
├── pages/       Route entry points and page composition
├── components/  Feature-only presentational UI
├── hooks/       Async workflows, form state, timers, and side effects
├── model/       Pure configuration and transformation helpers
└── schema/      Runtime validation
```

Keep route pages focused on composition. Put reusable visual sections in `components`, and put request/state orchestration in `hooks`. Code shared by multiple features belongs in `src/components`, `src/hooks`, or `src/lib` depending on whether it is UI, React behavior, or framework-independent logic.

Import feature internals directly instead of adding broad barrel exports. This keeps lazy route bundles analyzable and makes ownership clear.
