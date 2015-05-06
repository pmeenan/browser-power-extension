var powerScrollDirection = 1;
var powerLastScrollTop = -1;
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if (message.name === "scroll") {
    	if (document.body.scrollTop == powerLastScrollTop)
    		powerScrollDirection = powerScrollDirection * -1;
    	powerLastScrollTop = document.body.scrollTop;
    	var amount = message.message * powerScrollDirection;
    	document.body.scrollTop = document.body.scrollTop + amount;
    }
});
