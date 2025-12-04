import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


// ---------------------------------------------------
// SCENE + CAMERA + RENDERER
// ---------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ---------------------------------------------------
// ORBIT CONTROLS
// ---------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ---------------------------------------------------
// BLACK HOLE CORE
// ---------------------------------------------------
const blackHole = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
scene.add(blackHole);

// ---------------------------------------------------
// ACCRETION DISK (glow, shaders)
// ---------------------------------------------------
const diskVertex = await fetch("./assets/shaders/diskVertex.glsl").then(r => r.text());
const diskFragment = await fetch("./assets/shaders/diskFragment.glsl").then(r => r.text());

const accretionDisk = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 4.5, 128),
    new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: diskVertex,
        fragmentShader: diskFragment,
        transparent: true,
        side: THREE.DoubleSide
    })
);

accretionDisk.rotation.x = Math.PI / 2;
scene.add(accretionDisk);

// ---------------------------------------------------
// ANIMATE
// ---------------------------------------------------
function animate(time) {
    requestAnimationFrame(animate);

    accretionDisk.material.uniforms.time.value = time * 0.001;

    // slow rotation
    accretionDisk.rotation.z += 0.002;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// ---------------------------------------------------
// RESPONSIVE
// ---------------------------------------------------
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
