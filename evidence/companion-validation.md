# Companion guide validation · 2026-11-18

- Added an original inline SVG character, a compact contextual guide and explicit select/compare/confirm/save progression.
- The UI visibly identifies itself as a scripted guide with local checks, not AI inference. No API/model calls, uploads or persistence added.
- Confirmation is only acknowledgement of the demo interpretation. It is not deployment approval, verified production behavior or a saved customer rule.
- Fixed a confusing split state: comparison now also populates the current adapter output, probe matrix and evidence export. It deliberately selects the bundled example, not a custom payload.
- Chrome desktop: observed Money 11/20→20/20, confirmation→save action, completed Markdown download, scenario-change reset and Missing/null 6/8→8/8 with synchronized original failure/matrix.
- Two companion unit tests added. Full 87-test suite, TypeScript/Vite build and whitespace check pass on Mac mini.
- Responsive CSS included; mobile visual checks not completed in this pass. Character is decorative to screen readers; actionable controls have text labels and comparison moves focus to its status.
- Existing runtime-readiness branch not modified. No publication or deployment in this commit.
