'use strict'
var fs = require('fs');
const uuid = require('uuid');

var _DEBUG = false;

var textProv = fs.readFileSync("province.geojson");
var textMunic = fs.readFileSync("municipality.geojson");
if (!_DEBUG) {
	var regProps = fs.readFileSync("regionsProp.json");
	var props = JSON.parse(regProps);
}


var prov = JSON.parse(textProv);
var munic = JSON.parse(textMunic);
prov = prov.features;
munic = munic.features;

var provArr = Array();
var municArr = Array();

var poligonFile = "function loadCoordinates(polygonCoordsArray) ";
var allCoordStr= "";

//Проходим по областям и записываем отдельно данные, отдельно координаты
for (var i = 0; i < prov.length; i++) {
	var provProp = {
		name: prov[i].properties["name"],
		uuid: prov[i].properties["name"],//uuid(),
		parent: null
	};

	provArr.push(provProp);

	//Write coordinates
	var coord = "\n\n\/\/" + provProp.name + "\npolygonCoordsArray['"+provProp.uuid+"'] = \n";
	var temp = "";
	var coordArr = prov[i].geometry.coordinates[0][0];

	for (var j = 0; j < coordArr.length; j += 5) {
		if(temp !== "") temp += " ";
		temp += (Math.round(coordArr[j][0] * 10000) /10000) + "," + (Math.round(coordArr[j][1] * 10000) /10000);
	}

	coord += "'" + temp + "';";
	allCoordStr += coord;
}

//Проходим по районам и записываем отдельно данные, отдельно координаты
for (var i = 0; i < munic.length; i++) {

	var municProp = {
		name: munic[i].properties["name"],
		ref: munic[i].parent,
		uuid: munic[i].properties["name"]//uuid()
	};

	municArr.push(municProp);

	//Write coordinates
	var coord = "\n\n\/\/" + municProp.name + "\npolygonCoordsArray['"+municProp.uuid+"'] = \n";
	var temp = "";
	var coordArr = munic[i].geometry.coordinates[0][0];

	for (var j = 0; j < coordArr.length; j += 5) {
		if(temp !== "") temp += " ";
		temp += (Math.round(coordArr[j][0] * 10000) /10000) + "," + (Math.round(coordArr[j][1] * 10000) /10000);
	}

	coord += "'" + temp + "';";
	allCoordStr += coord;
}

//Находим родительские области для каждого района
for (var i = 0; i < municArr.length; i++) {
	var findRef = municArr[i].ref;
	municArr[i].parent = returnUUIDByRef(findRef, provArr);
}

//Обьединяем регионы в один массив
var regionsArr = provArr.concat(municArr);

if(_DEBUG) {
	createPropFile(regionsArr); //don't run please
} else {
	//Загружаем дополнительные данные для каждого региона из отделного файла
	for (var i = 0; i < regionsArr.length; i++) {
		regionsArr[i].area = props[regionsArr[i].name].area;
		regionsArr[i].population = props[regionsArr[i].name].population;
	}
}

	poligonFile += "{" + allCoordStr + "\n}";
	var regions = JSON.stringify(regionsArr);

	fs.writeFileSync('regions.json', regions);
	fs.writeFileSync('result\\rsapolygons.js', poligonFile);



//Функции----------------------------------------------------
function returnUUIDByRef(ref, arrOfReg) {
	for (var i = 0; i < arrOfReg.length; i++) {
		if (arrOfReg[i].name == ref) return arrOfReg[i].uuid;
	}

	return null;
}

function createPropFile(regionsArr) {
	var tempArr = {};
	for (var i = 0; i < regionsArr.length; i++) {
		tempArr[regionsArr[i].name] = {area:null, population:null};
	}

	var temp = JSON.stringify(tempArr);

	fs.writeFileSync('regionsProp.json', temp);
}

