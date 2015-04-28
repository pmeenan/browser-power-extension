var NAVIGATE_TIMEOUT = 60000;
var SCROLL_DELAY = 1000;
var SCROLL_COUNT = 60;
var SCROLL_AMOUNT = 100;
var WATCHDOG_INTERVAL = 60000;

var g_isActive = false;
var g_testID = undefined;
var g_task = undefined;
var g_taskTimer = undefined;
var g_scrollCount = 0;
var g_measuring = false;

var watchdog = function() {
  if (g_task === undefined) {
    console.log("watchdog");
    getNextTask();
  }
}

var startMeasurement = function() {
  console.log("Starting measurement");
  window.setInterval(watchdog, WATCHDOG_INTERVAL);
  g_isActive = true;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:8765/start', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.responseText == 'OK')
          g_measuring = true;
        processTask();
      }
    };
    xhr.send();
  } catch (err) {
    processTask();
  }
}

var startTest = function() {
  console.log("Starting test");
  window.setInterval(watchdog, WATCHDOG_INTERVAL);
  g_isActive = true;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://power.webpagetest.org/startTest.php', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.responseText.length > 0) {
          try {
            console.log(xhr.responseText);
            var resp = JSON.parse(xhr.responseText);
          } catch (err) {
            console.log('Error parsing response as JSON: ' +
                  xhr.responseText.substr(0, 120) + '[...]\n');
          }
          if (resp.result == 200 && resp.id) {
            g_testID = resp.id;
            getNextTask();
          }
        }
      }
    };
    xhr.send();
  } catch (err) {}
}

var getNextTask = function() {
  g_task = undefined;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://power.webpagetest.org/getTask.php?test=' + g_testID, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (g_task === undefined && xhr.responseText.length > 0) {
          try {
            console.log(xhr.responseText);
            var resp = JSON.parse(xhr.responseText);
          } catch (err) {
            console.log('Error parsing response as JSON: ' +
                  xhr.responseText.substr(0, 120) + '[...]\n');
          }
          if (resp.result == 200 && resp.task) {
            g_task = resp.task;
            g_task.loaded = false;
            g_task.scrolled = false;
            g_task.waited = false;
            startMeasurement();
          }
        }
      }
    };
    xhr.send();
  } catch (err) {}
}

var reportMeasurement = function(data) {
  if (g_measuring) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://power.webpagetest.org/report.php?test=' + g_testID, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          startMeasurement();
        }
      };
      xhr.send(data);
    } catch (err) {}
  } else {
    getNextTask();
  }
}

var collectMeasurement = function(action) {
  if (g_measuring) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://127.0.0.1:8765/measure', true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.responseText.length > 0) {
          try {
            var resp = JSON.parse(xhr.responseText);
            resp.action = action;
            resp.url = g_task.url;
            reportMeasurement(JSON.stringify(resp));
          } catch (err) {
            startMeasurement();
          }
        }
      };
      xhr.send();
    } catch (err) {}
  } else {
    getNextTask();
  }
}

var scrollPage = function() {
  console.log("Scroll Page");
  if (g_scrollCount < SCROLL_COUNT) {
    g_scrollCount += 1;
    doScroll(SCROLL_AMOUNT);
    setTimeout(scrollPage, SCROLL_DELAY);
  } else {
    collectMeasurement('Scroll');
  }
};

var processTask = function() {
  console.log("processTask");
  if (g_taskTimer !== undefined) {
    clearTimeout(g_taskTimer);
    g_taskTimer = undefined;
  }

  if (g_task !== undefined) {
    if (!g_task.loaded) {
      g_task.loaded = true;
      g_task.loaded_ok = false;
      g_taskTimer = setTimeout(processTask, NAVIGATE_TIMEOUT);
      doNavigate(g_task.url);
    } else if (!g_task.waited && g_task.loaded_ok && g_task.wait > 0) {
      g_task.waited = true;
      setTimeout(function() {collectMeasurement('wait');}, g_task.wait * 1000);
    } else if (!g_task.scrolled && g_task.loaded_ok && g_task.scroll) {
      g_task.scrolled = true;
      g_scrollCount = 0;
      scrollPage();
    } else {
      g_task = undefined;
    }
  }

  if (g_task === undefined)
    getNextTask();
};

var onload = function() {
  if (g_isActive && g_task !== undefined && !g_task.loaded_ok) {
    console.log("onload");
    g_task.loaded_ok = true;
    collectMeasurement('load');
  }
};