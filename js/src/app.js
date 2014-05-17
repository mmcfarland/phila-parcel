"use strict"

var ParcelMap = require('map'),
    search = require('search');

function init(options) {
    var map = new ParcelMap(),
        searchStream = search.setup(options.search);

    searchStream.onValue(function(opa) {
        console.log(opa);
    });
}

module.exports = {
    init: init
}
