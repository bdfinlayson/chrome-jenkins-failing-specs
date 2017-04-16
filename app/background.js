chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    var jenkinsRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostPrefix: 'jenkins.',
            hostSuffix: '.com',
            schemes: ['https']
          },
          css: ['div[id=buildHistory]']
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    };
    chrome.declarativeContent.onPageChanged.addRules([jenkinsRule]);
  });
});

chrome.pageAction.onClicked.addListener(function(tab) {
  getFailedBuildInfo(tab)
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    getFailedBuildInfo(sender.tab)
    sendResponse('got info');
  });


function getFailedBuildInfo(tab) {
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {
      message: 'find builds'
    }, function(response) {
      chrome.storage.sync.set({
        failedBuilds: {
          failures: response.failedBuilds.failures,
          rootPath: response.failedBuilds.rootPath,
          projectName: response.failedBuilds.projectName
        }
      }, function() {
        if (response.failedBuilds.failures.length > 0) {
          chrome.tabs.create({
            url: chrome.extension.getURL('index.html')
          }, function(tab) {
            console.log('tab opened')
          })
        } else {
          chrome.storage.sync.set({
            failedBuilds: [],
            rootPath: response.failedBuilds.rootPath,
            projectName: response.failedBuilds.projectName
          }, function() {
            alert('This project has no failed builds!')
          })
        }
      })
    })
  }
}
