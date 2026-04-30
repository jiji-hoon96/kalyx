---
"@kalyx/react": patch
---

Replace deprecated `MutableRefObject<T>` with `RefObject<T>` in context types.

`@types/react@19` marks `MutableRefObject` as deprecated (`Use 'RefObject' instead`). In React 19 `RefObject<T>` is itself mutable, so the swap is type-equivalent for the existing `referenceRef` usage in `DatePickerContext` and `RangePickerContext`.

No runtime change. No public API surface change.
