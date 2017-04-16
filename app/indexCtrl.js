angular.module('evilJenkins').controller('indexCtrl', ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {

  $scope.loading = true;
  $scope.buildCount = 0
  $scope.testCount = 0
  $scope.testsFound = true
  $scope.data = []

  $scope.$watch('testCount', function() {

    if (($scope.buildCount == $scope.failedBuildsCount) && ($http.pendingRequests.length == 0)) {
      $scope.loading = false
    }
    if (($scope.buildCount == $scope.failedBuildsCount) && ($http.pendingRequests.length == 0) && ($scope.testCount == 0)) {
      $scope.loading = false
      $scope.testsFound = false
    }
  })

  $scope.$watch('$viewContentLoading', function() {
    chrome.storage.sync.get('failedBuilds', function(keys) {
      $scope.projectName = keys.failedBuilds.projectName
      $scope.projectUrl = keys.failedBuilds.rootPath
      $scope.failedBuildsCount = keys.failedBuilds.failures.length

      if ($scope.failedBuildsCount > 0) {
        $scope.fetchBuildData(keys.failedBuilds)
      } else {
        $scope.testsFound = false
        $scope.loading = false
      }
    })
  });


  $scope.fetchBuildData = function(failedBuilds) {
    if (failedBuilds.failures.length > 0) {
      for (i = 0; i < failedBuilds.failures.length; i++) {
        $scope.getBuild(failedBuilds.failures[i])
      }
    }
  }

  $scope.getBuild = function(build) {
    $http({
      method: 'GET',
      url: build.url
    }).then(function successCallback(response) {
      $scope.buildCount += 1
      testLinks = $scope.scrapeBuildPage(response.data)
      for (i = 0; i < testLinks.length; i++) {
        if (testLinks[i].search('xml/_empty_') == -1) {
          $scope.getTest(testLinks[i], build)
        }
      }
    }, function errorCallback(response) {
      console.log(response.statusText)
    })
  }

  $scope.scrapeBuildPage = function(page) {
    var testLinks = []
    var parser = new DOMParser
    var dom = parser.parseFromString(page, 'text/html')

    // inspecting the list of failed specs
    var pageLinkElements = dom.querySelectorAll('#main-panel tr td ul li a')
    for (n = 0; n < pageLinkElements.length; n++) {
      testLinks.push(pageLinkElements[n].getAttribute('href'))
    }
    return testLinks
  }

  $scope.getTest = function(testUrl, build) {
    $http({
      method: 'GET',
      url: build.url + testUrl
    }).then(function successCallback(response) {
      $scope.testCount += 1
      $scope.scrapeTestPage(response.data, testUrl, build)
    }, function errorCallback(response) {
      console.log(response.statusText)
    })
  }

  $scope.scrapeTestPage = function(page, testUrl, build) {
    parser = new DOMParser
    dom = parser.parseFromString(page, 'text/html')
    var testName = ''
    var stackTrace = ''
    var buildPathChunks = build.url.split('/')
    var buildId = buildPathChunks[buildPathChunks.length - 2]
    if (dom.querySelector('#main-panel > p > span') != null) {
      testName = dom.querySelector('#main-panel > p > span').textContent
    }
    if (dom.querySelectorAll('#main-panel > pre')[1] != null) {
      stackTrace = dom.querySelectorAll('#main-panel > pre')[1].textContent
    }
    $scope.data.push({
      name: testName,
      testUrl: build.url + testUrl,
      stackTrace: stackTrace,
      time: build.time,
      buildUrl: build.url,
      buildId: buildId
    })
  }
}]);
