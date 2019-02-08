// Based on http://www.stat.go.jp/data/mesh/pdf/gaiyo1.pdf
const meshCodePattern = /^[0-9][0-9][0-9][0-9][0-7][0-7][0-9][0-9][1-4]?[1-4]?[1-4]?$/;
function meshCodeToLngLat(meshCode) {
  const toLngLat = (latDeg, latMin, latSec, lngDeg, lngMin, lngSec) => {
    const lng = (lngDeg * 3600 + lngMin * 60 + lngSec) / 3600;
    const lat = (latDeg * 3600 + latMin * 60 + latSec) / 3600;

    return [lng, lat];
  };

  const lnglat = function(_mesh) {
    const mesh = _mesh.toString();
    if (mesh.match(meshCodePattern) === null) {
      return [];
    }

    const meshLevel = mesh.length;
    const mesh1 = mesh.slice(0, 4);
    const mesh2 = mesh.slice(4, 6);
    const mesh3 = mesh.slice(6, 8);

    const lngDeg = parseInt(mesh1.slice(0, 2), 10) / 1.5;
    const lngMin = parseInt(mesh2.slice(0, 1), 10) * 5;
    let lngSec = parseInt(mesh3.slice(0, 1), 10) * 30;
    const latDeg = parseInt(mesh1.slice(2, 4), 10) + 100;
    const latMin = parseInt(mesh2.slice(1, 2), 10) * 7.5;
    let latSec = parseInt(mesh3.slice(1, 2), 10) * 45;

    if (meshLevel >= 9) {
      const mesh4 = parseInt(mesh[8], 10);
      // debugger
      lngSec = lngSec + (mesh4 >= 3 ? 1 : 0) * 15;
      latSec = latSec + (mesh4 % 2 === 0 ? 1 : 0) * 22.5;
    }

    if (meshLevel >= 10) {
      const mesh5 = parseInt(mesh[9], 10);
      // debugger
      lngSec = lngSec + (mesh5 >= 3 ? 1 : 0) * 7.5;
      latSec = latSec + (mesh5 % 2 === 0 ? 1 : 0) * 11.25;
    }

    if (meshLevel >= 11) {
      const mesh6 = parseInt(mesh[10], 10);
      // debugger
      lngSec = lngSec + (mesh6 >= 3 ? 1 : 0) * 3.75;
      latSec = latSec + (mesh6 % 2 === 0 ? 1 : 0) * 5.625;
    }

    const horizontalLength = {
      8: 30,
      9: 15,
      10: 7.5,
      11: 3.75
    };
    const verticalLength = {
      8: 45,
      9: 22.5,
      10: 11.25,
      11: 5.625
    };

    const BL = toLngLat(lngDeg, lngMin, lngSec, latDeg, latMin, latSec);
    const BR = toLngLat(
      lngDeg,
      lngMin,
      lngSec + horizontalLength[meshLevel],
      latDeg,
      latMin,
      latSec
    );
    const TR = toLngLat(
      lngDeg,
      lngMin,
      lngSec + horizontalLength[meshLevel],
      latDeg,
      latMin,
      latSec + verticalLength[meshLevel]
    );
    const TL = toLngLat(
      lngDeg,
      lngMin,
      lngSec,
      latDeg,
      latMin,
      latSec + verticalLength[meshLevel]
    );

    return [TL, TR, BR, BL];
  };

  return lnglat(meshCode);
}


const generateCodes = (usableCodes, level) => {
  let codes = [...usableCodes];

  if (["500", "250", "125"].includes(level)) {
    codes = codes.reduce((codes, code) => {
      codes.push(
        code + "1",
        code + "2",
        code + "3",
        code + "4"
      );
      return codes;
    }, []);
  }
  if (["250", "125"].includes(level)) {
    codes = codes.reduce((codes, code) => {
      codes.push(
        code + "1",
        code + "2",
        code + "3",
        code + "4"
      );
      return codes;
    }, []);
  }
  if (["125"].includes(level)) {
    codes = codes.reduce((codes, code) => {
      codes.push(
        code + "1",
        code + "2",
        code + "3",
        code + "4"
      );
      return codes;
    }, []);
  }

  return codes;
};

module.exports = {
  meshCodeToLngLat,
  generateCodes
}