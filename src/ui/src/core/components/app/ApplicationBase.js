/**
 * @fileoverview - Contains core helper functions used in application.js files accross sites. 
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const apiChannel = Radio.channel('api');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export const ApplicationBaseModelMixin = {

  mixin_isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
  mixin_invalidBrowserWarningMsg: `This site was fully tested on newer versions of Google Chrome. You appear to be using a non-tested browser or an older version of Chrome that may not work as expected.\r\n\r\nAre you sure you would like to continue?`,
  currentUTCDate: null,
  
  mixin_getChromeVersion() {     
    const match = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return match ? parseInt(match[2], 10) : false;
  },

  mixin_isValidBrowser() {
    const chromeVersion = this.mixin_getChromeVersion();
    return this.mixin_isChrome && (!chromeVersion || chromeVersion > 20);
  },

  mixin_loadAndStartApplicationWithBrowserCheck(marionetteApp) {
    if (!marionetteApp) {
      console.trace(`[Error] Was not passed an instance of Marionette Application`);
      return;
    }

    this.load().then(() => {
      if (this.mixin_isValidBrowser() || confirm(this.mixin_invalidBrowserWarningMsg)) {
        marionetteApp.start();
      } else {
        if (sessionChannel.request('is:login:siteminder')) {
          marionetteApp.initializeAppRouter();
          if (!Backbone.History.started) {
            Backbone.history.start({ silent: true });
          }
        } else {
          marionetteApp.start();
        }
        Backbone.history.navigate('logout', { trigger: true });
      }
    }, err => {
      console.debug(err);
      alert("Error loading initial application data");
    });
  },

  // In this case, we are loading the application from the cookie or url
  _validateTokenPromise(token, postLoginPromises=[]) {
    return new Promise((res, rej) => {
      sessionChannel.request('check:token', token)
        .then(() => {
          localStorage.setItem('authToken', token);
          return sessionChannel.request('load:user:details', token);
        })
        .then(() => Promise.all(postLoginPromises.map(p => p())))
        .then(() => res())
        .catch(rej);
    });
  },


  mixin_checkSiteVersionAndLogin(postLoginPromises) {
    postLoginPromises = _.isEmpty(postLoginPromises) || !postLoginPromises ? [] : postLoginPromises;
    const dfd = $.Deferred();
    this.mixin_checkVersion().done(response => {
      response = response || {};

      sessionChannel.request('set:login:type', response.token_method);
      const isSiteminderLogin = sessionChannel.request('is:login:siteminder');
      
      const urlToken = UtilityMixin.util_getParameterByName('token');
      const savedToken = localStorage.getItem('authToken');
      const tokenToUse = urlToken ? urlToken : savedToken;

      if (urlToken) {
        // Always remove the Token from the URL first
        window.history.pushState({}, null, UtilityMixin.util_removeURLParameter(window.location.href, 'token'));
      }

      if (!tokenToUse) {
        if (isSiteminderLogin) {
          // No cookie or url token - redirect to login page
          sessionChannel.trigger('logout:complete');
          sessionChannel.trigger('redirect:login');
        } else {
          Backbone.history.navigate('login', { trigger: true, replace: false });
        }
        return dfd.resolve().promise();
      } else {
        this._validateTokenPromise(tokenToUse, postLoginPromises).then(() => {
          sessionChannel.request('authorize:token', tokenToUse, { disableNav: !urlToken && !!savedToken });
          dfd.resolve();
        }, () => {
          Backbone.history.navigate('login', { trigger: true, replace: false });
          dfd.resolve();
        });
      }
      
    }).fail(dfd.reject);

    return dfd.promise();
  },

  mixin_checkVersion() {
    const dfd = $.Deferred();
    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}version`
    }).done(response => {
      response = response || {};
      this.currentUTCDate = response.current_utc_date_time;
      dfd.resolve(response);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  mixin_checkClientTimeSyncAndLogout() {
    if(!this.currentUTCDate) {
      console.log('[Error] Time sync could not be validated due to missing server time response from version API');
      return;
    }
    const CHECK_TIME_SYNC = configChannel.request('get', 'CHECK_TIME_SYNC');
    if(!CHECK_TIME_SYNC) return;

    const ALLOWABLE_TIME_SYNC_DIFFERENCE_MINUTES = configChannel.request('get', 'ALLOWABLE_TIME_SYNC_DIFFERENCE_MINUTES');
    const clientTime = Moment.utc();
    const serverTime = Moment(this.currentUTCDate);
    const allowedPositiveSyncDifference = Moment(serverTime).add(ALLOWABLE_TIME_SYNC_DIFFERENCE_MINUTES, 'minutes');
    const allowedNegativeSyncDifference = Moment(serverTime).subtract(ALLOWABLE_TIME_SYNC_DIFFERENCE_MINUTES, 'minutes');

    if (clientTime.isBetween(serverTime, allowedPositiveSyncDifference) || clientTime.isBetween(allowedNegativeSyncDifference, serverTime)) {
      console.log('[Success] Client and server time sync successful');
      return;
    } else {
      const logoutTimer = setTimeout(() => Backbone.history.navigate('logout', { trigger: true }), 60000);//log out after one minute
      const modalView = modalChannel.request('show:standard', {
        title: 'Computer Time Error',
        bodyHtml: `
        <p>
        Your computer time appears to be incorrect and outside of allowed tolerances to use these systems.  We use your computer time to record the time of your submissions.  
        As the date and time of your actions are important to the outcomes of your dispute file you cannot continue until your computer time is corrected.
        </p>
        <p>
          <div style="margin-left: 15px;">Your Detected Computer Time: ${Formatter.toDateAndTimeWithSecondsDisplay(clientTime, Moment.tz.guess())}</div>
          <div style="margin-left: 15px;">Our Detected Systems Time: ${Formatter.toDateAndTimeWithSecondsDisplay(serverTime.local(), Moment.tz.guess())}</div>
        </p>
        <p>Please ensure that you have the correct date and timezone on your computer or device.</p>
        <p>If you think you are receiving this message in error, please contact the Residential Tenancy Branch.</p>
        `,
        primaryButtonText: 'Exit System',
        hideCancelButton: true,
        onContinueFn(modalView) {
          modalView.close(); 
        }
      });

      this.listenTo(modalView, 'removed:modal', () => {
        loaderChannel.trigger('page:load');
        clearTimeout(logoutTimer);
        Backbone.history.navigate('logout', { trigger: true }); 
      });
    }
  }
};