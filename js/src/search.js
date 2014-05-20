"use strict";

var $ = require('jquery'),
    Bacon = require('baconjs'),
    _ = require('lodash');

$.extend($.fn, Bacon.$);

function isEnterKey(e) {
    return e.keyCode === 13;
}

function getUlrs(address) {
    var ulrs = 'http://services.phila.gov/ULRS311/Data/Location/';
    return fromPromise(ulrs + address, {format: 'json'});
}

function toPropCode(ulrsResult) {
    function pad5(n) {
        return ("0000"+n).slice(-5);
    }

    var prop = ulrsResult.Locations[0].Address;
    return "" + prop.StreetCode + pad5(prop.StreetNumber) + (prop.Unit || '');
}

function getOpa(propCode) {
    var opa = 'http://api.phila.gov/opa/v1.0/property/';
    return fromPromise(opa + propCode, {format: 'json'});
}

function fromPromise(url, query) {
    return Bacon.fromPromise(
        $.getJSON(url, query)
    );
}

function setupSearchStream(options) {
    var $search = $(options.searchInput),
        queryProp = $search.asEventStream('keyup').map('.target.value').toProperty(''),
        textStream = $search.asEventStream('keypress').filter(isEnterKey),
        buttonStream = $(options.searchBtn).asEventStream('click'), 
        searchStream = textStream.merge(buttonStream),
        addressStream = queryProp.sampledBy(searchStream).flatMapLatest(getUlrs);

    return addressStream.map(toPropCode).flatMapLatest(getOpa);
}

module.exports = {
    setup: function(options) {
        var opts = _.extend({
            searchInput: '',
            searchBtn: ''
        }, options);

        return setupSearchStream(opts);
    }
};
