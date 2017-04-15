function findFailures() {
  console.log('finding failures...')
  failures_count = document.getElementById('buildHistory').getElementsByClassName('icon-red').length
  failures = failures_count > 0
  if (failures_count > 0) {
    failedBuilds = []
    rows = document.getElementById('buildHistory').getElementsByClassName('build-row-cell')
    for (i = 0; i < rows.length; i++) {
      if (rows[i].getElementsByTagName('img')[0].alt.search('Failed') == 0) {
        failedBuilds.push({
          url: rows[i].getElementsByClassName('build-link display-name')[0].href,
          time: rows[i].getElementsByClassName('pane build-details')[0].getElementsByTagName('a')[0].textContent
        })
      }
    }
    chrome.storage.sync.set({
      failedBuilds: {
        failures: failedBuilds,
        rootPath: window.location.href
      }
    }, function() {
      console.log('failures saved...')
    })
  } else {
    console.log('no failures found...')
    chrome.storage.sync.set({
      failedBuilds: {
        failures: [],
        rootPath: ''
      }
    }, function() {
      console.log('no failures found...')
    })
  }
}

var buildHistoryNav = document.getElementById('buildHistoryPageNav')
if (buildHistoryNav != null) {
  buildHistoryNav.addEventListener('click', function() {
    findFailures()
  })
}

findFailures()
