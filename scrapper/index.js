const fetchObjects = require("./fetchObjects.js");
const jsdom = require("jsdom");
const fs = require("fs");

const cleanData = (response) => {
  let tdElements = [];
  for (let element in response) tdElements.push(response[element].textContent);
  return tdElements;
};

const replaceComma = (object) => {
  const replacedObject = {};
  for (let key in object) {
    replacedObject[key] = {};
    for (let prop in object[key]) {
      if (typeof object[key][prop] === "string") {
        replacedObject[key][prop] = object[key][prop].replace(/,/g, "_");
      } else {
        replacedObject[key][prop] = object[key][prop];
      }
    }
  }
  return replacedObject;
};

const formatArray = (originalArray) => {
  const chunkSize = 5;
  const chunks = [];
  let rows = [];

  while (originalArray.length > 0) {
    const chunk = originalArray.splice(0, chunkSize);
    chunks.push(chunk);
  }

  for (let i in chunks) {
    rows.push({
      element: chunks[i][0],
      level: chunks[i][1],
      compound: chunks[i][2],
      energy: parseFloat(chunks[i][3]),
    });
  }
  return rows;
};

const getAverageByFormula = (array) => {
  const averageMap = array.reduce((acc, obj) => {
    const { compound, level, element, energy } = obj;
    const key = `${compound}Ç${level}`;
    if (acc.has(key)) {
      const entry = acc.get(key);
      entry.max = energy > entry.max ? energy : entry.max;
      entry.min = energy < entry.min ? energy : entry.min;
      entry.sum += energy;
      entry.element = element;
      entry.count++;
    } else {
      acc.set(key, {
        sum: energy,
        count: 1,
        max: energy,
        min: energy,
        element: element,
      });
    }
    return acc;
  }, new Map());

  const averages = Array.from(averageMap.entries()).map(
    ([key, { sum, count, max, min, element }]) => ({
      element,
      level: key.split("Ç")[1],
      compound: key.split("Ç")[0],
      average: sum / count,
      max,
      min,
    })
  );
  return averages;
};

const toCSV = (obj) => {
  const filename = "elemet.csv";
  const arr = Object.values(obj).map((innerObj) => Object.values(innerObj));
  const csvContent = arr.map((row) => row.join(",")).join("\n");
  fs.writeFileSync(filename, csvContent, { encoding: "utf8" });
  console.log("create file csv");
};

const fetchInfo = (url, params) => {
  return new Promise((resolve, reject) => {
    fetch(url, params)
      .then((response) =>
        new Response(response.body, {
          headers: { "Content-Type": "text/html" },
        }).text()
      )
      .then((body) => {
        const dom = new jsdom.JSDOM(body);
        let rows = dom.window.document.getElementsByTagName("td");
        resolve(rows);
      });
  });
};

const scrapData = () => {
  let promises = [];
  return new Promise((resolve, reject) => {
    let csvRows = [];
    fetchObjects.forEach((element) => {
      promises.push(fetchInfo(element.url, element.requestParams));
    });
    Promise.all(promises).then((results) => {
      results.forEach((element) => {
        let tdElements = cleanData(element);
        let rows = formatArray(tdElements);
        let eleAverage = getAverageByFormula(rows);
        let eleFormat = replaceComma(eleAverage);
        csvRows.push(...Object.values(eleFormat).slice(0, -1));
      });
      resolve(csvRows);
    });
  });
};

scrapData().then((df) => {
  toCSV(df);
});
