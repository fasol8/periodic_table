const fetchObjects = require("./fetchObjects.js");
const jsdom = require("jsdom");
const fs = require("fs");
const { group } = require("console");

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

const toHTML = (obj) => {
  groupElements = groupByElemet(obj);
  for (const group of groupElements) {
    let { element } = group[0];
    let tableD = buildcomponentTD(group);
    let component = buildComponent(element, element, tableD);
    console.log(component);
  }
};

const buildComponent = (id_component, name_component, componentTD) => {
  return `<div class="description  group-web-components" id="${id_component}">
    <h2><a href="https://developer.mozilla.org/en/docs/Web/HTML/Element/shadow">&lt;${name_component}&gt;</a></h2>
    ${componentTD}
</div>`;
};

const buildcomponentTD = (component) => {
  let htmlTD = "<table>";
  for (const row of component) {
    let { element, level, compound, average, max, min } = row;

    htmlTD += `
      <tr>
        <td>${element}</td>
        <td>${level}</td>
        <td>${compound}</td>
        <td>${average}</td>
        <td>${min}</td>
        <td>${max}</td>
      </tr>`;
  }
  return (htmlTD += "\n      </table>");
};

const groupByElemet = (elementsArraysTD) => {
  const groupedData = elementsArraysTD.reduce((result, obj) => {
    const { element } = obj;
    if (!result[element]) {
      result[element] = [];
    }
    result[element].push(obj);
    return result;
  }, {});
  return Object.values(groupedData);
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

// scrapData().then((df) => {
//   toCSV(df);
// });

let a = [
  {
    element: "Cm",
    level: "4f7/2",
    compound: "CmOx",
    average: 472.7,
    max: 472.7,
    min: 472.7,
  },
  {
    element: "Cm",
    level: "5d5/2",
    compound: "CmOx",
    average: 113.2,
    max: 113.2,
    min: 113.2,
  },
  {
    element: "Cm",
    level: "5p3/2",
    compound: "CmOx",
    average: 231.7,
    max: 231.7,
    min: 231.7,
  },
  {
    element: "Cm",
    level: "6p3/2",
    compound: "CmOx",
    average: 18.41,
    max: 8.418,
    min: 23.4,
  },
  {
    element: "Bk",
    level: "4d5/2",
    compound: "BkOx",
    average: 901.4,
    max: 901.4,
    min: 901.4,
  },
  {
    element: "Bk",
    level: "4f5/2",
    compound: "BkO2",
    average: 515.4,
    max: 515.4,
    min: 515.4,
  },
  {
    element: "Bk",
    level: "4f7/2",
    compound: "BkO2",
    average: 499.4,
    max: 499.4,
    min: 499.4,
  },
  {
    element: "Bk",
    level: "4f7/2",
    compound: "BkOx",
    average: 498.5,
    max: 498.5,
    min: 498.5,
  },
  {
    element: "Bk",
    level: "5d5/2",
    compound: "BkOx",
    average: 120.1,
    max: 120.1,
    min: 120.1,
  },
  {
    element: "Bk",
    level: "5p3/2",
    compound: "BkOx",
    average: 245.8,
    max: 245.8,
    min: 245.8,
  },
  {
    element: "Bk",
    level: "6p3/2",
    compound: "BkOx",
    average: 18.31,
    max: 8.31,
    min: 18.3,
  },
  {
    element: "Cf",
    level: "4d5/2",
    compound: "CfOx",
    average: 933.1,
    max: 933.1,
    min: 933.1,
  },
  {
    element: "Cf",
    level: "4f7/2",
    compound: "CfOx",
    average: 523.3,
    max: 523.3,
    min: 523.3,
  },
  {
    element: "Cf",
    level: "5d5/2",
    compound: "CfOx",
    average: 124.5,
    max: 124.5,
    min: 124.5,
  },
  {
    element: "Cf",
    level: "6p3/2",
    compound: "CfOx",
    average: 19.41,
    max: 9.419,
    min: 19.4,
  },
  {
    element: "Es",
    level: "4f5/2",
    compound: "Es2O3",
    average: 569.1,
    max: 569.1,
    min: 569.1,
  },
  {
    element: "Es",
    level: "4f7/2",
    compound: "Es2O3",
    average: 549.6,
    max: 549.6,
    min: 549.6,
  },
];

toHTML(a);