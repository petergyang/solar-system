// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 2, 500); // Increased intensity and distance
pointLight.position.set(0, 0, 0); // Sun's position
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
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
    { name: "Mercury", radius: 0.5, distance: 10, orbitalSpeed: 0.04, rotationSpeed: 0.005, angle: 0, textureFile: 'textures/2k_mercury.jpg' },
    { name: "Venus", radius: 0.9, distance: 15, orbitalSpeed: 0.025, rotationSpeed: 0.003, angle: 0, textureFile: 'textures/2k_venus.jpg' },
    { name: "Earth", radius: 1, distance: 20, orbitalSpeed: 0.015, rotationSpeed: 0.01, angle: 0, textureFile: 'textures/2k_earth.jpg' },
    { name: "Mars", radius: 0.7, distance: 25, orbitalSpeed: 0.01, rotationSpeed: 0.012, angle: 0, textureFile: 'textures/2k_mars.jpg' },
    { name: "Jupiter", radius: 3.5, distance: 35, orbitalSpeed: 0.005, rotationSpeed: 0.02, angle: 0, textureFile: 'textures/2k_jupiter.jpg' },
    { name: "Saturn", radius: 3, distance: 45, orbitalSpeed: 0.003, rotationSpeed: 0.018, angle: 0, textureFile: 'textures/2k_saturn.jpg', ringTextureFile: 'textures/2k_saturn_ring.png' },
    { name: "Uranus", radius: 2, distance: 55, orbitalSpeed: 0.002, rotationSpeed: 0.015, angle: 0, textureFile: 'textures/2k_uranus.jpg' },
    { name: "Neptune", radius: 1.8, distance: 65, orbitalSpeed: 0.001, rotationSpeed: 0.014, angle: 0, textureFile: 'textures/2k_neptune.jpg' },
];

const planets = [];

planetsData.forEach(planetData => {
    const planetGeometry = new THREE.SphereGeometry(planetData.radius, 64, 64); // Increased segments
    const planetTexture = textureLoader.load(planetData.textureFile);
    const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.userData = planetData; 
    scene.add(planet);
    planets.push(planet);

    // Saturn's Rings
    if (planetData.name === "Saturn") {
        const ringTexture = textureLoader.load(planetData.ringTextureFile);
        // Adjusted innerRadius and outerRadius to better fit Saturn's typical ring proportions
        const ringGeometry = new THREE.RingGeometry(planetData.radius * 1.2, planetData.radius * 2.2, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.01 // Prevents transparent parts from casting shadows or being fully opaque
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Rotate rings to be horizontal
        // ring.rotation.z = 0.1; // Optional slight tilt
        planet.add(ring); // Add rings as a child of Saturn
    }
});

// Camera Position
camera.position.z = 70;
camera.position.y = 20;
camera.lookAt(0,0,0);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Sun rotation (optional)
    sun.rotation.y += 0.001;

    // Animate planets
    planets.forEach(planet => {
        const data = planet.userData;
        data.angle += data.orbitalSpeed;

        planet.position.x = Math.cos(data.angle) * data.distance;
        planet.position.z = Math.sin(data.angle) * data.distance;

        planet.rotation.y += data.rotationSpeed;
    });

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 