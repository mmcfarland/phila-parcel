"use strict"

var L = require('leaflet'),
    esri = require('esriLeaflet');

function loadMap() {
    var map = L.map('map').setView([39.9523768,-75.1634726], 18),
        basemap = "http://gis.phila.gov/arcgis/rest/services/BaseMaps/Hybrid_WM/MapServer",
        baseLayer = L.esri.tiledMapLayer(basemap, 
            { 
                continuousWorld: true,
                maxZoom: 19
            }).addTo(map);
    return map;
}

module.exports = function ParcelMap() {
    this.map = loadMap();
};
