"use strict"

var L = require('leaflet'),
    esri = require('esriLeaflet');

var ParcelMap = function() {
    this.map = this._loadMap();
};

ParcelMap.prototype.identify = function(latLng, callback) {
    var pwdParcelUrl = "http://gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer/identify",
        parcelLayerId = 0,
        query = {
            sr: '4326',
            mapExtent: JSON.stringify(L.esri.Util.boundsToExtent(this.map.getBounds())),
            layers: parcelLayerId,
            tolerance: 5,
            geometryType: 'esriGeometryPoint',
            imageDisplay: this.map._size.x + ',' + this.map._size.y + ',96',
            geometry: JSON.stringify({
                x: latLng.lng,
                y: latLng.lat,
                spatialReference: {
                    wkid: 4326
                }
            })
        };

    L.esri.get(pwdParcelUrl, query, callback);
};

ParcelMap.prototype._loadMap = function() {
    var self = this,
        map = L.map('map').setView([39.9523768,-75.1634726], 18),

        basemap = "http://gis.phila.gov/arcgis/rest/services/BaseMaps/Hybrid_WM/MapServer",
        baseLayer = L.esri.tiledMapLayer(basemap, 
            { 
                continuousWorld: true,
                maxZoom: 19
            }).addTo(map);

    map.on('click', function(e) {
        self.identify(e.latlng, self._showPopup);
    });
    return map;
};

ParcelMap.prototype._showPopup = function(parcel) {
    console.log(parcel);
};

module.exports = ParcelMap;
