import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// =============================================
// DOMAIN WARNING — Enter button logic
// =============================================
const enterBtn = document.getElementById('enterBtn');
const domainOverlay = document.getElementById('domain-warning');
const mainContent = document.getElementById('main-content');
const mainNav = document.getElementById('main-nav');
const mainFooter = document.getElementById('main-footer');
const settingsBar = document.getElementById('settings-bar');

let audioContext, analyser, audioSource, audioBuffer;
let isAudioPlaying = false;
let particlesEnabled = true;

enterBtn.addEventListener('click', () => {
    domainOverlay.classList.add('fade-out');
    setTimeout(() => {
        domainOverlay.style.display = 'none';
        mainContent.classList.remove('hidden');
        mainContent.classList.add('visible');
        mainNav.classList.remove('hidden');
        mainNav.classList.add('visible');
        mainFooter.classList.remove('hidden');
        mainFooter.classList.add('visible');
        settingsBar.classList.remove('hidden');
        settingsBar.classList.add('visible');
        initAudio();
        initWheelScene();
        initScrollReveal();
    }, 1000);
});

// =============================================
// SETTINGS
// =============================================
const audioToggle = document.getElementById('audioToggle');
const particleToggle = document.getElementById('particleToggle');
const volumeSlider = document.getElementById('volumeSlider');

audioToggle.addEventListener('change', () => {
    if (audioToggle.checked) {
        resumeAudio();
    } else {
        pauseAudio();
    }
});

particleToggle.addEventListener('change', () => {
    particlesEnabled = particleToggle.checked;
    if (particles) {
        particles.visible = particlesEnabled;
    }
});

volumeSlider.addEventListener('input', () => {
    if (gainNode) {
        gainNode.gain.value = volumeSlider.value / 100;
    }
});

// =============================================
// AUDIO — Web Audio API with beat detection
// =============================================
let gainNode, dataArray, bufferLength;

async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.4;

        const response = await fetch('/audio/mahoraga.mp3');
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        playAudio();
    } catch (e) {
        console.warn('Audio not available:', e);
    }
}

function playAudio() {
    if (!audioContext || !audioBuffer) return;
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.loop = true;
    audioSource.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
    audioSource.start(0);
    isAudioPlaying = true;
}

function pauseAudio() {
    if (audioSource && isAudioPlaying) {
        audioSource.stop();
        isAudioPlaying = false;
    }
}

function resumeAudio() {
    if (!isAudioPlaying) {
        playAudio();
    }
}

function getAudioLevel() {
    if (!analyser || !dataArray) return 0;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    return sum / bufferLength / 255; // 0 to 1
}

// =============================================
// PARTICLE SCENE — Full background
// =============================================
const bgCanvas = document.getElementById('vfx-canvas');
const bgScene = new THREE.Scene();
const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
bgCamera.position.z = 5;

const bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    alpha: true,
    antialias: true
});
bgRenderer.setPixelRatio(window.devicePixelRatio);
bgRenderer.setSize(window.innerWidth, window.innerHeight);

// Particles
const particleGeometry = new THREE.BufferGeometry();
const vertices = [];
const count = 5000;

for (let i = 0; i < count; i++) {
    vertices.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
    );
}

particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0xcc0000,
    size: 0.02,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
bgScene.add(particles);

// Mouse interaction
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    targetX = (event.clientX - window.innerWidth / 2) / 1000;
    targetY = (event.clientY - window.innerHeight / 2) / 1000;
});

window.addEventListener('resize', () => {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
});

// =============================================
// MAHORAGA WHEEL SCENE — Hero canvas
// =============================================
let wheelScene, wheelCamera, wheelRenderer, wheelModel, wheelMixer;

function initWheelScene() {
    const wheelCanvas = document.getElementById('wheel-canvas');
    wheelScene = new THREE.Scene();

    wheelCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    wheelCamera.position.set(0, 0, 4);

    wheelRenderer = new THREE.WebGLRenderer({
        canvas: wheelCanvas,
        alpha: true,
        antialias: true
    });
    wheelRenderer.setPixelRatio(window.devicePixelRatio);
    wheelRenderer.setSize(
        wheelCanvas.parentElement.clientWidth,
        wheelCanvas.parentElement.clientHeight
    );

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    wheelScene.add(ambientLight);

    const redLight = new THREE.PointLight(0xcc0000, 3, 10);
    redLight.position.set(2, 2, 2);
    wheelScene.add(redLight);

    const redLight2 = new THREE.PointLight(0xff1a1a, 2, 8);
    redLight2.position.set(-2, -1, 1);
    wheelScene.add(redLight2);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 5, -3);
    wheelScene.add(rimLight);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
        '/assets/models/mahoraga.glb',
        (gltf) => {
            wheelModel = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(wheelModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxDim;

            wheelModel.position.sub(center.multiplyScalar(scale));
            wheelModel.scale.setScalar(scale);

            // Apply red tint to all materials
            wheelModel.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x1a0000,
                        emissive: 0xcc0000,
                        emissiveIntensity: 0.3,
                        metalness: 0.8,
                        roughness: 0.2,
                    });
                }
            });

            wheelScene.add(wheelModel);

            // Play animation if available
            if (gltf.animations && gltf.animations.length > 0) {
                wheelMixer = new THREE.AnimationMixer(wheelModel);
                const action = wheelMixer.clipAction(gltf.animations[0]);
                action.play();
            }
        },
        undefined,
        (error) => {
            console.warn('Model not loaded yet:', error);
            // Fallback: spinning ring if model not found
            createFallbackWheel();
        }
    );
}

