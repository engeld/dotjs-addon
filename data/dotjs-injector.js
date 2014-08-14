/*
 * catch the 'load-scripts' event and inject the results into the current scope.
 */
(function() {
    self.port.on("load-scripts", function(msg) {
        // bail out if we're in an iframe
        if (window.frameElement) return;
        
        if ( msg.jquery ) eval(msg.jquery);

        if ( msg.js ) {
            let js = msg.js;
            if ( Array.isArray(js) ) {
                for ( let i = 0; i < js.length; i++ ) eval(js[i]);
            }
            else eval(js);
        }

        if ( msg.coffee ) {
            // coffee-script.js assumes this === window
            ( function() { eval(msg.transpiler); } ).call(window);
            let coffee = msg.coffee;
            if ( ! Array.isArray(coffee) ) coffee = [ coffee ];
            for ( let i = 0; i < coffee.length; i++ ) eval( CoffeeScript.compile(coffee[i]) );
        }

        if ( msg.css ) {
            let headNode = document.getElementsByTagName('head')[0];

            let css = msg.css;
            if ( ! Array.isArray(css) ) css = [ css ];
            for ( let i = 0; i < css.length; i++ ) {
                let cssNode = document.createElement('style');
                cssNode.innerHTML = css[i];
                if ( headNode ) headNode.appendChild(cssNode);
            }
        }
    });

    if ( document.URL.indexOf('http') === 0 ) {
        self.port.emit('init', document.URL);
    }
})();