import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


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

camera.position.set(0, 10, 0)
camera.lookAt(0, 0, 0)

const loader = new GLTFLoader();
// loader.load('/Mahoraga Wheel ani.glb', function (gltf) {
//     scene.add(gltf.scene);
// });

let mixer;

loader.load('/Mahoraga Wheel ani.glb', function (gltf) {

    const model = gltf.scene;
    scene.add(model);

    // Animatie
    mixer = new THREE.AnimationMixer(model);

    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
    });

});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);

    model.rotation.y += 0.01;
}
animate();