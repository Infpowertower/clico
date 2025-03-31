# 3D Earth Globe

An interactive 3D Earth globe visualization built with Three.js.

## Features

- Realistic Earth globe with texture mapping
- Terrain elevation using displacement mapping
- Progressive loading of high-resolution elevation data
- Cloud layer with slow rotation
- Starry background
- Level of Detail (LOD) for performance optimization
- Interactive controls:
  - Left-click and drag to rotate the globe
  - Mouse wheel to zoom in and out

## Setup

No build steps required! This project uses ES modules loaded directly from CDN.

1. Clone this repository
2. Open `index.html` in your browser
   - For local development, you may need to use a local server due to CORS restrictions
   - You can run `npx serve` or use any other simple HTTP server

## Technologies Used

- Three.js for 3D rendering
- OrbitControls for mouse interaction
- Earth textures from Three.js examples repository