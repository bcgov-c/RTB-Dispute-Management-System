/**
 * @fileoverview - Contains validation helper functions for both Canada Post API integrations - Address lookup, tracking number lookup
 */

import Radio from 'backbone.radio';

const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');

export default  {
  hasError: (trackingData) => {
    const noMatchingResultError =  trackingData?.['messages']?.message?.code === '004';
    const apiLimitReachedError = trackingData?.['messages']?.message?.code === 'Server';
    return noMatchingResultError || apiLimitReachedError;
  },

  getTrackingDisplay: (trackingData) => {
    let displayText = '';
    const noMatchingResultError =  trackingData?.['messages']?.message?.code === '004';
    const apiLimitReachedError = trackingData?.['messages']?.message?.code === 'Server';
    const hasError = noMatchingResultError || apiLimitReachedError;

    if (!hasError && trackingData) {
      let deliveryEvents = trackingData?.['tracking-detail']?.['significant-events']?.occurrence;
      deliveryEvents = deliveryEvents && !Array.isArray(deliveryEvents) ? [deliveryEvents] : deliveryEvents;
      const createdDate = deliveryEvents?.[deliveryEvents.length - 1]?.['event-date'];
      const deliveredEvent = deliveryEvents?.find?.(item => item?.['event-description'] === 'Delivered');
      const signedEvent = deliveryEvents?.find?.(item => item?.['event-description'] === 'Signature available');
      const deliveryDate = deliveredEvent?.['event-date'];
      const deliveryCity = deliveredEvent?.['event-site'];
      const deliveryProvince = deliveredEvent?.['event-province'];
      displayText = `${
        createdDate ? `Verified: Mailed on ${Formatter.toDateDisplay(createdDate)}` : ''}${
        deliveryDate ? ` - Delivered ${Formatter.toDateDisplay(deliveryDate)}` : ' - Not delivered'}${
        signedEvent ? ', Signed' : ', Not signed'}${deliveryCity ? `, ${deliveryCity}` : ''}${
        deliveryProvince ? `, ${deliveryProvince}` : ''}`;
    } else {
      displayText = 
        noMatchingResultError ? `Not Verified: No matching results found for this tracking number.` : 
        apiLimitReachedError ? `Not Verified: Unable to connect to Canada Post` :
        '';
    }

    return displayText;
  },

  isDelivered: (trackingData) => {
    let deliveryEvents = trackingData?.['tracking-detail']?.['significant-events']?.occurrence;
    deliveryEvents = deliveryEvents && !Array.isArray(deliveryEvents) ? [deliveryEvents] : deliveryEvents;
    const deliveredEvent = deliveryEvents?.find?.(item => item?.['event-description'] === 'Delivered');
    const deliveryDate = deliveredEvent?.['event-date'];

    return !!deliveryDate;
  },

  validateCPTrackingNumber: (trackingCode) => {
    const apiName = `${configChannel.request('get', 'API_ROOT_URL')}other/canadapostdelivery/${trackingCode}`;

    return new Promise((res, rej) => {
      apiChannel.request('call', {
        type: 'GET',
        url: `${apiName}`,
      }).done((response={}) => {
        res(response);
      }).fail((err) => {
        rej(err);
      });
    });
  },

  lookupAddress: (searchValue, params) => {
    const defaultParams = {
      Key: configChannel.request('get', 'CP_API_KEY'),
      Country: 'CAN',
      SearchTerm: searchValue,
      LanguagePreference: 'en',
      SearchFor: 'Everything',
      OrderBy: 'UserLocation',
      $block: true,
      $cache: true,
    };

    const searchParams = {...defaultParams, ...params};
    
    return apiChannel.request('call', {
      method: 'GET',
      url: `${configChannel.request('get', 'CP_API_ROOT')}/AddressComplete/Interactive/Find/v2.10/json3ex.ws?${$.param(searchParams, true)}`
    });
  }
}