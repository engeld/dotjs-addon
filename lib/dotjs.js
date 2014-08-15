const data = require('sdk/self').data;
const file = require('sdk/io/file');
const system = require('sdk/system');

let homeDir = system.pathFor('Home');
let jsDir = homeDir.indexOf('/') === 0 ? '.js' : 'js';
let cssDir = homeDir.indexOf('/') === 0 ? '.css' : 'css';

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

	let jsmatch = false; let jqmatch = null; // do not load jQuery by default

	for ( let i = 0; i < files.length; i++ ) {
	    let filename = file.join(homeDir, jsDir, files[i]);

	    let namewithext = filename + '.js'; 
	    if ( file.exists( namewithext ) ) {
	    	let content = file.read(namewithext);
	    	if ( ret.js == null ) ret.js = content;
	    	else {
	    		if ( Array.isArray(ret.js) ) ret.js.push(content);
	    		else ret.js = [ ret.js, content ];
	    	}
            jsmatch = true; ret.match = true;
            if ( jqmatch === null ) jqmatch = /\(jQuery\)/g.test(ret.js); // last line })(jQuery);
	    }

		namewithext = filename + '.coffee'; 
	    if ( file.exists( namewithext ) ) {
	    	if ( coffee === false ) coffee = data.load('coffee-script.js');
	    	ret.transpiler = coffee;
	    	let content = file.read(namewithext);
	    	if ( ret.coffee == null ) ret.coffee = content;
	    	else {
	    		if ( Array.isArray(ret.coffee) ) ret.coffee.push(content);
	    		else ret.coffee = [ ret.coffee, content ];
	    	}
            jsmatch = true; ret.match = true;
	    }

	    filename = file.join(homeDir, cssDir, files[i]);
	    namewithext = filename + '.css'; 
	    if ( file.exists( namewithext ) ) {
	    	let content = file.read(namewithext);
	    	if ( ret.css == null ) ret.css = content;
	    	else {
	    		if ( Array.isArray(ret.css) ) ret.css.push(content);
	    		else ret.css = [ ret.css, content ];
	    	}
            ret.match = true;
	    }
	}

	if ( jsmatch === true && jqmatch === true ) {
		if ( jquery === false ) jquery = data.load('jquery.min.js');
		ret.jquery = jquery;
	}

	callback(ret); // error === undefined
}