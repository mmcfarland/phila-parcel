"use strict"

var L = require('leaflet'),
    esri = require('esriLeaflet'),
    Bacon = require('baconjs'),
    $ = require('jquery'),
    bootstrap = require('bootstrap');

function setupMap(options) {
    var map = L.map('map')
            .setView([39.9523768,-75.1634726], 18)
            .addLayer(makeBasemap()),
        popup = showPopup(map, options.popupTmpl),
        fullInfo = getFullInfo(options.fullTmpl, options.fullTarget),
        mapClickStream = new Bacon.Bus(),
        mapChangeStream = new Bacon.Bus(),
        mapProp = mapChangeStream.map('.target')
            .map(mapToIdInfo)
            .toProperty(mapToIdInfo(map)),
        clickProp = mapClickStream.map('.latlng')
            .toProperty();

    // Track map state needed for doing an identify
    map.on('moveend zoomend', mapChangeStream.push);
    map.on('click', mapClickStream.push);

    var click = Bacon.combineTemplate({ latLng: clickProp, map: mapProp })
            .sampledBy(mapClickStream)
            .flatMapLatest(identify)
            .flatMapLatest(toOpa),

        search = options.searchStream
            .flatMap(searchToIdResult),

        property = click.merge(search).doAction(popup).toProperty(),
        fullDetails = $('#map').asEventStream('click', '#show-full');

    property.sampledBy(fullDetails)
        .map('.opa.data.property').log()
        .onValue(fullInfo);
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

    return Bacon.combineTemplate({
            latLng: Bacon.constant(idInfo.latLng), 
            pwdParcel: Bacon.fromPromise($.getJSON(pwdParcelUrl, query))
    });
};

function getFullInfo(tmpl, $target) {
    return function(opa) {
        var text = tmpl(opa);
        $target.find('.modal-content').html(text).end().modal();
    };
}

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

function toOpa(idResult) {
    var opa = 'http://api.phila.gov/opa/v1.0/account/',
        parcel = idResult.pwdParcel.results[0].attributes,
        query = {format: 'json'};

    return Bacon.combineTemplate({
        latLng: idResult.latLng,
        opa: Bacon.fromPromise($.getJSON(opa + parcel.BRT_ID, query))
    });
}

function searchToIdResult(opaAccount) {
    var geom = opaAccount.data.property.geometry;
    return Bacon.combineTemplate({
        latLng: L.latLng([geom.y, geom.x]),
        opa: opaAccount
    });
}

function showPopup(map, tmpl) {
    return function(opaIdResult) {
        var parcel = opaIdResult.opa.data.property;    

        if (!map.getBounds().contains(L.latLng(opaIdResult.latLng))) {
            map.panTo(opaIdResult.latLng);
        }

        map.openPopup(tmpl(parcel), opaIdResult.latLng);
    }; 
};

module.exports = setupMap;
