## 2024-05-22 - Keyboard Accessible Cards
**Learning:** In this vanilla JS project, interactive `article` cards were completely inaccessible to keyboard users. Adding `tabindex="0"`, `role="button"`, and `keydown` handlers is a low-effort, high-impact pattern for this repo.
**Action:** Default to including keyboard support when creating any interactive elements in `app.js`, not just mouse handlers.
