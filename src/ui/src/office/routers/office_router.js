import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';

const sessionChannel = Radio.channel('session');
const disputeChannel = Radio.channel('dispute');

const routes = {
  login: 'login',
  logout: 'logout',
  loginPage: 'login-page',
  logoutPage: 'logout-page',
  main: 'main',
  default: '*page'
};

const routesWithAssociatedData = Object.assign(...([
  'pay/:feeId',
  'pay/waiver/:feeId',
  'new',
  'new/2',
  'new/3',
  'clarification',
  'correction',
  'review',
  'amendment',
  'substituted-service',
  'pickup'
].map(key => ({ [key]: true }))));

export const doesCurrentURLHaveAssociatedData = () => {
  const currentRoute = Backbone.history.getFragment();
  return _.has(routesWithAssociatedData, currentRoute);
};

export const AppRouter = Marionette.AppRouter.extend({
  appRoutes: {
    [routes.main]: 'showOfficeMainView',
    'pay/waiver/:feeId': 'showOfficeFeeWaiver',
    'pay/:feeId': 'showOfficePayment',
    'new': 'showNewDisputePage',
    'new/2': 'showNewDisputeUploadsPage',
    'new/3': 'showNewDisputePaymentsPage',
    'new/receipt': 'showNewDisputeReceiptPage',
    'clarification': 'showClarificationPage',
    'clarification/receipt': 'showClarificationReceiptPage',
    'correction': 'showCorrectionPage',
    'correction/receipt': 'showCorrectionReceiptPage',
    'review': 'showReviewPage',
    'review/receipt': 'showReviewReceiptPage',
    'amendment': 'showAmendmentPage',
    'amendment/receipt': 'showAmendmentReceiptPage',
    'substituted-service': 'showSubstitutedServicePage',
    'substituted-service/receipt': 'showSubstitutedServiceReceiptPage',
    'pickup': 'showPickupPage',
    'pickup/receipt': 'showPickupReceiptPage',

    [routes.login]: 'handleRouterLogin',
    [routes.logout]: 'handleRouterLogout',
    [routes.loginPage]: 'showLoginView',
    [routes.logoutPage]: 'showLogoutView',

    [routes.default]: 'onLoginComplete'
  },

  pagesNeedingAuth: {
    [routes.main]: true,
    'pay/:feeId': true,
    'pay/waiver/:feeId': true,
    new: true,
    'new/2': true,
    'new/3': true,
    'new/receipt': true,
    clarification: true,
    'clarification/receipt': true,
    correction: true,
    'correction/receipt': true,
    review: true,
    'review/receipt': true,
    amendment: true,
    'amendment/receipt': true,
    'substituted-service': true,
    'substituted-service/receipt': true,
    'pickup': true,
    'pickup/receipt': true
  },

  pagesNeedingDispute: {
    'pay/:feeId': true,
    'pay/waiver/:feeId': true,
    'new/2': true,
    'new/3': true,
    'new/receipt': true,
    clarification: true,
    'clarification/receipt': true,
    correction: true,
    'correction/receipt': true,
    review: true,
    'review/receipt': true,
    amendment: true,
    'amendment/receipt': true,
    'substituted-service': true,
    'substituted-service/receipt': true,
    'pickup': true,
    'pickup/receipt': true,
  },

  _routeMatches(route, matchingStrings) {
    if (!_.isArray(matchingStrings)) {
      matchingStrings = [matchingStrings];
    }
    return _.contains(matchingStrings, route);
  },

  routeRequiresAuth(route) {
    return this._routeMatches(route, routes.default) || _.has(this.pagesNeedingAuth, route);
  },

  routeIsLogout(route) {
    return this._routeMatches(route, [routes.logout, routes.logoutPage]);
  },

  routeIsLogin(route) {
    return this._routeMatches(route, [routes.login, routes.loginPage]);
  },

  routeRequiresDispute(route) {
    return _.has(this.pagesNeedingDispute, route);
  },

  routeIsReceipt(route) {
    return $.trim(route).indexOf('receipt') !== -1;
  },

  before(route) {
    const isLogout = this.routeIsLogout(route);
    const isLogin = this.routeIsLogin(route);
    const userIsAuthorized = sessionChannel.request('is:authorized');

    // If routing to logout* pages, or a login page when we're not auth'd then always route right away
    if (isLogout || (isLogin && !userIsAuthorized)) {
      return true;
    }

    let replacement_route;

    if (this.routeRequiresAuth(route) && !userIsAuthorized) {
      replacement_route = routes.login;
    } else if (
      // If we are logged in and trying to go back to the login page, move to main page instead
        (isLogin && userIsAuthorized) ||
      // Also route to main if we need a dispute but don't have one loaded already
        (this.routeRequiresDispute(route) && !disputeChannel.request('get:id'))
    ) {
      replacement_route = routes.main;
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
