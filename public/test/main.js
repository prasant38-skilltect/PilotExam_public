import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js';
import { Lensflare, LensflareElement } from 'https://unpkg.com/three@0.155.0/examples/jsm/objects/Lensflare.js';
import { CSS3DRenderer, CSS3DObject } from 'https://unpkg.com/three@0.155.0/examples/jsm/renderers/CSS3DRenderer.js';

class EarthScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.cssRenderer = new CSS3DRenderer();
        
        this.earth = null;
        this.clouds = null;
        this.atmosphere = null;
        this.controls = null;
        this.joystick = null;
        this.stars = null;
        this.layerGroup = new THREE.Group();
        this.isPlaying = false;
        this.isMuted = false;
        this.isNarrating = false;
        this.currentNarration = null;
        this.narrationScript = [];
        this.currentChapterIndex = 0;
        this.narrationTimeout = null;
        this.subtitleTimeout = null;
        this.subtitlesEnabled = true;
        this.gasParticles = null;
        this.gravityConstant = 0.002;
        this.greenhouseEffectGroup = new THREE.Group();
        this.solarRadiationParticles = null;
        this.terrestrialRadiationParticles = null;
        this.greenhouseGasLayer = null;
        this.greenhouseGasHalo = null;
        this.ozoneLayer = null;
        this.uvRadiationParticles = null;
        this.heatMoistureParticles = null;
        this.earthHeatParticles = null;
        this.conductionParticles = null;
        this.convectionParticles = null;
        this.radiationParticles = null;
        this.latentHeatParticles = null;
        this.solarHeatingParticles = null;
        this.troposphereVisual = null;
        this.temperatureChangeParticles = null;
        this.stratosphereVisual = null;
        this.mesosphereVisual = null;
        this.thermosphereVisual = null;
        this.exosphereVisual = null;
        
        this.voices = [];
        this.selectedVoice = null;
        this.audioContext = null;
        
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        this.init();
    }
    
    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // CSS3D Renderer for labels
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('css-renderer').appendChild(this.cssRenderer.domElement);
        
        // Camera position
        this.camera.position.set(0, 0, 3.5);
        
        // Narration script
        this.setupNarrationScript();
        
        // Controls
        this.setupControls();
        
        // Lighting
        this.setupLighting();
        
        // Create Earth
        this.createEarth();
        
        // Create stars
        this.createStars();
        
        // Event listeners
        this.setupEventListeners();
        
        // Start animation
        this.animate();
        
        // Hide loading
        document.getElementById('loading').style.display = 'none';
    }
    
    setupNarrationScript() {
        this.narrationScript = [
            {
                title: "The Atmosphere",
                text: [
                    { line: "The atmosphere is a mixture of gases surrounding the Earth.", time: 0 },
                    { line: "It's held by gravity and rotates with our planet.", time: 4000 },
                    { line: "Though it seems boundless, it extends roughly 800 kilometers up.", time: 8000 },
                ],
                action: () => this.focusOnAtmosphere(),
                duration: 13500
            },
            {
                title: "Atmosphere Constituents",
                text: [
                    { line: "Our atmosphere is a complex cocktail of gases.", time: 0 },
                    { line: "The vast majority, about 78 percent, is Nitrogen.", time: 4000 },
                    { line: "Followed by about 21 percent Oxygen, which is vital for life.", time: 9000 },
                    { line: "Together, Nitrogen and Oxygen make up almost 99 percent of the air.", time: 14000 },
                    { line: "Argon makes up nearly 1 percent.", time: 19000 },
                    { line: "The rest are trace amounts of other gases, like Neon, Helium, Methane, Krypton, Hydrogen and others.", time: 23000 },
                    { line: "In addition, the air contains variable amounts of water vapour and solid particles.", time: 31000 }
                ],
                action: () => this.showGasParticlesSequentially(),
                duration: 38000
            }
            // More narration script items would go here...
        ];
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 8;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (Sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 3, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }
    
    createEarth() {
        // Earth geometry
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Earth material with texture
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: this.createEarthTexture(),
            bumpMap: this.createEarthTexture(),
            bumpScale: 0.05,
            shininess: 30
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);
        
        // Create atmosphere
        this.createAtmosphere();
    }
    
    createEarthTexture() {
        // Create a simple procedural Earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Create a simple Earth-like texture
        const gradient = context.createLinearGradient(0, 0, 512, 256);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.3, '#22c55e');
        gradient.addColorStop(0.7, '#eab308');
        gradient.addColorStop(1, '#f59e0b');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 256);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createAtmosphere() {
        // Atmosphere layer
        const atmosphereGeometry = new THREE.SphereGeometry(1.1, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
        
        // Outer atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                'c': { type: 'f', value: 1.0 },
                'p': { type: 'f', value: 1.4 },
                glowColor: { type: 'c', value: new THREE.Color(0x87ceeb) },
                viewVector: { type: 'v3', value: this.camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glow);
    }
    
    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const starsPositions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
            starsPositions[i] = (Math.random() - 0.5) * 100;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5
        });
        
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Media controls
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('next-btn').addEventListener('click', () => this.nextChapter());
        document.getElementById('back-btn').addEventListener('click', () => this.previousChapter());
        document.getElementById('mute-btn').addEventListener('click', () => this.toggleMute());
        document.getElementById('subtitles-btn').addEventListener('click', () => this.toggleSubtitles());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    play() {
        this.isPlaying = true;
        document.getElementById('play-btn').classList.add('hidden');
        document.getElementById('pause-btn').classList.remove('hidden');
        document.getElementById('back-btn').classList.remove('hidden');
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('slide-counter').classList.remove('hidden');
        document.getElementById('mute-btn').classList.remove('hidden');
        document.getElementById('subtitles-btn').classList.remove('hidden');
        
        this.startNarration();
    }
    
    pause() {
        this.isPlaying = false;
        document.getElementById('play-btn').classList.remove('hidden');
        document.getElementById('pause-btn').classList.add('hidden');
        
        this.stopNarration();
    }
    
    nextChapter() {
        if (this.currentChapterIndex < this.narrationScript.length - 1) {
            this.currentChapterIndex++;
            this.startNarration();
        }
    }
    
    previousChapter() {
        if (this.currentChapterIndex > 0) {
            this.currentChapterIndex--;
            this.startNarration();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        document.getElementById('mute-btn').textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    toggleSubtitles() {
        this.subtitlesEnabled = !this.subtitlesEnabled;
        document.getElementById('subtitles-btn').textContent = this.subtitlesEnabled ? '💬' : '💭';
        
        if (!this.subtitlesEnabled) {
            document.getElementById('subtitles').style.display = 'none';
        }
    }
    
    startNarration() {
        this.stopNarration();
        
        if (this.currentChapterIndex >= this.narrationScript.length) return;
        
        const chapter = this.narrationScript[this.currentChapterIndex];
        
        // Update info panel
        document.getElementById('info-title').textContent = chapter.title;
        document.getElementById('info-status').textContent = 'Playing...';
        
        // Update slide counter
        document.getElementById('slide-counter').textContent = 
            `${this.currentChapterIndex + 1}/${this.narrationScript.length}`;
        
        // Execute chapter action
        if (chapter.action) {
            chapter.action();
        }
        
        // Start subtitle sequence
        this.playSubtitles(chapter.text);
        
        // Auto advance to next chapter
        this.narrationTimeout = setTimeout(() => {
            if (this.isPlaying) {
                this.nextChapter();
            }
        }, chapter.duration);
    }
    
    stopNarration() {
        if (this.narrationTimeout) {
            clearTimeout(this.narrationTimeout);
            this.narrationTimeout = null;
        }
        
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
            this.subtitleTimeout = null;
        }
        
        document.getElementById('subtitles').style.display = 'none';
    }
    
    playSubtitles(textArray) {
        if (!this.subtitlesEnabled) return;
        
        let currentIndex = 0;
        
        const showNext = () => {
            if (currentIndex >= textArray.length) return;
            
            const textItem = textArray[currentIndex];
            document.getElementById('subtitles').textContent = textItem.line;
            document.getElementById('subtitles').style.display = 'block';
            
            currentIndex++;
            
            if (currentIndex < textArray.length) {
                const nextDelay = textArray[currentIndex].time - textItem.time;
                this.subtitleTimeout = setTimeout(showNext, nextDelay);
            } else {
                // Hide subtitles after the last line
                this.subtitleTimeout = setTimeout(() => {
                    document.getElementById('subtitles').style.display = 'none';
                }, 3000);
            }
        };
        
        // Start with first subtitle
        showNext();
    }
    
    // Placeholder methods for chapter actions
    focusOnAtmosphere() {
        // Animate camera to focus on atmosphere
        console.log('Focusing on atmosphere...');
    }
    
    showGasParticlesSequentially() {
        // Show gas composition overlay
        document.getElementById('stats-overlay').style.display = 'block';
        document.getElementById('stats-overlay').style.opacity = '1';
        
        // Animate each gas stat
        const stats = ['stat-nitrogen', 'stat-oxygen', 'stat-n2o2', 'stat-argon', 'stat-trace'];
        stats.forEach((stat, index) => {
            setTimeout(() => {
                document.getElementById(stat).classList.add('visible');
            }, index * 1000);
        });
    }
    
    showGreenhouseGasInfoAndHalo() {
        document.getElementById('greenhouse-gas-info').classList.add('visible');
    }
    
    showGreenhouseEffect() {
        // Show greenhouse effect visualization
        console.log('Showing greenhouse effect...');
    }
    
    showOzoneLayer() {
        document.getElementById('ozone-info').classList.add('visible');
    }
    
    showAtmosphereProperties() {
        console.log('Showing atmosphere properties...');
    }
    
    showVerticalDistribution() {
        document.getElementById('vertical-distribution-info').classList.add('visible');
    }
    
    showAtmosphericHeating() {
        console.log('Showing atmospheric heating...');
    }
    
    showTemperatureLayers() {
        document.getElementById('temp-gradient-overlay').style.display = 'flex';
        document.getElementById('temp-gradient-overlay').style.opacity = '1';
        document.getElementById('temp-gradient-overlay').style.transform = 'translateY(-50%) translateX(0)';
    }
    
    showTroposphereShape() {
        console.log('Showing troposphere shape...');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Rotate Earth
        if (this.earth) {
            this.earth.rotation.y += 0.002;
        }
        
        // Rotate atmosphere slightly slower
        if (this.atmosphere) {
            this.atmosphere.rotation.y += 0.001;
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
    }
}

// Initialize the scene when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EarthScene();
});