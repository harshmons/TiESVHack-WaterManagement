$(document).ready (function(){
            $("#error-alert").hide();
 });
var scope;
angular.module('appMaps', ['uiGmapgoogle-maps','ng-fusioncharts' ,'ui.bootstrap'])
    .controller('mainCtrl', function($scope, $log,$http,uiGmapIsReady,$timeout,queryService,$filter) {
        var x2js = new X2JS();
        //Store Google Map Options
        $scope.mapOptions = {};

        //$scope.date = "Wed Dec 05 2012 13:35:02 GMT+0530 (India Standard Time)";        
        //console.log($filter('date')(new Date($scope.date),'dd, MMMM yyyy'))
        //Dummy Data for the Graph
        // $scope.noOfDaysPassed = ['1st Jan','2nd jan' , '3rd Jan' , '4th Jan' , '5th Jan' ,'1st Jan','2nd jan' , '3rd Jan' , '4th Jan' , '5th Jan'];
        // $scope.noOfResidentsGotWater = [600,400,300,600,900,600,400,300,600,900];
        $scope.noOfDaysPassed = [];
        $scope.noOfResidentsGotWater = [];

        $scope.errorMessage = "";
        //Setting Initial Google Map options
        $scope.mapOptions = {
          center: {
            latitude: 8.3232215080,
            longitude: 36.8234306400
          },
          zoom: 12,
          options:{
            scrollWheel:false
          }
        }

        // queryService.getResources(httpUrl,'<Query><Find><Well><Id Ne=""/></Well></Find></Query>').then(function(data){
        //   console.log('???????????????');
        //   console.log(data);
        // });
        $scope.mapControl = {};
        
        //Storing  Rsidents, Wells, Mobilevendors, StandPipes data for map markers 
        $scope.markerOptions = {};
        $scope.markerOptions.residents = [];
        $scope.markerOptions.wells = [];
        $scope.markerOptions.standPipes = [];
        $scope.markerOptions.mobileVendors = [];
        $scope.markerOptions.householdResellers = [];
        $scope.map= {};
        

        //Array to hold Residents, Wells, Mobilevendors, StandPipes data
        $scope.allResidents = [];
        $scope.allWells = [];
        $scope.allMobileVendors = [];
        $scope.allStandPipes = [] ;
        $scope.allHouseholdResellers = [] ;  

        //Function querying NGO Balance to show as Notification
        $scope.findNGOBalance = function(){
          var data = '<Query> <Find> <NGO> <StartingBudget Ne="0" /> </NGO> </Find> </Query>';
          $http.post(httpUrl, data).then(function(response){
            
            $scope.NGODetails = x2js.xml_str2json(response.data).Find.Result;
            $scope.startingBalance = "$ " + Number($scope.NGODetails.NGO.StartingBudget).toFixed(2); 
            $scope.currentBalance = "$ " + Number($scope.NGODetails.NGO.BudgetBalance).toFixed(2);

          })
        }

        //Function querying all the Residents to show in map 
        $scope.findAllResident = function(){
          var data = '<Query> <Find> <Residents> <Id Ne=""/> </Residents> </Find> </Query>';
          
          queryService.getResources(httpUrl,data).then(function(response){
            $scope.allResidents = response.Data.Find.Result;
          
            
            angular.forEach($scope.allResidents, function(resident,count){
            
              //Converting WaterNeed and MonthlyAllowance for the marker window
              resident.Residents.WaterNeed = Number(resident.Residents.WaterNeed).toFixed(2);
              resident.Residents.MonthlyAllowance = Number(resident.Residents.MonthlyAllowance).toFixed(2);
    
              var markerOption ={
                
                id: resident.Residents.Id,
                
                coords:{
                  latitude:resident.Residents.HouseLocation.latitude,
                  longitude:resident.Residents.HouseLocation.longitude  
                },
                
                options:{
                  title:resident.Residents.Name,
                  // icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|F1290E' 
                  icon:'images/icons/Marker_Resident.png'
                },
                
                show: false,
                
                markerType:'Residents',
                
                windowOptions :{
                  visible: false
                },
                
                markersEvents: {
                click: function(marker, eventName, model, arguments) {
                    $scope.markerClicked(marker,'Residents');
                  }
                }
              
              }  
              
              $scope.markerOptions.residents.push(markerOption);
            });
            
            $scope.residentLoaded = true;
          })

        }

        //Function querying all the Wells to show in map 
        $scope.findAllWells = function(){
          var data = '<Query><Find><Well><Id Ne=""/></Well></Find></Query>';
          
          queryService.getResources(httpUrl,data).then(function(response){
            $scope.allWells  = response.Data.Find.Result;
            
            angular.forEach($scope.allWells, function(well,count){
              
              //Converting Flowrate, Water Revenue for the marker window
              well.Well.MaxFlowRate = Number(well.Well.MaxFlowRate).toFixed(2);
              well.Well.WaterRevenue = '$ ' + Number(well.Well.WaterRevenue).toFixed(2);

              var markerOption ={
                
                id: well.Well.Id,
                
                coords:{
                  latitude:well.Well.GeoLocation.latitude,
                  longitude:well.Well.GeoLocation.longitude  
                },
                
                options:{
                  title:well.Well.Name,
                  // icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF' 
                  icon:'images/icons/Marker_Well.png'
                },
                
                show: false,
                
                markerType:'Wells',
                
                windowOptions :{
                  visible: false,
                  maxWidth: 300
                },
                
                markersEvents: {
                
                click: function(marker, eventName, model, arguments) {
                    $scope.markerClicked(marker,'Wells');
                  }
                }
                
              }  
              
              $scope.markerOptions.wells.push(markerOption);
          
            })  
            $scope.wellLoaded = true;
          })
          
        }

        //Function querying single Well to add in the map 
        $scope.addWellByName = function(wellName){
          var data = '<Query><Find><Well><Name Eq="' + wellName +'"/></Well></Find></Query>';
    
          queryService.getResources(httpUrl,data).then(function(response){
            
            var well = response.Data.Find.Result;

            //Converting Flowrate, Water Revenue for the marker window
            well.Well.MaxFlowRate = Number(well.Well.MaxFlowRate).toFixed(2);
            well.Well.WaterRevenue = '$ ' + Number(well.Well.WaterRevenue).toFixed(2);

            var markerOption =
            {
              id: well.Well.Id,
              
              coords:{
                  latitude:well.Well.GeoLocation.latitude,
                  longitude:well.Well.GeoLocation.longitude  
              },
                
              options:{
                  title:well.Well.Name,
                  //icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF' 
                  icon:'images/icons/Marker_Well.png'
              },
              show: false,
              markerType:'Wells',
              windowOptions :{
                visible: false,
                maxWidth: 300
              },
              markersEvents: {
                click: function(marker, eventName, model, arguments) {
                    $scope.markerClicked(marker,'Wells');
                  }
              }
            }  
              
            $scope.markerOptions.wells.push(markerOption);
            $scope.allWells.push(well)
          })
        }

        
        //Function querying all the Standpipe to show in map 
        $scope.findAllStandPipes = function(){
          var data = '<Query> <Find> <StandPipe> <Id Ne=""/> </StandPipe> </Find> </Query>';
          
          queryService.getResources(httpUrl,data).then(function(response){

            $scope.allStandPipes = response.Data.Find.Result;

            angular.forEach($scope.allStandPipes, function(standPipe,count){
              
              //Converting ExpectedPressure, UnitPrice, StartTime, EndTime , QueueSize, Water Sold  for the marker window
              //--------------------------------------------------------------------------------------------
              standPipe.Standpipe.ExpectedPressure = Number(standPipe.Standpipe.ExpectedPressure).toFixed(2)
              standPipe.Standpipe.UnitPrice = '$ ' + Number(standPipe.Standpipe.UnitPrice).toFixed(2);
              standPipe.Standpipe.QueueSize = Number(standPipe.Standpipe.QueueSize).toFixed(0);
              standPipe.Standpipe.WaterSold = Number(standPipe.Standpipe.WaterSold).toFixed(2) + ' Ltrs';
              standPipe.Standpipe.WaterRevenue = '$ ' + Number(standPipe.Standpipe.WaterRevenue).toFixed(2);

              var startTime = Number(standPipe.Standpipe.OperatingHours.StartTime).toFixed(2);
              var endTime = Number(standPipe.Standpipe.OperatingHours.EndTime).toFixed(2);
              
              if (startTime > 12)
                startTime = (startTime - 12).toFixed(2) + ' PM';
              else
                startTime = startTime + ' AM'; 
              
              if (endTime > 12)
                endTime = (endTime - 12).toFixed(2) + ' PM';
              else
                endTime = endTime + ' AM'; 
              
              startTime = startTime.replace('.',':');
              endTime = endTime.replace('.',':');

              standPipe.Standpipe.OperatingHours.StartTime = startTime;
              standPipe.Standpipe.OperatingHours.EndTime = endTime;  
              //--------------------------------------------------------------------------------------------

              var markerOption ={
                
                id: standPipe.Standpipe.Id,
                
                coords:{
                  latitude:standPipe.Standpipe.GeoLocation.latitude,
                  longitude:standPipe.Standpipe.GeoLocation.longitude  
                },
                
                options:{
                  title:standPipe.Standpipe.Name,
                  // icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|202264' 
                  icon:'images/icons/Marker_StandPipes.png'
                },
                
                show: false,
                
                markerType:'StandPipes',
                
                windowOptions :{
                  visible: false
                },
                
                markersEvents: {
                click: function(marker, eventName, model, arguments) {
                    $scope.markerClicked(marker,'StandPipes');
                  }
                }
              }  
              
              $scope.markerOptions.standPipes.push(markerOption);
            });
            $scope.standPipeLoaded = true;

          })
          
        }

        //Function querying all the Mobile Vendors to show in map 
        $scope.findAllMobileVendors = function(){
          var data = '<Query> <Find> <MobileVendor> <Id> <Ne/> </Id> </MobileVendor> </Find> </Query>';
          
          queryService.getResources(httpUrl,data).then(function(response){

            $scope.allMobileVendors = response.Data.Find.Result;

            angular.forEach($scope.allMobileVendors, function(mobileVendor,count){
              
              //Converting Unit Price and Radius for the marker window
              mobileVendor.MobileVendor.UnitPrice = '$ ' + Number(mobileVendor.MobileVendor.UnitPrice).toFixed(2);
              mobileVendor.MobileVendor.Radius =  Number(mobileVendor.MobileVendor.Radius).toFixed(2);

              var markerOption ={
                id: mobileVendor.MobileVendor.Id,
                coords:{
                  latitude:mobileVendor.MobileVendor.GeoLocation.latitude,
                  longitude:mobileVendor.MobileVendor.GeoLocation.longitude  
                },
                
                options:{
                  title:mobileVendor.MobileVendor.Name,
                  // icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|75ff55' 
                  icon:'images/icons/Marker_MobileVendor.png'
                },
                show: false,
                markerType:'MobileVendors',
                windowOptions :{
                  visible: false
                },
                markersEvents: {
                click: function(marker, eventName, model, arguments) {
                    $scope.markerClicked(marker,'MobileVendors');
                  }
                }
              }  
              
              $scope.markerOptions.mobileVendors.push(markerOption);
            });

            $scope.mobileVendorsLoaded = true;  
          })
        
        }

        //Function querying all the Wells to show in map 
        $scope.findAllHouseholdResellers = function(){
          var data = '<Query> <Find> <HouseholdReseller> <Id> <Ne/> </Id> </HouseholdReseller> </Find> </Query>';
          
          queryService.getResources(httpUrl,data).then(function(response){
            $scope.allHouseholdResellers  = response.Data.Find.Result;
            //console.log($scope.allHouseholdResellers);
            angular.forEach($scope.allHouseholdResellers, function(householdReseller,count){
              
              //Converting Flowrate for the marker window
              householdReseller.HouseholdReseller.UnitPrice = Number(householdReseller.HouseholdReseller.UnitPrice).toFixed(2);
              householdReseller.HouseholdReseller.WaterSold = Number(householdReseller.HouseholdReseller.WaterSold).toFixed(2) + ' Ltrs';
              householdReseller.HouseholdReseller.WaterRevenue = '$ ' + Number(householdReseller.HouseholdReseller.WaterRevenue).toFixed(2);
              
              var markerOption ={
                
                id: householdReseller.HouseholdReseller.Id,
                
                coords:{
                  latitude:householdReseller.HouseholdReseller.GeoLocation.latitude,
                  longitude:householdReseller.HouseholdReseller.GeoLocation.longitude  
                },
                
                options:{
                  title:householdReseller.HouseholdReseller.Name,
                  // icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff7000' 
                  icon:'images/icons/Marker_HouseholdReseller.png'
                },
                
                show: false,
                
                markerType:'HouseholdResellers',
                
                windowOptions :{
                  visible: false,
                  maxWidth: 300
                },
                
                markersEvents: {
                
                click: function(marker, eventName, model, arguments) {
                    $scope.markerClicked(marker,'HouseholdResellers');
                  }
                }
                
              }  
              
              $scope.markerOptions.householdResellers.push(markerOption);
          
            })  
            $scope.householdResellerLoaded = true;
            
          })
          
        }


        $scope.changeMapCenter = function(latitude,longitude){
          $scope.mapControl.getGMap().setCenter({lat:Number(latitude),lng:Number(longitude)})
        }

        $scope.changeMapZoom = function(zoomValue){
          //zoomValue - Zoom level of the map 

          $scope.mapControl.getGMap().setZoom(Number(zoomValue))
        }
        
        //Function to Dig a new well 
        $scope.digWell = function(){
          var data = "<digWell> <Name> well-xyz </Name> <Lat> 8.4466661700 </Lat> <Lon> 36.9536202000 </Lon> </digWell>";
          $http.post(httpUrl,data).then(function(response){
            response = '<Data>' + response.data + '</Data>';

            var response = x2js.xml_str2json(response);
            if (response.Data.Find){
              if (response.Data.Find._Status == "Success"){
                $scope.addWellByName('well-xyz');
                $scope.currentBalance = "$ " + Number(response.Data.Find.Result.NGO.BudgetBalance._Value).toFixed(2); 
              }  
            }else{
              if (response.Data.Result){
                if (response.Data.Result.Status == 'failure'){
                  //$("#myWish").click(function showAlert() {
                  $("#error-alert").show();
                  $("#error-alert").fadeTo(2000, 500).slideUp(500, function(){
                    $("#error-alert").hide();
                  });   
                  //});
                  $scope.errorMessage = "NGO has Insufficient Fund !!"

                }
              }
            }
            
          })
        }



        $scope.markerClicked = function(marker,markerType){
          //marker.id - Id of the marker
          //markerType - Type of the Marker i.e. Residents , Wells , StandPipes , MobileVendors
          //templateParameter is the Object passed to the template based on the click
       
          //marker.windowOptions.visible = !marker.windowOptions.visible;
          if (markerType == 'Residents'){
            angular.forEach($scope.allResidents, function(resident){
              if (resident.Residents.Id == marker.key ){
                $scope.templateParameter = resident.Residents;
                $scope.changeMapZoom(21)
                latLng = resident.Residents.HouseLocation;
                $scope.changeMapCenter(latLng.latitude,latLng.longitude);
              }
            });

          }
          else if(markerType == 'Wells'){
            angular.forEach($scope.allWells, function(well){
              if (well.Well.Id == marker.key ){
                $scope.templateParameter = well.Well;
                $scope.changeMapZoom(12)
              }
            });
          }
          else if(markerType == 'MobileVendors'){
            angular.forEach($scope.allMobileVendors, function(mobileVendor){
              if (mobileVendor.MobileVendor.Id == marker.key ){
                $scope.templateParameter = mobileVendor.MobileVendor;
                $scope.changeMapZoom(12)
              }
            });
          }
          else if (markerType == 'HouseholdResellers'){
            angular.forEach($scope.allHouseholdResellers, function(householdReseller){
              if (householdReseller.HouseholdReseller.Id == marker.key ){
                $scope.templateParameter = householdReseller.HouseholdReseller;
                $scope.changeMapZoom(12)
              }
            }); 
          }
          else // 'StandPipes'
          {
            angular.forEach($scope.allStandPipes, function(standPipe){
              if (standPipe.Standpipe.Id == marker.key ){
                $scope.templateParameter = standPipe.Standpipe;
                $scope.changeMapZoom(12)
              }
            });
          }

          $scope.$apply();

        }

        $scope.search = function(searchType){
          //alert($scope.searchText);

          $scope.showMarkerType = searchType;

          $timeout(function(){
            if (searchType == "Residents" ){
              angular.forEach($scope.markerOptions.residents, function(marker){
                if (marker.options.title.toLowerCase() == $scope.searchText.toLowerCase()){
                  $scope.markerClickedOutside( marker, 'Residents');    
                  $scope.changeMapCenter(marker.coords.latitude,marker.coords.longitude);
                  $scope.changeMapZoom(21);
                }
              });
            }
            
            else if (searchType == 'Wells'){
              angular.forEach($scope.markerOptions.wells, function(marker){
                if (marker.options.title.toLowerCase() == $scope.searchText.toLowerCase()){
                  $scope.markerClickedOutside( marker, 'Wells');    
                  $scope.changeMapCenter(marker.coords.latitude,marker.coords.longitude);
                  $scope.changeMapZoom(12);
                }
              });
            }

            else if(searchType == 'MobileVendors'){
              angular.forEach($scope.markerOptions.mobileVendors, function(marker){
                if (marker.options.title.toLowerCase() == $scope.searchText.toLowerCase()){
                  $scope.markerClickedOutside( marker, 'MobileVendors');
                  $scope.changeMapCenter(marker.coords.latitude,marker.coords.longitude);    
                  $scope.changeMapZoom(12);
                }
              });
            }

            else if(searchType == 'HouseholdResellers' ){
              angular.forEach($scope.markerOptions.householdResellers, function(marker){
                if (marker.options.title.toLowerCase() == $scope.searchText.toLowerCase()){
                  $scope.markerClickedOutside( marker, 'HouseholdResellers');
                  $scope.changeMapCenter(marker.coords.latitude,marker.coords.longitude);    
                  $scope.changeMapZoom(12);
                }
              });  
            }
            else{ // StandPipes
              angular.forEach($scope.markerOptions.standPipes, function(marker){
                if (marker.options.title.toLowerCase() == $scope.searchText.toLowerCase()){
                  $scope.markerClickedOutside( marker, 'StandPipes');
                  $scope.changeMapCenter(marker.coords.latitude,marker.coords.longitude);    
                  $scope.changeMapZoom(12);
                }
              });
            }  
          },500)
        }

        $scope.markerClickedOutside = function(marker,markerType){
          //marker.id - Id of the marker
          //markerType - Type of the Marker i.e. Residents , Wells , StandPipes , MobileVendors
          //templateParameter is the Object passed to the template based on the click

          marker.windowOptions.visible = true;
          if (markerType == 'Residents'){
            
            angular.forEach($scope.allResidents, function(resident){
              if (resident.Residents.Id == marker.id ){
                $scope.templateParameter = resident.Residents;
              }
            });

          }
          else if(markerType == 'Wells'){
            angular.forEach($scope.allWells, function(well){
              if (well.Well.Id == marker.id ){
                $scope.templateParameter = well.Well;
              }
            });
          }
          else if(markerType == 'MobileVendors'){
            angular.forEach($scope.allMobileVendors, function(mobileVendor){
              if (mobileVendor.MobileVendor.Id == marker.id ){
                $scope.templateParameter = mobileVendor.MobileVendor;
              }
            });
          }
          else if(markerType == 'HouseholdResellers'){
            angular.forEach($scope.allHouseholdResellers, function(householdReseller){
              if (householdReseller.HouseholdReseller.Id == marker.id ){
                $scope.templateParameter = householdReseller.HouseholdReseller;
              }
            });  
          }
          else // 'StandPipes'
          {
            angular.forEach($scope.allStandPipes, function(standPipe){
              if (standPipe.Standpipe.Id == marker.id ){
                $scope.templateParameter = standPipe.Standpipe;
              }
            });
          }

        }

        
        $scope.closeClick = function(marker){
          marker.windowOptions.visible = false;
        }

        //Legends for the Map Marker
        $scope.legends = [{
          legendName: 'Residents',
          // legendIcon : 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|F1290E' 
          legendIcon : 'images/icons/Marker_Resident.png'
        },
        {
          legendName : 'Wells',
          // legendIcon : 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF' 
          legendIcon : 'images/icons/Marker_Well.png'
        },  
        {
          legendName : 'StandPipes',
          // legendIcon : 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|202264' 
          legendIcon : 'images/icons/Marker_StandPipes.png'
        },
        {
          legendName : 'MobileVendors',
          // legendIcon : 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|75ff55' 
          legendIcon : 'images/icons/Marker_MobileVendor.png'
        },
        {
          legendName : 'HouseholdReseller',
          // legendIcon : 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff7000' 
          legendIcon : 'images/icons/Marker_HouseholdReseller.png'
        }];

        uiGmapIsReady.promise().then(function (map_instances) {
        //var map1 = $scope.map.control.getGMap();    // get map object through $scope.map.control getGMap() function
          $scope.map = map_instances[0].map;            // get map object through array object returned by uiGmapIsReady promise
          // map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend'));
        
          // var legend = document.getElementById('legend');
          
          // angular.forEach($scope.legends, function(legendData, legendKey){
          //   var name = legendData.name;
          //   var icon = legendData.icon;
          //   var div = document.createElement('div');
          //   div.innerHTML = '<img src="' + icon  +'">' + name + '</img>';
          //   legend.appendChild(div);   
          // });
          
        });

        $scope.showMarkerType = 'All';
        $scope.showClickedMarker = function(type){
          var latLng;
          $scope.showMarkerType = type;
          if (type == 'Residents' ){
            latLng = $scope.allResidents[0].Residents.HouseLocation;
            $scope.changeMapCenter(latLng.latitude,latLng.longitude);
            $scope.changeMapZoom(21);
          }
          else{
            $scope.changeMapZoom(12);
            if(type ==  'All'){
              latLng = $scope.allMobileVendors[0].MobileVendor.GeoLocation;
              $scope.changeMapCenter(latLng.latitude,latLng.longitude);   
            }
            else if(type == 'Wells'){
              latLng = $scope.allWells[0].Well.GeoLocation;
              $scope.changeMapCenter(latLng.latitude,latLng.longitude);
            }
            else if(type == 'StandPipes'){
              latLng = $scope.allStandPipes[0].Standpipe.GeoLocation;
              $scope.changeMapCenter(latLng.latitude,latLng.longitude);
            }
            else if(type == 'HouseholdResellers'){
              latLng = $scope.allHouseholdResellers[0].HouseholdReseller.GeoLocation;
              $scope.changeMapCenter(latLng.latitude,latLng.longitude); 
            }
            else {
              //MobileVendors
              latLng = $scope.allMobileVendors[0].MobileVendor.GeoLocation;
              $scope.changeMapCenter(latLng.latitude,latLng.longitude);
            }
          }
          //$scope.$apply();
        }

        //Creating Socket Connection
        $scope.openSocket =  function()
         {
            if ("WebSocket" in window)
            {
               console.log("WebSocket is supported by your Browser!");
               
               // Opening a web socket
               var ws = new WebSocket(webSocketUrl);
        
               ws.onopen = function()
               {
                  // Web Socket is connected, send data using send()
                  ws.send('<Query Storage="TqlSubscription"> <Save> <TqlSubscription Label="TiEClock" sid="11"> <Topic> *watermanagement.distribution.* </Topic> </TqlSubscription> </Save> </Query>');
                  console.log("Message is sent...");
               };
        
               ws.onmessage = function (evt) 
               { 
                  var notifiedMsg = evt.data;
                  console.log(evt.data);
                  var notifiedXML = x2js.xml_str2json(notifiedMsg);
                  if (angular.isDefined(notifiedXML.TqlNotification)){
                    notifiedXML = notifiedXML.TqlNotification.Update
                    angular.forEach(notifiedXML, function(notifiedXMLObjectValue,notifiedXMLObject){
                      //notifiedXMLObject - It will be the ID for the particular notification(say for Resident , well , Stand Pipes etc) (Or Value of Update tag in notification XML)
                      //notifiedXMLObjectValue - It will the object containing all the updated values for the notifiedXMLObject (Or  tags inside Update tag in notification XML)
                      var newUpdateTag = true;
                      var currentResident = {};
                      var currentStandPipe = {};
                      var currentWell = {};
                      angular.forEach(notifiedXMLObjectValue, function(dateTimeValue,dateTimeKey){
                        
                        //Notification of Residents 
                        /***********************************************************************/
                        if(dateTimeKey.indexOf('watermanagement.distribution.Residents') == 0 ){
                          
                          //Finding Resident object stored in $scope.allResidents whenever Update tag changes
                          if (newUpdateTag){
                            var isResidentFound = false;
                            angular.forEach($scope.allResidents, function(resident){
                              if(!isResidentFound){
                                
                                if (resident.Residents.Id == notifiedXMLObject){
                                  currentResident=resident.Residents;
                                  newUpdateTag = false;
                                  isResidentFound = true;
                                }  
                              }
                              
                            });
                          } 
                          
                          //Assiging the notified value to the Resident object i.e currentResident
                          var notifiedResidentObjKey = dateTimeKey.split('.')[dateTimeKey.split('.').length - 1]
                          if(notifiedResidentObjKey != 'ResidentID'){
                            currentResident[notifiedResidentObjKey] = dateTimeValue._Value  
                          }

                        }
                        /***********************************************************************/
                        

                        //Notification of StandPipes 
                        /***********************************************************************/
                        if(dateTimeKey.indexOf('watermanagement.distribution.Standpipe') == 0 ){
                          
                          //Finding Resident object stored in $scope.allResidents whenever Update tag changes
                          if (newUpdateTag){
                            var isStandPipeFound = false;
                            angular.forEach($scope.allStandPipes, function(standPipe){
                              if(!isStandPipeFound){
                                
                                if (standPipe.Standpipe.Id == notifiedXMLObject){
                                  currentResident=standPipe.Standpipe;
                                  newUpdateTag = false;
                                  isStandPipeFound = true;
                                }  
                              }
                              
                            });
                          } 
                          
                          //Assiging the notified value to the StandPipe object i.e currentStandPipe
                          var notifiedWellObjKey = dateTimeKey.split('.')[dateTimeKey.split('.').length - 1]
                          if(notifiedWellObjKey != 'RecordDate'){
                            if (notifiedWellObjKey == 'WaterRevenue'){
                              currentResident[notifiedWellObjKey] = '$ ' + Number(dateTimeValue._Value).toFixed(2)    
                            }
                            else if(notifiedWellObjKey == 'WaterSold'){
                              currentResident[notifiedWellObjKey] = Number(dateTimeValue._Value).toFixed(2) + ' Ltrs'    
                            }
                            else{
                              currentResident[notifiedWellObjKey] = dateTimeValue._Value    
                            } 
                          }    
                        }
                        /***********************************************************************/

                        //Notification of Wells
                        /***********************************************************************/
                        if(dateTimeKey.indexOf('watermanagement.distribution.Well') == 0 ){
                          
                          //Finding Resident object stored in $scope.allResidents whenever Update tag changes
                          if (newUpdateTag){
                            var isWellFound = false;
                            angular.forEach($scope.allWells, function(well){
                              if(!isWellFound){
                                
                                if (well.Well.Id == notifiedXMLObject){
                                  currentWell=well.Well;
                                  newUpdateTag = false;
                                  isWellFound = true;
                                }  
                              }
                              
                            });
                          } 
                          
                          //Assiging the notified value to the Well object i.e currentWell
                          var notifiedWellObjKey = dateTimeKey.split('.')[dateTimeKey.split('.').length - 1]
                          if(notifiedWellObjKey != 'RecordDate'){
                            if (notifiedWellObjKey == 'WaterRevenue'){
                              currentResident[notifiedWellObjKey] = '$ ' + Number(dateTimeValue._Value).toFixed(2)    
                            }
                            else{
                              currentResident[notifiedWellObjKey] = dateTimeValue._Value    
                            } 
                          }  
                        }
                        /***********************************************************************/


                        if (dateTimeKey == 'watermanagement.distribution.VirtualClock.CurrentDate'){
                          $scope.notifiedDate = new Date(dateTimeValue._Known); 
                          //$scope.notifiedDate = $scope.notifiedDate.getDate();
                        }
                        if (dateTimeKey == 'watermanagement.distribution.VirtualClock.CurrentHour'){
                          $scope.notifiedTime = dateTimeValue._Known;
                          
                          
                          //Adding Logic for fetching the data from the backend for the grap representation at 22 hour daily
                          /***********************************************************************/
                          if($scope.notifiedTime == 22){
                              
                              $scope.chartData = [];

                              var count = 0;
                              //Counting the no of Residents which got water 
                              angular.forEach($scope.allResidents, function(resident){
                                if (resident.Residents.WaterAccess == 'true'){
                                  count ++;
                                }
                              });

                              //Adding the counted resident on Y axis data
                              $scope.noOfResidentsGotWater.push(count);
                              //Adding the no of days passed on X axis  
                              var formattedNotifiedDate = $filter('date')(new Date($scope.notifiedDate),'dd, MMM')
                              $scope.noOfDaysPassed.push(formattedNotifiedDate);
                              
                              angular.forEach($scope.noOfDaysPassed, function(value,key){
                                $scope.chartData.push({'label':value,'value':$scope.noOfResidentsGotWater[key]})
                              });
                              
                              $scope.myDataSource.data = $scope.chartData;

                            
                          } 
                          /***********************************************************************/
                        }

                        if (dateTimeKey == 'watermanagement.distribution.NGO.BudgetBalance'){
                          $scope.currentBalance = "$ " + Number(dateTimeValue._Value).toFixed(2);
                        }

                        $scope.$apply();
                      });
                    });

                  }
                  
               };
        
               ws.onclose = function()
               { 
                  // websocket is closed.
                  console.log("Connection is closed..."); 
               };
            }
            
            else
            {
               // The browser doesn't support WebSocket
               alert("WebSocket NOT supported by your Browser!");
            }
         }

        $scope.showTodaysStats = function(){

          $scope.showTodayStats = !$scope.showTodayStats;
        }

        $scope.showTodayStats = false
        $scope.findAllResident();
        $scope.findAllWells();
        $scope.findAllStandPipes();
        $scope.findAllMobileVendors();
        $scope.openSocket();
        $scope.findNGOBalance();
        $scope.findAllHouseholdResellers();
     
        //Chart data
        // $scope.noOfDaysPassed = ['1st Jan','2nd jan' , '3rd Jan' , '4th Jan' , '5th Jan'];
        // $scope.noOfResidentsGotWater = [600,400,300,600,900];
        $scope.chartData = [];
        //alert('11111');
        // angular.forEach($scope.noOfDaysPassed, function(value,key){
        //   chartData.push({'label':value,'value':$scope.noOfResidentsGotWater[key]})
        // });
        //console.log(chartData);
        $scope.myDataSource = {
          chart: {
            "caption": "Water Access Details",
            "subCaption": "Water Access Day by Day for Residents ",
            "xAxisName": "No of Days",
            "yAxisName": "No. of Residents",
            "lineThickness":"2",
            "paletteColors": "#0075c2",
            "baseFontColor": "#333333",
            "baseFont": "Helvetica Neue,Arial",
            "captionFontSize": "14",
            "subcaptionFontSize": "14",
            "subcaptionFontBold": "0",
            "showBorder": "0",
            "bgColor": "#ffffff",
            "showShadow": "0",
            "canvasBgColor": "#ffffff",
            "canvasBorderAlpha": "0",
            "divlineAlpha": "100",
            "divlineColor": "#999999",
            "divlineThickness": "1",
            "divLineIsDashed": "1",
            "divLineDashLen": "1",
            "divLineGapLen": "1",
            "showXAxisLine": "1",
            "xAxisLineThickness": "1",
            "xAxisLineColor": "#999999",
            "showAlternateHGridColor": "0"

          },
          data:$scope.chartData,
          "trendlines": [
            {
              "line": [
                {
                  "startvalue": "40",
                  "color": "#FF0000",
                  "displayvalue": "Average{br}Resident{br}need to{br}be fulfilled",
                  "valueOnRight": "1",
                  "thickness": "2"
                }
              ]
            }
          ]
        };
});