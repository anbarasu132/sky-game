# Sky Sprint

Sky Sprint is a simple endless runner game built with React and Vite. Jump over obstacles, survive as long as you can, and try to beat your best score.

## Features

- Endless runner gameplay with increasing speed
- Jump controls with keyboard and on-screen button
- Pause and resume support
- Best score saved in browser `localStorage`
- Responsive full-screen game layout

## Tech Stack

- React 18
- Vite
- Plain CSS

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Run the project

```bash
npm run dev
```

Open the local Vite URL shown in your terminal, usually `http://localhost:5173`.

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally

## How to Play

- Press `Space` to start the game
- Press `Space` again to jump
- Press `P` to pause or resume
- You can also use the on-screen `Jump` button
- Avoid hitting obstacles

## Game Details

- The player starts on the left side of the screen
- Obstacles spawn from the right and move toward the player
- Game speed increases as your score goes up
- The current score and best score are shown at the top

## Project Structure

```text
game1/
|-- src/
|   |-- App.jsx
|   |-- App.css
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

## Notes

- Best score is stored in the browser, so it may differ between devices or browsers.
- The `dist/` folder contains the production build output.

## License

This project is for learning and personal use unless you choose to add a license.
