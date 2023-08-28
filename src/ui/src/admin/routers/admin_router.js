import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';

const sessionChannel = Radio.channel('session');

const routes = {
  login: 'login',
  logout: 'logout',
  loginPage: 'login-page',
  logoutPage: 'logout-page',
  default: '*page'
};

export default Marionette.AppRouter.extend({
  appRoutes: {
    [routes.login]: 'handleRouterLogin',
    [routes.logout]: 'handleRouterLogout',
    [routes.loginPage]: 'showLoginView',
    [routes.logoutPage]: 'showLogoutView',
    [routes.default]: 'performRoutingActionOnLoginComplete'
  },

  pagesNeedingAuth: {
    [routes.landing]: true
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

  
  before(route) {
    const isLogout = this.routeIsLogout(route);
    const isLogin = this.routeIsLogin(route);
    const userIsAuthorized = sessionChannel.request('is:authorized');

    // If routing to logout* pages, or a login page when we're not auth'd then always route right away
    if (isLogout || (isLogin && !userIsAuthorized)) {
      return true;
    }
    
    let replacement_route;

    if (isLogin && userIsAuthorized) {
      replacement_route = [routes.landing];
    } else if (this.routeRequiresAuth(route) && !userIsAuthorized) {
      replacement_route = routes.login;
    }

    if (replacement_route && replacement_route !== route) {
      Backbone.history.navigate(replacement_route, { trigger: true });
      return false;
    }
  }
});
