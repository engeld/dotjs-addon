const {Cc, Ci} = require('chrome'); 
const data = require("self").data;
const file = require('file');
const dirSvc = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties),
homeDir = dirSvc.get('Home', Ci.nsIFile).path,
jsDir = homeDir.indexOf('/') === 0 ? '.js' : 'js';
cssDir = homeDir.indexOf('/') === 0 ? '.css' : 'css';

// pre-load out helper scripts
var jquery = false;
var coffeescript = false;

/**  
 * matchFile: takes the domain name and returns an object with the correct matching
 * content scripts
 */
exports.matchFile = function (domain) {
	/*
	 * This is a problem - if the user has a default.js/css file,  we will always inject
	 * causing a bunch of overhead for each tab.
	 */
	let files = [ domain, '*' ]; // default.js replaced with *.js
    
    // support domain wildcards e.g. *.kares.org.js :
    let split = domain.split('.'), length = split.length;;
    for ( let i = 0; i < length; i++ ) {
        let part = split.slice(length - i, length);
        files.push( '*.' + part.join('.') );
    }

	// our return object
	let ret = {match: false};

	let jsmatch = false; let jqmatch = true;

	for (var i = files.length - 1; i >= 0; i--) {
	    let filename = file.join(homeDir, jsDir, files[i]);

	    if (file.exists(filename + '.js')) {
            ret.js = file.read(filename + '.js');
            jsmatch = true;
            ret.match = true;
            jqmatch = /\(jQuery\)/g.test(ret.js); // last line })(jQuery);
	    }

	    if (file.exists(filename + '.coffee')) {
	    	if (coffeescript === false)
	    		coffeescript = data.load('coffee-script.js');
	    	ret.transpiler = coffeescript;
            ret.coffee = file.read(filename + '.coffee');
            jsmatch = true;
            ret.match = true;
	    }

	    let cssname = file.join(homeDir, cssDir, files[i]);
	    if (file.exists(cssname + '.css')) {
            ret.css = file.read(cssname + '.css');
            ret.match = true;
	    }
	}

	// we always load jQuery is there is a JS match.
	if (jsmatch === true && jqmatch === true) {
		if (jquery === false)
			jquery = data.load('jquery.min.js');
		ret.jquery = jquery;
	}

	return ret;
}
