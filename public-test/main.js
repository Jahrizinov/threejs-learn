import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let model;                // je 3D model
let targetRotation = 0;   // scroll target
let currentRotation = 0;

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
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

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
    } else if(width > 800) {
        model.scale.set(0.7,0.7,0.7);
    } else {
        model.scale.set(0.5,0.5,0.5);
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


function animate() {
    requestAnimationFrame(animate);

    if (model) {
        currentRotation += (targetRotation - currentRotation) * 0.1;
        model.rotation.y = currentRotation;
    }

    renderer.render(scene, camera);
}

animate();