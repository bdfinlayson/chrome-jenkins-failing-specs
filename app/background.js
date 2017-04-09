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
     if(request.failures) {
       var data = []
       var resultLinks = []
       var rootPath = window.location.href //request.rootPath
       xmlhttp = []
       xmlhttp2 = []
       for(i = 0; i < failures.length; i++) {
         (function (i) {
           xmlhttp[i] = new XMLHttpRequest();
           var rootUrl = failures[i]
           xmlhttp[i].open('GET', rootUrl, true)

           xmlhttp[i].onreadystatechange = (function (req) {
              return function() {

                if (req.readyState === 4) {
                  if (req.status === 200) {
                    var parser = new DOMParser
                    var dom = parser.parseFromString(req.response, 'text/html')
                    var pageLinkElements = dom.querySelectorAll('#main-panel tr td ul li a')
                    for(n = 0; n < pageLinkElements.length; n++) {
                      resultLinks.push(pageLinkElements[n].getAttribute('href'))
                    }

                    for(x = 0; x < resultLinks.length; x++) {
                      (function (x) {
                        if (resultLinks[x].search('xml/_empty_') == -1) {
                          xmlhttp2[x] = new XMLHttpRequest();
                          testUrl = resultLinks[x]
                          xmlhttp2[x].open('GET', rootUrl + testUrl, true)


                          xmlhttp2[x].onreadystatechange = (function (req2) {
                            return function() {
                              if (req2.readyState === 4) {
                                if (req2.status === 200) {
                                  parser = new DOMParser
                                  dom = parser.parseFromString(req2.response, 'text/html')
                                  console.log(dom.querySelector('#main-panel > p'))
                                  var testName = ''
                                  var stackTrace = ''
                                  if(dom.querySelector('#main-panel > p > span') != null) {
                                    testName = dom.querySelector('#main-panel > p > span').textContent
                                  }
                                  if(dom.querySelectorAll('#main-panel > pre')[1] != null) {
                                    stackTrace = dom.querySelectorAll('#main-panel > pre')[1].textContent
                                  }
                                  data.push({test_name: testName, stack_trace: stackTrace })
                                  } else {
                                    console.error('blah 2');
                                  }
                                }
                            }
                          }(xmlhttp2[x]));
                          xmlhttp2[x].send(null);
                        }
                      })(x)
                    }

                  } else {
                    console.error('blah 1');
                  }
                }
              }
            }(xmlhttp[i]));


           xmlhttp[i].send(null)
         })(i);
       }
       sendResponse({data: data })
     }
 });
