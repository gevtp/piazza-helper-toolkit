  
var brws = null;
if (typeof chrome != "undefined") {
	brwsr = chrome;
}
else{
	brwsr = browser;
}
window.addEventListener("load", function(event) {
	var showHideBtn = document.querySelector("#popup-show-hide");
	brwsr.runtime.sendMessage({"popupOpen": "true"}, function(res) {
    if(res.showHideBtnText){
			showHideBtn.innerText = res.showHideBtnText;
    }
  });
	showHideBtn.addEventListener("click", function(event) {
		brwsr.runtime.sendMessage({buttonClicked: "showHideBtn"}, function(res) {
	    if(res.showHideBtnText){
				showHideBtn.innerText = res.showHideBtnText;
	    }
	  });
	});
});