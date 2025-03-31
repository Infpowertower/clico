import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialize scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Create Earth globe with displacement mapping for elevation
const earthRadius = 5;
const earthSegments = 128; // Increase resolution for better displacement

// Create higher resolution sphere for displacement mapping
const earthGeometry = new THREE.SphereGeometry(earthRadius, earthSegments, earthSegments);

// Load Earth textures
const textureLoader = new THREE.TextureLoader();

// Load terrain elevation data
const elevationScale = 0.08; // Adjust to control elevation height
const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const earthBumpMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
const earthSpecMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');

// We'll implement progressive loading of elevation data
// First, declare this variable for later use
let earthDisplacementMap;

// Use a higher detail mesh with displacement mapping
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    displacementMap: earthDisplacementMap, // Use displacement for elevation
    displacementScale: 0,  // Initial scale set to 0, will be updated when texture loads
    displacementBias: -0.15 * elevationScale, // Adjust to lower oceans
    bumpMap: earthBumpMap,
    bumpScale: 0.02,
    specularMap: earthSpecMap,
    specular: new THREE.Color(0x333333),
    shininess: 25
});

// Create the globe
const earth = new THREE.Mesh(earthGeometry, earthMaterial);

// Add Level of Detail management
// This helps performance by reducing detail at distance
const lod = new THREE.LOD();

// Add multiple detail levels
// High detail - original mesh with displacement
lod.addLevel(earth, 0);

// Medium detail - less segments
const medGeometry = new THREE.SphereGeometry(earthRadius, earthSegments / 2, earthSegments / 2);
const medEarth = new THREE.Mesh(medGeometry, earthMaterial.clone());
lod.addLevel(medEarth, 20);

// Low detail - even less segments
const lowGeometry = new THREE.SphereGeometry(earthRadius, earthSegments / 4, earthSegments / 4);
const lowEarth = new THREE.Mesh(lowGeometry, earthMaterial.clone());
lod.addLevel(lowEarth, 40);

scene.add(lod);

// Add clouds layer - adjusted to account for elevation
const cloudRadius = earthRadius + 0.2; // Slightly larger than earth with elevation
const cloudGeometry = new THREE.SphereGeometry(cloudRadius, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
    transparent: true,
    opacity: 0.4,
    depthWrite: false // Fix transparency sorting issues
});

const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Load elevation data with proper progressive loading
// First use a simpler bump map for immediate feedback
earthMaterial.displacementMap = earthBumpMap;
earthMaterial.displacementScale = elevationScale * 0.3;

// Then load high resolution data for better quality elevation
earthDisplacementMap = textureLoader.load(
    'gebco_08_rev_elev_21600x10800.png',
    (texture) => {
        // Replace with high resolution when loaded
        console.log('High-resolution elevation data loaded');
        earthMaterial.displacementMap = texture;
        earthMaterial.displacementScale = elevationScale;

        // After loading, recalculate normals for better lighting
        earth.geometry.computeVertexNormals();
        medEarth.geometry.computeVertexNormals();
        lowEarth.geometry.computeVertexNormals();
    }
);

// Add stars background
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Setup camera position
camera.position.z = 15;

// Add OrbitControls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 6;  // Minimum zoom
controls.maxDistance = 50; // Maximum zoom
controls.rotateSpeed = 0.8;

// Set up for LOD update in animation loop
controls.addEventListener('change', () => {
    // Update LOD based on camera distance
    lod.update(camera);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add loading indicator
const loadingElem = document.createElement('div');
loadingElem.style.position = 'absolute';
loadingElem.style.top = '40px';
loadingElem.style.left = '10px';
loadingElem.style.color = 'white';
loadingElem.style.backgroundColor = 'rgba(0,0,0,0.5)';
loadingElem.style.padding = '10px';
loadingElem.style.borderRadius = '5px';
loadingElem.style.fontFamily = 'Arial, sans-serif';
loadingElem.textContent = 'Loading elevation data...';
document.body.appendChild(loadingElem);

// Hide loading indicator when high-res data is loaded
textureLoader.manager.onLoad = () => {
    loadingElem.style.display = 'none';
};

// Animation loop with LOD handling
function animate() {
    requestAnimationFrame(animate);

    // Update LOD for the Earth mesh
    lod.update(camera);

    // Slowly rotate clouds
    clouds.rotation.y += 0.0005;

    // Sync rotation of LOD with clouds
    // This keeps them aligned when the user isn't interacting
    if (!controls.enabled) {
        lod.rotation.y += 0.0001; // Very subtle automatic rotation
    }

    // Update controls
    controls.update();

    renderer.render(scene, camera);
}

// Add UI indicator for loading progress
const onProgress = (url, loaded, total) => {
    if (total > 0) {
        const percent = (loaded / total * 100).toFixed(0);
        loadingElem.textContent = `Loading elevation data: ${percent}%`;
    }
};

textureLoader.manager.onProgress = onProgress;

// Start animation loop
animate();