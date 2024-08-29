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
const celebrations = ['family-celebration'];
let currentCelebration;
let holidayToDelete;
const $calCanvas = document.querySelector('#calendar-canvas');
const $celeCanvas = document.querySelector('#celebration-canvas');
const $holidayName = document.querySelector('#holiday-name');
const $holidayDesc = document.querySelector('#holiday-desc');
const $favorite = document.querySelector('#favorite');
const $noCelebration = document.querySelector('#no-celebration');
const $headerButtons = document.querySelector('#header-buttons');
const $new = document.querySelector('#new');
const $save = document.querySelector('#save');
const $open = document.querySelector('#open');
const $dateInputDialog = document.querySelector('#date-input-dialog');
const $dateInputForm = document.querySelector('#date-input-form');
const $savePopUp = document.querySelector('#save-pop-up');
const $openDialog = document.querySelector('#open-dialog');
const $closeOpenDialog = document.querySelector('#close-open-dialog');
const $openDialogContent = document.querySelector('#open-dialog-content');
const $savedHolidayPlaceholder = document.querySelector('#saved-holiday-placeholder');
const $deleteConfirmationDialog = document.querySelector('#delete-confirmation-dialog');
const $deleteConfirm = document.querySelector('#delete-confirm');
const $deleteCancel = document.querySelector('#delete-cancel');
let mixer;
let action;
let calRenderer;
let calScene;
let calCamera;
let celeRenderer;
let celeScene;
let celeCamera;
let calGltf;
let celeModel;
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
    if (!$noCelebration)
        throw new Error('$noCelebration not found!');
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
          throw new Error(`HTTP error! Status: ${holidaysPromiseResponse.status}`);
        }
        const holidaysObject =
          (await holidaysPromiseResponse.json()) as HolidaysObject;
        const holidaysArray = holidaysObject.response.holidays;
        if (holidaysArray.length > 0) {
          const chosenHoliday =
            holidaysArray[Math.floor(Math.random() * holidaysArray.length)];
          if (chosenHoliday.name && chosenHoliday.description) {
            $noCelebration.classList.add('hidden');
            getRandomCelebration();
            const celeGltf = await loadGLTF(
              `../../objects/celebrations/${currentCelebration}.glb`,
            );
            for (const child of celeScene.children) {
              if (child.type === 'Group') {
                celeScene.remove(child);
              }
            }
            celeModel = celeGltf.scene;
            celeScene.add(celeModel);
            celeRenderer.render(celeScene, celeCamera);
          }
          $holidayName.textContent = chosenHoliday.name;
          $favorite.classList.remove('hidden');
          $holidayDesc.textContent = chosenHoliday.description;
          const stringMonth =
            currentMonth + 1 >= 10
              ? String(currentMonth + 1)
              : '0' + (currentMonth + 1);
          const stringDay =
            currentDay >= 10 ? String(currentDay) : '0' + currentDay;
          const stringDate = `${stringMonth}/${stringDay}/${currentYear}`;
          const match = data.holidays.find((holiday) => {
            if (
              chosenHoliday.name === holiday.name &&
              stringDate === holiday.date
            ) {
              return true;
            } else {
              return false;
            }
          });
          if (match) {
            if (match.favorite) {
              $favorite.classList.remove('fa-regular');
              $favorite.classList.add('fa-solid');
            } else {
              $favorite.classList.remove('fa-solid');
              $favorite.classList.add('fa-regular');
            }
          }
        } else {
          for (const child of celeScene.children) {
            if (child.type === 'Group') {
              celeScene.remove(child);
            }
          }
          $noCelebration.classList.remove('hidden');
          celeRenderer.render(celeScene, celeCamera);
          $holidayName.textContent = '';
          $favorite.classList.add('hidden');
          $holidayDesc.textContent = '';
          currentCelebration = '';
        }
        */
        $holidayName.textContent = `${currentDay}th of ${currentMonth + 1}`;
        $favorite.classList.remove('hidden');
        $holidayDesc.textContent = `A holiday on the ${currentDay}th of ${currentMonth + 1}`;
        currentCelebration = 'family-celebration';
        const celeGltf = await loadGLTF(`../../objects/celebrations/${currentCelebration}.glb`);
        for (const child of celeScene.children) {
            if (child.type === 'Group') {
                celeScene.remove(child);
            }
        }
        celeModel = celeGltf.scene;
        celeScene.add(celeModel);
        celeRenderer.render(celeScene, celeCamera);
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
    if (!(window.innerWidth < breakpointForLarge)) {
        $calCanvas.classList.add(`left-[${window.innerWidth / 2 - window.innerHeight / 3}px]`);
    }
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
        celeCamera.lookAt(0, 7, 0);
        celeRenderer.render(celeScene, celeCamera);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
