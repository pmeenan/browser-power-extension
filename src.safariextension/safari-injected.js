var powerScrollDirection = 1;
var powerLastScrollTop = -1;
function handleMessage(msgEvent) {
    if (msgEvent.name === "scroll") {
    	if (document.body.scrollTop == powerLastScrollTop)
    		powerScrollDirection = powerScrollDirection * -1;
    	powerLastScrollTop = document.body.scrollTop;
    	var amount = msgEvent.message * powerScrollDirection;
    	document.body.scrollTop = document.body.scrollTop + amount;
    }
}
safari.self.addEventListener("message", handleMessage, false);