import * as THREE from '../js/three.module.js';
import { TextureLoader } from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';
const initialDelayBeforeCalendarPageFlip = 1000; // in ms
const breakpointForLarge = 1024;
const currentDate = new Date();
// const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth(); // this is 0-indexed
const currentDay = currentDate.getDate();
const previousDate = new Date();
previousDate.setDate(previousDate.getDate() - 1);
const previousMonth = previousDate.getMonth(); // this is 0-indexed
const previousDay = previousDate.getDate();
let holidayFound = false;
const $calCanvas = document.querySelector('#calendar-canvas');
const $celeCanvas = document.querySelector('#celebration-canvas');
const $holidayName = document.querySelector('#holiday-name');
const $holidayDesc = document.querySelector('#holiday-desc');
const $textSection = document.querySelector('#text-section');
const $noCelebration = document.querySelector('#no-celebration');
/*
interface Holiday {
  name: string;
  description: string;
}

interface HolidayResponseObject extends Object {
  holidays: Holiday[];
}

interface HolidaysObject extends Promise<object> {
  response: HolidayResponseObject;
}
*/
// shortened from updateRendererSizeRelativeToScreenSize
function updateRendererSizeRSS(renderer) {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  if (innerW < breakpointForLarge) {
    renderer.setSize(innerW, innerW);
  } else {
    renderer.setSize((innerH * 2) / 3, (innerH * 2) / 3);
  }
}
function updateHTMLElementSizes() {
  if (!$textSection) throw new Error('$textSection not found!');
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  if (innerW < breakpointForLarge) {
    $textSection.classList.add(`min-h-[${innerH - innerW}px]`);
  } else {
    $textSection.classList.add(`min-h-[${innerH / 3}px]`);
  }
}
async function loadGLTF(url) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      undefined,
      (error) => {
        reject(error);
      },
    );
  });
}
async function loadTexture(url) {
  const loader = new TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        resolve(texture);
      },
      undefined,
      (error) => {
        reject(error);
      },
    );
  });
}
// Note that the following function IS NOT generic. It requires finding the
// specific paths to the textures that needs to be updated.
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
async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}
async function getHoliday() {
  if (!$holidayName) throw new Error('$holidayName not found!');
  if (!$holidayDesc) throw new Error('$holidayName not found!');
  /*
    const params = {
      api_key: 'FoSOX7Tl9kyNyP4WRVBqwtHEj7zozDcR',
      country: 'us',
      year: currentYear,
      month: currentMonth + 1,
      day: currentDay,
    };
    */
  try {
    /*
        const holidaysPromiseResponse = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${params.api_key}&country=${params.country}&year=${params.year}&month=${params.month}&day=${params.day}`,
        );
        if (!holidaysPromiseResponse.ok) {
          holidayFound = false;
          throw new Error(`HTTP error! Status: ${holidaysPromiseResponse.status}`);
        }
        const holidaysObject =
          (await holidaysPromiseResponse.json()) as HolidaysObject;
        console.log(holidaysObject);
        const holidaysArray = holidaysObject.response.holidays;
        console.log(holidaysArray);
        if (holidaysArray.length > 0) {
          const chosenHoliday =
            holidaysArray[Math.floor(Math.random() * holidaysArray.length)];
          if (chosenHoliday.name && chosenHoliday.description) {
            $holidayName.textContent = chosenHoliday.name;
            $holidayDesc.textContent = chosenHoliday.description;
          }
        }
        */
    $holidayName.textContent =
      'International Day of Remembrance of and Tribute to the Victims of Terrorism';
    $holidayDesc.textContent =
      'International Day of Remembrance of and Tribute to the Victims of Terrorism is a United Nations observance in the USA';
    holidayFound = true;
    /*
          else {
            holidayFound = false;
          }
          */
  } catch (error) {
    holidayFound = false;
    console.error('Error:', error);
  }
}
async function animate(mixer, action, renderer, scene, camera, duration) {
  return new Promise((resolve) => {
    function nextFrame() {
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
async function initialCameraMovement(camera, renderer, scene) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let count = 1;
    function nextFrame() {
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
async function createCalendarScene() {
  const calRenderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: $calCanvas,
  });
  updateRendererSizeRSS(calRenderer);
  if (!$calCanvas) throw new Error('$calCanvas not found!');
  if (!(window.innerWidth < breakpointForLarge)) {
    $calCanvas.classList.add(
      `left-[${window.innerWidth / 2 - window.innerHeight / 3}px]`,
    );
  }
  updateHTMLElementSizes();
  // The four arguments below are field of view, aspect, near, and far, respectively
  const calCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
  calCamera.position.set(15, 15, 7);
  const calScene = new THREE.Scene();
  calScene.background = new THREE.Color(0xeeeeee);
  const calSceneLight = new THREE.DirectionalLight(0xffffff, 5);
  calSceneLight.decay = 0;
  calSceneLight.position.set(10, 18, -20);
  calScene.add(calSceneLight);
  const celeRenderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: $celeCanvas,
  });
  updateRendererSizeRSS(celeRenderer);
  const celeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
  celeCamera.position.set(15, 9, 2);
  const celeScene = new THREE.Scene();
  celeScene.background = new THREE.Color(0xeeeeee);
  const celeSceneLight = new THREE.DirectionalLight(0xfdf1bf, 5);
  celeSceneLight.decay = 0;
  celeSceneLight.position.set(10, 18, 0);
  celeScene.add(celeSceneLight);
  try {
    const calGltf = await loadGLTF('../../objects/calendar.glb');
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
    updateTextures(
      [newTexture1, newTexture2, newTexture3, newTexture4],
      calGltf,
    );
    const calModel = calGltf.scene;
    calScene.add(calModel);
    calCamera.lookAt(0, 6, 0);
    const mixer = new THREE.AnimationMixer(calModel);
    const action = mixer.clipAction(calGltf.animations[0]).play();
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
    await getHoliday();
    if (!$noCelebration) throw new Error('$noCelebration not found!');
    if (holidayFound) {
      $noCelebration.classList.add('hidden');
      const celeGltf = await loadGLTF(
        '../../objects/celebrations/family-celebration.glb',
      );
      const celeModel = celeGltf.scene;
      celeScene.add(celeModel);
      celeCamera.lookAt(0, 7, 0);
      celeRenderer.render(celeScene, celeCamera);
    } else {
      $noCelebration.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
createCalendarScene();
