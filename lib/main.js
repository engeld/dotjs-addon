const data = require('sdk/self').data,
    url = require('sdk/url'),
    matchFile = require("dotjs").matchFile;

require('sdk/page-mod').PageMod({
    include: "*",
    contentScriptWhen: 'end',
    contentScriptFile: data.url('dotjs-injector.js'),
    onAttach: function (worker) {
        worker.port.on('init', function(domain) {
            let host = url.URL(domain).host;
            if (!host) return;
            if (host.indexOf('www.') === 0) {
                host = host.substring(4, host.length);
            }
            
            matchFile(host, function(err, files) {
                if (err) throw err;
                if (files) worker.port.emit('load-scripts', files);
            });
        });
    }
});
