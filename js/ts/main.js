import * as THREE from '../js/three.module.js';
import { TextureLoader, } from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';
const initialDelayBeforeCalendarPageFlip = 1000;
const breakpointForLarge = 1024;
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let currentDay = currentDate.getDate();
let previousDate = new Date();
previousDate.setDate(previousDate.getDate() - 1);
let previousMonth = previousDate.getMonth();
let previousDay = previousDate.getDate();
let holidayFound = false;
const celebrations = ['family-celebration'];
let currentCelebration;
const $calCanvas = document.querySelector('#calendar-canvas');
const $celeCanvas = document.querySelector('#celebration-canvas');
const $sidebar = document.querySelector('#sidebar');
const $holidayName = document.querySelector('#holiday-name');
const $holidayDesc = document.querySelector('#holiday-desc');
const $favorite = document.querySelector('#favorite');
const $textSection = document.querySelector('#text-section');
const $noCelebration = document.querySelector('#no-celebration');
const $newButton = document.querySelector('#new');
const $saveButton = document.querySelector('#save');
const $dateInputDialog = document.querySelector('#date-input-dialog');
const $dateInputForm = document.querySelector('#date-input-form');
const $savePopUp = document.querySelector('#save-pop-up');
let mixer;
let action;
let calRenderer;
let calScene;
let calCamera;
let celeRenderer;
let celeScene;
let celeCamera;
let calGltf;
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
    if (!$holidayName)
        throw new Error('$holidayName not found!');
    if (!$holidayDesc)
        throw new Error('$holidayDesc not found!');
    if (!$favorite)
        throw new Error('$favorite not found!');
    const params = {
        api_key: 'FoSOX7Tl9kyNyP4WRVBqwtHEj7zozDcR',
        country: 'us',
        year: currentYear,
        month: currentMonth + 1,
        day: currentDay,
    };
    try {
        /*
        const holidaysPromiseResponse = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${params.api_key}&country=${params.country}&year=${params.year}&month=${params.month}&day=${params.day}`,
        );
        if (!holidaysPromiseResponse.ok) {
          for (const child of celeScene.children) {
            if (child.type === 'Group') {
              celeScene.remove(child);
            }
          }
          celeRenderer.render(celeScene, celeCamera);
          $holidayName.textContent = '';
          $favorite.classList.add('hidden');
          $holidayDesc.textContent = '';
          currentCelebration = '';
          holidayFound = false;
          throw new Error(`HTTP error! Status: ${holidaysPromiseResponse.status}`);
        }
        const holidaysObject =
          (await holidaysPromiseResponse.json()) as HolidaysObject;
        const holidaysArray = holidaysObject.response.holidays;
        if (holidaysArray.length > 0) {
          const chosenHoliday =
            holidaysArray[Math.floor(Math.random() * holidaysArray.length)];
          if (chosenHoliday.name && chosenHoliday.description) {
            holidayFound = true;
            $holidayName.textContent = chosenHoliday.name;
            $favorite.classList.remove('hidden');
            $holidayDesc.textContent = chosenHoliday.description;
          }
        } else {
          for (const child of celeScene.children) {
            if (child.type === 'Group') {
              celeScene.remove(child);
            }
          }
          celeRenderer.render(celeScene, celeCamera);
          $holidayName.textContent = '';
          $favorite.classList.add('hidden');
          $holidayDesc.textContent = '';
          currentCelebration = '';
          holidayFound = false;
        }
        */
        holidayFound = true;
        $holidayName.textContent = 'Blah';
        $favorite.classList.remove('hidden');
        $holidayDesc.textContent = 'blah blah blah';
    }
    catch (error) {
        for (const child of celeScene.children) {
            if (child.type === 'Group') {
                celeScene.remove(child);
            }
        }
        celeRenderer.render(celeScene, celeCamera);
        $holidayName.textContent = '';
        $favorite.classList.add('hidden');
        $holidayDesc.textContent = '';
        currentCelebration = '';
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
                }
                else {
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
            setTimeout(() => {
                if (count <= 40) {
                    camera.position.set(15 + 3.5 * Math.sin((count * Math.PI) / 40) - count / 20, 15 - count / 10, 7 - 3.5 * (1 - Math.cos((count * Math.PI) / 40)));
                    camera.lookAt(0, 6, 0);
                    renderer.render(scene, camera);
                    count++;
                    nextFrame();
                }
                else {
                    resolve(true);
                }
            }, 50 * count - (Date.now() - startTime));
        }
        nextFrame();
    });
}
function getRandomCelebration() {
    currentCelebration =
        celebrations[Math.floor(Math.random() * celebrations.length)];
}
async function createCalendarScene() {
    calRenderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: $calCanvas,
    });
    updateRendererSizeRSS(calRenderer);
    if (!$calCanvas)
        throw new Error('$calCanvas not found!');
    if (!$sidebar)
        throw new Error('$sidebar not found!');
    if (!(window.innerWidth < breakpointForLarge)) {
        $calCanvas.classList.add(`left-[${window.innerWidth / 2 - window.innerHeight / 3}px]`);
        $sidebar.classList.add('top-[calc(50vh-53.5px)]');
    }
    else {
        $sidebar.classList.add('top-[calc(200vw/3-80px)]');
    }
    updateHTMLElementSizes();
    calCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
    calCamera.position.set(15, 15, 7);
    calScene = new THREE.Scene();
    calScene.background = new THREE.Color(0xeeeeee);
    const calSceneLight = new THREE.DirectionalLight(0xffffff, 5);
    calSceneLight.decay = 0;
    calSceneLight.position.set(10, 18, -20);
    calScene.add(calSceneLight);
    celeRenderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: $celeCanvas,
    });
    updateRendererSizeRSS(celeRenderer);
    celeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
    celeCamera.position.set(15, 9, 2);
    celeScene = new THREE.Scene();
    celeScene.background = new THREE.Color(0xeeeeee);
    const celeSceneLight = new THREE.DirectionalLight(0xfdf1bf, 5);
    celeSceneLight.decay = 0;
    celeSceneLight.position.set(10, 18, 0);
    celeScene.add(celeSceneLight);
    try {
        calGltf = await loadGLTF('../../objects/calendar.glb');
        const newTexture1 = await loadTexture(`../../images/days/d${previousDay}.png`);
        const newTexture2 = await loadTexture(`../../images/months/m${previousMonth + 1}.png`);
        const newTexture3 = await loadTexture(`../../images/days/d${currentDay}.png`);
        const newTexture4 = await loadTexture(`../../images/months/m${currentMonth + 1}.png`);
        updateTextures([newTexture1, newTexture2, newTexture3, newTexture4], calGltf);
        const calModel = calGltf.scene;
        calScene.add(calModel);
        calCamera.lookAt(0, 6, 0);
        mixer = new THREE.AnimationMixer(calModel);
        action = mixer.clipAction(calGltf.animations[0]);
        action.play();
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce);
        calRenderer.render(calScene, calCamera);
        await delay(initialDelayBeforeCalendarPageFlip);
        await animate(mixer, action, calRenderer, calScene, calCamera, action.getClip().duration);
        if (window.innerWidth < breakpointForLarge) {
            $calCanvas.classList.add('transition-transform', 'duration-[2000ms]', 'ease-in-out', '0s', 'scale-[calc(33.33%)]', 'translate-x-[calc(-33.33%)]', 'translate-y-[calc(-33.33%)]');
        }
        else {
            $calCanvas.classList.add('transition-transform', 'duration-[2000ms]', 'ease-in-out', '0s', 'scale-[calc(33.33%)]', `translate-x-[-${window.innerWidth / 2 - window.innerHeight / 9}px]`, `translate-y-[-${(window.innerHeight * 2) / 9}px]`);
        }
        await initialCameraMovement(calCamera, calRenderer, calScene);
        await getHoliday();
        if (!$noCelebration)
            throw new Error('$noCelebration not found!');
        if (holidayFound) {
            $noCelebration.classList.add('hidden');
            getRandomCelebration();
            const celeGltf = await loadGLTF(`../../objects/celebrations/${currentCelebration}.glb`);
            const celeModel = celeGltf.scene;
            celeScene.add(celeModel);
            celeCamera.lookAt(0, 7, 0);
            celeRenderer.render(celeScene, celeCamera);
        }
        else {
            $noCelebration.classList.remove('hidden');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
createCalendarScene();
if (!$sidebar)
    throw new Error('$sidebar not found!');
$sidebar.addEventListener('click', sidebarClickHandler);
function sidebarClickHandler(event) {
    const eventTarget = event.target;
    if (eventTarget === $newButton) {
        if (!$dateInputDialog)
            throw new Error('$dateInputDialog not found!');
        if (!$dateInputDialog.open) {
            $dateInputDialog.show();
        }
        else {
            $dateInputDialog.close();
            if (!$dateInputForm)
                throw new Error('$dateInputForm not found!');
            $dateInputForm.reset();
        }
    }
}
if (!$dateInputForm)
    throw new Error('$dateInputForm not found!');
$dateInputForm.addEventListener('submit', handleDateSearch);
async function handleDateSearch(event) {
    event.preventDefault();
    const elements = $dateInputForm.elements;
    const dateString = elements.date.value;
    if (dateString.length === 10) {
        $dateInputForm.reset();
        $dateInputDialog.close();
        const year = Number(dateString.slice(0, 4));
        const month = Number(dateString.slice(-5, -3)) - 1;
        const day = Number(dateString.slice(-2));
        const newDate = new Date(year, month, day);
        previousDate = currentDate;
        previousDay = currentDay;
        previousMonth = currentMonth;
        currentDate = newDate;
        currentYear = year;
        currentMonth = month;
        currentDay = day;
        const newTexture1 = await loadTexture(`../../images/days/d${previousDay}.png`);
        const newTexture2 = await loadTexture(`../../images/months/m${previousMonth + 1}.png`);
        const newTexture3 = await loadTexture(`../../images/days/d${currentDay}.png`);
        const newTexture4 = await loadTexture(`../../images/months/m${currentMonth + 1}.png`);
        updateTextures([newTexture1, newTexture2, newTexture3, newTexture4], calGltf);
        action.stop();
        action.time = 0;
        action.play();
        await animate(mixer, action, calRenderer, calScene, calCamera, action.getClip().duration);
        await getHoliday();
        if (!$noCelebration)
            throw new Error('$noCelebration not found!');
        if (holidayFound) {
            $noCelebration.classList.add('hidden');
            getRandomCelebration();
            const celeGltf = await loadGLTF(`../../objects/celebrations/${currentCelebration}.glb`);
            const celeModel = celeGltf.scene;
            for (const child of celeScene.children) {
                if (child.type === 'Group') {
                    celeScene.remove(child);
                }
            }
            celeScene.add(celeModel);
            celeRenderer.render(celeScene, celeCamera);
        }
        else {
            $noCelebration.classList.remove('hidden');
        }
    }
}
if (!$saveButton)
    throw new Error('$saveButton not found!');
$saveButton.addEventListener('click', saveDate);
function saveDate() {
    if (!$savePopUp)
        throw new Error('$savePopUp not found!');
    if (!$holidayName)
        throw new Error('$holidayName not found!');
    if (!$holidayDesc)
        throw new Error('$holidayDesc not found!');
    if (!$holidayName.textContent ||
        !$holidayDesc.textContent ||
        !currentCelebration) {
        return;
    }
    if (!$favorite)
        throw new Error('$favorite not found!');
    $savePopUp.classList.add('transition-opacity', 'duration-500', 'ease-in-out', 'opacity-100');
    setTimeout(() => $savePopUp.classList.remove('opacity-100'), 1000);
    const holidayToAdd = {
        name: $holidayName.textContent,
        desc: $holidayDesc.textContent,
        favorite: $favorite.dataset.favorite === 'y',
        imageReference: currentCelebration,
        date: `${currentMonth + 1}/${currentDay + 1}/${currentYear + 1}`,
    };
    if (!data.holidays.some((day) => day.name === holidayToAdd.name && day.date === holidayToAdd.date)) {
        data.holidays.push(holidayToAdd);
        storeData();
    }
    else {
        for (let i = 0; i < data.holidays.length; i++) {
            if (data.holidays[i].name === holidayToAdd.name &&
                data.holidays[i].date === holidayToAdd.date &&
                data.holidays[i].favorite !== holidayToAdd.favorite) {
                data.holidays.splice(i, 1);
                break;
            }
        }
        data.holidays.push(holidayToAdd);
        storeData();
    }
}
if (!$favorite)
    throw new Error('$favorite not found!');
$favorite.addEventListener('click', favoriteDate);
function favoriteDate() {
    if (!$favorite)
        throw new Error('$favorite not found!');
    if ($favorite.dataset.favorite === 'n') {
        $favorite.dataset.favorite = 'y';
        $favorite.classList.remove('fa-regular');
        $favorite.classList.add('fa-solid');
        saveDate();
    }
    else {
        $favorite.dataset.favorite = 'n';
        $favorite.classList.remove('fa-solid');
        $favorite.classList.add('fa-regular');
        saveDate();
    }
}
