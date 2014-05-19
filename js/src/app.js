"use strict"

var $ = require('jquery'),
    ParcelMap = require('map'),
    search = require('search'),
    _ = require('lodash');

function init(options) {
    var templates = complileTemplates(),
        map = ParcelMap({popupTmpl: templates['id-popup']}),
        searchStream = search.setup(options.search);

    searchStream.onValue(function(opa) {
        console.log(opa);
    });
}

function complileTemplates() {
    var tmpls = {},
        pairs = $('script[type="text/template"]').each(function(idx, tmpl) {
            tmpls[tmpl.id] = _.template(tmpl.innerHTML); 
        });

    return tmpls;
}

module.exports = {
    init: init
}
