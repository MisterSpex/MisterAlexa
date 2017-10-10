'use strict';

const Alexa = require('alexa-sdk');
const AlexaDeviceAddressClient = require('./lib/AlexaDeviceAddressClient');
const MSxStoreFinder = require('./lib/MSxStoreFinder');
const Messages = require('./lib/Messages');

const APP_ID = "amzn1.ask.skill.ac4dda67-94cd-4676-a49f-290e22135397"
const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address:country_and_postal_code";
const PERMISSIONS = [ALL_ADDRESS_PERMISSION];


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

const findClosestStore = function(postalCode, callback) {
    const storeFinder = new MSxStoreFinder(postalCode);
    storeFinder.getClosestStore(callback);
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
                findClosestStore(address['postalCode'], function() {
                  this.emit(":tell", address['result']);
                })
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

/* Test function
findClosestStore(15366, function(result) {
  console.log(result);
})*/
