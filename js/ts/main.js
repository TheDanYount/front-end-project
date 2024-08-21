import * as THREE from '../js/three.module.js';
import { TextureLoader } from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';
const breakpointForLarge = 1024;
let currentDate = new Date();
let currentMonth = currentDate.getMonth(); //this is 0-indexed!
let currentDay = currentDate.getDate();
let previousDate = new Date();
previousDate.setDate(previousDate.getDate() - 1);
let previousMonth = previousDate.getMonth(); //this is 0-indexed!
let previousDay = previousDate.getDate();
let currentTitle = '';
let currentDesc = '';
const $calCanvas = document.querySelector('#calendar-canvas');
const $celeCanvas = document.querySelector('#celebration-canvas'); //short for celebrationCanvas
const $holidayTitle = document.querySelector('#holiday-title');
const $holidayDesc = document.querySelector('#holiday-desc');
const $textSection = document.querySelector('#text-section');
//shortened from updateRendererSizeRelativeToScreenSize
function updateRendererSizeRSS(renderer) {
    const innerW = window.innerWidth;
    const innerH = window.innerHeight;
    if (innerW < breakpointForLarge) {
        renderer.setSize(innerW, innerW);
    }
    else {
        renderer.setSize((innerH * 2) / 3, (innerH * 2) / 3);
    }
}
function updateHTMLElementSizes() {
    if (!$textSection)
        throw new Error('$textSection not found!');
    const innerW = window.innerWidth;
    const innerH = window.innerHeight;
    if (innerW < breakpointForLarge) {
        $textSection.classList.add(`min-h-[${innerH - innerW}px]`);
    }
    else {
        $textSection.classList.add(`min-h-[${innerH / 3}px]`);
    }
}
async function loadGLTF(url) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(url, (gltf) => {
            resolve(gltf);
        }, undefined, (error) => {
            reject(error);
        });
    });
}
async function loadTexture(url) {
    const loader = new TextureLoader();
    return new Promise((resolve, reject) => {
        loader.load(url, (texture) => {
            resolve(texture);
        }, undefined, (error) => {
            reject(error);
        });
    });
}
//Note that the following function IS NOT generic. It requires finding the
//specific paths to the textures that needs to be updated.
function updateTextures(textureArray, gltf) {
    textureArray[0].flipY = false;
    textureArray[1].flipY = false;
    textureArray[2].flipY = false;
    textureArray[3].flipY = false;
    gltf.scene.children[1].children[0].children[0].material.map = textureArray[0];
    gltf.scene.children[1].children[0].children[0].material.needsUpdate = true;
    gltf.scene.children[1].children[0].children[1].material.map = textureArray[1];
    gltf.scene.children[1].children[0].children[1].material.needsUpdate = true;
    gltf.scene.children[2].children[0].material.map = textureArray[2];
    gltf.scene.children[2].children[0].material.needsUpdate = true;
    gltf.scene.children[2].children[1].material.map = textureArray[3];
    gltf.scene.children[2].children[1].material.needsUpdate = true;
}
async function createCalendarScene() {
    const calRenderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: $calCanvas,
    });
    updateRendererSizeRSS(calRenderer);
    updateHTMLElementSizes();
    //The four arguments below are field of view, aspect, near, and far, respectively
    const calCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
    calCamera.position.set(15, 15, 7);
    const calScene = new THREE.Scene();
    calScene.background = new THREE.Color(0xeeeeee);
    const calSceneLight = new THREE.DirectionalLight(0xffffff, 5);
    calSceneLight.decay = 0;
    calSceneLight.position.set(10, 18, -20);
    calScene.add(calSceneLight);
    try {
        const gltf = await loadGLTF('../../objects/calendar.glb');
        const newTexture1 = await loadTexture(`../../images/days/d${previousDay}.png`);
        const newTexture2 = await loadTexture(`../../images/months/m${previousMonth + 1}.png`);
        const newTexture3 = await loadTexture(`../../images/days/d${currentDay}.png`);
        const newTexture4 = await loadTexture(`../../images/months/m${currentMonth + 1}.png`);
        updateTextures([newTexture1, newTexture2, newTexture3, newTexture4], gltf);
        const model = gltf.scene;
        calScene.add(model);
        calCamera.lookAt(0, 6, 0);
        calRenderer.render(calScene, calCamera);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
createCalendarScene();
