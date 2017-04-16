chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('message received by content script')
  var failedBuilds = []

  function findFailures() {
    failures_count = document.getElementById('buildHistory').getElementsByClassName('icon-red').length
    failures = failures_count > 0
    if (failures_count > 0) {
      rows = document.getElementById('buildHistory').getElementsByClassName('build-row-cell')
      for (i = 0; i < rows.length; i++) {
        if (rows[i].getElementsByTagName('img')[0].alt.search('Failed') == 0) {
          failedBuilds.push({
            url: rows[i].getElementsByClassName('build-link display-name')[0].href,
            time: rows[i].getElementsByClassName('pane build-details')[0].getElementsByTagName('a')[0].textContent
          })
        }
      }
    }
    sendResponse({
      failedBuilds: {
        failures: failedBuilds,
        rootPath: window.location.href,
        projectName: document.getElementsByClassName("job-index-headline page-headline")[0].textContent
      }
    })
  }

  findFailures()
});
