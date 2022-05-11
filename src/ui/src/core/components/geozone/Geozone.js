/**
 * @class core.utilities.Geozone
 * @memberof core.utilities
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import scriptjs from 'scriptjs';

const configChannel = Radio.channel('config');

/**
 * @property {string} GOOGLE_MAPS_API - The URL to import the Google Maps API library we use for the geozone lookups.
*/
const GOOGLE_MAPS_API = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCtZaawI1WzMzyeko6n4F5L-xQH7o1zDl0&libraries=geometry';

const Geozone = Marionette.Object.extend({

  channelName: 'geozone',

  onLoadFail: false,

  radioRequests: {
    'load': 'loadGoogleMapsAPI',
    'lookup:address': 'addressLookup'
  },
  
  loadGoogleMapsAPI() {
    const initializeGeocoderFn = _.bind(this.initializeGeocoder, this),
      dfd = $.Deferred(),
      self = this;
    scriptjs(GOOGLE_MAPS_API, function(response) {
      // Initiailze the Geozone instance and its channel
      initializeGeocoderFn();
      dfd.resolve();
    }, function() {
      console.log(`[Error] Problem loading Google Maps API`);
      self.onLoadFail = true;
      dfd.reject();
    });
    return dfd.promise();
  },

  initialize() {
    this.initializeGeocoder();
  },

  initializeGeocoder() {
    if (!window.google || _.isEmpty(window.google)) {
      console.log(`[Warning] Google Maps API not properly loaded, call 'load:googleMaps'`);
      this._geocoder = null;
      this.onLoadFail = true;
    } else {
      this.onLoadFail = false;
      this._geocoder = new window.google.maps.Geocoder();
      this.loadGeocodeZones();
    }
  },

  loadGeocodeZones() {
    this._geocode_zones = {};
    _.each(_.object([['VICTORIA_GEOZONE_CODE', 'victoria_poly_fill'], ['KELOWNA_GEOZONE_CODE', 'kelowna_poly_fill'], ['BURNABY_GEOZONE_CODE', 'burnaby_poly_fill']]),
        function(config_name, code_string) {
          this._geocode_zones[ configChannel.request('get', code_string) ] = configChannel.request('get', config_name);
    }, this);
  },

  addressLookup(address_string) {
    let geozone_val = configChannel.request('get', 'INVALID_GEOZONE_CODE');

    if (!this._geocoder) {
      console.log(`[Warning] Tried to lookup address"${address_string}" on a google maps api that was not properly initialized`);
      this.getChannel().trigger('lookup:address:complete', geozone_val);
      return;
    }

    if (this.onLoadFail) {
      console.log('[Warning] Setting address geozone to 4 because initial loading of geozone map API had failed.');
      geozone_val = configChannel.request('get', 'INVALID_GEOZONE_ERROR');
      this.getChannel().trigger('lookup:address:complete', geozone_val);
      return;      
    }

    const self = this;
    this._geocoder.geocode({ 'address': address_string }, function(results, status) {
      if (status === 'OK' && results.length === 1) {
        _.each(self._geocode_zones, function(geozone_points, geozone_code) {
          if (geozone_points && !_.isEmpty(geozone_points) && self._isPointInside(results[0].geometry.location, geozone_points)) {
            geozone_val = geozone_code;
          }
        });
      } else if (status === 'ZERO_RESULTS') {
          geozone_val = configChannel.request('get', 'INVALID_GEOZONE_CODE');
      } else if (status === 'INVALID_REQUEST' || status === 'UNKNOWN_ERROR' || status === 'REQUEST_DENIED' || status === 'ERROR') {
        // API call error of some sort while checking address
        geozone_val = configChannel.request('get', 'INVALID_GEOZONE_ERROR');
      }
      self.getChannel().trigger('lookup:address:complete', geozone_val);
    });
  },

  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  _isPointInside(point, polygon) {
    const x = point.lng(),
      y = point.lat();

    let inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng,
        yi = polygon[i].lat;
      const xj = polygon[j].lng,
        yj = polygon[j].lat;

      const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

});

const geozoneInstance = new Geozone();

export default geozoneInstance;
