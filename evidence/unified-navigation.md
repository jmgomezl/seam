# One visual workspace

All views now share a dark shell, one header renderer and the same route names: Start here, Example checks, Your payload, and More tools. The payload page no longer changes to a cream sidebar workspace or renames itself Your boundary. The active route and scope remain visible. Native disclosure navigation keeps advanced routes available.

Mobile payload actions stack full-width instead of three narrow equal-flex buttons. Form fields and controls have larger text and minimum touch heights. The guided replay's main action appears above request-card details, and heading spacing is relaxed. A compact two-row mobile header retains the scope label.

Validation: 176 tests, TypeScript, production build and whitespace checks. Tests verify shared routes, current-state labels, bindings and existing flows; no execution engine or Firebase configuration changed. Independent Mac mini Chrome QA against this checkout verified the desktop payload keeps the shared dark header; at 390×844 the comparison showed 12.50 versus 1250, three full-width single-line actions, and no horizontal overflow. The first-run heading was legible and its main action visible at y619–667 within the initial fold. The mobile header remained 162px tall with More tools below other links, a nonblocking refinement. No live Firebase or browser export-completion verification was performed.
