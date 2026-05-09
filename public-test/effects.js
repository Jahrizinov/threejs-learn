// Shadow Realm - Three.js Void Effect
(function() {
    const canvas = document.getElementById('vfx-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create Particles (Embers/Void Dust)
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const count = 5000;

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xff0000,
        size: 0.02,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Interaction (Mouse Move)
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX - window.innerWidth / 2) / 1000;
        targetY = (event.clientY - window.innerHeight / 2) / 1000;
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;

        // Smooth camera drift logic moved to animate loop for high-quality fluid movement
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Session-based Warning Logic
    const initWarning = () => {
        const warningSeen = sessionStorage.getItem('shadow_realm_warning_seen');
        const modalElement = document.getElementById('warningModal');
        const acknowledgeBtn = document.getElementById('acknowledgeBtn');

        if (!warningSeen && modalElement) {
            // Slight delay to ensure Bootstrap's transition system is ready
            setTimeout(() => {
                try {
                    const warningModal = new bootstrap.Modal(modalElement);
                    warningModal.show();

                    if (acknowledgeBtn) {
                        acknowledgeBtn.addEventListener('click', () => {
                            sessionStorage.setItem('shadow_realm_warning_seen', 'true');
                        });
                    }
                } catch (e) {
                    console.error("Bootstrap Modal Initialization Error:", e);
                }
            }, 500);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWarning);
    } else {
        initWarning();
    }
})();
