import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let model;                // je 3D model
let targetRotation = 0;   // scroll target
let currentRotation = 0;
const clickSound = new Audio('audio/Mahoraga Wheel Spin  Adaption Sound Effect.mp3');
let canPlaySound = true; // true = geluid mag afspelen
const soundCooldown = 1000; // 1000 ms = 1 seconde cooldow

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const canvas = document.getElementById('three-canvas');

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,   // BELANGRIJK
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x11111, 0.8));

camera.position.set(0, 20, 0); // 20 units boven het model
camera.lookAt(0, 7, -6);      // kijk naar het midden van het model

const loader = new GLTFLoader();
// loader.load('/Mahoraga Wheel ani.glb', function (gltf) {
//     scene.add(gltf.scene);
// });

let mixer;



loader.load('/Mahoraga Wheel ani.glb', function (gltf) {

    model = gltf.scene;

    model.position.set(0,10,-6);   // model in midden
    scene.add(model);

    // Animatie
    // mixer = new THREE.AnimationMixer(model);

    // gltf.animations.forEach((clip) => {
    //     mixer.clipAction(clip).play();
    // });

});




function updateModelScale() {
    if(!model) return;

    const width = window.innerWidth;

    if(width > 1200) {
        model.scale.set(2,2,2);
    } else if(width > 786) {
        model.scale.set(1.5,1.5,1.5);
    } else {
        model.scale.set(1.2,1.2,1.2);
    }
}

// Bij laden
updateModelScale();

// Bij resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    updateModelScale(); // schaal bijwerken
});

const clock = new THREE.Clock();


window.addEventListener("scroll", () => {
    targetRotation = window.scrollY * 0.005;
});


function isNearBottom() {
    // window.innerHeight = viewport hoogte
    // window.scrollY = huidige scroll top
    // document.body.scrollHeight = totale pagina hoogte
    return window.scrollY + window.innerHeight >= document.body.scrollHeight - 50;
}

window.addEventListener("scroll", () => {
    // scroll-rotation van je model
    targetRotation = window.scrollY * 0.005;

    // check of we near bottom zijn en cooldown actief
    if(isNearBottom() && canPlaySound){
        clickSound.play();    // speel geluid
        canPlaySound = false; // blokkeer tijdelijk
        setTimeout(() => canPlaySound = true, soundCooldown); // reset na cooldown
    }
});


function animate() {
    requestAnimationFrame(animate);

    if (model) {
        currentRotation += (targetRotation - currentRotation) * 0.1;
        model.rotation.y = currentRotation;
    }

    renderer.render(scene, camera);
}

animate();


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

