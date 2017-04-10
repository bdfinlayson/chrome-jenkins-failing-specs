failures_count = document.getElementById('buildHistory').getElementsByClassName('icon-red').length
if(failures_count > 0) {
  failed_build_urls = []
  rows = document.getElementById('buildHistory').getElementsByClassName('build-row-cell')
  for(i = 0; i < rows.length; i++) {
    if(rows[i].getElementsByTagName('img')[0].alt.search('Failed') == 0) {
      failed_build_urls.push(rows[i].getElementsByClassName('build-link display-name')[0].href)
    }
  }
  console.log(failures_count)
  console.log(failed_build_urls)
  chrome.runtime.sendMessage({
    failures: true,
    count: failures_count,
    failed_build_urls: failed_build_urls,
    root_path: window.location.href
  },function(response) {
      console.log(response.data, response.status)
      names = response.data.map(function(obj) { return obj.name })
      stacks = response.data.map(function(obj) { return obj.stackTrace })
      console.log(names)
      console.log(stacks)
    })
}
