"use strict";
/* exported data */
/* eslint-disable @typescript-eslint/no-unused-vars */
const data = retrieveData();
function storeData() {
    const dataJSON = JSON.stringify(data);
    localStorage.setItem('data', dataJSON);
}
function retrieveData() {
    const retrievedString = localStorage.getItem('data');
    if (!retrievedString) {
        return { holidays: [] };
    }
    else {
        return JSON.parse(retrievedString);
    }
}
