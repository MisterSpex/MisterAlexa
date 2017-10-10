'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const storeLocations = ['28195, DE', '10179, DE', '12163, DE', '46047, DE'];


/** This is a small wrapper client for Google Distance Matrix API to find the closest Mister Spex store. */
class StoreFinder {

    constructor(deviceLocation) {
        this.deviceLocation = deviceLocation;

        // Initialize and promisify distance calculator based on Google Maps
        this.distanceCalculator = Promise.promisifyAll(require('google-distance-matrix'));
        this.distanceCalculator.key("AIzaSyDCzfbiOe9c-lkvEv1tZZPdBXdPm6e2CU0");
    }

    getClosestStore(callback) {
      // Calculate distance from current location to all stores
      var request = this.distanceCalculator.matrixAsync([this.deviceLocation + ', DE'], storeLocations).then(function(data) {
        var distances = data.rows[0].elements;

        // Map distances to store locations
        for(var i = 0; i < distances.length; i++) {
          distances[i].store = storeLocations[i];
        }

        distances = _.sortBy(distances, [function(o) {return o.distance.value}])
          callback(distances[0].store);
      });
    }
}

module.exports = StoreFinder;
