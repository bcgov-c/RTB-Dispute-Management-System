import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';
import UtilityMixin from '../../core/utilities/UtilityMixin';

const accessChannel = Radio.channel('access');
const sessionChannel = Radio.channel('session');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

const routes = {
  access: 'access',
  paymentReturnItem: 'loadTxn',
  externalReturnItem: 'loadExt',
  login: 'login',
  logout: 'logout',
  loginPage: 'login-page',
  logoutPage: 'logout-page',
  default: '*page'
};

export default Marionette.AppRouter.extend({
  appRoutes: {
    [routes.access]: 'showAccessView',
    'update/contact': 'showUpdateContactView',
    'update/contact/receipt': 'showUpdateContactReceiptView',
    'update/notice/service/receipt': 'showNoticeServiceReceiptView',
    'update/notice/service': 'showUpdateNoticeServiceView',
    'modify/notice/service': 'showModifyNoticeServiceView',
    'evidence': 'showEvidenceSummaryView',
    'evidence/upload': 'showEvidenceUploadView',
    'evidence/receipt': 'showEvidenceUploadReceiptView',
    'pay/:feeId': 'showPaymentPageView',
    'pay/:feeId?*': 'showPaymentPageView',
    'payment/receipt': 'showPaymentReceiptPageView',
    [routes.paymentReturnItem]: 'loadPaymentReturnAndShowView',
    'correction': 'showCorrectionView',
    'correction/receipt': 'showCorrectionClarificationReceiptView',
    'clarification': 'showClarificationView',
    'clarification/receipt': 'showCorrectionClarificationReceiptView',
    'review/step:stepNum': 'showReviewView',
    'review-pay': 'showReviewPaymentView',
    'substituted-service': 'showSubstituteServiceView',
    'substituted-service/receipt': 'showSubstituteServiceReceiptView',
    [routes.externalReturnItem]: 'loadExternalReturnAndLogin',
    'recovery': 'showAccessCodeRecoveryView',
    
    [routes.login]: 'handleRouterLogin',
    [routes.logout]: 'handleRouterLogout',
    [routes.loginPage]: 'showLoginView',
    [routes.logoutPage]: 'showLogoutView',
    
    [routes.default]: 'showLoginView'
  },

  pagesNeedingAuth: {
    'update/contact': true,
    'update/contact/receipt': true,
    'update/notice/service/receipt': true,
    'update/notice/service': true,
    'modify/notice/service': true,
    evidence: true,
    'evidence/upload': true,
    'evidence/receipt': true,
    'pay/:feeId': true,
    'pay/:feeId?*': true,
    'payment/receipt': true,
    'correction': true,
    'correction/receipt': true,
    'clarification': true,
    'clarification/receipt': true,
    'review/step:stepNum': true,
    'review/receipt': true,
    'review-pay': true,
    'substituted-service': true,
    'substituted-service/receipt': true
  },

  _routeMatches(route, matchingStrings) {
    if (!_.isArray(matchingStrings)) {
      matchingStrings = [matchingStrings];
    }
    return _.contains(matchingStrings, route);
  },

  routeRequiresAuth(route) {
    // For DA site, these pages also need a dispute
    return this._routeMatches(route, routes.default) || _.has(this.pagesNeedingAuth, route);
  },

  routeIsLogout(route) {
    return this._routeMatches(route, [routes.logout, routes.logoutPage]);
  },

  routeIsLogin(route) {
    return this._routeMatches(route, [routes.login, routes.loginPage]);
  },

  routeIsAccess(route) {
    return this._routeMatches(route, routes.access);
  },

  routeIsReceipt(route) {
    return $.trim(route).indexOf('receipt') !== -1;
  },

  routeIsAddFiles(route) {
    return /evidence\/upload/.test(route);
  },

  routeIsEvidence(route) {
    return /evidence/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsUpdateContact(route) {
    return /update\/contact/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsNoticeService(route) {
    return /(update||modify)\/notice\/service/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsCorrection(route) {
    return /correction/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsClarification(route) {
    return /clarification/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsReviewStep(route) {
    return /review\/step/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsReviewPayment(route) {
    return /review-pay/.test(route) && !this.routeIsReceipt(route);
  },

  routeIsSubServe(route) {
    return /substituted-service/.test(route) && !this.routeIsReceipt(route);
  },

  _isRouteRestricted(route) {
    const dispute = disputeChannel.request('get');
    const isDisputeOpen = dispute && dispute.get('disputeAccessOpen');
    
    const restricted_conditions = [
      // The Access page can be accessed with a token or if the dispute is closed
      (this.routeIsAccess(route) && (
        (!sessionChannel.request('is:authorized') && isDisputeOpen) ||
        (!isDisputeOpen && !dispute)
      )),
      (!this.routeIsReceipt(route) && this.controller.model.get('routingReceiptMode') && !this.routeIsLogout(route)),
      (this.routeIsReceipt(route) && !this.controller.model.get('routingReceiptMode')),
      // Now check access rules for individual action pages
      (this.routeIsEvidence(route) && !accessChannel.request('external:evidence')),
      (this.routeIsUpdateContact(route) && !accessChannel.request('external:contact')),
      (this.routeIsNoticeService(route) && !accessChannel.request('external:notice')),
      (this.routeIsCorrection(route) && !accessChannel.request('external:correction')),
      (this.routeIsClarification(route) && !accessChannel.request('external:clarification')),
      (this.routeIsReviewStep(route) && !accessChannel.request('external:review')),
      (this.routeIsReviewPayment(route) && !accessChannel.request('external:review:payment')),
      (dispute && this.routeIsSubServe(route) && !accessChannel.request('external:subserv', dispute?.get('tokenParticipantId')))
    ];

    return _.any(restricted_conditions);
  },

  before(route) {
    const dispute = disputeChannel.request('get');
    const tokenParticipantId = dispute && dispute.get('tokenParticipantId');
    const isLogout = this.routeIsLogout(route);
    const isLogin = this.routeIsLogin(route);
    const userIsAuthorized = sessionChannel.request('is:authorized');
    const reviewTokenStr = localStorage.getItem('_dmsReviewToken');
    if (reviewTokenStr) {
      try {
        const reviewTokenObj = JSON.parse(reviewTokenStr);
        const dayChanged = reviewTokenObj.exp !== (new Date).getDate();
        const participantChanged = tokenParticipantId && tokenParticipantId !== reviewTokenObj.pid;
        if (dayChanged || participantChanged) {
          localStorage.removeItem('_dmsReviewToken');
          this.controller.model.set({ reviewDataCache: null });
        } else {
          this.controller.model.set({ reviewDataCache: reviewTokenObj || null });
        }
      } catch (e) {
        localStorage.removeItem('_dmsReviewToken');
      }
    }

    if (route === routes.paymentReturnItem) {
      const paymentTokenStr = sessionStorage.getItem('_dmsPaymentToken');
      sessionStorage.removeItem('_dmsPaymentToken');
      // If on payment return site, automatically use the auth/payment cookie and proceed
      try {
        if (!paymentTokenStr) throw new Error();

        const paymentTokenObj = JSON.parse(paymentTokenStr);
        const t = atob(paymentTokenObj.t);
        const splitT = t.split('!#');
        const splitAc = splitT.slice(-1)[0].split('!@#');
        const _ac = splitAc[0];
        const _sn = splitAc[1];
        
        if (atob(paymentTokenObj.ac) !== String(UtilityMixin.util_hash(_ac)) ||
            (new Date()).getTime() > paymentTokenObj.exp) {
          throw new Error();
        }
        
        const tokenToUse = splitT.slice(0, -1).join('-');
        if (_ac) this.controller.model.set({ accessCode: _ac });
        if (_sn) this.controller.model.set({ submitterName: _sn });

        sessionChannel.request('authorize:token', tokenToUse, {skip_routing: true});
        return true;
      } catch (err) {
        const logoutModal = modalChannel.request('show:standard', {
          title: 'Session Expired - Unauthorized',
          bodyHtml: `<p>Your session has expired or has been terminated.  To continue you will need to login again.  Press Continue to login again.</p>`,
          onContinueFn(modaView) {
            modaView.close();
          },
          hideCancelButton: true
        });

        logoutModal.once('removed:modal', function() {
          loaderChannel.trigger('page:load');
          setTimeout(() => Backbone.history.navigate('logout', { trigger: true }), 50);
        });

        modalChannel.request('add', logoutModal);

        return false;
      }
    }

    if (route === routes.externalReturnItem) {
      const tokenStr = localStorage.getItem('_dmsDaAuthToken');
      localStorage.removeItem('_dmsDaAuthToken');
      try {
        if (!tokenStr) throw new Error();
        const tokenObj = JSON.parse(tokenStr);
        const t = atob(tokenObj.t);
        const splitT = t.split(':');
        const _ac = splitT[0];
        const _sn = splitT[1];
        
        if (atob(tokenObj.ac) !== String(UtilityMixin.util_hash(_ac)) ||
            (new Date()).getTime() > tokenObj.exp) {
          throw new Error();
        }
        
        if (_ac) this.controller.model.set({ accessCode: _ac });
        if (_sn) this.controller.model.set({ submitterName: _sn });
        if (tokenObj.s) this.controller.model.set({ extSiteId: tokenObj.s });
        if (tokenObj.a) this.controller.model.set({ extActionId: tokenObj.a });
        return true;
      } catch (err) {
        console.log(err);
        sessionChannel.trigger('logout:start');
        return false;
      }
    }

    // If routing to logout* pages, or a login page when we're not auth'd then always route right away
    if (isLogout || (isLogin && !userIsAuthorized)) {
      return true;
    }

    let replacement_route;
    
    if (this.routeRequiresAuth(route) && (!userIsAuthorized || !disputeChannel.request('get'))) {
      replacement_route = routes.login;
    } else if (isLogin && userIsAuthorized) {
      // If they're logged in and going to login page, redirect into the main page
      replacement_route = routes.access;
    } else if (this._isRouteRestricted(route)) {
      replacement_route = this.routeIsAccess(route) ? routes.login : routes.access;
    }

    if (!this.routeIsReceipt(route)) {
      this.controller.clearReceiptData();
    }

    if (replacement_route && replacement_route !== route) {
      Backbone.history.navigate(replacement_route, { trigger: true });
      return false;
    }
  }

});
