import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { reflectVector } from 'three/src/nodes/TSL.js';

// ========== VARIABLES ==========
let models = [];                  // array van alle geladen modellen
let currentModelIndex = 0;        // actieve model index
let targetRotation = 0;
let currentRotation = 0;
const clickSound = new Audio('audio/Mahoraga Wheel Spin  Adaption Sound Effect.mp3');
clickSound.volume = 0.3;
let canPlaySound = true;
const soundCooldown = 3000;

let lastScrollY = 0;

// ========== SCENE ==========
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 0); // top-down
camera.lookAt(0, 7, -6);

const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,5,5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));











const loader = new GLTFLoader();
const modelFiles = [
    '/Mahoraga Wheel ani.glb',
    '/Mahoraga Wheel with detail.glb'
];

// ========== LOAD MODELS ==========
modelFiles.forEach((path, index) => {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.visible = index === 0; // alleen eerste model zichtbaar
        model.position.set(0,10,-6); 
        scene.add(model);
        models.push(model);
    });
});

// ========== SWITCH MODEL ==========
function switchModel() {
    if(models.length < 2) return;

    models[currentModelIndex].visible = false;
    currentModelIndex = (currentModelIndex + 1) % models.length;
    models[currentModelIndex].visible = true;
}

window.addEventListener('keydown', (e) => {
    if(e.key === ' ') switchModel(); // spatie = wissel model
});

// ========== SCROLL ROTATION & SOUND ==========
function isNearBottom() {
    return window.scrollY + window.innerHeight >= document.body.scrollHeight - 50;
}

window.addEventListener('scroll', () => {
    targetRotation = window.scrollY * 0.005;

    // alleen naar beneden scrollen
    if(window.scrollY > lastScrollY) {
        if(isNearBottom() && canPlaySound) {
            clickSound.play();
            canPlaySound = false;
            setTimeout(() => canPlaySound = true, soundCooldown);
        }
    }

    lastScrollY = window.scrollY;
});

// ========== ANIMATE ==========
function animate() {
    requestAnimationFrame(animate);

    if(models.length) {
        const activeModel = models[currentModelIndex];
        currentRotation += (targetRotation - currentRotation) * 0.1;
        activeModel.rotation.y = currentRotation;
    }

    renderer.render(scene, camera);
}
animate();

// ========== RESIZE ==========
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // update schaal van actief model
    if(models.length) {
        const activeModel = models[currentModelIndex];
        const width = window.innerWidth;
        if(width > 1200) activeModel.scale.set(2,2,2);
        else if(width > 786) activeModel.scale.set(1.5,1.5,1.5);
        else activeModel.scale.set(1.2,1.2,1.2);
    }
});


const projectItems = document.querySelectorAll(".reveal-project");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show"); // verdwijnt bij omhoog scrollen
    }
  });
}, { threshold: 0.25 });

projectItems.forEach(item => observer.observe(item));

const modal = document.getElementById("contactModal");
const btn = document.getElementById("contactBtnNav");
const close = document.querySelector(".close");

btn.onclick = () => {
  modal.style.display = "block";
};

close.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};


