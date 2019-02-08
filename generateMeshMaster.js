const axios = require("axios");
const JSDOM = require("jsdom").JSDOM;
const csv = require("fast-csv");
const fs = require("fs");
const iconv = require('iconv-lite');
const { generateCodes, meshCodeToLngLat } = require("./meshCodeUtils");

const outputCode = (code, p, level) => {
  // "meshcode",
  // "meshcode_1000m",
  // "size",
  // "center_latitude",
  // "center_longitude",
  // "left_bottom_latitude",
  // "left_bottom_longitude",
  // "left_upper_latitude",
  // "left_upper_longitude",
  // "right_bottom_latitude",
  // "right_bottom_longitude",
  // "right_upper_latitude",
  // "right_upper_longitude"
  return `${code},${code.toString().slice(0, 8)},${level},${Math.abs(
    p[0][1] + p[2][1]
  ) / 2},${Math.abs(p[0][0] + p[2][0]) / 2},${p[3][1]},${p[3][0]},${p[2][1]},${
    p[2][0]
  },${p[0][1]},${p[0][0]},${p[1][1]},${p[1][0]}`;
};

const getCSVList = async function() {
  const url = "http://www.stat.go.jp/data/mesh/m_itiran.html";
  const { document } = (await JSDOM.fromURL(url)).window;
  const csvList = Array.from(
    document.querySelectorAll(
      "section > article:nth-child(2) > ul:nth-child(7) > li > a"
    )
  ).map(item => ({ url: item.href, name: item.textContent.split("（")[0] }));
  return csvList;
};

const getCodeListFromCSV = function(url) {
  return new Promise(async (resolve, reject) => {
    const csvData = (await axios(url, {
      responseType: "arraybuffer",
      transformResponse: data => {
        const sjis = Buffer.from(data, "SHIFT_JIS");
        const utf8 = iconv.decode(sjis, "SHIFT_JIS");
        return utf8;
      }
    })).data;
    const codeList = new Set();

    csv
      .fromString(csvData, { headers: true })
      .on("data", data => {
        codeList.add(data["基準メッシュコード"]);
      })
      .on("end", () => {
        resolve(Array.from(codeList.values()));
      })
      .on("error", err => {
        reject(err);
      });
  });
};

const generateOutputFile = function(codeList, name, size) {
  const codeLocationList = [];
  generateCodes(codeList, size).forEach(code => {
    const p = meshCodeToLngLat(code);
    codeLocationList.push(outputCode(code, p, size));
  });
  fs.writeFileSync(
    `${__dirname}/out/${name}_${size}.csv`,
    codeLocationList.join("\n"),
    {}
  );
}

const main = async function() {
  const csvList = await getCSVList();
  if (!fs.existsSync("out")) {
    fs.mkdirSync("out");
  }

  for (let i = 0; i < csvList.length; i++) {
    console.log(`Generating ${csvList[i].name} files...`)
    const codeList = await getCodeListFromCSV(csvList[i].url);
    generateOutputFile(codeList, csvList[i].name, "1000");
    generateOutputFile(codeList, csvList[i].name, "500");
    generateOutputFile(codeList, csvList[i].name, "250");
    generateOutputFile(codeList, csvList[i].name, "125");
  }
};

(async () => {
  await main();
})();
