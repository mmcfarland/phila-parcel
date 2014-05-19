"use strict"

var L = require('leaflet'),
    esri = require('esriLeaflet'),
    Bacon = require('baconjs'),
    $ = require('jquery');

var ParcelMap = function(options) {
    setupMap(options);
};

function identify(idInfo) {
    var pwdParcelUrl = "http://gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer/identify",
        parcelLayerId = 0,
        query = {
            f: 'json',
            sr: '4326',
            mapExtent: JSON.stringify(idInfo.map.extent),
            layers: parcelLayerId,
            tolerance: 5,
            geometryType: 'esriGeometryPoint',
            imageDisplay: idInfo.map.size.x + ',' + idInfo.map.size.y + ',96',
            geometry: JSON.stringify({
                x: idInfo.latLng.lng,
                y: idInfo.latLng.lat,
                spatialReference: {
                    wkid: 4326
                }
            })
        };
    return Bacon.fromPromise($.getJSON(pwdParcelUrl, query));
};

function setupMap(options) {
    var map = L.map('map').setView([39.9523768,-75.1634726], 18),
        basemap = makeBasemap(),
        mapClickStream = new Bacon.Bus(),
        mapChangeStream = new Bacon.Bus();

    basemap.addTo(map);

    // Track map state needed for doing an identify
    map.on('moveend zoomend', mapChangeStream.push);
    var mapProp = mapChangeStream.map('.target')
        .map(mapToIdInfo)
        .toProperty(mapToIdInfo(map));

    // Identify
    map.on('click', mapClickStream.push);
    var clickProp = mapClickStream.map('.latlng'),
        popup = showPopup(map, options.popupTmpl);
    
    var id = Bacon.combineTemplate({
            latLng: clickProp,
            map: mapProp
    });
    
    var i = id.sampledBy(mapClickStream).log().flatMapLatest(identify)
    
    Bacon.combineAsArray(id,i).log("combined").skipDuplicates().log().onValue(popup);

    return map;
};

function mapToIdInfo(map) {
    return {
        size: map._size,
        extent: L.esri.Util.boundsToExtent(map.getBounds())
    };
};

function makeBasemap() {
    var basemap = "http://gis.phila.gov/arcgis/rest/services/BaseMaps/Hybrid_WM/MapServer";
    return L.esri.tiledMapLayer(basemap, 
        { 
            continuousWorld: true,
            maxZoom: 19
        });
}

function showPopup(map, tmpl) {
    return function(identifyResult) {
        var latLng = identifyResult[0].latLng,
            parcel = identifyResult[1].results[0].attributes;

        map.openPopup(tmpl(parcel), latLng);
    }; 
};

module.exports = ParcelMap;
