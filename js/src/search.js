"use strict";

var L = require('leaflet'),
    esri = require('esriLeaflet');

function cheapPad5(n) {
    return ("0000"+n).slice(-5);
}

module.exports = function(term) {

    var ulrs = 'http://services.phila.gov/ULRS311/Data/Location/';

    L.esri.get(ulrs + term, {}, function(r) {
        console.log(r);
        var prop = r.Locations[0].Address,
            propCode = "" + prop.StreetCode + cheapPad5(prop.StreetNumber) + (prop.Unit || '');

        L.esri.get('http://api.phila.gov/opa/v1.0/property/' + propCode, {format:'json'}, function(property) {
            console.log(property);
        });
    });

};
