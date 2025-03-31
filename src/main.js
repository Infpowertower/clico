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

// Create Earth globe
const earthGeometry = new THREE.SphereGeometry(5, 64, 64);

// Load Earth textures
const textureLoader = new THREE.TextureLoader();

const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const earthBumpMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
const earthSpecMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');

const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    bumpMap: earthBumpMap,
    bumpScale: 0.05,
    specularMap: earthSpecMap,
    specular: new THREE.Color(0x333333),
    shininess: 25
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Add clouds layer
const cloudGeometry = new THREE.SphereGeometry(5.1, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
    transparent: true,
    opacity: 0.4
});

const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

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

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Slowly rotate clouds
    clouds.rotation.y += 0.0005;
    
    // Update controls
    controls.update();
    
    renderer.render(scene, camera);
}

animate();