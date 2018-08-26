/*
 * Manages extension/add-on states across content scripts.
 */
var brws = null;
// check if on chrome
if (typeof chrome != "undefined") {
	brwsr = chrome;
}
else{
	brwsr = browser;
}
var hideResolved = false;
var contentScripts = {};
function updatePopupView(sendResponse){
	if(hideResolved){
		 sendResponse({'result':true, 'showHideBtnText':'Show Resolved'});
		 return true;
	}
 	sendResponse({'result':false, 'showHideBtnText':'Hide Resolved'});
}
function updatePageAction(port){
	if(hideResolved){
  	brwsr.pageAction.setIcon({path: "images/imageSkipped.png", tabId:port.sender.tab.id});
	}
	else{
		brwsr.pageAction.setIcon({path: "images/icon128.png", tabId:port.sender.tab.id});
	}
}
function sendToContentScript(data){
	// send to specified content script or to all if tab id is missing
	if(typeof data['csId']!="undefined" && data['csId']!==null){
		var contentScriptPort = contentScripts[data['csId']];
	    if(typeof contentScriptPort!="undefined" && contentScriptPort!==null && contentScriptPort){
	    	delete data['csId'];
	    	contentScriptPort.postMessage(data);
	    }
	    updatePageAction(contentScriptPort);
	}
	else{
		for(csId in contentScripts){
			if(contentScripts[csId]!=null){
				contentScripts[csId].postMessage(data);
				updatePageAction(contentScripts[csId]);
			}
		}
	}
	return true;
}
brwsr.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if(request.popupOpen){
  		updatePopupView(sendResponse);
  	}
    else if (request.buttonClicked == "showHideBtn") {
    	hideResolved = !hideResolved;
    	sendToContentScript({'hideResolved':hideResolved});
    	updatePopupView(sendResponse);
     	return true;
    } 
});
// open a long lived connection between the background page and content scripts
brwsr.runtime.onConnect.addListener(function(port) {
  if(port.name == "piazzaToolkitCS"){
  	var csId = port.sender.frameId +"@"+port.sender.tab.id;
  	contentScripts[csId]=port;
  	port.onMessage.addListener(function(request, sender, sendResponse) {
		  // console.log("Background page received the following request from content script: "+JSON.stringify(request));
		  for (var key in request) {
			// add key - action mapping here to run an action according to a key received from content script	  
				switch(key){
					case "show_page_action":
						brwsr.pageAction.show(sender.sender.tab.id);  
						break;
					case "ready":
					      port.postMessage({'readyReceived':true});
						break;			
					default:
						request.csId = csId;
						break;						
				}				  
		  }
	  });
	  port.onDisconnect.addListener(function() {
		    contentScripts[csId] = null;
		});
		// send the state of the extension on connect
		sendToContentScript({'hideResolved':hideResolved});
  }
});