function createFallbackWheel() {
    const geometry = new THREE.TorusGeometry(1.5, 0.08, 16, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xcc0000,
        emissive: 0xcc0000,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.1,
    });
    wheelModel = new THREE.Mesh(geometry, material);

    const spoke1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 3, 8),
        material
    );
    const spoke2 = spoke1.clone();
    const spoke3 = spoke1.clone();
    const spoke4 = spoke1.clone();
    spoke2.rotation.z = Math.PI / 2;
    spoke3.rotation.z = Math.PI / 4;
    spoke4.rotation.z = -Math.PI / 4;

    wheelModel.add(spoke1, spoke2, spoke3, spoke4);
    wheelScene.add(wheelModel);
}

// =============================================
// SCROLL HOVER WHEEL SPEED
// =============================================
let scrollWheelSpeed = 0;

window.addEventListener('scroll', () => {
    scrollWheelSpeed = 0.05;
    setTimeout(() => { scrollWheelSpeed = 0; }, 300);
});

// =============================================
// MAIN ANIMATION LOOP
// =============================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const audioLevel = getAudioLevel();

    // Particles
    if (particlesEnabled) {
        particles.rotation.y += 0.001 + audioLevel * 0.005;
        particles.rotation.x += 0.0005;
        particleMaterial.opacity = 0.4 + audioLevel * 0.4;
    }

    bgCamera.position.x += (targetX - bgCamera.position.x) * 0.05;
    bgCamera.position.y += (-targetY - bgCamera.position.y) * 0.05;

    bgRenderer.render(bgScene, bgCamera);

    // Mahoraga wheel
    if (wheelModel && wheelRenderer) {
        const baseSpeed = 0.003;
        const scrollBoost = scrollWheelSpeed;
        const audioBoost = audioLevel * 0.04;
        const totalSpeed = baseSpeed + scrollBoost + audioBoost;

        wheelModel.rotation.y += totalSpeed;

        // Beat pulse on scale
        const pulse = 1 + audioLevel * 0.08;
        wheelModel.scale.setScalar(
            (2.5 / Math.max(0.1, wheelModel.scale.x)) * pulse *
            wheelModel.scale.x
        );

        if (wheelMixer) {
            wheelMixer.update(delta * (1 + audioLevel * 2));
        }

        wheelRenderer.render(wheelScene, wheelCamera);
    }
}

animate();

// =============================================
// SCROLL REVEAL
// =============================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, i * 100);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
}

// =============================================
// SKILL TREE — Node click interaction
// =============================================
const skillPanel = document.getElementById('skill-panel');
const panelSkillName = document.getElementById('panel-skill-name');
const panelStars = document.getElementById('panel-stars');
const panelDesc = document.getElementById('panel-desc');
const panelClose = document.getElementById('panel-close');

document.querySelectorAll('.skill-node').forEach(node => {
    node.addEventListener('click', () => {
        const skill = node.dataset.skill;
        const level = parseInt(node.dataset.level);
        const desc = node.dataset.desc;

        panelSkillName.textContent = skill;
        panelDesc.textContent = desc;

        // Stars
        const filledStar = '★';
        const emptyStar = '☆';
        panelStars.textContent = filledStar.repeat(level) + emptyStar.repeat(5 - level);

        skillPanel.classList.remove('hidden');
        skillPanel.style.opacity = '1';
        skillPanel.style.transform = 'translateY(0)';
        skillPanel.style.pointerEvents = 'all';
    });
});

panelClose.addEventListener('click', () => {
    skillPanel.classList.add('hidden');
});

// =============================================
// HAMBURGER MENU
// =============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '60px';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(5,5,5,0.97)';
    navLinks.style.padding = '20px';
    navLinks.style.border = '1px solid rgba(204,0,0,0.3)';
    navLinks.style.gap = '15px';
});

const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    if (darkModeToggle.checked) {
        particleMaterial.color.set(0xff4444);
    } else {
        particleMaterial.color.set(0xcc0000);
    }
});