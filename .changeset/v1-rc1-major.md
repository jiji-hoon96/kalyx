---
"@kalyx/react": patch
"@kalyx/core": patch
---

P1 v1.0-rc API/a11y/docs improvements:

- **Popover focus-out close** — `usePopover` now closes the popover when focus leaves the floating layer and the reference element (Tab through). Matches the Radix/Ark dismissable layer pattern.
- **`name` prop + hidden form input** — `DatePicker.Input` accepts a `name` prop. When set, a hidden `<input type="hidden">` is rendered alongside the visible input so the value participates in native form submission and integrates with `react-hook-form` Controller-less flows.
- **IME composition handling** — `DatePicker.Input` now defers parsing during IME composition (`compositionstart` / `compositionend`). Previously, partial Korean / Japanese / Chinese input was repeatedly re-parsed and the user's text disappeared.
- **README parity** — Korean README now has the "Styling with Tailwind CSS" and "Using data attributes" sections that were missing. Version table and bundle-size claim corrected to `v1.0.0-rc.1` / `11.57 KB`.
- **Package metadata** — `peerDependenciesMeta`, `engines.node`, and `publishConfig.provenance` added to both `@kalyx/react` and `@kalyx/core`.
- **`@kalyx/react` description** — corrected from "under 10 KB gzipped" (false claim) to "≤12 KB gzipped".
