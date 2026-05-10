// import * as THREE from 'three';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
//     75, window.innerWidth / window.innerHeight, 0.1, 1000);

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight);
// document.body.appendChild(
//     renderer.domElement
// );



// //BOX
// // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// // const cube = new THREE.Mesh( geometry, material );
// // scene.add( cube );

// // camera.position.z = 5;

// // function animate() {

// //   cube.rotation.x += 0.01;
// // cube.rotation.y += 0.01

// //   renderer.render( scene, camera );
// // }
// // renderer.setAnimationLoop( animate );



// //Sphere
// // ;
// // const circleGeometry = new THREE.SphereGeometry( 15, 32, 16 );
// // const circleM = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// // const circle = new THREE.Mesh( circleGeometry, circleM );
// // scene.add( circle );

// // camera.position.z = 30;

// // function animate() {

// //   circle.rotation.x += 0.01;
// // circle.rotation.y += 0.01

// //   renderer.render( scene, camera );
// // }
// // renderer.setAnimationLoop( animate );

// // ;


// const ringGeometry = new THREE.RingGeometry( 1, 5, 32)
// const ringM = new THREE.MeshBasicMaterial({
//   color: 0xffff00, side: THREE.DoubleSide 
// })
// const ringMesh = new THREE.Mesh (ringGeometry, ringM)
// scene.add(ringMesh)

// camera.position.z = 5;

// function animate() {

//   circle.rotation.x += 0.01;
// circle.rotation.y += 0.01

//   renderer.render( scene, camera );
// }
// renderer.setAnimationLoop( animate );

// ;

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Zwart gat
const blackHole = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    new THREE.MeshBasicMaterial({color:0xffff00})
);
scene.add(blackHole);

// Accretieschijf
const accretionDisk = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 1.5, 128),
    new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vec2 centeredUV = vUv - 0.5;
                float radius = length(centeredUV);
                
                // Simpele glow
                float glow = 1.0 - smoothstep(0.6, 1.5, radius); 
                glow *= 0.8 + 0.2 * sin(10.0*radius - time*2.0); // pulserend effect
                
                gl_FragColor = vec4(vec3(glow, glow*0.5, glow*0.2), glow); 
            }
        `,
        side: THREE.DoubleSide,
        transparent: true
    })
);
accretionDisk.rotation.x = Math.PI/2;
scene.add(accretionDisk);

// Animatie
function animate(time){
    requestAnimationFrame(animate);
    accretionDisk.material.uniforms.time.value = time * 0.001;
    accretionDisk.rotation.z += 0.005;
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
