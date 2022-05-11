import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';

const sessionChannel = Radio.channel('session');
const applicationChannel = Radio.channel('application');

const routes = {
  list: 'list',
  login: 'login',
  logout: 'logout',
  loginPage: 'login-page',
  logoutPage: 'logout-page',
  default: '*page'
};

export default Marionette.AppRouter.extend({
  appRoutes: {
    [routes.list]: 'showListView',
    [routes.login]: 'handleRouterLogin',
    [routes.logout]: 'handleRouterLogout',
    [routes.loginPage]: 'showLoginView',
    [routes.logoutPage]: 'showLogoutView',
    
    [routes.default]: 'onLoginComplete'
  },

  pagesNeedingAuth: {
    [routes.list]: true
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

  routeIsList(route) {
    return this._routeMatches(route, routes.list);
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
    const isLogout = this.routeIsLogout(route);
    const isLogin = this.routeIsLogin(route);
    const isList = this.routeIsList(route);
    const userIsAuthorized = sessionChannel.request('is:authorized');

    // If routing to logout* pages, or a login page when we're not auth'd then always route right away
    if (isLogout || (isLogin && !userIsAuthorized)) {
      return true;
    }
    
    let replacement_route;

    // If user is logged in and tries to go to the login page again, move them to the list page instead
    if (isLogin && userIsAuthorized) {
      replacement_route = routes.list;
    } else if (this.routeRequiresAuth(route) && !userIsAuthorized) {
      replacement_route = routes.login;
    }

    // Only check for page changes if we haven't already modified this route -
    // This will only match when on "list'" route matched here is either login or logout, and we never want to check for page changes on those redirects
    if (!replacement_route) {
      // Now check for unsaved page changes
      const pageApiUpdates = this.controller.getPageApiUpdates();
      if (pageApiUpdates && !_.isEmpty(pageApiUpdates)) {
        if (confirm("You have unsaved changes on the page.  Do you want to continue?")) {
          this.controller.cleanupPageInProgress();

          // Every time a route causes some local data / api change merging, make sure we refresh the router
          applicationChannel.request('refresh:progress');

          // If logout route triggered, then logout once user has confirmed
          if (!isList) {
            Backbone.history.navigate(routes.logout);
          }
          return true;
        } else {
          // If they cancel the route, replace the route to the default one
          return this.cancelRouteResetRoute();
        }
      }
    } else if (replacement_route !== route) {
      Backbone.history.navigate(replacement_route, {trigger: true});
      return false;
    }

    /*
    // If we're redirecting from a logout, don't check for page updates in progress
    if (!sessionChannel.request('token')) {
      try {
        this.controller.cleanupPageInProgress();
      } catch (err) {
        console.log(err);
      }
      return true;
    }
    // Note: If routing to list or logout, don't need to clean up app state and check for in-progress changes
    */
  }
});
