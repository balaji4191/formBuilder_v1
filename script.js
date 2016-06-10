var myApp = angular.module('myApp', ['restangular','fg', 'ngSanitize', 'markdown','rzModule', 'colorpicker.module','kendo.directives']);

myApp.config(['RestangularProvider',
    function(RestangularProvider) {
      RestangularProvider.setDefaultHeaders({'Accept':'application/json, text/javascript','Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'});
      RestangularProvider.setBaseUrl('http://172.16.9.45:8091/api/v1');
    }
]); 
 
myApp.controller('MyController', ['$scope','mySchema','serviceName','$http', function($scope, mySchema,serviceName,$http) {
  //console.log(serviceName);
  //serviceName.getFormList(); 
  $scope.myForm = {
    schema: [mySchema],
    extracts:{
      'reCaptcha':false,
      'location':false,
      'media':false,
      'registeration':true,
      'cookies':false,
      'ipTracking':false,
      'ssl':false,
      'analytics':false,
    },
    title : ''
  };
  
  
  $scope.monthSelectorOptions = {
            start: "year",
            depth: "year"
          };
          $scope.getType = function(x) {
            return typeof x;
          };
          $scope.isDate = function(x) {
            return x instanceof Date;
          };
      
      var config = {
          headers : {
            'Accept': 'application/json, text/javascript',
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
          }
        } 

    
    var Schemaval={"schema":[{"fields":[{"type":"phoneNumber","name":"field8545","displayName":"Phone Number","glypclassName":"fa fa-phone","supportingtext":"dfferererreere","placeholder":"dsdsdsdsdsds"},{"type":"radiobuttonlist","name":"field8549","displayName":"Radiobuttondfsewewewewewewewewewewewew","glypclassName":"fa fa-dot-circle-o","options":[{"value":"1","text":"Option 1"},{"value":"2","text":"Option 2"},{"value":"3","text":"Option 3"}]}]}],"extracts":{"reCaptcha":false,"location":false,"media":false,"registeration":true,"cookies":false,"ipTracking":false,"ssl":false,"analytics":false}}
    var checkField = JSON.stringify(Schemaval);
    console.log(checkField);
    var data = {
               "formName": "form91",
               "formSchema" : checkField
              }
    console.log(data);
    var dataValue = JSON.stringify(data);
    console.log(dataValue);
  /*  $http({
      method: 'POST',
      url   : 'http://172.16.9.45:8091/api/v1/sample/form',
      data  :  dataValue
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      console.log(JSON.stringify(response))
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      console.log('Error:)')
    }); */
       
       $http.post('http://172.16.9.45:8091/api/v1/sample/form', dataValue, config)
            .success(function (data, status, headers, config) {
                console.log('Success:)');
            })
            .error(function (data, status, header, config) {
                $scope.ResponseDetails = "Data: " + data +
                console.log('error:(');
            });  
 /* $.ajax({
      url: 'http://172.16.9.45:8091/api/v1/sample/form',
      type: 'POST',
      dataType: 'json',
      data:dataValue,
      success: function(data) {   
        console.log(dataValue,'********');     
        console.log(data);
      },
      error: function(e) {
        console.log(e.message);
      }
    });*/
}]);

myApp.factory('serviceName', ['Restangular', function(rest){
  var serviceApi = {};
    serviceApi.getFormList = function () {
     return rest.one('sample/form/447').get(); 
    };
  return serviceApi;
}]);  

myApp.value('mySchema', {
  "fields": [
  ]
});