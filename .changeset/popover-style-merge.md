---
'@kalyx/react': patch
---

Fix popover styling regression that broke documentation live previews.

- `DatePicker.Popover` and `RangePicker.Popover` now merge user-provided `style` props *under* Floating UI's positioning instead of being overwritten by it. Previously, passing `style={{...}}` to a Popover stripped away `position: absolute`, `top`, `left`, and `transform`, causing the popover to render as a static block at full container width.
- The popover is now hidden until Floating UI computes its position, eliminating an unpositioned first-frame flash on every open.
- The shared `usePopover` hook also wires the floating element's reference synchronously in the ref callback, so positioning is resolved before paint in most cases.
