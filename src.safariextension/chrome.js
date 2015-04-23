// Chrome-specific logic
var doNavigate = function(url) {
  chrome.tabs.update(null, {'url': url});
};

var doScroll = function(amount) {
  chrome.tabs.executeScript(null, {code: "document.body.scrollTop = document.body.scrollTop + " + amount + ";"});
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
