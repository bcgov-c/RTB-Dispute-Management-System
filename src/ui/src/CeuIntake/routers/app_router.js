import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';

const routes = {
  main: 'CeuIntake(/)',
  login: 'login',
  logout: 'logout',
  loginPage: 'login-page',
  logoutPage: 'logout-page',
  default: '*page'
};

export default Marionette.AppRouter.extend({
  appRoutes: {
    [routes.main]: 'handleRouterCeuIntake',
    [routes.login]: 'handleRouterLogin',
    [routes.logout]: 'handleRouterLogout',
    [routes.loginPage]: 'showLoginView',
    [routes.logoutPage]: 'showLogoutView',    
    [routes.default]: 'handleRouterLogin'
  },

  _routeMatches(route, matchingStrings) {
    if (!_.isArray(matchingStrings)) {
      matchingStrings = [matchingStrings];
    }
    return _.contains(matchingStrings, route);
  },

  routeIsLogout(route) {
    return this._routeMatches(route, [routes.logout, routes.logoutPage]);
  },

  routeIsLogin(route) {
    return this._routeMatches(route, [routes.login, routes.loginPage]);
  },

  // Cancels routing, and replaces the url history with the current page
  cancelRouteResetRoute() {
    // Set url to be the former one this.controller
    const prev_route = this.controller.getCurrentViewRoutingFragment();
    if (prev_route) {
      Backbone.history.navigate(prev_route, {trigger: false, replace: true});
    }
    return false;
  },

  before(route) {
  }
});
