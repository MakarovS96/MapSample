var fs = require('fs');
var js2xml = require("js2xmlparser");

var regText = fs.readFileSync("regions.json");
var regions = JSON.parse(regText);

var RegionXData = [];
var ParameterValueXData = [];

for (var i = 0; i < regions.length; i++) {
	var Region = {
		"Name": regions[i].name,
		"Guid": regions[i].uuid,
		"DataUrl": regions[i].name
	};
	if(regions[i].parent) Region.ParentRegion = regions[i].parent;
	RegionXData.push(Region);

	var ParameterValue = {
		"Region": regions[i].uuid,
		"Parameter": 1,
		"Value": regions[i].population
	};
	ParameterValueXData.push(ParameterValue);

	ParameterValue = {
		"Region": regions[i].uuid,
		"Parameter": 2,
		"Value": regions[i].area
	};
	ParameterValueXData.push(ParameterValue);
}

var ParameterXData = [
	{Name: "Population"},
	{Name: "Area", UnitName: "sq km"}
];

RegionXData = {"Region": RegionXData};
ParameterValueXData = {"ParameterValue": ParameterValueXData};
ParameterXData = {"Parameter": ParameterXData};

var textRegion = js2xml.parse("RegionXData",RegionXData);
var textParameterValue = js2xml.parse("ParameterValueXData",ParameterValueXData);
var textParameter = js2xml.parse("ParameterXData",ParameterXData);

fs.writeFileSync('result\\RegionXData.xml', textRegion);
fs.writeFileSync('result\\ParameterValueXData.xml', textParameterValue);
fs.writeFileSync('result\\ParameterXData.xml', textParameter);