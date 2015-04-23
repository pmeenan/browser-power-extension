// Chrome-specific logic
var doNavigate = function(url) {
  gBrowser.loadURI(url);
};

var doScroll = function(amount) {
  var win = window.content.document.defaultView.wrappedJSObject;
  win.scrollBy(0, amount);
};

// Install an onLoad handler for all tabs.
gBrowser.addEventListener('load', onload, true);

// Called when the user clicks on the browser action.
startTest();