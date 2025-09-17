import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import nipplejs from 'nipplejs';
import TWEEN from '@tweenjs/tween.js';

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
            },
            {
                title: "Major Greenhouse Gases",
                text: [
                    { line: "Certain gases in our atmosphere trap heat, keeping Earth warm enough for life.", time: 0 },
                    { line: "This is called the greenhouse effect.", time: 5000 },
                    { line: "The major greenhouse gases include Carbon Dioxide, Methane, Nitrous Oxide, and Ozone.", time: 8000 },
                    { line: "Water vapor is also a key greenhouse gas, naturally present and amplifying the warming.", time: 15000 },
                    { line: "Finally, man-made gases like Chlorofluorocarbons, or CFCs, also contribute.", time: 22000 },
                    { line: "They each come from different sources, both natural and man-made.", time: 28000 }
                ],
                action: () => this.showGreenhouseGasInfoAndHalo(),
                duration: 33000
            },
            {
                title: "Greenhouse Effect",
                text: [
                    { line: "Let's see how this works.", time: 0 },
                    { line: "Greenhouse gases are transparent to incoming short-wave radiation from the sun, which warms the Earth.", time: 2000 },
                    { line: "The Earth then radiates this energy back as long-wave heat radiation.", time: 10000 },
                    { line: "The greenhouse gases absorb and re-radiate some of this outgoing heat, trapping it.", time: 15000 },
                    { line: "This 'Greenhouse Effect' is vital for life, but has a delicate balance.", time: 22000 },
                    { line: "An excessive amount of these gases can lead to Global Warming, a serious threat to our world.", time: 28000 }
                ],
                action: () => this.showGreenhouseEffect(),
                duration: 36000
            },
            {
                title: "The Ozone Layer",
                text: [
                    { line: "Ozone is a special form of oxygen, with the chemical formula O₃.", time: 0 },
                    { line: "It forms in the stratosphere, a layer of the upper atmosphere, between 10 and 50 kilometers up.", time: 5000 },
                    { line: "Here, it plays a vital role, absorbing most of the Sun's harmful ultraviolet radiation.", time: 12000 },
                    { line: "This protects all life on Earth from damaging UV rays.", time: 19000 },
                    { line: "However, pollution from man-made chemicals like CFCs has damaged this protective layer.", time: 26000 },
                    { line: "This has led to the formation of 'ozone holes', most notably over the polar regions.", time: 33000 }
                ],
                action: () => this.showOzoneLayer(),
                duration: 40000
            },
            {
                title: "Atmosphere Properties",
                text: [
                    { line: "The atmosphere has weight and hence exerts pressure.", time: 0 },
                    { line: "It is compressible and expandable.", time: 5000 },
                    { line: "It occupies space and has no definite shape.", time: 9000 },
                    { line: "It is mobile, allowing for the transfer of heat and moisture.", time: 14000 },
                    { line: "It is also a poor conductor of heat and electricity.", time: 20000 }
                ],
                action: () => this.showAtmosphereProperties(),
                duration: 25000
            },
            {
                title: "Vertical Distribution of Air Mass",
                text: [
                    { line: "Due to gravitational attraction, most of the atmosphere's mass is concentrated near Earth's surface.", time: 0 },
                    { line: "Half of all atmospheric mass lies below just 6 kilometers altitude.", time: 5000 },
                    { line: "Three-quarters of the atmosphere's mass is found below 10 kilometers.", time: 10000 },
                    { line: "And an incredible 99 percent of all air mass exists below 35 kilometers.", time: 15000 },
                    { line: "This shows how thin our atmosphere really is compared to Earth's size.", time: 21000 }
                ],
                action: () => this.showVerticalDistribution(),
                duration: 26000
            },
            {
                title: "Heating the Atmosphere",
                text: [
                    { line: "The Sun heats the Earth with its powerful radiation.", time: 0 },
                    { line: "But the Earth doesn't just absorb this heat - it transfers it to the atmosphere.", time: 5000 },
                    { line: "This happens through four main processes.", time: 10000 },
                    { line: "First, conduction - direct contact between Earth's surface and air molecules.", time: 14000 },
                    { line: "Second, convection - heated air rises, creating circulation patterns.", time: 19000 },
                    { line: "Third, radiation - Earth emits infrared heat upward into the atmosphere.", time: 25000 },
                    { line: "Together, conduction, convection, and radiation make up sensible heat transfer - about 23 percent.", time: 31000 },
                    { line: "But the dominant process is latent heat from evaporation and condensation - accounting for 77 percent of heat transfer.", time: 38000 }
                ],
                action: () => this.showAtmosphericHeating(),
                duration: 46000
            },
            {
                title: "Atmosphere Layers by Temperature",
                text: [
                    { line: "Based on temperature distribution, the atmosphere is divided into several layers.", time: 0 },
                    { line: "Starting from the ground up, they are:", time: 5000 },
                    { line: "The Troposphere.", time: 7000, name: "Troposphere" },
                    { line: "The Tropopause.", time: 8500, name: "Tropopause" },
                    { line: "The Stratosphere.", time: 10000, name: "Stratosphere" },
                    { line: "The Stratopause.", time: 11500, name: "Stratopause" },
                    { line: "The Mesosphere.", time: 13000, name: "Mesosphere" },
                    { line: "The Mesopause.", time: 14500, name: "Mesopause" },
                    { line: "The Thermosphere.", time: 16000, name: "Thermosphere" },
                    { line: "And finally, the Exosphere, which fades into space.", time: 18000, name: "Exosphere" }
                ],
                action: () => this.showTemperatureLayers(),
                duration: 23000
            },
            {
                title: "Our Protective Shield",
                text: [
                    { line: "The Troposphere, the lowest layer of our atmosphere, is where we live and breathe.", time: 0 },
                    { line: "Above the Troposphere is the Stratosphere, and between them is the Tropopause.", time: 6000 },
                    { line: "It extends 16 to 18 kilometers around the equator...", time: 12000 },
                    { line: "...and 8 to 10 kilometers around the poles.", time: 17000 },
                    { line: "This entire, fragile system acts as our planet's protective shield.", time: 21000 },
                    { line: "Understanding it is the first step. Protecting it is protecting ourselves.", time: 27000 }
                ],
                action: () => this.showTroposphereShape(),
                duration: 33000
            },
            {
                title: "Troposphere Temperatures",
                text: [
                    { line: "In the Troposphere, temperature normally falls with height, at a rate of about 6.5 degrees Celsius per kilometer.", time: 0 },
                    { line: "This is known as the normal lapse rate.", time: 8000 },
                    { line: "Sometimes, however, the temperature can rise with height, a phenomenon known as a temperature inversion.", time: 12000 },
                    { line: "And at other times, it may remain the same with height, which is called an isothermal condition.", time: 21000 }
                ],
                action: () => this.showTroposphereTemperatureChanges(),
                duration: 29000
            }
        ];
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1.2;
        this.controls.maxDistance = 20;
        
        // Clamp vertical rotation
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minPolarAngle = 0;
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        sunLight.position.set(-15, 5, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 50;
        this.scene.add(sunLight);

        // Lens flare
        const textureLoader = new THREE.TextureLoader();
        const lensflareTexture0 = textureLoader.load('lensflare0.png');
        const lensflareTexture3 = textureLoader.load('lensflare3.png');

        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(lensflareTexture0, 700, 0, sunLight.color));
        lensflare.addElement(new LensflareElement(lensflareTexture3, 60, 0.6));
        lensflare.addElement(new LensflareElement(lensflareTexture3, 70, 0.7));
        lensflare.addElement(new LensflareElement(lensflareTexture3, 120, 0.9));
        lensflare.addElement(new LensflareElement(lensflareTexture3, 70, 1));
        sunLight.add(lensflare);
    }
    
    createEarth() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Load textures
        const loader = new THREE.TextureLoader();
        
        // Earth texture
        const earthTexture = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const normalTexture = loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
        const specularTexture = loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
        
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            normalMap: normalTexture,
            specularMap: specularTexture,
            shininess: 100
        });
        
        this.earth = new THREE.Mesh(geometry, earthMaterial);
        this.earth.receiveShadow = true;
        this.earth.castShadow = true;
        this.scene.add(this.earth);
        
        // Clouds
        const cloudTexture = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
        });
        
        const cloudGeometry = new THREE.SphereGeometry(1.005, 64, 64);
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.scene.add(this.clouds);

        // Atmospheric Gas/Haze
        const hazeGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        const hazeMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                // GLSL noise function from https://github.com/ashima/webgl-noise
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

                float snoise(vec3 v) {
                    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0); 

                    vec3 i  = floor(v + dot(v, C.yyy) );
                    vec3 x0 =   v - i + dot(i, C.xxx) ;

                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min( g.xyz, l.zxy );
                    vec3 i2 = max( g.xyz, l.zxy );
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;

                    i = mod289(i);
                    vec4 p = permute( permute( permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                    float n_ = 0.142857142857;
                    vec3  ns = n_ *  D.wyz - D.xzx;

                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = j - 7.0 * x_;

                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);

                    vec4 b0 = vec4( x.xy, y.xy );
                    vec4 b1 = vec4( x.zw, y.zw );

                    vec4 sh = -step(h, vec4(0.0));

                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);

                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;

                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
                }
                
                uniform float u_time;
                uniform float u_opacity;
                varying vec3 vPosition;

                void main() {
                    float noise = snoise(vPosition * 3.0 + u_time * 0.1);
                    noise = (noise + 1.0) / 2.0; // map to 0-1 range
                    
                    gl_FragColor = vec4(0.1, 0.4, 1.0, noise * 0.15 * u_opacity);
                }
            `,
            uniforms: {
                u_time: { value: 0.0 },
                u_opacity: { value: 1.0 },
            },
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
        this.haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
        this.scene.add(this.haze);
        
        // Atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(1.2, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(0.1, 0.4, 1.0, 1.0) * intensity * opacity;
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }
    
    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 10000;
        const positions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2000;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: true
        });
        
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (!this.audioContext && (event.key === ' ' || event.key === 'Enter')) {
                this.initAudio();
            }
            const key = event.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = true;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = false;
            }
        });
        
        // Media controls
        this.setupMediaControls();
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupMediaControls() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const backBtn = document.getElementById('back-btn');
        const nextBtn = document.getElementById('next-btn');
        const muteBtn = document.getElementById('mute-btn');
        const subtitlesBtn = document.getElementById('subtitles-btn');
        
        playBtn.addEventListener('click', () => {
            this.initAudio();
            this.setDefaultVoiceAndPlay();
        });
        
        pauseBtn.addEventListener('click', () => {
            this.pause();
        });
        
        backBtn.addEventListener('click', () => {
            this.previousChapter();
        });
        
        nextBtn.addEventListener('click', () => {
            this.nextChapter();
        });
        
        muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
            
            // Mute/unmute current narration
            if (this.isMuted) {
                speechSynthesis.cancel();
            } else if (this.isPlaying) {
                // If we un-mute during playback, restart the current chapter's narration
                this.stopNarration(); // Stop timeouts and clear effects
                this.startNarration(); // Then restart
            }
        });
        
        subtitlesBtn.addEventListener('click', () => {
            this.subtitlesEnabled = !this.subtitlesEnabled;
            subtitlesBtn.style.opacity = this.subtitlesEnabled ? '1' : '0.5';
            
            const subtitlesElement = document.getElementById('subtitles');
            if (!this.subtitlesEnabled) {
                subtitlesElement.style.display = 'none';
            } else if (this.isNarrating) {
                subtitlesElement.style.display = 'block';
            }
        });
    }

    setDefaultVoiceAndPlay() {
        // This function will be called when we need to select a voice and start playing.
        // It's often necessary to wait for the 'voiceschanged' event.
        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
                // Voices are not ready yet.
                return;
            }

            // Once we have voices, we don't need to listen for the event anymore.
            speechSynthesis.removeEventListener('voiceschanged', setVoice);

            // User requested "Daniel" voice. This is common on Apple devices with lang 'en-GB'.
            let preferredVoice = voices.find(voice => voice.name === 'Daniel' && voice.lang === 'en-GB');

            // If exact "Daniel" is not found, search for any voice containing "Daniel".
            if (!preferredVoice) {
                preferredVoice = voices.find(voice => voice.name.includes('Daniel') && voice.lang.startsWith('en'));
            }
            
            // Fallback to Google UK English voice if Daniel is not found.
            if (!preferredVoice) {
                preferredVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('google') && voice.lang.toLowerCase() === 'en-gb'
                );
            }

            if (preferredVoice) {
                this.selectedVoice = preferredVoice;
                console.log("Using voice:", this.selectedVoice.name);
            } else {
                // If the preferred voice is not found, selectedVoice will remain null,
                // and the system will use the browser's default voice.
                console.warn("Preferred voices not found. Using browser default.");
                this.selectedVoice = null;
            }
            
            this.play();
        };

        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            // If voices are not loaded, wait for them.
            speechSynthesis.addEventListener('voiceschanged', setVoice);
        } else {
            // If voices are already available, proceed.
            setVoice();
        }
    }

    updateUIState() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const backBtn = document.getElementById('back-btn');
        const nextBtn = document.getElementById('next-btn');
        const muteBtn = document.getElementById('mute-btn');
        const subtitlesBtn = document.getElementById('subtitles-btn');
        const slideCounter = document.getElementById('slide-counter');
        const infoTitle = document.getElementById('info-title');
        const infoStatus = document.getElementById('info-status');
        const chapter = this.narrationScript[this.currentChapterIndex];

        if (this.isPlaying) {
            playBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            backBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            muteBtn.classList.remove('hidden');
            subtitlesBtn.classList.remove('hidden');
            slideCounter.classList.remove('hidden');
            infoTitle.textContent = chapter.title;
            infoStatus.textContent = 'Playing...';
        } else {
            pauseBtn.classList.add('hidden');
            playBtn.classList.remove('hidden');
            // Show other controls only if playback has started once
            if (this.isNarrating || this.currentChapterIndex > 0) {
                backBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
                muteBtn.classList.remove('hidden');
                subtitlesBtn.classList.remove('hidden');
                slideCounter.classList.remove('hidden');
            } else {
                // Before starting, hide all controls except play
                backBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
                muteBtn.classList.add('hidden');
                subtitlesBtn.classList.add('hidden');
                slideCounter.classList.add('hidden');
            }
            infoTitle.textContent = chapter.title;
            infoStatus.textContent = 'Paused. Press play to resume.';
        }

        slideCounter.textContent = `${this.currentChapterIndex + 1} / ${this.narrationScript.length}`;

        if (this.currentChapterIndex !== 1) {
            this.hideStats();
        }
        if (this.currentChapterIndex !== 2) {
            this.hideGreenhouseGasInfo();
        }
        if (this.currentChapterIndex !== 4) {
            this.hideOzoneInfo();
        }
        if (this.currentChapterIndex !== 6) {
            this.hideVerticalDistributionInfo();
        }
        if (this.currentChapterIndex !== 10) {
            this.hideTemperatureGradientOverlay();
        }

        backBtn.disabled = this.currentChapterIndex === 0;
    }
    
    play() {
        this.isPlaying = true;
        this.startNarration();
        this.updateUIState();
    }

    pause() {
        this.isPlaying = false;
        this.stopNarration();
        this.updateUIState();
    }
    
    previousChapter() {
        if (this.currentChapterIndex > 0) {
            this.currentChapterIndex--;
            this.play();
        }
    }

    nextChapter() {
        if (this.currentChapterIndex < this.narrationScript.length - 1) {
            this.currentChapterIndex++;
            this.play();
        } else {
            this.pause();
            document.getElementById('info-status').textContent = "Tour complete. Explore freely.";
        }
    }

    startNarration() {
        this.stopNarration(); // Clear previous narration & timeouts

        const chapter = this.narrationScript[this.currentChapterIndex];
        
        if (chapter.action) {
            chapter.action();
        }

        const fullText = chapter.text.map(t => t.line).join(' ');
        this.isNarrating = true;
        
        // Handle subtitles
        this.showSubtitles(chapter.text);

        if (!this.isMuted && 'speechSynthesis' in window) {
            this.currentNarration = new SpeechSynthesisUtterance(fullText);
            
            // Use selected voice if available
            if (this.selectedVoice) {
                this.currentNarration.voice = this.selectedVoice;
            }
            
            this.currentNarration.rate = 0.9;
            this.currentNarration.pitch = 1.0;
            this.currentNarration.volume = 0.8;
            
            this.currentNarration.onend = () => {
                // This will be handled by the timeout to ensure sync
            };

            // Before speaking, ensure any previous utterance is fully stopped.
            speechSynthesis.cancel();
            
            speechSynthesis.speak(this.currentNarration);
        }

        // Use timeout to advance chapter, ensuring it's in sync
        this.narrationTimeout = setTimeout(() => {
            this.isNarrating = false;
            if (this.currentChapterIndex < this.narrationScript.length - 1) {
                this.nextChapter();
            } else {
                this.pause();
                document.getElementById('info-status').textContent = "Tour complete. Explore freely.";
            }
        }, chapter.duration);
    }
    
    stopNarration() {
        speechSynthesis.cancel();
        if (this.narrationTimeout) clearTimeout(this.narrationTimeout);
        if (this.subtitleTimeout) clearTimeout(this.subtitleTimeout);
        this.isNarrating = false;
        this.hideSubtitles();
        this.resetToDefaultState(); // Reset all visual effects when stopping
    }
    
    focusOnAtmosphere() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 2.5 }, 2000);
        
        // The word 'boundless' is at 8000ms. Start atmosphere animation then.
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 0) return; 

            const uniforms = this.atmosphere.material.uniforms;
            new TWEEN.Tween(uniforms.c)
                .to({ value: 0.3 }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            new TWEEN.Tween(uniforms.p)
                .to({ value: 2.5 }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            new TWEEN.Tween(uniforms.opacity)
                .to({ value: 2.5 }, 2000) // Increase opacity for a stronger effect
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }, 8000);

        setTimeout(() => this.trigger800kmEffect(), 9000);
    }

    showGasParticlesSequentially() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 4.0 }, 2000); // Zoom out to see particles
        this.createGasParticles();

        const checkPlayback = () => this.isPlaying && this.currentChapterIndex === 1;

        // Nitrogen
        setTimeout(() => {
            if (!checkPlayback()) return;
            this.updateVisibleParticles('nitrogen');
            this.showStats({ nitrogen: true });
            this.playSound('water_drop.mp3', 0.8, 1.0);
        }, 4000);

        // Oxygen
        setTimeout(() => {
            if (!checkPlayback()) return;
            this.updateVisibleParticles('oxygen');
            this.showStats({ oxygen: true });
            this.playSound('water_drop.mp3', 0.8, 1.2);
        }, 9000);

        // N2 + O2
        setTimeout(() => {
            if (!checkPlayback()) return;
            this.showStats({ n2o2: true });
            this.playSound('whoosh.mp3', 0.5, 1.0);
        }, 14000);

        // Argon
        setTimeout(() => {
            if (!checkPlayback()) return;
            this.updateVisibleParticles('argon');
            this.showStats({ argon: true });
            this.playSound('water_drop.mp3', 0.6, 1.4);
        }, 19000);

        // Trace gases are mentioned from 23s to 30s.
        // "The rest are trace amounts of other gases, like Neon, Helium, Methane, Krypton, Hydrogen and others."
        setTimeout(() => {
            if (!checkPlayback()) return;
            this.updateVisibleParticles('trace');
            this.showStats({ trace: true });
            this.playSound('water_drop.mp3', 0.5, 1.6);
        }, 23000);
        
        // Water Vapour + Dust
        setTimeout(() => {
            if (!checkPlayback()) return;
            this.updateVisibleParticles('additions');
            this.showStats({ additions: true });
            this.playSound('chime.mp3', 0.7, 1.0);
        }, 31000);
    }

    showGasParticles() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 4.0 }, 2000); // Zoom out to see particles
        this.createGasParticles(); // Show all particles
        this.updateVisibleParticles('all');
    }

    showAtmosphereProperties() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);

        // Make atmosphere slightly more prominent but without animations
        new TWEEN.Tween(this.atmosphere.material.uniforms.opacity)
            .to({ value: 0.8 }, 2000)
            .start();
        new TWEEN.Tween(this.atmosphere.material.uniforms.c)
            .to({ value: 0.5 }, 2000)
            .start();
        new TWEEN.Tween(this.atmosphere.material.uniforms.p)
            .to({ value: 3.0 }, 2000)
            .start();

        // Make haze slightly more visible
        new TWEEN.Tween(this.haze.material.uniforms.u_opacity)
            .to({ value: 1.2 }, 2000)
            .start();

        // Create pressure particles when "exerts pressure" is said
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 5) return;
            this.createPressureParticles();
        }, 0); // Right at the beginning when "exerts pressure" is said

        // Create heat and moisture transfer animation when "transfer of heat and moisture" is said
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 5) return;
            this.createHeatMoistureTransfer();
        }, 12000);

        // Create electrical conductivity animation when "poor conductor of heat and electricity" is said
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 5) return;
            this.createElectricalConductivityDemo();
        }, 20000);
    }
    
    createGasParticles(options = {}) {
        this.clearGasParticles(); // Clear any existing particles first

        const defaults = {
            particleCount: 25000,
            shellRadiusMin: 1.04,
            shellRadiusMax: 1.15,
            particleSize: 0.008,
            types: [
                { name: 'nitrogen', ratio: 0.78, color: new THREE.Color(0x00dd00) },
                { name: 'oxygen', ratio: 0.205, color: new THREE.Color(0x87ceeb) },
                { name: 'argon', ratio: 0.01, color: new THREE.Color(0xda70d6) },
                { name: 'trace', ratio: 0.003, color: new THREE.Color(0xffd700) },
                { name: 'water', ratio: 0.001, color: new THREE.Color(0xffffff) },
                { name: 'dust', ratio: 0.001, color: new THREE.Color(0xaaaaaa) },
            ]
        };
        const config = { ...defaults, ...options };
        const { particleCount, shellRadiusMin, shellRadiusMax, particleSize, types: typeDefs } = config;

        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const types = new Uint8Array(particleCount);

        // Normalize ratios
        const totalRatio = typeDefs.reduce((sum, type) => sum + type.ratio, 0);

        for (let i = 0; i < particleCount; i++) {
            // Position particles in a spherical shell
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = shellRadiusMin + Math.random() * (shellRadiusMax - shellRadiusMin);
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Set initial orbital velocity
            const posVec = new THREE.Vector3(x, y, z);
            const orbitAxis = new THREE.Vector3((Math.random() - 0.5) * 0.5, 1, (Math.random() - 0.5) * 0.5).normalize();
            const tangent = new THREE.Vector3().crossVectors(posVec, orbitAxis).normalize();
            const speed = Math.sqrt(this.gravityConstant / r) * (1 + (Math.random()-0.5) * 0.5); // Add some randomness to speed
            const velocity = tangent.multiplyScalar(speed);
            velocities.set([velocity.x, velocity.y, velocity.z], i * 3);

            // Assign colors and types based on ratios
            const rand = Math.random() * totalRatio;
            let cumulativeRatio = 0;
            for(let j = 0; j < typeDefs.length; j++) {
                cumulativeRatio += typeDefs[j].ratio;
                if (rand < cumulativeRatio) {
                    types[i] = j;
                    const color = typeDefs[j].color;
                    colors.set([color.r, color.g, color.b], i * 3);
                    break;
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('type', new THREE.BufferAttribute(types, 1));
        
        geometry.setDrawRange(0, 0); // Initially hide all particles

        const material = new THREE.PointsMaterial({
            size: particleSize,
            vertexColors: true,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        this.gasParticles = new THREE.Points(geometry, material);
        this.scene.add(this.gasParticles);
    }
    
    updateVisibleParticles(gasType) {
        if (!this.gasParticles) return;
        
        const geometry = this.gasParticles.geometry;
        const types = geometry.attributes.type;
        const totalParticles = types.count;
        
        if (!geometry.attributes.originalIndex) {
            const originalIndices = new Uint32Array(totalParticles);
            for(let i=0; i<totalParticles; i++) originalIndices[i] = i;
            geometry.setAttribute('originalIndex', new THREE.BufferAttribute(originalIndices, 1));
        }

        const visibleIndices = [];
        let currentDrawCount = geometry.drawRange.count;

        const originalIndex = geometry.attributes.originalIndex;
        for(let i=0; i < currentDrawCount; i++){
            visibleIndices.push(originalIndex.getX(i));
        }

        const typeMap = {
            'nitrogen': 0,
            'oxygen': 1,
            'argon': 2,
            'trace': 3,
            'additions': [4, 5],
        };

        const targetType = typeMap[gasType];
        
        for (let i = 0; i < totalParticles; i++) {
            const particleType = types.getX(i);
            const isVisible = visibleIndices.includes(i);
            
            let shouldBeVisible = false;
            if (Array.isArray(targetType)) {
                if (targetType.includes(particleType)) shouldBeVisible = true;
            } else {
                if (particleType === targetType) shouldBeVisible = true;
            }

            if (shouldBeVisible && !isVisible) {
                visibleIndices.push(i);
            } else if (gasType === 'all') {
                 if (!isVisible) visibleIndices.push(i);
            }
        }

        const newIndex = new Uint32Array(visibleIndices);
        geometry.setIndex(new THREE.BufferAttribute(newIndex, 1));
        geometry.setDrawRange(0, newIndex.length);
        geometry.getIndex().needsUpdate = true;
    }
    
    clearGasParticles() {
        if (this.gasParticles) {
            this.scene.remove(this.gasParticles);
            if (this.gasParticles.geometry) this.gasParticles.geometry.dispose();
            if (this.gasParticles.material) this.gasParticles.material.dispose();
            this.gasParticles = null;
        }
    }
    
    animateGasParticles() {
        if (!this.gasParticles) return;
        
        const positions = this.gasParticles.geometry.attributes.position;
        const velocities = this.gasParticles.geometry.attributes.velocity;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        
        const innerBoundary = 1.04;
        const outerBoundary = 1.20;
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            
            const r = positionVec.length();
            
            if (r > innerBoundary && r < outerBoundary) {
                // Gravitational acceleration: a = -GM * pos / r^3
                const accel = positionVec.clone().multiplyScalar(-this.gravityConstant / (r * r * r));
                velocityVec.add(accel); // v += a*dt (dt=1)
            } else {
                // Particle is out of bounds, reset it to the outer shell
                const phi = Math.acos(-1 + (2 * Math.random()));
                const theta = Math.random() * Math.PI * 2;
                const newR = 1.15 + Math.random() * 0.05; // shellRadiusMax
                
                positionVec.set(
                    newR * Math.cos(theta) * Math.sin(phi),
                    newR * Math.sin(theta) * Math.sin(phi),
                    newR * Math.cos(phi)
                );
                
                // Give it a new orbital velocity
                const orbitAxis = new THREE.Vector3((Math.random() - 0.5) * 0.5, 1, (Math.random() - 0.5) * 0.5).normalize();
                const tangent = new THREE.Vector3().crossVectors(positionVec, orbitAxis).normalize();
                const speed = Math.sqrt(this.gravityConstant / newR);
                velocityVec.copy(tangent).multiplyScalar(speed);
            }
            
            // Update position
            positionVec.add(velocityVec);
            
            positions.setXYZ(i, positionVec.x, positionVec.y, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
        }
        
        positions.needsUpdate = true;
    }
    
    triggerBoundlessEffect() {
        // This is now handled inside focusOnAtmosphere for a more integrated effect.
    }
    
    trigger800kmEffect() {
        // Show "800 km" text overlay
        this.show800kmText();
    }
    
    animateCamera(targetPosition, duration) {
        const startPosition = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeInOut = progress => progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            const easedProgress = easeInOut(progress);
            
            this.camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
            this.camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
            this.camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    show800kmText() {
        // Create temporary text overlay
        const textOverlay = document.createElement('div');
        textOverlay.id = 'temp-50km-text';
        textOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20%;
            transform: translateY(-50%);
            color: #00aaff;
            font-size: 48px;
            font-weight: bold;
            z-index: 300;
            text-shadow: 0 0 20px #00aaff;
            pointer-events: none;
            font-family: 'Space Mono', monospace;
        `;
        textOverlay.textContent = '800 km';
        document.body.appendChild(textOverlay);
        
        // Animate text appearance
        textOverlay.style.opacity = '0';
        textOverlay.style.transform = 'translateY(-50%) scale(0.5)';
        
        setTimeout(() => {
            if (!document.getElementById('temp-800km-text')) return; // Check if already removed
            textOverlay.style.transition = 'all 0.5s ease';
            textOverlay.style.opacity = '1';
            textOverlay.style.transform = 'translateY(-50%) scale(1)';
        }, 100);
        
        // Remove text after a few seconds
        setTimeout(() => {
            if (!textOverlay || textOverlay.style.opacity === '0') return;
            textOverlay.style.opacity = '0';
            textOverlay.style.transform = 'translateY(-50%) scale(0.5)';
            setTimeout(() => {
                if (textOverlay.parentNode) {
                    textOverlay.parentNode.removeChild(textOverlay);
                }
            }, 500);
        }, 3000);
    }
    
    resetCameraAndEffects() {
        // Remove any temporary text overlays
        const tempText = document.getElementById('temp-800km-text');
        if (tempText) {
            tempText.remove();
        }
        this.clearAtmosphereLayers();
        this.clearGasParticles();
        this.clearGreenhouseEffect();
        this.clearGreenHalo();
        this.clearOzoneLayer();
        this.clearAtmospherePropertyEffects();
        this.clearVerticalDistribution();
        this.clearAtmosphericHeating();
        this.hideStats();
        this.hideGreenhouseGasInfo();
        this.hideOzoneInfo();
        this.hideVerticalDistributionInfo();

        // Animate atmosphere back to its default subtle state
        if (this.atmosphere) {
            const uniforms = this.atmosphere.material.uniforms;
            new TWEEN.Tween(uniforms.p)
                .to({ value: 4.0 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            new TWEEN.Tween(uniforms.c)
                .to({ value: 0.8 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            new TWEEN.Tween(uniforms.opacity)
                .to({ value: 0.0 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }
    
    resetToDefaultState() {
        // Remove any temporary text overlays
        const temp800km = document.getElementById('temp-800km-text');
        if (temp800km) temp800km.remove();

        const temp50km = document.getElementById('temp-50km-text');
        if (temp50km) temp50km.remove();

        const temp6km = document.getElementById('temp-6km-text');
        if (temp6km) temp6km.remove();

        const temp10km = document.getElementById('temp-10km-text');
        if (temp10km) temp10km.remove();

        const temp35km = document.getElementById('temp-35km-text');
        if (temp35km) temp35km.remove();
        
        this.clearAtmosphereLayers();
        this.clearGasParticles();
        this.clearGreenhouseEffect();
        this.clearGreenHalo();
        this.clearOzoneLayer();
        this.clearAtmospherePropertyEffects();
        this.clearVerticalDistribution();
        this.clearAtmosphericHeating();
        this.clearTroposphereShape();
        this.clearStratosphereHalo();
        this.clearMesosphereHalo();
        this.clearThermosphereHalo();
        this.clearExosphereHalo();
        this.hideStats();
        this.hideGreenhouseGasInfo();
        this.hideOzoneInfo();
        this.hideVerticalDistributionInfo();

        // Animate atmosphere back to its default subtle state
        if (this.atmosphere) {
            const uniforms = this.atmosphere.material.uniforms;
            new TWEEN.Tween(uniforms.p)
                .to({ value: 4.0 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            new TWEEN.Tween(uniforms.c)
                .to({ value: 0.8 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            new TWEEN.Tween(uniforms.opacity)
                .to({ value: 0.0 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }
    
    clearAtmosphereLayers() {
        while (this.layerGroup.children.length > 0) {
            const child = this.layerGroup.children[0];
            this.layerGroup.remove(child);
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            } else if (child instanceof CSS3DObject) {
                if (child.element && child.element.parentNode) {
                    child.element.parentNode.removeChild(child.element);
                }
            }
        }
    }
    
    showSubtitles(textLines) {
        if (!this.subtitlesEnabled) return;
        
        const subtitlesElement = document.getElementById('subtitles');
        subtitlesElement.style.display = 'block';
        subtitlesElement.innerHTML = ''; // Clear previous

        let currentIndex = 0;

        const showNextLine = () => {
            if (currentIndex >= textLines.length || !this.isNarrating) {
                subtitlesElement.innerHTML = ''; // Clear at the end
                return;
            }

            const currentLine = textLines[currentIndex];
            subtitlesElement.innerHTML = currentLine.line;

            const nextTime = (currentIndex + 1 < textLines.length)
                ? textLines[currentIndex + 1].time
                : (this.narrationScript[this.currentChapterIndex].duration + 500); // Keep last line for a moment

            const delay = nextTime - currentLine.time;
            currentIndex++;
            this.subtitleTimeout = setTimeout(showNextLine, delay);
        };
        
        showNextLine();
    }
    
    hideSubtitles() {
        const subtitlesElement = document.getElementById('subtitles');
        subtitlesElement.style.display = 'none';
        subtitlesElement.innerHTML = '';
    }
    
    showStats(visibility) {
        const statsOverlay = document.getElementById('stats-overlay');
        statsOverlay.style.display = 'block';
        setTimeout(() => statsOverlay.style.opacity = '1', 50); // Fade in container

        const statIds = [
            'stat-nitrogen', 'stat-oxygen', 'stat-n2o2', 'stat-argon', 
            'stat-trace', 'stat-additions'
        ];

        for (const id of statIds) {
            const key = id.replace('stat-', '');
            const element = document.getElementById(id);
            if (visibility[key]) {
                element.classList.add('visible');
            }
        }
    }
    
    hideStats() {
        const statsOverlay = document.getElementById('stats-overlay');
        statsOverlay.style.opacity = '0';
        setTimeout(() => {
             // only hide if it's still invisible (don't interfere with a new show animation)
            if (statsOverlay.style.opacity === '0') {
               statsOverlay.style.display = 'none';
               // also hide list items so they can transition in again
               const statIds = [
                    'stat-nitrogen', 'stat-oxygen', 'stat-n2o2', 'stat-argon', 
                    'stat-trace', 'stat-additions'
               ];
               for (const id of statIds) {
                   document.getElementById(id).classList.remove('visible');
               }
            }
        }, 500);
    }
    
    showAnimatedText() {
        // This function is deprecated by the new narration system.
        this.controls.update();
    }
    
    hideAnimatedText() {
        // This function is deprecated by the new narration system.
        this.controls.update();
    }
    
    handleKeyboardMovement() {
        const moveSpeed = 0.02;
        
        if (this.keys.w) {
            this.camera.position.z -= moveSpeed;
        }
        if (this.keys.s) {
            this.camera.position.z += moveSpeed;
        }
        if (this.keys.a) {
            this.camera.position.x -= moveSpeed;
        }
        if (this.keys.d) {
            this.camera.position.x += moveSpeed;
        }
    }
    
    initAudio() {
        if (this.audioContext) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    async playSound(url, gain = 1.0, rate = 1.0) {
        if (!this.audioContext || this.isMuted) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = rate;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = gain;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
        } catch(e) {
            console.error(`Error with playing sound ${url}:`, e);
        }
    }
    
    showLayers() {
        this.resetToDefaultState();
        this.animateCamera({ x: 1.5, y: 1.5, z: 2.5 }, 2000);

        setTimeout(() => {
            if (this.isPlaying && this.currentChapterIndex === 6) {
                this.createAtmosphereLayer(1.15, new THREE.Color(0x00aaff), "Troposphere");
            }
        }, 5000);

        setTimeout(() => {
            if (this.isPlaying && this.currentChapterIndex === 6) {
                this.createAtmosphereLayer(1.3, new THREE.Color(0xffaa00), "Stratosphere");
            }
        }, 8000);
        
        setTimeout(() => {
            if (this.isPlaying && this.currentChapterIndex === 6) {
                this.createAtmosphereLayer(1.5, new THREE.Color(0xff00ff), "Upper Layers");
            }
        }, 12000);
    }
    
    createAtmosphereLayer(radius, color, name) {
        // Halo Sphere
        const geometry = new THREE.SphereGeometry(radius, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 u_color;
                uniform float c;
                uniform float p;
                uniform float u_opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(u_color, 1.0) * intensity * u_opacity;
                }
            `,
            uniforms: {
                u_color: { value: color },
                c: { value: 0.8 },
                p: { value: 4.0 },
                u_opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        const halo = new THREE.Mesh(geometry, material);
        this.layerGroup.add(halo);

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'layer-label';
        labelDiv.textContent = name;
        labelDiv.style.color = `#${color.getHexString()}`;
        labelDiv.style.textShadow = `0 0 10px #${color.getHexString()}`;
        labelDiv.style.fontSize = '16px';
        labelDiv.style.fontFamily = "'Space Mono', monospace";
        labelDiv.style.opacity = '0';
        labelDiv.style.transition = 'opacity 0.5s';

        const label = new CSS3DObject(labelDiv);
        // Position the label slightly above the ring on the side
        const angle = -Math.PI / 4;
        label.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0);
        this.layerGroup.add(label);

        // Animate appearance
        const finalOpacity = 1.5;
        new TWEEN.Tween(material.uniforms.u_opacity)
            .to({ value: finalOpacity }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                if (name) {
                    labelDiv.style.opacity = material.uniforms.u_opacity.value / finalOpacity;
                }
            })
            .onComplete(() => {
                // If a name was provided, fade the label out after a delay
                if (name) {
                    setTimeout(() => {
                        labelDiv.style.opacity = '0';
                    }, 1500); // Keep label visible for 1.5 seconds after halo appears
                }
            })
            .start();
        
        new TWEEN.Tween(material.uniforms.c)
            .to({ value: 0.2 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        
        new TWEEN.Tween(material.uniforms.p)
            .to({ value: 2.0 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }
    
    createAtmosphericLayers() {
        // Create multiple semi-transparent layers to show atmosphere's extent
        for (let i = 0; i < 4; i++) {
            const radius = 1.08 + i * 0.08;
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.6, 0.7, 0.3 + i * 0.1),
                transparent: true,
                opacity: 0.05 + i * 0.02,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            });
            
            const layer = new THREE.Mesh(geometry, material);
            layer.userData.isAtmosphereLayer = true;
            this.scene.add(layer);
            
            // Animate layers with different speeds
            const animate = () => {
                if (layer.parent) {
                    layer.rotation.y += 0.001 * (i + 1);
                    layer.rotation.z += 0.0005 * (i + 1);
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }
    }

    createPressureParticles() {
        this.clearPressureParticles(); // Cleanup any existing pressure particles

        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const initialPositions = new Float32Array(particleCount * 3);
        const targetPositions = new Float32Array(particleCount * 3);

        // Blue color variations
        const blueColors = [
            new THREE.Color(0x0066ff),
            new THREE.Color(0x0099ff),
            new THREE.Color(0x00ccff),
            new THREE.Color(0x4488ff)
        ];

        for (let i = 0; i < particleCount; i++) {
            // Start particles in a wide shell around Earth (sparse)
            const angle = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const startRadius = 1.8 + Math.random() * 0.8; // Start far from Earth
            const targetRadius = 1.1 + Math.random() * 0.2; // Compress closer to Earth
            
            // Initial position (sparse)
            const initialX = startRadius * Math.cos(angle) * Math.sin(phi);
            const initialY = startRadius * Math.sin(angle) * Math.sin(phi);
            const initialZ = startRadius * Math.cos(phi);
            
            // Target position (dense)
            const targetX = targetRadius * Math.cos(angle) * Math.sin(phi);
            const targetY = targetRadius * Math.sin(angle) * Math.sin(phi);
            const targetZ = targetRadius * Math.cos(phi);
            
            // Set initial positions
            positions.set([initialX, initialY, initialZ], i * 3);
            initialPositions.set([initialX, initialY, initialZ], i * 3);
            targetPositions.set([targetX, targetY, targetZ], i * 3);

            // Assign blue color
            const color = blueColors[Math.floor(Math.random() * blueColors.length)];
            colors.set([color.r, color.g, color.b], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPositions, 3));
        geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.008,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.pressureParticles = new THREE.Points(geometry, material);
        this.pressureParticles.userData.isPressureParticles = true;
        this.scene.add(this.pressureParticles);

        // Animate particles becoming visible and compressing
        new TWEEN.Tween(material)
            .to({ opacity: 0.8 }, 1000)
            .start();

        // Animate compression from sparse to dense over 4 seconds
        new TWEEN.Tween({ progress: 0 })
            .to({ progress: 1 }, 4000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((obj) => {
                if (!this.pressureParticles) return;
                
                const positions = this.pressureParticles.geometry.attributes.position;
                const initialPositions = this.pressureParticles.geometry.attributes.initialPosition;
                const targetPositions = this.pressureParticles.geometry.attributes.targetPosition;
                
                for (let i = 0; i < particleCount; i++) {
                    const initialX = initialPositions.getX(i);
                    const initialY = initialPositions.getY(i);
                    const initialZ = initialPositions.getZ(i);
                    
                    const targetX = targetPositions.getX(i);
                    const targetY = targetPositions.getY(i);
                    const targetZ = targetPositions.getZ(i);
                    
                    // Interpolate between initial and target positions
                    const x = initialX + (targetX - initialX) * obj.progress;
                    const y = initialY + (targetY - initialY) * obj.progress;
                    const z = initialZ + (targetZ - initialZ) * obj.progress;
                    
                    positions.setXYZ(i, x, y, z);
                }
                positions.needsUpdate = true;
            })
            .start();

        // Play compression sound
        this.playSound('whoosh.mp3', 0.4, 0.8);
    }

    clearPressureParticles() {
        if (this.pressureParticles) {
            this.scene.remove(this.pressureParticles);
            if (this.pressureParticles.geometry) this.pressureParticles.geometry.dispose();
            if (this.pressureParticles.material) this.pressureParticles.material.dispose();
            this.pressureParticles = null;
        }
    }
    
    clearAtmospherePropertyEffects() {
        // Remove atmosphere layers
        const toRemove = [];
        this.scene.traverse((child) => {
            if (child.userData.isAtmosphereLayer || 
                child.userData.isPressureWave || 
                child.userData.isShapelessEffect || 
                child.userData.isElectrical ||
                child.userData.isPressureParticles ||
                child.userData.isHeatMoistureTransfer ||
                child.userData.isElectricalDemo) {
                toRemove.push(child);
            }
        });
        
        toRemove.forEach(child => {
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.clearPressureParticles();
        this.clearHeatMoistureTransfer();
        this.clearElectricalDemo();
    }
    
    showGreenhouseGasInfo() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 2.5 }, 2000);
        
        const panel = document.getElementById('greenhouse-gas-info');
        panel.classList.add('visible');

        // The info panel remains visible for the duration of the chapter.
        // It will be hidden by stopNarration() or resetToDefaultState()
    }

    hideGreenhouseGasInfo() {
        const panel = document.getElementById('greenhouse-gas-info');
        panel.classList.remove('visible');
    }
    
    // --- Greenhouse Effect Methods ---

    createSolarRadiation() {
        const particleCount = 200;
        const arrowGeometry = new THREE.ConeGeometry(0.005, 0.02, 4);
        arrowGeometry.rotateZ(-Math.PI / 2); // Point along +X axis

        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
        });

        this.solarRadiationParticles = new THREE.InstancedMesh(arrowGeometry, material, particleCount);
        this.greenhouseEffectGroup.add(this.solarRadiationParticles);

        const matrix = new THREE.Matrix4();
        for (let i = 0; i < particleCount; i++) {
            const position = new THREE.Vector3(
                -15 + Math.random() * 2 - 1, // Start from sun's general direction
                Math.random() * 4 - 2,
                Math.random() * 4 - 2
            );
            matrix.setPosition(position);
            this.solarRadiationParticles.setMatrixAt(i, matrix);
        }
        this.solarRadiationParticles.instanceMatrix.needsUpdate = true;
    }

    createTerrestrialRadiation() {
        const particleCount = 300;
        
        // Arrow geometry. A cone points up the Y axis by default.
        const arrowGeometry = new THREE.ConeGeometry(0.004, 0.015, 4);
        arrowGeometry.translate(0, 0.015 / 2, 0); // Move base to origin

        const material = new THREE.MeshBasicMaterial({
            color: 0xff4444,
        });

        this.terrestrialRadiationParticles = new THREE.InstancedMesh(arrowGeometry, material, particleCount);
        
        // Store positions and velocities separately for animation
        this.terrestrialRadiationParticles.positions = [];
        this.terrestrialRadiationParticles.velocities = [];

        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const Y_AXIS = new THREE.Vector3(0, 1, 0);
        const scale = new THREE.Vector3(1, 1, 1);
            
        for (let i = 0; i < particleCount; i++) {
            const pos = new THREE.Vector3().setFromSphericalCoords(
                1.01, // Start just above Earth's surface
                Math.acos(2 * Math.random() - 1),
                Math.random() * 2 * Math.PI
            );
            this.terrestrialRadiationParticles.positions.push(pos);

            const vel = pos.clone().normalize().multiplyScalar(0.005 + Math.random() * 0.005);
            this.terrestrialRadiationParticles.velocities.push(vel);
            this.terrestrialRadiationParticles.bounced = [];

            // Orient arrow to velocity vector
            quaternion.setFromUnitVectors(Y_AXIS, vel.clone().normalize());
            matrix.compose(pos, quaternion, scale);
            this.terrestrialRadiationParticles.setMatrixAt(i, matrix);
        }

        this.greenhouseEffectGroup.add(this.terrestrialRadiationParticles);
        this.terrestrialRadiationParticles.instanceMatrix.needsUpdate = true;
    }

    createGreenhouseGasLayer() {
        const geometry = new THREE.SphereGeometry(1.1, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
                uniform float u_opacity;
                varying vec3 vPosition;
                void main() {
                    float noise = pow(1.0 - smoothstep(0.9, 1.0, length(vPosition)), 2.0);
                    gl_FragColor = vec4(0.1, 1.0, 0.2, noise * 0.15 * u_opacity);
                }
            `,
            uniforms: { u_opacity: { value: 0 } },
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
        
        this.greenhouseGasLayer = new THREE.Mesh(geometry, material);
        this.greenhouseEffectGroup.add(this.greenhouseGasLayer);
        this.scene.add(this.greenhouseEffectGroup);

        new TWEEN.Tween(material.uniforms.u_opacity)
            .to({ value: 1.0 }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    animateGreenhouseEffect() {
        if (this.solarRadiationParticles && this.solarRadiationParticles.isInstancedMesh) {
            const matrix = new THREE.Matrix4();
            const position = new THREE.Vector3();
        
            for (let i = 0; i < this.solarRadiationParticles.count; i++) {
                this.solarRadiationParticles.getMatrixAt(i, matrix);
                position.setFromMatrixPosition(matrix);

                position.x += 0.05; // Move toward Earth

                if (position.x > 5) {
                    position.x = -15 + Math.random() * 2;
                    position.y = Math.random() * 4 - 2;
                    position.z = Math.random() * 4 - 2;
                }
                
                matrix.setPosition(position);
                this.solarRadiationParticles.setMatrixAt(i, matrix);
            }
            this.solarRadiationParticles.instanceMatrix.needsUpdate = true;
        }

        if (this.terrestrialRadiationParticles && this.terrestrialRadiationParticles.isInstancedMesh) {
            const ghgRadius = 1.1;
            const ghgActive = this.greenhouseGasLayer && this.greenhouseGasLayer.material.uniforms.u_opacity.value > 0.5;

            const matrix = new THREE.Matrix4();
            const quaternion = new THREE.Quaternion();
            const Y_AXIS = new THREE.Vector3(0, 1, 0);
            const scale = new THREE.Vector3(1, 1, 1);
            
            for (let i = 0; i < this.terrestrialRadiationParticles.count; i++) {
                let pos = this.terrestrialRadiationParticles.positions[i];
                let vel = this.terrestrialRadiationParticles.velocities[i];
                
                pos.add(vel);

                // Check for interaction with greenhouse layer
                if (ghgActive && pos.length() > ghgRadius && pos.length() < ghgRadius + 0.02) {
                     if (Math.random() < 0.6) { // 60% chance to reflect
                        vel.negate(); // Reverse direction
                        this.playSound('water_drop.mp3', 0.1, 2.0 + Math.random());
                    }
                }
                
                // Reset if it gets too far in any direction
                if (pos.x > 8 || pos.x < -10 || pos.length() > 10) {
                     pos.set(
                        -8 + Math.random() * 2,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3
                    );
                    vel.set(0.08, 0, 0);
                    this.terrestrialRadiationParticles.bounced[i] = false;
                }

                // Update matrix with new position and orientation
                quaternion.setFromUnitVectors(Y_AXIS, vel.clone().normalize());
                matrix.compose(pos, quaternion, scale);
                this.terrestrialRadiationParticles.setMatrixAt(i, matrix);
            }

            this.terrestrialRadiationParticles.instanceMatrix.needsUpdate = true;
        }
    }

    clearGreenhouseEffect() {
        while (this.greenhouseEffectGroup.children.length > 0) {
            const child = this.greenhouseEffectGroup.children[0];
            this.greenhouseEffectGroup.remove(child);
            if (child.isPoints || child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
        }
        this.scene.remove(this.greenhouseEffectGroup);
        this.solarRadiationParticles = null;
        this.terrestrialRadiationParticles = null;
        this.greenhouseGasLayer = null;
    }

    showGreenhouseTemperature() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);
    }

    showGreenhouseEffect() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);
        this.createGreenHalo(2.2); // Show the halo for this slide as well, but brighter

        // Timing based on the new narration for this chapter
        // "Greenhouse gases are transparent to incoming short-wave radiation..."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 3) return;
            this.createSolarRadiation();
            this.playSound('whoosh.mp3', 0.3, 1.5);
        }, 2000);

        // "The Earth then radiates this energy back..."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 3) return;
            // Stop animating solar rays when terrestrial radiation appears
            if (this.solarRadiationParticles) {
                this.solarRadiationParticles.userData.isAnimating = false;
            }
            this.createTerrestrialRadiation();
        }, 10000);

        // "The greenhouse gases absorb and re-radiate..."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 3) return;
            this.createGreenhouseGasLayer();
        }, 15000);
    }

    createHeatMoistureTransfer() {
        this.clearHeatMoistureTransfer(); // Cleanup any existing animation

        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const types = new Uint8Array(particleCount); // 0 = heat, 1 = moisture

        // Heat colors (red/orange)
        const heatColors = [
            new THREE.Color(0xff4444),
            new THREE.Color(0xff6644),
            new THREE.Color(0xff8844),
            new THREE.Color(0xffaa22)
        ];

        // Moisture colors (blue/white)
        const moistureColors = [
            new THREE.Color(0x4488ff),
            new THREE.Color(0x66aaff),
            new THREE.Color(0x88ccff),
            new THREE.Color(0xaaeeff)
        ];

        for (let i = 0; i < particleCount; i++) {
            // Create particles in flowing streams around Earth
            const angle = (i / particleCount) * Math.PI * 4; // Multiple spirals
            const radius = 1.15 + Math.sin(angle * 2) * 0.1; // Wavy pattern
            const height = Math.sin(angle * 3) * 0.3; // Vertical movement
            
            const x = Math.cos(angle) * radius;
            const y = height;
            const z = Math.sin(angle) * radius;
            positions.set([x, y, z], i * 3);

            // Create flowing velocity (tangential + some randomness)
            const tangentX = -Math.sin(angle) * 0.015;
            const tangentY = Math.cos(angle * 3) * 0.01;
            const tangentZ = Math.cos(angle) * 0.015;
            velocities.set([
                tangentX + (Math.random() - 0.5) * 0.005,
                tangentY + (Math.random() - 0.5) * 0.005,
                tangentZ + (Math.random() - 0.5) * 0.005
            ], i * 3);

            // Assign type and color (50% heat, 50% moisture)
            const isHeat = Math.random() < 0.5;
            types[i] = isHeat ? 0 : 1;
            
            const colorArray = isHeat ? heatColors : moistureColors;
            const color = colorArray[Math.floor(Math.random() * colorArray.length)];
            colors.set([color.r, color.g, color.b], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('type', new THREE.BufferAttribute(types, 1));

        const material = new THREE.PointsMaterial({
            size: 0.012,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.heatMoistureParticles = new THREE.Points(geometry, material);
        this.heatMoistureParticles.userData.isHeatMoistureTransfer = true;
        this.scene.add(this.heatMoistureParticles);

        // Animate particles becoming visible
        new TWEEN.Tween(material)
            .to({ opacity: 0.9 }, 2000)
            .start();

        // Play flow sound
        this.playSound('whoosh.mp3', 0.4, 0.9);
    }

    animateHeatMoistureTransfer() {
        if (!this.heatMoistureParticles) return;
        
        const positions = this.heatMoistureParticles.geometry.attributes.position;
        const velocities = this.heatMoistureParticles.geometry.attributes.velocity;
        const colors = this.heatMoistureParticles.geometry.attributes.color;
        const types = this.heatMoistureParticles.geometry.attributes.type;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        const colorVec = new THREE.Color();
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            
            const isHeat = types.getX(i) === 0;
            
            // Heat particles tend to rise, moisture particles flow more horizontally
            if (isHeat) {
                velocityVec.y += 0.0002; // Slight upward tendency
            }
            
            // Add some turbulence
            velocityVec.x += (Math.random() - 0.5) * 0.005;
            velocityVec.y += (Math.random() - 0.5) * 0.005;
            velocityVec.z += (Math.random() - 0.5) * 0.005;
            
            // Update position
            positionVec.add(velocityVec);
            
            // Keep particles in atmospheric shell
            const distance = positionVec.length();
            if (distance > 1.4 || distance < 1.05) {
                // Reset particle to a new flow position
                const angle = Math.random() * Math.PI * 2;
                const radius = 1.15 + Math.sin(angle * 2) * 0.1;
                const height = Math.sin(angle * 3) * 0.3;
                
                positionVec.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                // Give it a new orbital velocity
                const orbitAxis = new THREE.Vector3((Math.random() - 0.5) * 0.5, 1, (Math.random() - 0.5) * 0.5).normalize();
                const tangent = new THREE.Vector3().crossVectors(positionVec, orbitAxis).normalize();
                const speed = Math.sqrt(this.gravityConstant / radius) * (1 + (Math.random()-0.5) * 0.5); // Add some randomness to speed
                velocityVec.copy(tangent).multiplyScalar(speed);
            }
            
            positions.setXYZ(i, positionVec.x, positionVec.y, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
        }
        
        positions.needsUpdate = true;
    }

    clearHeatMoistureTransfer() {
        if (this.heatMoistureParticles) {
            this.scene.remove(this.heatMoistureParticles);
            if (this.heatMoistureParticles.geometry) this.heatMoistureParticles.geometry.dispose();
            if (this.heatMoistureParticles.material) this.heatMoistureParticles.material.dispose();
            this.heatMoistureParticles = null;
        }
    }

    createElectricalConductivityDemo() {
        this.clearElectricalDemo(); // Cleanup any existing demo

        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount); // How long each particle has been alive

        // Electrical colors (bright blue/white/yellow)
        const electricalColors = [
            new THREE.Color(0x00ddff),
            new THREE.Color(0x44aaff),
            new THREE.Color(0xffffff),
            new THREE.Color(0xffffaa)
        ];

        for (let i = 0; i < particleCount; i++) {
            // Start particles at various points around Earth, trying to move through atmosphere
            const angle = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const startRadius = 1.05 + Math.random() * 0.1; // Start just above Earth
            
            const x = Math.cos(angle) * Math.sin(phi) * startRadius;
            const y = Math.cos(phi) * startRadius;
            const z = Math.sin(angle) * Math.sin(phi) * startRadius;
            positions.set([x, y, z], i * 3);

            // Try to move outward (like electricity trying to conduct)
            const direction = new THREE.Vector3(x, y, z).normalize();
            
            const speed = 0.01 + Math.random() * 0.01;
            velocities.set([
                direction.x * speed,
                direction.y * speed,
                direction.z * speed
            ], i * 3);

            // Assign electrical color
            const color = electricalColors[Math.floor(Math.random() * electricalColors.length)];
            colors.set([color.r, color.g, color.b], i * 3);

            lifetimes[i] = Math.random() * 2; // Random starting lifetime
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.015,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.electricalDemoParticles = new THREE.Points(geometry, material);
        this.electricalDemoParticles.userData.isElectricalDemo = true;
        this.scene.add(this.electricalDemoParticles);

        // Animate particles becoming visible
        new TWEEN.Tween(material)
            .to({ opacity: 0.9 }, 1500)
            .start();

        // Play electrical sound
        this.playSound('whoosh.mp3', 0.3, 2.0);
    }

    animateElectricalDemo() {
        if (!this.electricalDemoParticles) return;
        
        const positions = this.electricalDemoParticles.geometry.attributes.position;
        const velocities = this.electricalDemoParticles.geometry.attributes.velocity;
        const colors = this.electricalDemoParticles.geometry.attributes.color;
        const lifetimes = this.electricalDemoParticles.geometry.attributes.lifetime;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        const colorVec = new THREE.Color();
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            
            let lifetime = lifetimes.getX(i);
            lifetime += 0.016; // Roughly 60fps
            
            // Electrical particles get "blocked" by atmosphere - slow down and fade
            const resistance = Math.min(lifetime * 0.5, 1.0); // Increase resistance over time
            velocityVec.multiplyScalar(1.0 - resistance * 0.05); // Slow down
            
            // Add some electrical "jitter" or spark effect
            velocityVec.x += (Math.random() - 0.5) * 0.002;
            velocityVec.y += (Math.random() - 0.5) * 0.002;
            velocityVec.z += (Math.random() - 0.5) * 0.002;
            
            // Update position
            positionVec.add(velocityVec);
            
            // Fade out color as particle "dissipates"
            colorVec.fromBufferAttribute(colors, i);
            const fadeFactor = Math.max(0, 1.0 - lifetime * 0.3);
            colorVec.multiplyScalar(fadeFactor);
            
            // Reset particle if it's too old or too far
            const distance = positionVec.length();
            if (lifetime > 5.0 || distance > 1.5 || distance < 1.0) {
                // Reset to a new starting position
                const angle = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const startRadius = 1.05 + Math.random() * 0.1;
                
                positionVec.set(
                    Math.cos(angle) * Math.sin(phi) * startRadius,
                    Math.cos(phi) * startRadius,
                    Math.sin(angle) * Math.sin(phi) * startRadius
                );
                
                // Reset color to bright electrical color
                const electricalColors = [
                    new THREE.Color(0x00ddff),
                    new THREE.Color(0x44aaff),
                    new THREE.Color(0xffffff),
                    new THREE.Color(0xffffaa)
                ];
                const color = electricalColors[Math.floor(Math.random() * electricalColors.length)];
                colorVec.copy(color);
                
                lifetime = 0;
            }
            
            positions.setXYZ(i, positionVec.x, positionVec.y, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
            colors.setXYZ(i, colorVec.r, colorVec.g, colorVec.b);
            lifetimes.setX(i, lifetime);
        }
        
        positions.needsUpdate = true;
        colors.needsUpdate = true;
    }

    clearElectricalDemo() {
        if (this.electricalDemoParticles) {
            this.scene.remove(this.electricalDemoParticles);
            if (this.electricalDemoParticles.geometry) this.electricalDemoParticles.geometry.dispose();
            if (this.electricalDemoParticles.material) this.electricalDemoParticles.material.dispose();
            this.electricalDemoParticles = null;
        }
    }

    // --- Ozone Layer Methods ---

    show50kmText() {
        // Create temporary text overlay
        const textOverlay = document.createElement('div');
        textOverlay.id = 'temp-50km-text';
        textOverlay.style.cssText = `
            position: fixed;
            top: 40%;
            right: 25%;
            transform: translateY(-50%);
            color: #ffffaa;
            font-size: 32px;
            font-weight: bold;
            z-index: 300;
            text-shadow: 0 0 15px #ffffaa;
            pointer-events: none;
            font-family: 'Space Mono', monospace;
        `;
        textOverlay.textContent = '50 km';
        document.body.appendChild(textOverlay);

        // Animate text appearance
        textOverlay.style.opacity = '0';
        textOverlay.style.transform = 'translateY(-50%) scale(0.5)';

        setTimeout(() => {
            if (!document.getElementById('temp-50km-text')) return; // Check if already removed
            textOverlay.style.transition = 'all 0.5s ease';
            textOverlay.style.opacity = '1';
            textOverlay.style.transform = 'translateY(-50%) scale(1)';
        }, 100);
    }

    showOzoneLayer() {
        this.resetToDefaultState();
        // Tilt camera to see the pole
        this.animateCamera({ x: 0, y: 2.5, z: 2.5 }, 2000);
        this.controls.target.set(0, 0, 0);

        // "It forms in the stratosphere..."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 4) return;
            this.createOzoneLayerVisual();
            this.show50kmText();
            const ozoneInfo = document.getElementById('ozone-info');
            ozoneInfo.textContent = 'Ozone Layer (Stratosphere)';
            ozoneInfo.classList.add('visible');
        }, 5000);

        // "absorbing most of the Sun's harmful ultraviolet radiation"
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 4) return;
            this.createUvRadiation();
            const ozoneInfo = document.getElementById('ozone-info');
            ozoneInfo.textContent = 'Ozone absorbs incoming UV radiation';
        }, 12000);

        // "pollution from man-made chemicals like CFCs..."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 4) return;
            if (this.ozoneLayer) {
                this.playSound('ozone_deplete.mp3', 0.6);
                new TWEEN.Tween(this.ozoneLayer.material.uniforms.u_hole_size)
                    .to({ value: 0.7 }, 8000) // Create the hole over 8 seconds
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
            }
            const ozoneInfo = document.getElementById('ozone-info');
            ozoneInfo.textContent = 'CFCs deplete the ozone, creating a "hole" over the polar regions.';
        }, 26000);
    }
    
    createOzoneLayerVisual() {
        this.clearOzoneLayer();
        const geometry = new THREE.SphereGeometry(1.18, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float u_opacity;
                uniform float u_hole_size; // 0 to 1
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    
                    // Create a hole at the north pole (positive Y)
                    float hole_factor = 1.0 - smoothstep(1.0 - u_hole_size, 1.0, vPosition.y);

                    gl_FragColor = vec4(1.0, 1.0, 0.3, 1.0) * intensity * u_opacity * hole_factor;
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                u_opacity: { value: 0.0 },
                u_hole_size: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.ozoneLayer = new THREE.Mesh(geometry, material);
        this.scene.add(this.ozoneLayer);

        new TWEEN.Tween(material.uniforms.u_opacity)
            .to({ value: 1.0 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    createUvRadiation() {
        if (this.uvRadiationParticles) return;

        const particleCount = 150;
        // Create arrow geometry pointing along +Y by default
        const arrowGeometry = new THREE.ConeGeometry(0.015, 0.05, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x9932CC }); // Purple for UV

        this.uvRadiationParticles = new THREE.InstancedMesh(arrowGeometry, material, particleCount);
        this.scene.add(this.uvRadiationParticles);

        // Store positions and velocities
        this.uvRadiationParticles.positions = [];
        this.uvRadiationParticles.velocities = [];
        this.uvRadiationParticles.bounced = [];

        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const Y_AXIS = new THREE.Vector3(0, 1, 0);
        const scale = new THREE.Vector3(1, 1, 1);

        for (let i = 0; i < particleCount; i++) {
            const position = new THREE.Vector3(
                -8 + Math.random() * 2, 
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );
            this.uvRadiationParticles.positions.push(position.clone());

            const velocity = new THREE.Vector3(0.08, 0, 0); // Moving towards Earth
            this.uvRadiationParticles.velocities.push(velocity.clone());
            this.uvRadiationParticles.bounced.push(false);

            // Orient arrow to velocity
            quaternion.setFromUnitVectors(Y_AXIS, velocity.clone().normalize());
            matrix.compose(position, quaternion, scale);
            this.uvRadiationParticles.setMatrixAt(i, matrix);
        }
        this.uvRadiationParticles.instanceMatrix.needsUpdate = true;
    }

    animateUvRadiation() {
        if (!this.uvRadiationParticles || !this.ozoneLayer) return;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        
        for (let i = 0; i < this.uvRadiationParticles.count; i++) {
            this.uvRadiationParticles.getMatrixAt(i, matrix);
            position.setFromMatrixPosition(matrix);

            position.x += 0.08; // Move toward Earth

            if (position.x > 5) {
                position.x = -8 + Math.random() * 2;
                position.y = Math.random() * 6 - 3;
                position.z = Math.random() * 6 - 3;
            }
            
            matrix.setPosition(position);
            this.uvRadiationParticles.setMatrixAt(i, matrix);
        }
        this.uvRadiationParticles.instanceMatrix.needsUpdate = true;
    }

    clearOzoneLayer() {
        if (this.ozoneLayer) {
            this.scene.remove(this.ozoneLayer);
            if (this.ozoneLayer.geometry) this.ozoneLayer.geometry.dispose();
            if (this.ozoneLayer.material) this.ozoneLayer.material.dispose();
            this.ozoneLayer = null;
        }
        if (this.uvRadiationParticles) {
            this.scene.remove(this.uvRadiationParticles);
            this.uvRadiationParticles.geometry.dispose();
            this.uvRadiationParticles.material.dispose();
            this.uvRadiationParticles = null;
        }
        this.hideOzoneInfo();
    }

    hideOzoneInfo() {
        const panel = document.getElementById('ozone-info');
        panel.classList.remove('visible');
    }

    // --- Vertical Distribution Methods ---

    showVerticalDistribution() {
        this.resetToDefaultState();
        this.animateCamera({ x: 2, y: 1.5, z: 3 }, 2000); // Good angle to see layers
        
        const verticalInfo = document.getElementById('vertical-distribution-info');
        verticalInfo.classList.add('visible');

        // Show 6km layer and text
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 6) return;
            this.createAltitudeLayer(1.06, 0x00ff00, "6 km", "50% of air mass"); // Green
            this.showAltitudeText("6 km", "50%", { top: '25%', left: '20%' });
            this.playSound('chime.mp3', 0.5, 1.0);
        }, 5000);

        // Show 10km layer and text
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 6) return;
            this.createAltitudeLayer(1.10, 0xffff00, "10 km", "75% of air mass"); // Yellow
            this.showAltitudeText("10 km", "75%", { top: '35%', left: '15%' });
            this.playSound('chime.mp3', 0.6, 1.2);
        }, 10000);

        // Show 35km layer and text
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 6) return;
            this.createAltitudeLayer(1.35, 0xff8c00, "35 km", "99% of air mass"); // Dark Orange
            this.showAltitudeText("35 km", "99%", { top: '50%', left: '10%' });
            this.playSound('chime.mp3', 0.7, 1.4);
        }, 15000);

        // Show thinness comparison
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 6) return;
            verticalInfo.innerHTML = `
                <h3>Vertical Air Mass Distribution</h3>
                <p><strong>Below 6 km:</strong> 50% of total air mass</p>
                <p><strong>Below 10 km:</strong> 75% of total air mass</p>
                <p><strong>Below 35 km:</strong> 99% of total air mass</p>
                <p style="margin-top: 15px; font-style: italic;">Our atmosphere is incredibly thin compared to Earth's size!</p>
            `;
        }, 21000);
    }

    createAltitudeLayer(radius, color, altitudeText, massText) {
        // Create a transparent sphere to show the altitude
        const geometry = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2); // Only upper hemisphere
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            wireframe: true
        });
        
        const layer = new THREE.Mesh(geometry, material);
        layer.userData.isVerticalDistributionLayer = true;
        this.scene.add(layer);

        // Animate layer appearance
        new TWEEN.Tween(material)
            .to({ opacity: 0.4 }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Create a dense particle cloud below this altitude to show air mass
        this.createAirMassVisualization(radius, color);
    }

    createAirMassVisualization(maxRadius, color) {
        const particleCount = Math.floor(maxRadius * 3000); // More particles for higher altitudes
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Create particles distributed by altitude, with density decreasing with height
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            
            // Distribution: more particles closer to surface
            const heightFactor = Math.pow(Math.random(), 2); // Bias towards lower altitudes
            const r = 1.01 + heightFactor * (maxRadius - 1.01);
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Color based on altitude (lighter = higher)
            const colorMix = new THREE.Color(color);
            const altitudeFactor = (r - 1.01) / (maxRadius - 1.01);
            colorMix.lerp(new THREE.Color(0xffffff), altitudeFactor * 0.5);
            colors.set([colorMix.r, colorMix.g, colorMix.b], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.003,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData.isVerticalDistributionLayer = true;
        this.scene.add(particles);

        // Animate particles appearing
        new TWEEN.Tween(material)
            .to({ opacity: 0.6 }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    showAltitudeText(altitude, percentage, position) {
        const textId = `temp-${altitude.replace(' ', '')}-text`;
        const textOverlay = document.createElement('div');
        textOverlay.id = textId;
        textOverlay.style.cssText = `
            position: fixed;
            top: ${position.top};
            left: ${position.left};
            color: #4488ff;
            font-size: 24px;
            font-weight: bold;
            z-index: 300;
            text-shadow: 0 0 10px #4488ff;
            pointer-events: none;
            font-family: 'Space Mono', monospace;
            text-align: left;
        `;
        textOverlay.innerHTML = `${altitude}`;
        document.body.appendChild(textOverlay);

        // Animate text appearance
        textOverlay.style.opacity = '0';
        textOverlay.style.transform = 'scale(0.5)';

        setTimeout(() => {
            if (!document.getElementById(textId)) return;
            textOverlay.style.transition = 'all 0.5s ease';
            textOverlay.style.opacity = '1';
            textOverlay.style.transform = 'scale(1)';
        }, 100);
    }

    clearVerticalDistribution() {
        const toRemove = [];
        this.scene.traverse((child) => {
            if (child.userData.isVerticalDistributionLayer) {
                toRemove.push(child);
            }
        });
        
        toRemove.forEach(child => {
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        // Remove text overlays
        ['temp-6km-text', 'temp-10km-text', 'temp-35km-text'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });
    }

    hideVerticalDistributionInfo() {
        const panel = document.getElementById('vertical-distribution-info');
        panel.classList.remove('visible');
    }

    // --- Greenhouse Halo Methods ---

    createGreenHalo(brightness = 1.6) {
        this.clearGreenHalo(); // Ensure no previous halo exists

        const geometry = new THREE.SphereGeometry(1.25, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(0.4, 1.0, 0.5, 1.0) * intensity * opacity;
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.greenhouseGasHalo = new THREE.Mesh(geometry, material);
        this.greenhouseGasHalo.name = "greenhouseGasHalo";
        this.scene.add(this.greenhouseGasHalo);

        // Animate it in
        new TWEEN.Tween(material.uniforms.opacity)
            .to({ value: brightness }, 2000) // Use brightness parameter
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(material.uniforms.c)
            .to({ value: 0.2 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(material.uniforms.p)
            .to({ value: 2.0 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }
    
    clearGreenHalo() {
        if (this.greenhouseGasHalo) {
            this.scene.remove(this.greenhouseGasHalo);
            if (this.greenhouseGasHalo.geometry) this.greenhouseGasHalo.geometry.dispose();
            if (this.greenhouseGasHalo.material) this.greenhouseGasHalo.material.dispose();
            this.greenhouseGasHalo = null;
        }
    }

    showGreenhouseGasInfoAndHalo() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 2.5 }, 2000);
        
        const panel = document.getElementById('greenhouse-gas-info');
        panel.classList.add('visible');

        this.createGreenHalo();
    }

    showBlueHalo() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);
        
        const uniforms = this.atmosphere.material.uniforms;
        new TWEEN.Tween(uniforms.c)
            .to({ value: 0.3 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.p)
            .to({ value: 2.5 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.opacity)
            .to({ value: 2.5 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    showTroposphereShape() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);

        this.createTroposphereVisual();
    }
    
    createTroposphereVisual() {
        this.clearTroposphereShape();
        
        // Use a sphere and scale it to be oblate
        const geometry = new THREE.SphereGeometry(1.0, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(0.1, 0.4, 1.0, 1.0) * intensity * opacity;
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.troposphereVisual = new THREE.Mesh(geometry, material);
        // Add the visual as a child of the earth so it rotates with it
        this.earth.add(this.troposphereVisual);

        // Start with a spherical halo
        this.troposphereVisual.scale.set(1.15, 1.15, 1.15);

        // Animate halo
        new TWEEN.Tween(material.uniforms.opacity)
            .to({ value: 2.5 }, 2000)
            .start();
        new TWEEN.Tween(material.uniforms.c)
            .to({ value: 0.3 }, 2000)
            .start();
        new TWEEN.Tween(material.uniforms.p)
            .to({ value: 2.5 }, 2000)
            .start();

        // After a delay, animate the shape to be oblate (bulge at equator)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 9) return;
            
            new TWEEN.Tween(this.troposphereVisual.scale)
                .to({ x: 1.28, y: 1.10, z: 1.28 }, 4000) // Thicker at equator (X/Z), thinner at poles (Y)
                .easing(TWEEN.Easing.Elastic.Out)
                .start();
        }, 12000); // Start animation when the narration mentions it
    }

    clearTroposphereShape() {
        if (this.troposphereVisual) {
            // It's a child of the earth, so remove it from there
            if (this.troposphereVisual.parent) {
                this.troposphereVisual.parent.remove(this.troposphereVisual);
            }
            if (this.troposphereVisual.geometry) this.troposphereVisual.geometry.dispose();
            if (this.troposphereVisual.material) this.troposphereVisual.material.dispose();
            this.troposphereVisual = null;
        }
        if (this.temperatureChangeParticles) {
            this.scene.remove(this.temperatureChangeParticles);
            if (this.temperatureChangeParticles.geometry) this.temperatureChangeParticles.geometry.dispose();
            if (this.temperatureChangeParticles.material) this.temperatureChangeParticles.material.dispose();
            this.temperatureChangeParticles = null;
        }
        this.hideTemperatureGradientOverlay();
    }

    // --- Troposphere Temperature Changes ---
    showTroposphereTemperatureChanges() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);
        this.createTroposphereVisual(); // Re-use the halo visual

        // "temperature normally falls with height..."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 10) return;
            this.showTemperatureGradientOverlay('Lapse Rate');
            this.createTemperatureChangeParticles('lapse');
            this.createRisingTemperatureText();
            this.playSound('whoosh.mp3', 0.4, 0.8);
        }, 0);

        // "sometimes...temperature can rise with height...inversion."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 10) return;
            this.showTemperatureGradientOverlay('Inversion', true);
            this.createTemperatureChangeParticles('inversion');
            this.createInversionTemperatureText();
            this.playSound('whoosh.mp3', 0.5, 1.2);
        }, 12000);

        // "remain the same...isothermal condition."
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 10) return;
            this.showTemperatureGradientOverlay('Isothermal', false, true);
            this.createTemperatureChangeParticles('isothermal');
            this.playSound('chime.mp3', 0.6, 1.0);
        }, 21000);
    }
    
    createRisingTemperatureText() {
        const textDiv = document.createElement('div');
        textDiv.className = 'rising-temp-text';

        const tempObject = new CSS3DObject(textDiv);
        tempObject.position.set(1.1, 0, 0); 
        tempObject.scale.set(0.003, 0.003, 0.003);
        this.scene.add(tempObject);

        const startTemp = 15;
        const endTemp = -50; // a reasonable temp for high altitude in troposphere
        const startY = 0;
        const endY = 0.8;
        const duration = 7000; // Animation duration in ms

        new TWEEN.Tween({ y: startY, temp: startTemp })
            .to({ y: endY, temp: endTemp }, duration)
            .easing(TWEEN.Easing.Quadratic.In)
            .onUpdate((obj) => {
                if (!tempObject.parent) return; // Stop if removed
                tempObject.position.y = obj.y;
                const temp = Math.round(obj.temp);
                textDiv.textContent = (temp > 0 ? '+' : '') + temp + '°C';
                
                // Color changes from red to blue
                const color = new THREE.Color();
                const tempNormalized = (obj.temp - endTemp) / (startTemp - endTemp); // 1 at start, 0 at end
                color.setHSL(0.6 * (1 - tempNormalized), 1.0, 0.6); // 0 (red) to 0.6 (blue)
                textDiv.style.color = color.getStyle();

                tempObject.lookAt(this.camera.position); // Always face camera
            })
            .onComplete(() => {
                this.scene.remove(tempObject);
                if(textDiv.parentElement) {
                    textDiv.parentElement.removeChild(textDiv);
                }
            })
            .start();
    }

    createInversionTemperatureText() {
        const textDiv = document.createElement('div');
        textDiv.className = 'rising-temp-text';

        const tempObject = new CSS3DObject(textDiv);
        tempObject.position.set(1.1, 0, 0); 
        tempObject.scale.set(0.003, 0.003, 0.003);
        this.scene.add(tempObject);

        const startTemp = -5;
        const endTemp = 20;
        const startY = 0;
        const endY = 0.8;
        const duration = 7000; // Animation duration in ms

        new TWEEN.Tween({ y: startY, temp: startTemp })
            .to({ y: endY, temp: endTemp }, duration)
            .easing(TWEEN.Easing.Quadratic.In)
            .onUpdate((obj) => {
                if (!tempObject.parent) return; // Stop if removed
                tempObject.position.y = obj.y;
                const temp = Math.round(obj.temp);
                textDiv.textContent = (temp > 0 ? '+' : '') + temp + '°C';
                
                // Color changes from blue to red for inversion
                const color = new THREE.Color();
                const tempNormalized = (obj.temp - startTemp) / (endTemp - startTemp); // 0 at start, 1 at end
                color.setHSL(0.6 * (1 - tempNormalized), 1.0, 0.6); // 0.6 (blue) to 0 (red)
                textDiv.style.color = color.getStyle();

                tempObject.lookAt(this.camera.position); // Always face camera
            })
            .onComplete(() => {
                this.scene.remove(tempObject);
                if(textDiv.parentElement) {
                    textDiv.parentElement.removeChild(textDiv);
                }
            })
            .start();
    }

    createTemperatureChangeParticles(mode) { // mode: 'lapse', 'inversion', 'isothermal'
        if (this.temperatureChangeParticles) {
            this.scene.remove(this.temperatureChangeParticles);
            this.temperatureChangeParticles.geometry.dispose();
            this.temperatureChangeParticles.material.dispose();
            this.temperatureChangeParticles = null;
        }

        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const startY = new Float32Array(particleCount);

        const colorHot = new THREE.Color(0xff4444); // Red
        const colorWarm = new THREE.Color(0xffff44); // Yellow
        const colorCool = new THREE.Color(0x4488ff); // Blue

        for (let i = 0; i < particleCount; i++) {
            // Start particles very close to Earth's surface
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = 1.005 + Math.random() * 0.01; // Very close to surface
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Set color based on altitude and mode
            const altitude = (r - 1.01) / 0.2; // 0-1
            const color = new THREE.Color();
            if (mode === 'lapse') {
                color.copy(colorHot).lerp(colorCool, altitude);
            } else if (mode === 'inversion') {
                color.copy(colorCool).lerp(colorHot, altitude);
            } else { // isothermal
                color.copy(colorWarm);
            }
            colors.set([color.r, color.g, color.b], i * 3);

            // Set velocity for vertical movement
            velocities.set([
                (Math.random() - 0.5) * 0.005,
                i % 2 === 0 ? (Math.abs(Math.sin(theta)) * 0.015 + 0.005) : (-Math.abs(Math.sin(theta)) * 0.010 - 0.003),
                (Math.random() - 0.5) * 0.005
            ], i * 3);
            startY[i] = y;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('startY', new THREE.BufferAttribute(startY, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.008,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.temperatureChangeParticles = new THREE.Points(geometry, material);
        this.temperatureChangeParticles.userData.mode = mode; // Store mode for animation
        this.scene.add(this.temperatureChangeParticles);

        new TWEEN.Tween(material)
            .to({ opacity: 0.8 }, 1500)
            .start();
    }
    
    animateTemperatureChangeParticles() {
        if (!this.temperatureChangeParticles) return;

        const positions = this.temperatureChangeParticles.geometry.attributes.position;
        const velocities = this.temperatureChangeParticles.geometry.attributes.velocity;
        
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const vy = velocities.getY(i);
            positions.setY(i, y + vy);

            // Simple boundary check
            if (y > 1.25 || y < -1.25) {
                 velocities.setY(i, -vy);
            }
        }
        positions.needsUpdate = true;
    }

    showTemperatureGradientOverlay(title, inverted = false, constant = false) {
        const overlay = document.getElementById('temp-gradient-overlay');
        
        if (!overlay) { // Create if it doesn't exist
            const newOverlay = document.createElement('div');
            newOverlay.id = 'temp-gradient-overlay';
            newOverlay.innerHTML = `
                <div id="temp-gradient-title"></div>
                <div class="label-top"></div>
                <div id="temp-gradient-bar" style="height: 100%;"></div>
                <div class="label-bottom"></div>
            `;
            document.getElementById('canvas-container').appendChild(newOverlay);
        }
        
        // This query must happen after potentially creating the element.
        const currentOverlay = document.getElementById('temp-gradient-overlay');
        const currentBar = document.getElementById('temp-gradient-bar');
        const currentTitle = document.getElementById('temp-gradient-title');
        const labelTop = currentOverlay.querySelector('.label-top');
        const labelBottom = currentOverlay.querySelector('.label-bottom');
        
        currentTitle.textContent = title;
        let gradient;
        if (constant) {
            gradient = 'linear-gradient(to top, #ffff44, #ffff44)'; // Yellow
            labelTop.textContent = 'Same Temp';
            labelBottom.textContent = 'Same Temp';
        } else if (inverted) {
            gradient = 'linear-gradient(to top, #4488ff, #ff4444)'; // Blue to Red
            labelTop.textContent = 'High Temp';
            labelBottom.textContent = 'Low Temp';
        } else { // Normal Lapse Rate
            gradient = 'linear-gradient(to top, #ff4444, #4488ff)'; // Red to Blue
            labelTop.textContent = 'Low Temp';
            labelBottom.textContent = 'High Temp';
        }
        currentBar.style.background = gradient;

        currentOverlay.style.display = 'flex';
        setTimeout(() => currentOverlay.style.opacity = '1', 50);
        
        setTimeout(() => {
            currentOverlay.style.transition = 'all 0.5s ease';
            currentOverlay.style.transform = 'translateY(-50%) translateX(0)';
        }, 100);
    }
    
    hideTemperatureGradientOverlay() {
        const overlay = document.getElementById('temp-gradient-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateY(-50%) translateX(-120%)';
            setTimeout(() => {
                if (overlay.style.opacity === '0') {
                    overlay.style.display = 'none';
                }
            }, 800);
        }
    }

    showAtmosphericHeating() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);

        // Sun heating Earth (0-5s)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 7) return;
            this.createSolarHeating();
            this.playSound('whoosh.mp3', 0.4, 1.2);
        }, 0);

        // Show that Earth transfers heat to atmosphere (5-10s)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 7) return;
            this.createEarthToAtmosphereHeat();
        }, 5000);

        // Conduction animation (14s)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 7) return;
            this.createConductionAnimation();
            this.playSound('chime.mp3', 0.6, 0.8);
        }, 14000);

        // Convection animation (19s)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 7) return;
            this.createConvectionAnimation();
            this.playSound('whoosh.mp3', 0.5, 0.9);
        }, 19000);

        // Radiation animation (25s)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 7) return;
            this.createRadiationAnimation();
            this.playSound('whoosh.mp3', 0.4, 1.4);
        }, 25000);

        // Latent heat animation (31s)
        setTimeout(() => {
            if (!this.isPlaying || this.currentChapterIndex !== 7) return;
            this.createLatentHeatAnimation();
            this.playSound('water_drop.mp3', 0.7, 1.1);
        }, 31000);
    }

    createSolarHeating() {
        // Create bright sun rays coming toward Earth
        const particleCount = 300;
        const arrowGeometry = new THREE.ConeGeometry(0.008, 0.03, 4);
        arrowGeometry.rotateZ(-Math.PI / 2); // Point along +X axis

        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
        });

        this.solarHeatingParticles = new THREE.InstancedMesh(arrowGeometry, material, particleCount);
        this.solarHeatingParticles.userData.isSolarHeating = true;
        this.scene.add(this.solarHeatingParticles);

        const matrix = new THREE.Matrix4();
        for (let i = 0; i < particleCount; i++) {
            const position = new THREE.Vector3(
                -8 + Math.random() * 2,
                Math.random() * 6 - 3,
                Math.random() * 6 - 3
            );
            matrix.setPosition(position);
            this.solarHeatingParticles.setMatrixAt(i, matrix);
        }
        this.solarHeatingParticles.instanceMatrix.needsUpdate = true;
    }

    createEarthToAtmosphereHeat() {
        // Create heat waves emanating from Earth's surface
        const particleCount = 400;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        // Heat colors (red to orange gradient)
        const heatColors = [
            new THREE.Color(0xff4444),
            new THREE.Color(0xff6644),
            new THREE.Color(0xff8844),
            new THREE.Color(0xffaa22)
        ];

        for (let i = 0; i < particleCount; i++) {
            // Start particles just above Earth's surface
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = 1.01;
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Create outward velocity
            const direction = new THREE.Vector3(x, y, z).normalize();
            const speed = 0.008 + Math.random() * 0.012;
            velocities.set([
                direction.x * speed,
                direction.y * speed,
                direction.z * speed
            ], i * 3);

            // Assign heat color
            const color = heatColors[Math.floor(Math.random() * heatColors.length)];
            colors.set([color.r, color.g, color.b], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            size: 0.01,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.earthHeatParticles = new THREE.Points(geometry, material);
        this.earthHeatParticles.userData.isEarthHeat = true;
        this.scene.add(this.earthHeatParticles);
    }

    createConductionAnimation() {
        // Show direct contact heating with small, slow-moving particles at surface
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Position particles very close to Earth's surface
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = 1.005 + Math.random() * 0.01; // Very close to surface
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Blue to red gradient for conduction
            const color = new THREE.Color().setHSL(0.6 - (Math.random() * 0.6), 1.0, 0.5);
            colors.set([color.r, color.g, color.b], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.006,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.conductionParticles = new THREE.Points(geometry, material);
        this.conductionParticles.userData.isConduction = true;
        this.scene.add(this.conductionParticles);
    }

    createConvectionAnimation() {
        // Show rising air currents and circulation
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Start at various altitudes, some rising, some descending
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = 1.05 + Math.random() * 0.3; // Start somewhere
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Set color based on altitude and mode
            const altitude = (r - 1.01) / 0.2; // 0-1
            const color = new THREE.Color();
            if (i % 2 === 0) {
                color.copy(new THREE.Color(0xff4444)); // Hot rising air
            } else {
                color.copy(new THREE.Color(0x4488ff)); // Cooler descending air
            }
            colors.set([color.r, color.g, color.b], i * 3);

            // Set velocity for vertical movement
            velocities.set([
                (Math.random() - 0.5) * 0.005,
                i % 2 === 0 ? (Math.abs(Math.sin(theta)) * 0.015 + 0.005) : (-Math.abs(Math.sin(theta)) * 0.010 - 0.003),
                (Math.random() - 0.5) * 0.005
            ], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            size: 0.008,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.convectionParticles = new THREE.Points(geometry, material);
        this.convectionParticles.userData.isConvection = true;
        this.scene.add(this.convectionParticles);
    }

    createRadiationAnimation() {
        // Show infrared radiation waves emanating from Earth
        const particleCount = 250;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Start particles very close to Earth's surface
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = 1.01;
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Create outward velocity
            const direction = new THREE.Vector3(x, y, z).normalize();
            const speed = 0.015 + Math.random() * 0.01;
            velocities.set([
                direction.x * speed,
                direction.y * speed,
                direction.z * speed
            ], i * 3);

            // Infrared colors (deep red to orange)
            const color = new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1.0, 0.5);
            colors.set([color.r, color.g, color.b], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            size: 0.012,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.radiationParticles = new THREE.Points(geometry, material);
        this.radiationParticles.userData.isRadiation = true;
        this.scene.add(this.radiationParticles);
    }

    createLatentHeatAnimation() {
        // Show water vapor condensing and releasing heat
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const phases = new Float32Array(particleCount); // 0 = vapor, 1 = condensing

        for (let i = 0; i < particleCount; i++) {
            // Start particles as water vapor in the atmosphere
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = 1.08 + Math.random() * 0.15;
            
            const x = r * Math.cos(theta) * Math.sin(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(phi);
            positions.set([x, y, z], i * 3);

            // Random movement initially
            velocities.set([
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.008
            ], i * 3);

            // Assign water vapor color
            const color = new THREE.Color(0xaaeeff);
            colors.set([color.r, color.g, color.b], i * 3);
            phases[i] = 0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        const material = new THREE.PointsMaterial({
            size: 0.008,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.latentHeatParticles = new THREE.Points(geometry, material);
        this.latentHeatParticles.userData.isLatentHeat = true;
        this.scene.add(this.latentHeatParticles);
    }

    animateSolarHeating() {
        if (!this.solarHeatingParticles || !this.solarHeatingParticles.isInstancedMesh) return;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        
        for (let i = 0; i < this.solarHeatingParticles.count; i++) {
            this.solarHeatingParticles.getMatrixAt(i, matrix);
            position.setFromMatrixPosition(matrix);

            position.x += 0.08; // Move toward Earth

            if (position.x > 5) {
                position.x = -8 + Math.random() * 2;
                position.y = Math.random() * 6 - 3;
                position.z = Math.random() * 6 - 3;
            }
            
            matrix.setPosition(position);
            this.solarHeatingParticles.setMatrixAt(i, matrix);
        }
        this.solarHeatingParticles.instanceMatrix.needsUpdate = true;
    }

    animateEarthHeat() {
        if (!this.earthHeatParticles) return;
        
        const positions = this.earthHeatParticles.geometry.attributes.position;
        const velocities = this.earthHeatParticles.geometry.attributes.velocity;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            
            positionVec.add(velocityVec);

            // Reset if too far from Earth
            if (positionVec.length() > 1.4) {
                 const phi = Math.acos(-1 + (2 * Math.random()));
                 const theta = Math.random() * Math.PI * 2;
                 const r = 1.01 + Math.random() * 0.02;
                
                 positionVec.set(
                     r * Math.cos(theta) * Math.sin(phi),
                     r * Math.sin(theta) * Math.sin(phi),
                     r * Math.cos(phi)
                 );
                
                 const direction = positionVec.clone().normalize();
                 const speed = 0.008 + Math.random() * 0.012;
                 velocityVec.set(
                     direction.x * speed,
                     direction.y * speed,
                     direction.z * speed
                 );
            }
            
            positions.setXYZ(i, positionVec.x, positionVec.y, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
        }
        
        positions.needsUpdate = true;
    }

    animateConvection() {
        if (!this.convectionParticles) return;
        
        const positions = this.convectionParticles.geometry.attributes.position;
        const velocities = this.convectionParticles.geometry.attributes.velocity;
        const colors = this.convectionParticles.geometry.attributes.color;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        const colorVec = new THREE.Color();
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            colorVec.fromBufferAttribute(colors, i);
            
            const isRising = velocityVec.y > 0;
            
            // Reset particle if out of bounds
            const distance = positionVec.length();
            if (distance > 1.4 || distance < 1.04) {
                // Reset to a new starting position
                const angle = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 1.05 + Math.random() * 0.3;
                
                positionVec.set(
                    r * Math.cos(angle) * Math.sin(phi),
                    r * Math.sin(angle) * Math.sin(phi),
                    r * Math.cos(phi)
                );
                
                const direction = positionVec.clone().normalize();
                const newIsRising = Math.random() < 0.6;
                
                if (newIsRising) {
                    velocityVec.set(
                        direction.x * 0.003 + (Math.random() - 0.5) * 0.002,
                        Math.abs(direction.y) * 0.015 + 0.005,
                        direction.z * 0.003 + (Math.random() - 0.5) * 0.002
                    );
                    colorVec.setHex(0xff6644); // Hot rising air
                } else {
                    velocityVec.set(
                        direction.x * 0.003 + (Math.random() - 0.5) * 0.002,
                        -Math.abs(direction.y) * 0.010 - 0.003,
                        direction.z * 0.003 + (Math.random() - 0.5) * 0.002
                    );
                    colorVec.setHex(0x4466ff); // Cool descending air
                }
            }
            
            positions.setXYZ(i, positionVec.x, positionVec.x, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
            colors.setXYZ(i, colorVec.r, colorVec.g, colorVec.b);
        }
        
        positions.needsUpdate = true;
        colors.needsUpdate = true;
    }

    animateRadiation() {
        if (!this.radiationParticles) return;
        
        const positions = this.radiationParticles.geometry.attributes.position;
        const velocities = this.radiationParticles.geometry.attributes.velocity;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            
            positionVec.add(velocityVec);
            
            // Reset if too far
            if (positionVec.length() > 1.5) {
                const phi = Math.acos(-1 + (2 * Math.random()));
                const theta = Math.random() * Math.PI * 2;
                const r = 1.01;
                
                positionVec.set(
                    r * Math.cos(theta) * Math.sin(phi),
                    r * Math.sin(theta) * Math.sin(phi),
                    r * Math.cos(phi)
                );
                
                const direction = positionVec.clone().normalize();
                const speed = 0.015 + Math.random() * 0.01;
                velocityVec.set(
                    direction.x * speed,
                    direction.y * speed,
                    direction.z * speed
                );
            }
            
            positions.setXYZ(i, positionVec.x, positionVec.y, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
        }
        
        positions.needsUpdate = true;
    }

    animateLatentHeat() {
        if (!this.latentHeatParticles) return;
        
        const positions = this.latentHeatParticles.geometry.attributes.position;
        const velocities = this.latentHeatParticles.geometry.attributes.velocity;
        const colors = this.latentHeatParticles.geometry.attributes.color;
        const phases = this.latentHeatParticles.geometry.attributes.phase;
        
        const positionVec = new THREE.Vector3();
        const velocityVec = new THREE.Vector3();
        const colorVec = new THREE.Color();
        
        for (let i = 0; i < positions.count; i++) {
            positionVec.fromBufferAttribute(positions, i);
            velocityVec.fromBufferAttribute(velocities, i);
            
            let phase = phases.getX(i);
            
            positionVec.add(velocityVec);
            
            // Randomly trigger condensation
            if (phase === 0 && Math.random() < 0.01) {
                phase = 1; // Start condensing
                // Release heat energy (change color to warm and create outward heat)
                colorVec.setHex(0xffaa44); // Warm color for released heat
                // Create small heat burst
                const heatDirection = new THREE.Vector3().randomDirection();
                velocityVec.copy(heatDirection.multiplyScalar(0.02));
            }
            
            // Reset if out of bounds
            const distance = positionVec.length();
            if (distance > 1.3 || distance < 1.05) {
                // Reset to a new starting position
                const angle = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 1.08 + Math.random() * 0.15;
                
                positionVec.set(
                    r * Math.cos(angle) * Math.sin(phi),
                    r * Math.sin(angle) * Math.sin(phi),
                    r * Math.cos(phi)
                );
                
                velocityVec.set(
                    (Math.random() - 0.5) * 0.008,
                    (Math.random() - 0.5) * 0.008,
                    (Math.random() - 0.5) * 0.008
                );
                
                colorVec.setHex(0xaaeeff); // Back to water vapor color
                phase = 0; // Back to vapor phase
            }
            
            positions.setXYZ(i, positionVec.x, positionVec.y, positionVec.z);
            velocities.setXYZ(i, velocityVec.x, velocityVec.y, velocityVec.z);
            colors.setXYZ(i, colorVec.r, colorVec.g, colorVec.b);
            phases.setX(i, phase);
        }
        
        positions.needsUpdate = true;
        colors.needsUpdate = true;
    }

    clearAtmosphericHeating() {
        const toRemove = [];
        this.scene.traverse((child) => {
            if (!child.userData) return;
            if (child.userData.isSolarHeating || 
                child.userData.isEarthHeat || 
                child.userData.isConduction ||
                child.userData.isConvection ||
                child.userData.isRadiation ||
                child.userData.isLatentHeat) {
                toRemove.push(child);
            }
        });
        
        toRemove.forEach(child => {
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.solarHeatingParticles = null;
        this.earthHeatParticles = null;
        this.conductionParticles = null;
        this.convectionParticles = null;
        this.radiationParticles = null;
        this.latentHeatParticles = null;
    }

    showTemperatureLayers() {
        this.resetToDefaultState();
        this.animateCamera({ x: 0, y: 0, z: 3.5 }, 2000);

        const toRemove = [];
        this.scene.traverse((child) => {
            if (child.userData.isVerticalDistributionLayer) {
                toRemove.push(child);
            }
        });
        
        toRemove.forEach(child => {
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        const layersData = [
            { name: "Troposphere", radius: 1.10, color: 0x00aaff, time: 7000, special: 'troposphere' },
            { name: "Tropopause", radius: 1.12, color: 0x90ee90, time: 8500 },
            { name: "Stratosphere", radius: 1.25, color: 0xffaa00, time: 10000, special: 'stratosphere' },
            { name: "Stratopause", radius: 1.27, color: 0xeeffaa, time: 11500 },
            { name: "Mesosphere", radius: 1.40, color: 0x00ff00, time: 13000, special: 'mesosphere' },
            { name: "Mesopause", radius: 1.42, color: 0xaaffff, time: 14500 },
            { name: "Thermosphere", radius: 1.60, color: 0xff5555, time: 16000, special: 'thermosphere' },
            { name: "Exosphere", radius: 1.80, color: 0xffffff, time: 18000, special: 'exosphere' }
        ];

        // Show each layer as it's being named in the narration
        layersData.forEach((layerData) => {
            setTimeout(() => {
                if (this.isPlaying && this.currentChapterIndex === 8) {
                    if (layerData.special) {
                        if (layerData.special === 'troposphere') {
                             this.showBlueHalo();
                        } else if (layerData.special === 'stratosphere') {
                            this.showStratosphereHalo();
                        } else if (layerData.special === 'mesosphere') {
                            this.showMesosphereHalo();
                        } else if (layerData.special === 'thermosphere') {
                            this.showThermosphereHalo();
                        } else if (layerData.special === 'exosphere') {
                            this.showExosphereHalo();
                        }
                    } else {
                        this.createAtmosphereLayer(layerData.radius, new THREE.Color(layerData.color), layerData.name); // Pass the name
                    }
                    this.playSound('chime.mp3', 0.3, 1.0 + (layerData.time / 10000)); // Vary pitch slightly
                }
            }, layerData.time);
        });
    }

    showStratosphereHalo() {
        this.clearStratosphereHalo();
        const geometry = new THREE.SphereGeometry(1.25, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(1.0, 0.8, 0.2, 1.0) * intensity * opacity;
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.stratosphereVisual = new THREE.Mesh(geometry, material);
        this.scene.add(this.stratosphereVisual);

        const uniforms = this.stratosphereVisual.material.uniforms;
        new TWEEN.Tween(uniforms.c)
            .to({ value: 0.3 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.p)
            .to({ value: 2.5 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.opacity)
            .to({ value: 2.0 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    clearStratosphereHalo() {
        if (this.stratosphereVisual) {
            this.scene.remove(this.stratosphereVisual);
            if (this.stratosphereVisual.geometry) this.stratosphereVisual.geometry.dispose();
            if (this.stratosphereVisual.material) this.stratosphereVisual.material.dispose();
            this.stratosphereVisual = null;
        }
    }

    showMesosphereHalo() {
        this.clearMesosphereHalo();
        const geometry = new THREE.SphereGeometry(1.40, 64, 64); // Mesosphere radius
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(0.2, 1.0, 0.2, 1.0) * intensity * opacity; // Green color
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.mesosphereVisual = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesosphereVisual);

        const uniforms = this.mesosphereVisual.material.uniforms;
        new TWEEN.Tween(uniforms.c)
            .to({ value: 0.3 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.p)
            .to({ value: 2.5 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.opacity)
            .to({ value: 1.8 }, 2000) // Slightly less bright than others
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    clearMesosphereHalo() {
        if (this.mesosphereVisual) {
            this.scene.remove(this.mesosphereVisual);
            if (this.mesosphereVisual.geometry) this.mesosphereVisual.geometry.dispose();
            if (this.mesosphereVisual.material) this.mesosphereVisual.material.dispose();
            this.mesosphereVisual = null;
        }
    }

    showThermosphereHalo() {
        this.clearThermosphereHalo();
        const geometry = new THREE.SphereGeometry(1.60, 64, 64); // Thermosphere radius
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0) * intensity * opacity; // Red color
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.thermosphereVisual = new THREE.Mesh(geometry, material);
        this.scene.add(this.thermosphereVisual);

        const uniforms = this.thermosphereVisual.material.uniforms;
        new TWEEN.Tween(uniforms.c)
            .to({ value: 0.3 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.p)
            .to({ value: 2.5 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.opacity)
            .to({ value: 1.8 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    clearThermosphereHalo() {
        if (this.thermosphereVisual) {
            this.scene.remove(this.thermosphereVisual);
            if (this.thermosphereVisual.geometry) this.thermosphereVisual.geometry.dispose();
            if (this.thermosphereVisual.material) this.thermosphereVisual.material.dispose();
            this.thermosphereVisual = null;
        }
    }

    showExosphereHalo() {
        this.clearExosphereHalo();
        const geometry = new THREE.SphereGeometry(1.80, 64, 64); // Exosphere radius
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float c;
                uniform float p;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(c + dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * intensity * opacity; // White color
                }
            `,
            uniforms: {
                c: { value: 0.8 },
                p: { value: 4.0 },
                opacity: { value: 0.0 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.exosphereVisual = new THREE.Mesh(geometry, material);
        this.scene.add(this.exosphereVisual);

        const uniforms = this.exosphereVisual.material.uniforms;
        new TWEEN.Tween(uniforms.c)
            .to({ value: 0.3 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.p)
            .to({ value: 2.5 }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        new TWEEN.Tween(uniforms.opacity)
            .to({ value: 1.5 }, 2000) // Fainter, as it's fading to space
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    clearExosphereHalo() {
        if (this.exosphereVisual) {
            this.scene.remove(this.exosphereVisual);
            if (this.exosphereVisual.geometry) this.exosphereVisual.geometry.dispose();
            if (this.exosphereVisual.material) this.exosphereVisual.material.dispose();
            this.exosphereVisual = null;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Handle keyboard movement
        this.handleKeyboardMovement();
        
        // Animate gas particles if they exist
        this.animateGasParticles();
        
        // Animate greenhouse effect if active
        this.animateGreenhouseEffect();

        // Animate Ozone layer effects if active
        this.animateUvRadiation();

        // Animate heat and moisture transfer if active
        this.animateHeatMoistureTransfer();

        // Animate electrical demo if active
        this.animateElectricalDemo();

        // Animate atmospheric heating if active
        this.animateSolarHeating();
        this.animateEarthHeat();
        this.animateConvection();
        this.animateRadiation();
        this.animateLatentHeat();

        // Animate temperature change particles
        this.animateTemperatureChangeParticles();

        // Earth and cloud rotation is now independent of narration playback
        if (this.earth) {
            this.earth.rotation.y += 0.0005;
        }
        if (this.clouds) {
            this.clouds.rotation.y += 0.0007;
        }
        if (this.haze) {
             this.haze.material.uniforms.u_time.value = performance.now() / 1000;
        }
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        TWEEN.update();
        
        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
    }
}

// Initialize the scene
new EarthScene();