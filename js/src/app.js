"use strict"

var $ = require('jquery'),
    ParcelMap = require('map'),
    search = require('search'),
    _ = require('lodash');

function init(options) {
    var templates = complileTemplates(),
        searchStream = search.setup(options.search),
        map = ParcelMap({
            searchStream: searchStream,
            popupTmpl: templates['id-popup']
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
