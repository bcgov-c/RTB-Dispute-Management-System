import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const rtbAnalyticsFilePath = './rtb_analytics.js';

let analyticsFailedToLoad = false;

const isAnalyticsEnabled = () => !analyticsFailedToLoad && configChannel.request('get', 'UAT_TOGGLING')?.ENABLE_RTB_ANALYTICS && 
    configChannel.request('get', 'UAT_TOGGLING')?.RTB_ANALYTICS_TARGET;

const initializeAnalyticsTracking = async () => {
  if (!isAnalyticsEnabled()) return;
  const { startPlowing } = await import(`${rtbAnalyticsFilePath}`);
  const trackerUrl = configChannel.request('get', 'UAT_TOGGLING')?.RTB_ANALYTICS_TARGET;
  if (typeof startPlowing === 'function') {
    try {
      startPlowing.call(window, trackerUrl);
    } catch (err) {
      analyticsFailedToLoad = true;
    }
  }
};

const trackEvent = (eventData={}) => {
  if (!isAnalyticsEnabled()) return;
  try {
    window.snowplow('trackSelfDescribingEvent', {
      schema: 'iglu:ca.bc.gov.rtb/click/jsonschema/1-0-0',
      data: eventData
    });
  } catch (err) {
    console.debug('[Error] Unable to log rtb analytics event', eventData);
  }
};

// Pass in a url to track navigation to.
// Always uses current url as the source
const trackUrlClickEvent = (targetUrl) => {
  trackEvent({
    source_url: window.location.href,
    target_url: targetUrl
  });
};

export default {
  initializeAnalyticsTracking,
  trackUrlClickEvent,
};
