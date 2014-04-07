const data = require('sdk/self').data;
const file = require('sdk/io/file');
const system = require('sdk/system');

homeDir = system.pathFor('Home');
jsDir = homeDir.indexOf('/') === 0 ? '.js' : 'js';
cssDir = homeDir.indexOf('/') === 0 ? '.css' : 'css';

var jquery = false; var coffee = false;

/**  
 * matchFile: takes the domain name and returns an object with the correct matching
 * content scripts
 */
exports.matchFile = function (domain, callback) {
	let files = [ domain ];
    // support domain wildcards e.g. *.kares.org.js :
    let split = domain.split('.'), length = split.length;;
    for ( let i = length - 1; i > 0; i-- ) {
        let part = split.slice(length - i, length);
        files.push( '*.' + part.join('.') );
    }
    files.push('*');  // default.js replaced with *.js

	let ret = { match: false }; // our return object

	let jsmatch = false; let jqmatch = true;

	for ( let i = 0; i < files.length; i++ ) {
	    let filename = file.join(homeDir, jsDir, files[i]);

	    if ( file.exists(filename + '.js') ) {
            ret.js = file.read(filename + '.js');
            jsmatch = true;
            ret.match = true;
            jqmatch = /\(jQuery\)/g.test(ret.js); // last line })(jQuery);
	    }

	    if ( file.exists(filename + '.coffee') ) {
	    	if (coffee === false) coffee = data.load('coffee-script.js');
	    	ret.transpiler = coffee;
            ret.coffee = file.read(filename + '.coffee');
            jsmatch = true;
            ret.match = true;
	    }

	    let cssname = file.join(homeDir, cssDir, files[i]);
	    if ( file.exists(cssname + '.css') ) {
            ret.css = file.read(cssname + '.css');
            ret.match = true;
	    }
	}

	if ( jsmatch === true && jqmatch === true ) {
		if (jquery === false) jquery = data.load('jquery.min.js');
		ret.jquery = jquery;
	}

	callback(ret);
}
