# SCT_WD_3 — Tic Tac Toe

An interactive tic-tac-toe game built with vanilla HTML, CSS, and
JavaScript, styled like a chalkboard. Play against another person on the
same device, or against a computer opponent with two difficulty levels.

## Files

```
SCT_WD_3/
│── index.html   → structure/markup
│── style.css    → chalkboard styling and animations
│── script.js    → game state, click handling, win detection, AI
│── README.md    → this file
```

## Features

- **Two modes**
  - **Vs Computer** — play as X against an AI opponent
  - **Two Player** — play X vs O on the same device, turns alternate
- **Two AI difficulties** (Vs Computer mode only)
  - **Easy** — takes an immediate win when available, sometimes blocks
    your winning move, otherwise plays randomly — beatable and forgiving
  - **Unbeatable** — full minimax search with alpha-beta pruning; it will
    never lose, at best you can force a draw
- **Click handling** — tapping a cell places the current player's mark if
  the cell is empty and the game isn't already over
- **Win detection** — checks all 8 winning lines (3 rows, 3 columns, 2
  diagonals) after every move, plus draw detection when the board fills
  with no winner
- **Winning line highlight** — the three winning cells glow and an
  animated line is drawn across them
- **Scoreboard** — tracks X wins, O wins, and draws across rounds
- **New game** button resets the board (keeps the score), **Reset scores**
  clears the scoreboard back to zero

## Usage

Open `index.html` in any modern browser — no build step or dependencies
required (Google Fonts load from a CDN link in `index.html`).

## Tech

- HTML5
- CSS3 (custom properties, CSS Grid, SVG for the winning line, keyframe
  animations)
- Vanilla JavaScript (ES5/ES6-compatible, no frameworks or libraries) —
  including a from-scratch minimax + alpha-beta pruning AI
  
