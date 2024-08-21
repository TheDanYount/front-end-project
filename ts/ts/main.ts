import * as THREE from '../js/three.module.js';
import {
  TextureLoader,
  Scene,
  WebGLRenderer,
  Vector3,
} from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';

const initialDelayBeforeCalendarPageFlip = 1000; // in ms
const breakpointForLarge = 1024;

const currentDate = new Date();
const currentMonth = currentDate.getMonth(); // this is 0-indexed!
const currentDay = currentDate.getDate();
const previousDate = new Date();
previousDate.setDate(previousDate.getDate() - 1);
const previousMonth = previousDate.getMonth(); // this is 0-indexed!
const previousDay = previousDate.getDate();

const $calCanvas = document.querySelector('#calendar-canvas');
// Not used... YET
// const $celeCanvas = document.querySelector('#celebration-canvas'); //short for celebrationCanvas
// Not used... YET
// const $holidayTitle = document.querySelector('#holiday-title');
// Not used... YET
// const $holidayDesc = document.querySelector('#holiday-desc');
const $textSection = document.querySelector('#text-section');

interface UpdatedPerspectiveCamera extends THREE.PerspectiveCamera {
  position: Vector3;
}

interface UpdatedDirectionalLight extends THREE.DirectionalLight {
  position: Vector3;
  decay: number;
}

interface GLTF {
  scene: THREE.Scene;
  scenes: THREE.Scene[];
  animations: THREE.AnimationClip[];
  cameras: THREE.Camera[];
  materials: THREE.Material[];
  meshes: THREE.Mesh[];
  textures: THREE.Texture[];
}

// shortened from updateRendererSizeRelativeToScreenSize
function updateRendererSizeRSS(renderer: WebGLRenderer): void {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  if (innerW < breakpointForLarge) {
    renderer.setSize(innerW, innerW);
  } else {
    renderer.setSize((innerH * 2) / 3, (innerH * 2) / 3);
  }
}

function updateHTMLElementSizes(): void {
  if (!$textSection) throw new Error('$textSection not found!');
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  if (innerW < breakpointForLarge) {
    $textSection.classList.add(`min-h-[${innerH - innerW}px]`);
  } else {
    $textSection.classList.add(`min-h-[${innerH / 3}px]`);
  }
}

async function loadGLTF(url: string): Promise<GLTF> {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf: GLTF) => {
        resolve(gltf);
      },
      undefined,
      (error: Error) => {
        reject(error);
      },
    );
  });
}

async function loadTexture(url: string): Promise<THREE.Texture> {
  const loader = new TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture: THREE.Texture) => {
        resolve(texture);
      },
      undefined,
      (error: Error) => {
        reject(error);
      },
    );
  });
}

// Note that the following function IS NOT generic. It requires finding the
// specific paths to the textures that needs to be updated.
function updateTextures(textureArray: THREE.Texture[], gltf: GLTF): void {
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

async function delay(time: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}

async function animate(
  mixer: THREE.AnimationMixer,
  action: THREE.AnimationAction,
  renderer: WebGLRenderer,
  scene: Scene,
  camera: UpdatedPerspectiveCamera,
  duration: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    function nextFrame(): void {
      setTimeout(() => {
        if (action.time < duration) {
          requestAnimationFrame(nextFrame);
          mixer.update(0.05);
          renderer.render(scene, camera);
        } else {
          resolve(true);
        }
      }, 50);
    }
    requestAnimationFrame(nextFrame);
  });
}

async function initialCameraMovement(
  camera: UpdatedPerspectiveCamera,
  renderer: WebGLRenderer,
  scene: Scene,
): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let count = 1;
    function nextFrame(): void {
      setTimeout(
        () => {
          if (count <= 40) {
            camera.position.set(
              15 + 3.5 * Math.sin((count * Math.PI) / 40) - count / 20,
              15 - count / 10,
              7 - 3.5 * (1 - Math.cos((count * Math.PI) / 40)),
            );
            camera.lookAt(0, 6, 0);
            renderer.render(scene, camera);
            count++;
            nextFrame();
          } else {
            resolve(true);
          }
        },
        50 * count - (Date.now() - startTime),
      );
    }
    nextFrame();
  });
}

async function createCalendarScene(): Promise<void> {
  const calRenderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: $calCanvas,
  }) as WebGLRenderer;
  updateRendererSizeRSS(calRenderer);
  if (!$calCanvas) throw new Error('$calCanvas not found!');
  if (!(window.innerWidth < breakpointForLarge)) {
    $calCanvas.classList.add(
      `left-[${window.innerWidth / 2 - window.innerHeight / 3}px]`,
    );
  }
  updateHTMLElementSizes();
  // The four arguments below are field of view, aspect, near, and far, respectively
  const calCamera = new THREE.PerspectiveCamera(
    75,
    1,
    0.1,
    50,
  ) as UpdatedPerspectiveCamera;
  calCamera.position.set(15, 15, 7);
  const calScene = new THREE.Scene();
  calScene.background = new THREE.Color(0xeeeeee);
  const calSceneLight = new THREE.DirectionalLight(
    0xffffff,
    5,
  ) as UpdatedDirectionalLight;
  calSceneLight.decay = 0;
  calSceneLight.position.set(10, 18, -20);
  calScene.add(calSceneLight);
  try {
    const gltf = await loadGLTF('../../objects/calendar.glb');
    const newTexture1 = await loadTexture(
      `../../images/days/d${previousDay}.png`,
    );
    const newTexture2 = await loadTexture(
      `../../images/months/m${previousMonth + 1}.png`,
    );
    const newTexture3 = await loadTexture(
      `../../images/days/d${currentDay}.png`,
    );
    const newTexture4 = await loadTexture(
      `../../images/months/m${currentMonth + 1}.png`,
    );
    updateTextures([newTexture1, newTexture2, newTexture3, newTexture4], gltf);
    const model = gltf.scene;
    calScene.add(model);
    calCamera.lookAt(0, 6, 0);
    const mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(gltf.animations[0]).play();
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce);
    calRenderer.render(calScene, calCamera);
    await delay(initialDelayBeforeCalendarPageFlip);
    await animate(
      mixer,
      action,
      calRenderer,
      calScene,
      calCamera,
      action.getClip().duration,
    );
    if (window.innerWidth < breakpointForLarge) {
      $calCanvas.classList.add(
        'transition-transform',
        'duration-[2000ms]',
        'ease-in-out',
        '0s',
        'scale-[calc(33.33%)]',
        'translate-x-[calc(-33.33%)]',
        'translate-y-[calc(-33.33%)]',
      );
    } else {
      $calCanvas.classList.add(
        'transition-transform',
        'duration-[2000ms]',
        'ease-in-out',
        '0s',
        'scale-[calc(33.33%)]',
        `translate-x-[-${window.innerWidth / 2 - window.innerHeight / 9}px]`,
        `translate-y-[-${(window.innerHeight * 2) / 9}px]`,
      );
    }
    await initialCameraMovement(calCamera, calRenderer, calScene);
  } catch (error) {
    console.error('Error:', error);
  }
}

createCalendarScene();
