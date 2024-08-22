/* exported data */
/* eslint-disable @typescript-eslint/no-unused-vars */

interface SavedHoliday {
  name: string;
  desc: string;
  favorite: boolean;
  imageReference: string;
}

interface Data {
  holidays: SavedHoliday[];
}

const data: Data = {
  holidays: [],
};

function storeData(): void {
  const dataJSON = JSON.stringify(data);
  localStorage.setItem('data', dataJSON);
}

function retrieveData(): Data {
  const retrievedString = localStorage.getItem('data');
  if (!retrievedString) {
    return { holidays: [] };
  } else {
    return JSON.parse(retrievedString);
  }
}
