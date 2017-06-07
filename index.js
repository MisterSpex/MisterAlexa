'use strict';
var Alexa = require('alexa-sdk');
var appId = '';

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handler);
   alexa.appId = appId;
  alexa.execute();
};

var handler = {
  'FindNextPOorStoreIntent': function() {
    var defaultResponse = 'The next Mister Spex Store is at the Alexa shopping center'
    this.emit(':tell', defaultResponse);

  }

}
