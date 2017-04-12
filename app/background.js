chrome.runtime.onInstalled.addListener(function() {
 chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
     var jenkinsRule = {
       conditions: [
         new chrome.declarativeContent.PageStateMatcher({
           pageUrl: { hostPrefix: 'jenkins.', hostSuffix: '.com', schemes: ['https'] },
           css: ['div[id=buildHistory]']
         })
       ],
       actions: [ new chrome.declarativeContent.ShowPageAction() ]
     };
     chrome.declarativeContent.onPageChanged.addRules([jenkinsRule]);
   });
 });

 chrome.pageAction.onClicked.addListener(function(tab) {
   chrome.tabs.create({url: chrome.extension.getURL('index.html')}, function(tab) {
     console.log('tab opened')
   })
 });
