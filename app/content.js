function findFailures() {
  failures_count = document.getElementById('buildHistory').getElementsByClassName('icon-red').length
  failures = failures_count > 0
  if (failures_count > 0) {
    failed_build_urls = []
    rows = document.getElementById('buildHistory').getElementsByClassName('build-row-cell')
    for (i = 0; i < rows.length; i++) {
      if (rows[i].getElementsByTagName('img')[0].alt.search('Failed') == 0) {
        failed_build_urls.push(rows[i].getElementsByClassName('build-link display-name')[0].href)
      }
    }
    console.log(failures_count)
    console.log(failed_build_urls)
    chrome.storage.sync.set({
      failedBuilds: {
        buildUrls: failed_build_urls,
        rootPath: window.location.href
      }
    }, function() {
      if (failures) {
        console.log('urls stored...')
      } else {
        console.log('no failures found...')
      }
    })
  }
}

document.getElementById('buildHistoryPageNav').addEventListener('click', function() {
  console.log('finding failures...')
  findFailures()
})

findFailures()
