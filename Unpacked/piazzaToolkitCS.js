new function() {
    var _this = this;
    this.changeObserver = [];
    this.port = null;
    this.bckMsgListeners = [];
    var brwsr = null;
    if (typeof chrome != "undefined") {
        brwsr = chrome;
    }
    else{
        brwsr = browser;
    }         
    this.helpers = {
        addBackgroundMessageListener: function(listener){
            if(_this.port!==null){
                _this.port.onMessage.addListener(listener); 
                _this.bckMsgListeners.push(listener);
            } 
        },
        removeBackgroundMessageListeners: function(){
            if(_this.port!==null){
                for(var i in _this.bckMsgListeners){
                    _this.port.onMessage.removeListener(_this.bckMsgListeners[i]);
                }
                _this.bckMsgListeners = [];                
            } 
        },
        sendToBackground: function(data){
            if(_this.port!==null){
                _this.port.postMessage(data); 
            } 
        },
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },
        apply: function(collection, apply) {
            for (var i = 0; i < collection.length; ++i) {
                apply(collection[i]);
            }
        },
        hide: function(item) {
            item.style.display = "none";
        },
        getParameterByName: function(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return "";
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        removeURLParameter: function(parameter, url) {
            if (!url) url = window.location.href;
            var urlparts = url.split("?");
            if (urlparts.length >= 2) {
                var prefix = encodeURIComponent(parameter) + "=";
                var pars = urlparts[1].split(/[&;]/g);
                for (var i = pars.length; i-- > 0; ) {
                    if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                        pars.splice(i, 1);
                    }
                }
                url = urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
                return url;
            } else {
                return url;
            }
        }
    };
    this.listeners = {
        // hides all resolved threads and creates a listener to hide proactively
        start: function(mutation) {
            function hideResolved(){
              var resolvedContents = document.querySelectorAll("#clarifying_discussion .post_region_content .clarifying_discussion:not(.unresolved):not(.hidden)");
              _this.helpers.apply(resolvedContents, function(resolvedContent) {
                  resolvedContent.classList.add("hidden");
                  resolvedContent.classList.add("js-piazza-helper-hidden");
              });    
            }
            hideResolved();
            var changeObserver = new MutationObserver(function(mutations) {
              hideResolved();
            });          
            changeObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            _this.changeObserver.push(changeObserver);
        },
        // makes the hidden threads visible again and stops the change listeners
        stop: function() {
            if (_this.changeObserver.length > 0) {
                for (var i in _this.changeObserver) {
                    _this.changeObserver[i].disconnect();
                }
            }
            var resolvedContents = document.querySelectorAll(".js-piazza-helper-hidden");
            _this.helpers.apply(resolvedContents, function(resolvedContent) {
                resolvedContent.classList.remove('hidden');
                resolvedContent.classList.remove('js-piazza-helper-hidden');
            });  
        }
    };
    _this.port = brwsr.runtime.connect({
        name : "piazzaToolkitCS"
    });
    // adding a state change listener
     _this.helpers.addBackgroundMessageListener(function(request) {
        for (var key in request) {
            switch(key){
                case "hideResolved":
                    if(request[key]){
                      _this.listeners.start();
                      return;
                    }
                    _this.listeners.stop();
                    break;
                default:
                    break;
            }               
        }
    });
    _this.helpers.sendToBackground({show_page_action : true});
    _this.helpers.sendToBackground({ready : true});
}();