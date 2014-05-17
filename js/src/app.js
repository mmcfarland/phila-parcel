"use strict"

var ParcelMap = require('map'),
    search = require('search');

function init() {
    var map = new ParcelMap();

    search('144 E Coulter St');
}

module.exports = {
    init: init
}
