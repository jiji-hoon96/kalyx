---
'@kalyx/react': patch
---

Make per-picker tree-shaking actually work.

The dot-notation exports are built with `Object.assign(Root, { Input, Calendar, … })`.
A bundler cannot prove that call is side-effect-free, so it retained every
sub-component of every picker — importing one picker pulled in all seven. All
seven single-picker scenarios measured byte-identical, within 4% of importing the
entire library.

Annotating the eight `Object.assign` calls with `/*#__PURE__*/` lets bundlers drop
the pickers you don't import. No API, behaviour, or runtime-code change; the
published artifacts are unchanged.

Measured with `pnpm check-tree-shaking` (gzip):

| Import | Before | After |
| --- | ---: | ---: |
| `TimePicker` only | 24.04 KB | **16.18 KB** |
| `YearPicker` only | 24.04 KB | **16.45 KB** |
| `DatePicker` only | 24.04 KB | **18.60 KB** |
| `useDatePicker` only | 24.35 KB | **8.55 KB** |
| all pickers + hooks | 25.01 KB | 25.01 KB |

Importing everything costs exactly what it did, so nobody regresses. The pickers
share a substantial base (context, popover, calendar math), so the saving is real
but well short of linear — one picker is roughly two thirds of all seven, not a
seventh.
