const fetchObjects = require('./fetchObjects.js')
const jsdom = require("jsdom");

const fetchInfo = (url, params) =>
    fetch(url, params)
    .then((response) => new Response(response.body, { headers: { "Content-Type": "text/html" } }).text())
    .then((body) => {
        const dom = new jsdom.JSDOM(body);
        let rows = dom.window.document.getElementsByTagName("td");
        // console.log(rows.length);
        return rows;
    });


const scrapData = () => {
    fetchObjects.forEach(element => {
        fetchInfo(element.url, element.requestParams)
            .then((response) => {
                console.log(response.length);
                // console.log(response[4].textContent.trim());
                console.log(response[2].textContent.trim());
                console.log(response[3].textContent.trim());
            });
    })
}



scrapData();