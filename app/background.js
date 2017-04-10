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

 chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
     var data = []
     var rootPath = request.rootPath
     xmlhttp = []
     xmlhttp2 = []

     if(request.failures) {

       //getting build results
       for(i = 0; i < request.failed_build_urls.length; i++) {
         (function (i) {
           xmlhttp[i] = new XMLHttpRequest();
           var rootUrl = request.failed_build_urls[i]
           xmlhttp[i].open('GET', rootUrl, false)

           xmlhttp[i].onreadystatechange = (function (req) {
              return function() {

                if (req.readyState === 4) {
                  if (req.status === 200) {
                    var resultLinks = []
                    var parser = new DOMParser
                    var dom = parser.parseFromString(req.response, 'text/html')

                    // inspecting the list of failed specs
                    var pageLinkElements = dom.querySelectorAll('#main-panel tr td ul li a')
                    for(n = 0; n < pageLinkElements.length; n++) {
                      resultLinks.push(pageLinkElements[n].getAttribute('href'))
                    }

                    //getting test names and stack traces
                    for(x = 0; x < resultLinks.length; x++) {
                      (function (x) {
                        if (resultLinks[x].search('xml/_empty_') == -1) {
                          xmlhttp2[x] = new XMLHttpRequest();
                          testUrl = resultLinks[x]
                          xmlhttp2[x].open('GET', rootUrl + testUrl, false)

                          xmlhttp2[x].onreadystatechange = (function (req2) {
                            return function() {
                              if (req2.readyState === 4) {
                                if (req2.status === 200) {
                                  parser = new DOMParser
                                  dom = parser.parseFromString(req2.response, 'text/html')
                                  var testName = ''
                                  var stackTrace = ''
                                  if(dom.querySelector('#main-panel > p > span') != null) {
                                    testName = dom.querySelector('#main-panel > p > span').textContent
                                  }
                                  if(dom.querySelectorAll('#main-panel > pre')[1] != null) {
                                    stackTrace = dom.querySelectorAll('#main-panel > pre')[1].textContent
                                  }
                                  data.push({name: testName, stackTrace: stackTrace })
                                  } else {
                                    console.error('error retrieving test data');
                                  }
                                }
                            }
                          }(xmlhttp2[x]));
                          xmlhttp2[x].send(null);
                        }
                      })(x)
                    }
                  } else {
                    console.error('error retrieving build data');
                  }
                }
              }
            }(xmlhttp[i]));
           xmlhttp[i].send(null)
         })(i);
       }
       if(data.length > 0) {
         sendResponse({data: data, status: 'Completed' })
       } else {
         sendResponse({data: data, status: 'This project does not have test reporting' })
       }
     }
 });
