angular.module('evilJenkins').controller('indexCtrl', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.loading = true;
  $scope.count = 0
  $scope.data = []
  $scope.testsFound = true

  $scope.$watch('$viewContentLoaded', function(){
    $timeout(function () {
      chrome.storage.sync.get('failedBuilds', function(keys) {
        $scope.projectName = keys.failedBuilds.projectName
        $scope.projectUrl = keys.failedBuilds.rootPath
        $scope.failedBuildsCount = keys.failedBuilds.failures.length
        if($scope.failedBuildsCount > 0) {
          $scope.fetch(keys.failedBuilds)
        } else {
          $scope.testsFound = false
          $scope.loading = false
        }
      })
    }, 1000);
  });

  $scope.fetch = function(failedBuilds) {
    $scope.count = 0
    var xmlhttp = []

    if (failedBuilds.failures.length > 0) {
      //getting build results
      for (i = 0; i < failedBuilds.failures.length; i++) {
        (function(i) {
          xmlhttp[i] = new XMLHttpRequest();
          var rootUrl = failedBuilds.failures[i]['url']
          var timeFailed = failedBuilds.failures[i]['time']
          xmlhttp[i].open('GET', rootUrl, false)

          xmlhttp[i].onreadystatechange = (function(req) {
            return function() {

              if (req.readyState === 4) {
                if (req.status === 200) {
                  var resultLinks = []
                  var parser = new DOMParser
                  var dom = parser.parseFromString(req.response, 'text/html')

                  // inspecting the list of failed specs
                  var pageLinkElements = dom.querySelectorAll('#main-panel tr td ul li a')
                  for (n = 0; n < pageLinkElements.length; n++) {
                    resultLinks.push(pageLinkElements[n].getAttribute('href'))
                  }

                  //getting test names and stack traces
                  $scope.getTestData(resultLinks, rootUrl, timeFailed)

                } else {
                  console.error('error retrieving build data');
                }
              }
            }
          }(xmlhttp[i]));
          xmlhttp[i].send(null)
        })(i);
      }
    }
  }

  $scope.getTestData = function(resultLinks, rootUrl, timeFailed) {
    var xmlhttp2 = []

    for (x = 0; x < resultLinks.length; x++) {
      (function(x) {
        if (resultLinks[x].search('xml/_empty_') == -1) {
          xmlhttp2[x] = new XMLHttpRequest();
          testUrl = rootUrl + resultLinks[x]
          xmlhttp2[x].open('GET', testUrl, false)

          xmlhttp2[x].onreadystatechange = (function(req2) {
            return function() {
              $scope.updateData(req2, timeFailed, testUrl)
            }
          }(xmlhttp2[x]));
          xmlhttp2[x].send(null);
        }
      })(x)
    }
  }

  $scope.updateData = function(req2, timeFailed, testUrl) {
    $scope.$apply(function() {
      if (req2.readyState === 4) {
        if (req2.status === 200) {
          parser = new DOMParser
          dom = parser.parseFromString(req2.response, 'text/html')
          var testName = ''
          var stackTrace = ''
          if (dom.querySelector('#main-panel > p > span') != null) {
            testName = dom.querySelector('#main-panel > p > span').textContent
          }
          if (dom.querySelectorAll('#main-panel > pre')[1] != null) {
            stackTrace = dom.querySelectorAll('#main-panel > pre')[1].textContent
          }
          $scope.data.push({
            name: testName,
            testUrl: testUrl,
            stackTrace: stackTrace,
            time: timeFailed
          })

          $scope.count++
          $scope.loading = false;
        } else {
          console.error('error retrieving test data');
        }
      }
    })

  }
}]);
