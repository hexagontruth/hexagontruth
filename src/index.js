import './styles/style.scss';

import Page from './classes/page.js';

window.page = new Page();

console.log(`
================================================================================
Hexagonal greetings, friend.

This site doesn't do much, but some rudimentary controls for anyone interested:

- Click: Place cells

- Shift+Click: Remove cells

- <R>: Restart from new random seed

- Shift+<R>: Clear grid (useful for manual placement)

- <H>: Reset pan and zoom transforms

- <T>: Pause/resume

- <G>: Step/pause

- <WASD>: Pan

- <,>: Zoom out

- <.>: Zoom in

- <C>: Toggle counter

- <Esc>: Hide page content

Various uniforms can be set manually on \`page.players.main.uniforms\`.

================================================================================
`.trim());
