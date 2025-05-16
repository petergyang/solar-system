import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 2.5, 600); // Increased intensity and distance slightly
pointLight.position.set(0, 0, 0); // Sun's position
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x606060, 0.8); // Increased ambient light intensity
scene.add(ambientLight);

// Starry Background
const starTexture = textureLoader.load('textures/2k_stars.jpg');
scene.background = starTexture;

// Sun
const sunGeometry = new THREE.SphereGeometry(5, 64, 64); // Increased segments for better texture mapping
const sunTexture = textureLoader.load('textures/2k_sun.jpg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); 
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets Data (radius, color, distance, speeds, texture file)
const planetsData = [
    { name: "Mercury", radius: 0.5, distance: 10, orbitalSpeed: 0.04, rotationSpeed: 0.005, angle: 0, textureFile: 'textures/2k_mercury.jpg', description: "Mercury is the smallest planet in our solar system and nearest to the Sun. It is only slightly larger than Earth's Moon." },
    { name: "Venus", radius: 0.9, distance: 15, orbitalSpeed: 0.025, rotationSpeed: 0.003, angle: 0, textureFile: 'textures/2k_venus.jpg', description: "Venus is the second planet from the Sun and is Earth's closest planetary neighbor. It's the hottest planet in our solar system." },
    { name: "Earth", radius: 1, distance: 20, orbitalSpeed: 0.015, rotationSpeed: 0.01, angle: 0, textureFile: 'textures/2k_earth.jpg', description: "Earth is our home planet, the third planet from the Sun. It is the only planet known to have an atmosphere containing free oxygen, oceans of water on its surface, and life." },
    { name: "Mars", radius: 0.7, distance: 25, orbitalSpeed: 0.01, rotationSpeed: 0.012, angle: 0, textureFile: 'textures/2k_mars.jpg', description: "Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere. Mars is also a dynamic planet with seasons, polar ice caps, canyons, extinct volcanoes, and evidence that it was even more active in the past." },
    { name: "Jupiter", radius: 3.5, distance: 35, orbitalSpeed: 0.005, rotationSpeed: 0.02, angle: 0, textureFile: 'textures/2k_jupiter.jpg', description: "Jupiter is the fifth planet from the Sun and the largest in the solar system. It is a gas giant, more than twice as massive as all the other planets combined." },
    { name: "Saturn", radius: 3, distance: 45, orbitalSpeed: 0.003, rotationSpeed: 0.018, angle: 0, textureFile: 'textures/2k_saturn.jpg', ringTextureFile: 'textures/2k_saturn_ring.png', description: "Saturn is the sixth planet from the Sun and the second largest in the solar system. Adorned with thousands of beautiful ringlets, Saturn is unique among the planets." },
    { name: "Uranus", radius: 2, distance: 55, orbitalSpeed: 0.002, rotationSpeed: 0.015, angle: 0, textureFile: 'textures/2k_uranus.jpg', description: "Uranus is the seventh planet from the Sun. It is an ice giant and the third-largest diameter in our solar system. It rotates at a nearly 90-degree angle from the plane of its orbit, making it appear to spin on its side." },
    { name: "Neptune", radius: 1.8, distance: 65, orbitalSpeed: 0.001, rotationSpeed: 0.014, angle: 0, textureFile: 'textures/2k_neptune.jpg', description: "Neptune is the eighth and most distant major planet orbiting our Sun. It is a dark, cold, and very windy ice giant, more than 30 times as far from the Sun as Earth." },
];

const planets = [];
const orbitLines = []; // To potentially update orbits if needed, though not in this step
let earthObject = null; // To store a reference to the Earth mesh
let moonObject = null;  // To store a reference to the Moon mesh

// Moon properties
const MOON_TEXTURE_FILE = 'textures/2k_moon.jpg';
const MOON_RADIUS_SCALE = 0.27; // Relative to Earth's radius
const MOON_ORBIT_RADIUS_SCALE = 2.5; // Multiplier of Earth's radius for orbit distance
const MOON_ORBITAL_SPEED = 0.05; // Radians per frame around Earth
const MOON_AXIAL_ROTATION_SPEED = 0.005;
let moonOrbitAngle = 0;

// Store the currently selected planet for camera focusing
let selectedPlanet = null;
let desiredCameraPosition = new THREE.Vector3(); // To store the calculated ideal camera position
let isAnimatingToPlanet = false; // Flag to control the animation

// Initial camera position (also used for reset)
const initialCameraPosition = new THREE.Vector3(0, 20, 70);
const initialControlsTarget = new THREE.Vector3(0, 0, 0);

planetsData.forEach(planetData => {
    const planetGeometry = new THREE.SphereGeometry(planetData.radius, 64, 64);
    const planetTexture = textureLoader.load(planetData.textureFile);
    const planetMaterial = new THREE.MeshBasicMaterial({ 
        map: planetTexture
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.userData = planetData; 
    scene.add(planet);
    planets.push(planet);

    if (planetData.name === "Earth") {
        earthObject = planet; // Store Earth reference

        const moonRadius = planetData.radius * MOON_RADIUS_SCALE;
        const moonOrbitRadius = planetData.radius * MOON_ORBIT_RADIUS_SCALE;

        const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
        const moonTexture = textureLoader.load(MOON_TEXTURE_FILE);
        const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        moon.userData = { 
            orbitRadius: moonOrbitRadius, 
            orbitalSpeed: MOON_ORBITAL_SPEED, 
            axialSpeed: MOON_AXIAL_ROTATION_SPEED 
        };

        // Initial position - will be updated in animate loop
        moon.position.set(moonOrbitRadius, 0, 0);
        
        earthObject.add(moon); // Add Moon as a child of Earth
        moonObject = moon; // Store Moon reference
    }

    // Create orbit line
    const orbitCurve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        planetData.distance, planetData.distance, // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );
    const points = orbitCurve.getPoints(128); // Number of segments
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineDashedMaterial({
        color: 0x555555, // Light gray for the orbit line
        linewidth: 1,
        scale: 1,
        dashSize: 0.2, // Length of a dash
        gapSize: 0.2   // Length of the gap
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.computeLineDistances(); // Crucial for dashed lines
    orbitLine.rotation.x = Math.PI / 2; // Rotate to lay flat on XZ plane
    scene.add(orbitLine);
    orbitLines.push(orbitLine);

    // Saturn's Rings
    if (planetData.name === "Saturn") {
        const ringTexture = textureLoader.load(planetData.ringTextureFile);
        // Rings should also be MeshBasicMaterial if planets are, for consistency
        const ringGeometry = new THREE.RingGeometry(planetData.radius * 1.2, planetData.radius * 2.2, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.01 // Retain alphaTest for transparency
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Rotate rings to be horizontal
        // ring.rotation.z = 0.1; // Optional slight tilt
        planet.add(ring); // Add rings as a child of Saturn
    }
});

// Adjust orbital speeds (e.g., make them 50% slower)
planetsData.forEach(data => {
    data.orbitalSpeed *= 0.5; 
});

// Camera Position
camera.position.copy(initialCameraPosition);
camera.lookAt(initialControlsTarget);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(initialControlsTarget);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

// Raycasting for planet selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoPanel = document.getElementById('infoPanel');
const planetNameElement = document.getElementById('planetName');
const planetDescriptionElement = document.getElementById('planetDescription');

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const planetData = clickedPlanet.userData;

        // Update info panel
        planetNameElement.textContent = planetData.name;
        planetDescriptionElement.textContent = planetData.description;
        infoPanel.style.display = 'block';

        selectedPlanet = clickedPlanet;
        isAnimatingToPlanet = true; 

    } else {
        // Clicked on background: Reset view
        selectedPlanet = null; // Deselect planet
        isAnimatingToPlanet = true; // Trigger animation back to default
        infoPanel.style.display = 'none';

        // The animate() function will now use initialCameraPosition and initialControlsTarget
        // when selectedPlanet is null and isAnimatingToPlanet is true.
    }
}

window.addEventListener('click', onMouseClick, false);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update planet positions and rotations
    planets.forEach(planet => {
        const data = planet.userData;
        data.angle += data.orbitalSpeed;
        planet.position.x = Math.cos(data.angle) * data.distance;
        planet.position.z = Math.sin(data.angle) * data.distance;
        planet.rotation.y += data.rotationSpeed;
    });

    // Animate Moon if it exists
    if (earthObject && moonObject) {
        moonOrbitAngle += moonObject.userData.orbitalSpeed;
        moonObject.position.x = Math.cos(moonOrbitAngle) * moonObject.userData.orbitRadius;
        moonObject.position.z = Math.sin(moonOrbitAngle) * moonObject.userData.orbitRadius;
        moonObject.rotation.y += moonObject.userData.axialSpeed;
    }

    if (isAnimatingToPlanet) {
        if (selectedPlanet) {
            const planetWorldPosition = selectedPlanet.getWorldPosition(new THREE.Vector3());
            controls.target.lerp(planetWorldPosition, 0.05); 

            const offset = new THREE.Vector3(0, selectedPlanet.userData.radius * 1.5, selectedPlanet.userData.radius * 3 + 7); // Adjusted offset for a closer but not too close view
            desiredCameraPosition.copy(planetWorldPosition).add(offset);
            camera.position.lerp(desiredCameraPosition, 0.05);

            if (controls.target.distanceTo(planetWorldPosition) < 0.1 && camera.position.distanceTo(desiredCameraPosition) < 0.1) {
                isAnimatingToPlanet = false;
                controls.target.copy(planetWorldPosition); 
                camera.position.copy(desiredCameraPosition); 
            }
        } else {
            // Animating back to initial/default view
            controls.target.lerp(initialControlsTarget, 0.05);
            camera.position.lerp(initialCameraPosition, 0.05);

            if (controls.target.distanceTo(initialControlsTarget) < 0.1 && camera.position.distanceTo(initialCameraPosition) < 0.1) {
                isAnimatingToPlanet = false;
                controls.target.copy(initialControlsTarget);
                camera.position.copy(initialCameraPosition);
            }
        }
    } else if (selectedPlanet) {
        // Planet selected, no animation in progress, keep target updated
        const planetWorldPosition = selectedPlanet.getWorldPosition(new THREE.Vector3());
        controls.target.copy(planetWorldPosition);
    } // If no planet selected and not animating, controls.target remains where it was (or at initial if just reset)

    controls.update(); 
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 