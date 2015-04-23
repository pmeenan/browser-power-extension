function handleMessage(msgEvent) {
    if (msgEvent.name === "scroll") {
    	document.body.scrollTop = document.body.scrollTop + msgEvent.message;
    }
    console.log("message");
}
safari.self.addEventListener("message", handleMessage, false);
console.log("Injected");