---
'@kalyx/react': patch
---

fix(a11y): restore focus to the trigger when a picker popover closes and focus was lost

When a keyboard user opened a picker, moved into the calendar grid, and pressed
Escape, focus fell to `<body>` instead of returning to the Input/Trigger — a
WAI-ARIA recovery failure that left keyboard users stranded.

Root cause (the prior `el !== referenceRef.current` guard's premise was wrong):
the grid auto-focuses the selected day on open, and because `usePopover` runs
its capture effect *after* the child grid's focus effect, the "previously
focused" element it recorded was the day button — not the Input. On close that
button unmounts, so the old restore either skipped (guard) or focused a detached
node, dropping focus to `<body>`.

The popover now restores focus only when it was actually lost
(`document.activeElement === document.body`), targeting the still-connected
captured element or falling back to the reference control. Closing by clicking
another field leaves that field focused — restoration no longer steals it.