createCalendarScene();
if (!$headerButtons)
    throw new Error('$headerButtons not found!');
$headerButtons.addEventListener('click', headerButtonsClickHandler);
function headerButtonsClickHandler(event) {
    const eventTarget = event.target;
    console.log(eventTarget);
    if (eventTarget === $new) {
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
    else if (eventTarget === $save) {
        console.log('hi');
        saveDate();
    }
    else if (eventTarget === $open) {
        openHolidays();
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
    }
}
function sortData() {
    data.holidays.sort((a, b) => {
        if (a.favorite === true && b.favorite === false) {
            return -1;
        }
        else if (a.favorite === false && b.favorite === true) {
            return 1;
        }
        else {
            if (!a.date || !b.date) {
                return 0;
            }
            return a.date > b.date ? 1 : -1;
        }
    });
}
function removeHolidayFromDomAtPosition(pos) {
    if (!$openDialogContent)
        throw new Error('$openDialogContent not found!');
    $openDialogContent.removeChild($openDialogContent.children[pos]);
}
function createDomRepresentationOfSavedHolidayAndAddItAtPosition(pos, holidayToAdd) {
    const container = document.createElement('div');
    container.className = `relative flex flex-col flex-wrap gap-2 w-64
    lg:w-[24rem] items-center bg-white rounded-[3rem]`;
    container.dataset.favorite = holidayToAdd.favorite ? 'y' : 'n';
    container.dataset.date = holidayToAdd.date;
    container.dataset.imgRef = holidayToAdd.imageReference;
    container.dataset.name = holidayToAdd.name;
    container.dataset.description = holidayToAdd.desc;
    const img = document.createElement('img');
    img.src = `../../images/celebrations/${holidayToAdd.imageReference}.png`;
    img.className = `w-44 h-44 lg:w-60 lg:h-60`;
    container.appendChild(img);
    const trash = document.createElement('i');
    trash.className = `absolute bottom-0 right-0 fa-solid fa-trash text-4xl`;
    container.appendChild(trash);
    const star = document.createElement('i');
    holidayToAdd.favorite
        ? (star.className = `absolute top-1 left-[3rem] lg:left-[4.75rem] fa-solid fa-star text-2xl text-amber-400`)
        : (star.className = `absolute top-1 left-[3rem] lg:left-[4.75rem] fa-regular fa-star text-2xl text-amber-400`);
    container.appendChild(star);
    const h2 = document.createElement('h2');
    h2.className = `text-2xl lg:text-5xl font-semibold font-[Calligraffitti]
    w-full text-center`;
    h2.textContent = holidayToAdd.name;
    container.appendChild(h2);
    const p = document.createElement('p');
    p.className = `text-base lg:text-3xl`;
    p.textContent = holidayToAdd.date;
    container.appendChild(p);
    $openDialogContent.insertBefore(container, $openDialogContent.children[pos]);
}
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
    const stringMonth = currentMonth + 1 >= 10
        ? String(currentMonth + 1)
        : '0' + (currentMonth + 1);
    const stringDay = currentDay >= 10 ? String(currentDay) : '0' + currentDay;
    const holidayToAdd = {
        name: $holidayName.textContent,
        desc: $holidayDesc.textContent,
        favorite: $favorite.dataset.favorite === 'y',
        imageReference: currentCelebration,
        date: `${stringMonth}/${stringDay}/${currentYear}`,
    };
    if (!data.holidays.some((day) => day.name === holidayToAdd.name && day.date === holidayToAdd.date)) {
        data.holidays.push(holidayToAdd);
        sortData();
        const pos = data.holidays.findIndex((element) => element === holidayToAdd);
        createDomRepresentationOfSavedHolidayAndAddItAtPosition(pos + 1, holidayToAdd);
        storeData();
        toggleSavedHolidayPlaceholder();
    }
    else {
        for (let i = 0; i < data.holidays.length; i++) {
            if (data.holidays[i].name === holidayToAdd.name &&
                data.holidays[i].date === holidayToAdd.date &&
                data.holidays[i].favorite !== holidayToAdd.favorite) {
                removeHolidayFromDomAtPosition(i + 1);
                data.holidays.splice(i, 1);
                data.holidays.push(holidayToAdd);
                sortData();
                const pos = data.holidays.findIndex((element) => element === holidayToAdd);
                createDomRepresentationOfSavedHolidayAndAddItAtPosition(pos + 1, holidayToAdd);
                storeData();
                toggleSavedHolidayPlaceholder();
                break;
            }
        }
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
function toggleSavedHolidayPlaceholder() {
    if (!$savedHolidayPlaceholder)
        throw new Error('$savedHolidayPlaceholder not found!');
    if (data.holidays.length > 0) {
        $savedHolidayPlaceholder.classList.add('hidden');
    }
    else {
        $savedHolidayPlaceholder.classList.remove('hidden');
    }
}
function fillOpenDialog(savedHolidaysArray) {
    if (!$openDialogContent)
        throw new Error('$openDialogContent not found!');
    toggleSavedHolidayPlaceholder();
    for (let i = 0; i < savedHolidaysArray.length; i++) {
        const container = document.createElement('div');
        container.className = `relative flex flex-col flex-wrap gap-2 w-64
    lg:w-[24rem] items-center bg-white rounded-[3rem]`;
        container.dataset.favorite = savedHolidaysArray[i].favorite ? 'y' : 'n';
        container.dataset.date = savedHolidaysArray[i].date;
        container.dataset.imgRef = savedHolidaysArray[i].imageReference;
        container.dataset.name = savedHolidaysArray[i].name;
        container.dataset.description = savedHolidaysArray[i].desc;
        const img = document.createElement('img');
        img.src = `../../images/celebrations/${savedHolidaysArray[i].imageReference}.png`;
        img.className = `w-44 h-44 lg:w-60 lg:h-60`;
        container.appendChild(img);
        const trash = document.createElement('i');
        trash.className = `absolute bottom-0 right-0 fa-solid fa-trash text-4xl`;
        container.appendChild(trash);
        const star = document.createElement('i');
        savedHolidaysArray[i].favorite
            ? (star.className = `absolute top-1 left-[3rem] lg:left-[4.75rem] fa-solid fa-star text-2xl text-amber-400`)
            : (star.className = `absolute top-1 left-[3rem] lg:left-[4.75rem] fa-regular fa-star text-2xl text-amber-400`);
        container.appendChild(star);
        const h2 = document.createElement('h2');
        h2.className = `text-2xl lg:text-5xl font-semibold font-[Calligraffitti]
    w-full text-center`;
        h2.textContent = savedHolidaysArray[i].name;
        container.appendChild(h2);
        const p = document.createElement('p');
        p.className = `text-base lg:text-3xl`;
        p.textContent = savedHolidaysArray[i].date;
        container.appendChild(p);
        $openDialogContent.appendChild(container);
    }
}
function openHolidays() {
    if (!$openDialog)
        throw new Error('$openDialog not found!');
    $openDialog.showModal();
}
if (!$closeOpenDialog)
    throw new Error('$closeOpenDialog not found!');
$closeOpenDialog.addEventListener('click', closeHolidays);
function closeHolidays() {
    if (!$openDialog)
        throw new Error('$openDialog not found!');
    $openDialog.close();
}
const savedHolidays = retrieveData();
fillOpenDialog(savedHolidays.holidays);
async function handleOpenDialogContentClick(event) {
    const eventTarget = event.target;
    if (!eventTarget)
        throw new Error('eventTarget not found!');
    if (eventTarget === $openDialogContent)
        return;
    if (!eventTarget.classList.contains('fa-trash')) {
        const holidayToDisplay = eventTarget.closest('div');
        if (!holidayToDisplay)
            throw new Error('holidayToDisplay not found');
        if (!$holidayName)
            throw new Error('holidayToDisplay not found');
        if (!$holidayDesc)
            throw new Error('holidayToDisplay not found');
        if (!holidayToDisplay.dataset.date)
            throw new Error('holidayToDisplay.dataset.date not found');
        $openDialog.close();
        const year = Number(holidayToDisplay.dataset.date.slice(-4));
        const month = Number(holidayToDisplay.dataset.date.slice(0, 2)) - 1;
        const day = Number(holidayToDisplay.dataset.date.slice(3, 5));
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
        $holidayName.textContent = String(holidayToDisplay.dataset.name);
        $favorite.classList.remove('hidden');
        if (holidayToDisplay.dataset.favorite === 'y') {
            $favorite.classList.remove('fa-regular');
            $favorite.classList.add('fa-solid');
        }
        else {
            $favorite.classList.remove('fa-solid');
            $favorite.classList.add('fa-regular');
        }
        $holidayDesc.textContent = String(holidayToDisplay.dataset.description);
        if (!$noCelebration)
            throw new Error('$noCelebration not found!');
        $noCelebration.classList.add('hidden');
        const celeGltf = await loadGLTF(`../../objects/celebrations/${holidayToDisplay.dataset.imgRef}.glb`);
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
        const container = eventTarget.closest('div');
        if (!container)
            throw new Error('container not found!');
        holidayToDelete = container;
        if (!$deleteConfirmationDialog)
            throw new Error('$deleteConfirmationDialog not found!');
        $deleteConfirmationDialog.showModal();
    }
}
if (!$openDialogContent)
    throw new Error('$openDialogContent not found!');
$openDialogContent.addEventListener('click', handleOpenDialogContentClick);
function deleteHoliday() {
    $deleteConfirmationDialog.close();
    if (!$holidayName)
        throw new Error('$holidayName not found!');
    if (holidayToDelete) {
        const stringMonth = currentMonth + 1 >= 10
            ? String(currentMonth + 1)
            : '0' + (currentMonth + 1);
        const stringDay = currentDay >= 10 ? String(currentDay) : '0' + currentDay;
        const stringDate = `${stringMonth}/${stringDay}/${currentYear}`;
        if (holidayToDelete.dataset.name === $holidayName.textContent &&
            holidayToDelete.dataset.date === stringDate) {
            $favorite.classList.remove('fa-solid');
            $favorite.classList.add('fa-regular');
        }
        const pos = data.holidays.findIndex((element) => {
            if (holidayToDelete?.dataset.name === element.name &&
                holidayToDelete?.dataset.date === element.date) {
                return true;
            }
            else {
                return false;
            }
        });
        $openDialogContent.removeChild(holidayToDelete);
        data.holidays.splice(pos, 1);
        storeData();
        toggleSavedHolidayPlaceholder();
        holidayToDelete = null;
    }
}
if (!$deleteConfirm)
    throw new Error('$deleteConfirm not found!');
$deleteConfirm.addEventListener('click', deleteHoliday);
function deleteCancel() {
    $deleteConfirmationDialog.close();
    holidayToDelete = null;
}
if (!$deleteCancel)
    throw new Error('$deleteCancel not found!');
$deleteCancel.addEventListener('click', deleteCancel);
