// Chrome-specific logic
var doNavigate = function(url) {
  chrome.tabs.update(null, {'url': url});
};

var doScroll = function(amount) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {name: "scroll", message: amount}, function(response) {});
	});
};

// Install an onLoad handler for all tabs.
chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == 'complete') {
    onload();
  }
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    startTest();
});
