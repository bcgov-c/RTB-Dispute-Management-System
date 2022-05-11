import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';

const applicationChannel = Radio.channel('application');
const configChannel = Radio.channel('config');

const routes = {
  general: 'page/1',
  applicants: 'page/2',
  applicantOptions: 'page/3',
  respondents: 'page/4',
  units: 'page/5',
  contraventions: 'page/6',
  contraventionInfo: 'page/7',
  review: 'page/8',
  receipt: 'page/9',
};

const getRouteStepNumberFn = (route) => route && route.indexOf('page/') !== -1 ? parseInt(route.split('page/')[1]) : null;

export default Marionette.AppRouter.extend({
  appRoutes: {
    [routes.general]: 'showIntakeCeuGeneral',
    [routes.applicants]: 'showIntakeCeuApplicants',
    [routes.applicantOptions]: 'showIntakeCeuApplicantOptions',
    [routes.respondents]: 'showIntakeCeuRespondents',
    [routes.units]: 'showIntakeCeuUnits',
    [routes.contraventions]: 'showIntakeCeuContraventions',
    [routes.contraventionInfo]: 'showIntakeCeuContraventionInfo',
    [routes.review]: 'showIntakeCeuReview',
    [routes.receipt]: 'showIntakeCeuReceipt',
  },

  changeController(newController) {
    this.controller = newController;
  },

  _isDisputeRoute(route) {
    // NOTE: This may have to be updated if there are new dispute / non-dispute routes
    return /page\/\d/.test(route);
  },

  _isExplorationRoute(route) {
    return Object.values(routes).some(_r => new RegExp(_r).test(route));
  },

  _getDisputeStateRouteRestrictionsActions(route) {
    // This method is only valid for dispute type routes
    if (!this._isDisputeRoute(route)) return;

    const route_step = getRouteStepNumberFn(route);
    const recent_progress = applicationChannel.request('get:progress:recent');

      // Only allow routing to the step after the most recent progress
    if (route_step && recent_progress) {
      if (route_step > recent_progress+1) {
        // If they try to navigate somewhere too ahead of the progress, don't let them
        return _.bind(this.cancelRouteResetRoute, this);
      }
    }
  },

  cancelRoute(optionalAction) {
    if (optionalAction && _.isFunction(optionalAction)) {
      optionalAction();
    }
    return false;
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

  // This is always exectuted before the route is performed.
  // Returning false from this method cancels any routing.
  // Part of backbone.routefilter third party library.
  before(route) {
    if (this._isExplorationRoute(route) && !this.controller.parent.getActiveCeuModel()) {
      return this.cancelRoute(() => {
        const ceuLogoutUrl = configChannel.request('get', 'CEU_CONFIG')?.LOGOUT_URL;
        if (ceuLogoutUrl) window.location.href = ceuLogoutUrl;
        else Backbone.history.navigate('login-page', { trigger: true, replace: true });
      });
    }

    if (this._isDisputeRoute(route)) {
      const restricted_routing_actions = this._getDisputeStateRouteRestrictionsActions(route);
      if (restricted_routing_actions && _.isFunction(restricted_routing_actions)) {
        return restricted_routing_actions();
      }
    }

    // Now check for unsaved page changes
    const pageApiUpdates = this.controller.getPageApiUpdates();
    if (String(route).indexOf('logout') === -1 && pageApiUpdates && !_.isEmpty(pageApiUpdates)) {
      if (confirm("You have unsaved changes on the page.  Do you want to continue?")) {
        this.controller.cleanupPageInProgress();

        // Every time a route causes some local data / api change merging, make sure we refresh the router
        applicationChannel.request('refresh:progress');
        return true;
      } else {
        // If they cancel the route, replace the route to the default one
        return this.cancelRouteResetRoute();
      }
    }

  }
});
