var Alexa = require('alexa-sdk');
const APP_ID = "amzn1.ask.skill.ac4dda67-94cd-4676-a49f-290e22135397"

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
  'MisterSpex': function () {
        this.emit(':tell', 'Mister Spex hat Geschäfte in Berlin, Bremen und Oberhausen.');
    },

    'Unhandled': function() {
      this.emit(':ask', 'Ich kann dich leider nicht verstehen');
    },

}


// https://api.amazonalexa.com/v1/devices/{deviceId}/settings/address/countryAndPostalCode
