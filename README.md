# 3D Solar System

A simple interactive 3D model of the solar system built with JavaScript and Three.js.

## Tech Stack
- **JavaScript**: Core programming language
- **Three.js**: 3D rendering library
- **Node.js + http-server**: Lightweight static file server for local development

## Project Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd solar-system
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the project locally:**
   ```bash
   npm start
   ```
   This will typically start a server at `http://localhost:8080`.
4. **Open your browser:**
   Navigate to the address shown in your terminal (usually `http://localhost:8080`).

## Milestones

### Milestone 1: Basic 3D Solar System
- Render the sun and all major planets as spheres in 3D space
- Set up a basic Three.js scene with camera and lighting

### Milestone 2: Orbital Motion
- Animate planets to orbit the sun at proportional speeds and distances
- Add simple rotation to planets
- Add textures to the planets using image files

### Milestone 3: Interactivity & Info
- Add camera controls (zoom, pan, rotate)
- Display planet information on click or hover
- Polish visuals (lighting, backgrounds)

## Folder Structure
```
solar-system/
├── index.html
├── main.js
├── README.md
└── ...
```

## License
MIT 