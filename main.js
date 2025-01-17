import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const scroll = new LocomotiveScroll();

const scene = new THREE.Scene();



const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const model = new THREE.Object3D(); // Create an empty object to hold the model
scene.add(model);


window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.3);
    const y = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.3);

    gsap.to(model.rotation, {
        x: y,
        y: x,
        duration: 0.5,
        ease: "power2.out"
    });
});

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);


// Load HDRI
const hdriLoader = new RGBELoader();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

hdriLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();
});

// Load GLTF Model
const loader = new GLTFLoader();
loader.load('./DamagedHelmet.gltf', function (gltf) {
    model.add(gltf.scene);
});

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms.amount.value = 0.003; // Adjust the amount of RGB shift effect
composer.addPass(rgbShiftPass);

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);


function animate() {
    window.requestAnimationFrame(animate);

    composer.render();
}

animate();
