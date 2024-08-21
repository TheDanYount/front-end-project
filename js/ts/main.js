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
const $sidebar = document.querySelector('#sidebar');
const $holidayTitle = document.querySelector('#holiday-title');
const $holidayDesc = document.querySelector('#holiday-desc');
const $textSection = document.querySelector('#text-section');
export {};
