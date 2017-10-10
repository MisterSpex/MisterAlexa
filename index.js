'use strict';

const Alexa = require('alexa-sdk');
const AlexaDeviceAddressClient = require('./lib/AlexaDeviceAddressClient');
const Messages = require('./lib/Messages');
const GoogleMaps = require('@google/maps');

const Stores = ['10179', '12163', '46047', '28195'];

const APP_ID = "amzn1.ask.skill.ac4dda67-94cd-4676-a49f-290e22135397"
const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address:country_and_postal_code";
const PERMISSIONS = [ALL_ADDRESS_PERMISSION];
const GOOGLE_MAPS_KEY = "AIzaSyDCzfbiOe9c-lkvEv1tZZPdBXdPm6e2CU0";

module.exports.processor = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const requestDeviceLocation = function(apiEndpoint, deviceId, consentToken) {
    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getCountryAndPostalCode();
    return deviceAddressRequest;
};

const searchNearestStore = function(deviceLocation) {

  var googleMapsClient = GoogleMaps.createClient({
    key: GOOGLE_MAPS_KEY
  });

  var retrieveDistance = function(destination) {
    return googleMapsClient.distanceMatrix({
      origins: [deviceLocation + ', DE'],
      destinations: [destination + ', DE'],
      language: 'en',
      units: 'metric',
      region: 'EU'
    }).asPromise();
  };

  var actions = Stores.map(retrieveDistance);
  //var distanceResults = Promise.all(actions);


    //  console.log(response.json.rows[0].elements[0].distance.value);
}

var handlers = {
  'MisterSpex': function () {
    const consentToken = this.event.context.System.user.permissions.consentToken;
    if(!consentToken) {
      this.emit(":tellWithPermissionCard", Messages.DEFAULT_ANSWER_WITHOUT_NEXT_LOCATION, PERMISSIONS);
      return;
    }

    const deviceId = this.event.context.System.device.deviceId;
    const apiEndpoint = this.event.context.System.apiEndpoint;
    requestDeviceLocation(apiEndpoint, deviceId, consentToken).then((addressResponse) => {
          console.log(addressResponse);
          switch(addressResponse.statusCode) {
              case 200:
                const address = addressResponse.address;
                console.info(address['postalCode']);
                this.emit(":tell", address['postalCode']);
                searchNearestStore("15366");
                return;
              default:
                console.info("Response code: " + addressResponse.statusCode);
                this.emit(":tellWithPermissionCard", Messages.DEFAULT_ANSWER_WITHOUT_NEXT_LOCATION, PERMISSIONS);
          }
      }, (error) => {
        console.error(error);
        this.emit(":tellWithPermissionCard", Messages.DEFAULT_ANSWER_WITHOUT_NEXT_LOCATION, PERMISSIONS);
      });
  },

  'Unhandled': function() {
    this.emit(':tell', 'Ich kann dich leider nicht verstehen');
  },
}

//https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=Hoppegarten,DE&destinations=Berlin,DE&key=AIzaSyDCzfbiOe9c-lkvEv1tZZPdBXdPm6e2CU0
