angular.module('jenkinsFailingSpecs').controller('failingSpecsCtrl', ['$scope', function($scope) {
  $scope.fetchData = function() {
    chrome.storage.sync.get('failedBuilds', function(keys) {
      $scope.scrape(keys.failedBuilds)
    })
  }

  $scope.scrape = function (failedBuilds) {
    console.log('scraping...')
    var data = []
    xmlhttp = []
    xmlhttp2 = []

    if(failedBuilds.buildUrls.length > 0) {
      //getting build results
      for(i = 0; i < failedBuilds.buildUrls.length; i++) {
        (function (i) {
          xmlhttp[i] = new XMLHttpRequest();
          var rootUrl = failedBuilds.buildUrls[i]
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
        console.log('got data')
        scrapedData = {}
        for(i = 0; i < data.length; i++) {
          scrapedData[i] = {name: data[i].name, stackTrace: data[i].stackTrace }
        }
        $scope.scrapedData = scrapedData
        chrome.storage.sync.set({
          scrapedData: scrapedData
        }, function() {
          console.log('scraped data stored')
        })
      } else {
        alert('failed to get data')
      }
    }
  }

}]);
