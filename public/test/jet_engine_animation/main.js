import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(2, 0, 5); // We'll set this after the model loads

// Renderer setup
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// GLTF Loader
const loader = new GLTFLoader();
let mixer;
let jetEngineModel;
let textMesh; // Add text mesh variable

// Arrow arrays
const intakeArrows = [];
const exhaustArrows = [];

// --- Arrow Functions ---

function resetIntakeArrow(arrow) {
    const x = -(Math.random() * 8 + 4); // Start between x=-12 and x=-4
    const funnelRadius = 2.0 - 0.15 * (x + 12);
    
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * funnelRadius;
    const y = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    arrow.position.set(x, y, z);

    const speed = 16 + Math.random() * 8; // Much faster
    // Direction towards the engine inlet center (0,0,0)
    const direction = new THREE.Vector3(-x, -y, -z).normalize();
    arrow.setDirection(direction);
    
    arrow.userData.velocity.copy(direction).multiplyScalar(speed);
}

function createIntakeArrows() {
    const numArrows = 30;
    const arrowGroup = new THREE.Group();
    for (let i = 0; i < numArrows; i++) {
        const dir = new THREE.Vector3(1, 0, 0);
        const origin = new THREE.Vector3(0, 0, 0);
        const length = 0.8;
        const color = 0x00aaff;
        const headLength = 0.1;
        const headWidth = 0.05;
        
        const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth);
        arrowHelper.userData.velocity = new THREE.Vector3();
        
        resetIntakeArrow(arrowHelper);
        
        intakeArrows.push(arrowHelper);
        arrowGroup.add(arrowHelper);
    }
    scene.add(arrowGroup);
}

function resetExhaustArrow(arrow) {
    const startX = 0;
    const startRadius = 0.6;
    
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * startRadius;
    
    arrow.position.set(startX, Math.cos(angle) * radius, Math.sin(angle) * radius);

    const speed = 56 + Math.random() * 24; // Much faster
    const divergence = 0.2;
    // Direction is mostly forward with some random divergence
    const direction = new THREE.Vector3(
        1,
        (Math.random() - 0.5) * divergence,
        (Math.random() - 0.5) * divergence
    ).normalize();

    arrow.setDirection(direction);
    arrow.userData.velocity.copy(direction).multiplyScalar(speed);
}

function createExhaustArrows() {
    const numArrows = 30;
    const arrowGroup = new THREE.Group();
    for (let i = 0; i < numArrows; i++) {
        const dir = new THREE.Vector3(1, 0, 0);
        const origin = new THREE.Vector3(0, 0, 0);
        const length = 1.0;
        const color = 0xffa500;
        const headLength = 0.12;
        const headWidth = 0.06;

        const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth);
        arrowHelper.userData.velocity = new THREE.Vector3();

        resetExhaustArrow(arrowHelper);
        // Delay start for a staggered effect
        arrowHelper.position.x = -Math.random() * 10;
        
        exhaustArrows.push(arrowHelper);
        arrowGroup.add(arrowHelper);
    }
    scene.add(arrowGroup);
}

loader.load(
    '/Rotating Jet Engine.glb',
    function (gltf) {
        const model = gltf.scene;
        jetEngineModel = model;
        scene.add(model);

        // Center the model and adjust camera
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        cameraZ *= 1.8; // Zoom out a bit more so the model is not edge to edge

        camera.position.set(-cameraZ * 0.8, 0, cameraZ);

        const minZ = box.min.z;
        const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ;

        camera.far = cameraToFarEdge * 3;
        camera.updateProjectionMatrix();

        controls.target.copy(center);
        controls.update();

        // Animation setup
        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
            mixer.timeScale = 4; // Much faster engine rotation
            animationsPlaying = true;
        }

        // Create arrows
        createIntakeArrows();
        createExhaustArrows();
        
        // Add 3D text to engine
        createEngineText();
    },
    undefined,
    function (error) {
        console.error('An error happened while loading the model:', error);
    }
);

// Function to create 3D text on engine
function createEngineText() {
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new TextGeometry('eatpl.in', {
            font: font,
            size: 0.09,
            height: 0.005,
            curveSegments: 12,
            bevelEnabled: false
        });
        
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0);
        
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });
        
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0.02, -0.35, 0); // just inside inlet, lower inner cover
        textMesh.rotation.y = -Math.PI / 2;    // face inward (-X), simulating engraving
        
        scene.add(textMesh);
    });
}

// Animation loop
const clock = new THREE.Clock();
let animationsPlaying = false;

function updateArrows(delta) {
    // Update intake arrows
    for (const arrow of intakeArrows) {
        arrow.position.add(arrow.userData.velocity.clone().multiplyScalar(delta));
        if (arrow.position.x > -1) { // When arrow gets close to the inlet
            resetIntakeArrow(arrow);
        }
    }

    // Update exhaust arrows
    for (const arrow of exhaustArrows) {
        arrow.position.add(arrow.userData.velocity.clone().multiplyScalar(delta));
        if (arrow.position.x > 10) { // When arrow flies far away
            resetExhaustArrow(arrow);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer && animationsPlaying) {
        mixer.update(delta);
    }

    updateArrows(delta);

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