import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const applicationChannel = Radio.channel('application');

const ARI_PAYMENT_STEP_NUMBER = 10;
const ARI_PAYMENT_RECEIPT_STEP_NUMBER = 11;

const PFR_PAYMENT_STEP_NUMBER = 7;
const PFR_PAYMENT_RECEIPT_STEP_NUMBER = 8;

const ariRoutes = {
  review_item: 'page/9',
  payment_item: `page/${ARI_PAYMENT_STEP_NUMBER}`,
  payment_receipt_item: `page/${ARI_PAYMENT_RECEIPT_STEP_NUMBER}`,
  payment_return_item: 'loadTxn'
};

const pfrRoutes = {
  review_item: 'page/6',
  payment_item: `page/${PFR_PAYMENT_STEP_NUMBER}`,
  payment_receipt_item: `page/${PFR_PAYMENT_RECEIPT_STEP_NUMBER}`,
  payment_return_item: 'loadTxn'
};

const getRouteStepNumberFn = (route) => route && route.indexOf('page/') !== -1 ? parseInt(route.split('page/')[1]) : null;

const BaseIntakeAriRouter = Marionette.AppRouter.extend({
  // Must be overriden by subclasses
  _routesConfig: {},
  _appRoutes: {},

  initialize() {
    this.processAppRoutes(this.controller,  this._appRoutes);
  },

  changeController(newController) {
    this.controller = newController;
    this.processAppRoutes(this.controller,  this._appRoutes);
  },

  _isDisputeRoute(route) {
    // NOTE: This may have to be updated if there are new dispute / non-dispute routes
    return /page\/\d/.test(route);
  },

  /**
   * Checks and returns any routing restrictions and rules based on the dispue state.
   * Only valid for routes within a dispute.
   * @returns {Function|null} A function to be run to restrict the actions.
   * If no actions are needed, returns null.
   */
  _getDisputeStateRouteRestrictionsActions(route) {
    // This method is only valid for dispute type routes
    if (!this._isDisputeRoute(route)) {
      return;
    }

    const dispute = disputeChannel.request('get'),
      stage = dispute && parseInt(dispute.getStage());

    // If no dispute info is loaded, don't let them enter the dispute state
    if (!dispute) {
      return _.bind(this.cancelRoute, this, () => { Backbone.history.navigate('#list', {trigger: true, replace: true}); });
    }

    if (dispute.isPaymentState() &&
        (route !== this._routesConfig.payment_item && route !== this._routesConfig.payment_receipt_item)) {
      // If the status is waiting for a payment, restrict the routing to payment pages only
      return _.bind(this.cancelRoute, this, () => {
        Backbone.history.navigate(this._routesConfig.payment_item, {trigger: true, replace: true});
      });
    } else if (!dispute.isPaymentState() &&
        (route === this._routesConfig.payment_return_item || route === this._routesConfig.payment_item)) {
      // If the dispute is not waiting for payment and we try to route to payment or return, exit to list
      return _.bind(this.cancelRoute, this, () => {
        Backbone.history.navigate('#list', {trigger: true, replace: true});
      });
    }

    // If the status is outside of Stage Application In Progress, restrict the routing to the payment page only
    if (_.isNumber(stage) && stage !== configChannel.request('get', 'STAGE_APPLICATION_IN_PROGRESS') &&
        route !== this._routesConfig.payment_receipt_item) {
      applicationChannel.trigger('progress:step:complete', getRouteStepNumberFn(this._routesConfig.payment_receipt_item));
      return _.bind(this.cancelRoute, this, () => {
        Backbone.history.navigate(this._routesConfig.payment_receipt_item, {trigger: true, replace: true});
      });
    }
    
    const route_step = getRouteStepNumberFn(route),
      recent_progress = applicationChannel.request('get:progress:recent');
    
    // Only allow routing to the step after the most recent progress
    if (route_step && recent_progress) {

      // If we are on a payment item, skip
      if (route_step === getRouteStepNumberFn(this._routesConfig.payment_item) || route_step === getRouteStepNumberFn(this._routesConfig.payment_receipt_item)) {
        return false;
      }

      if (route_step > recent_progress+1) {
        // If they try to navigate somewhere too ahead of the progress, don't let them
        return _.bind(this.cancelRouteResetRoute, this);
      } else if (route_step === recent_progress+1 &&
        applicationChannel.request('check:progress:step:incomplete', route_step)) {
        // If they try to go to Next step but current route is invalid or incomplete, don't let them
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
    if (route === this._routesConfig.payment_return_item) {
      // If on payment return site, automatically use the auth/payment cookie and proceed
      const tokenToUse = sessionStorage.getItem('_dmsPaymentToken') || localStorage.getItem('authToken');
      sessionStorage.removeItem('_dmsPaymentToken');
      sessionChannel.request('authorize:token', tokenToUse, {skip_routing: true});
    }
        
    if (!sessionChannel.request('is:authorized')) {
      console.debug(`[Warning] User is not authorized in intake_router`);
      Backbone.history.navigate('login', { trigger: true });
      return false;
    }

    // If we're redirecting from a logout, don't check for page updates in progress
    if (!sessionChannel.request('token')) {
      this.controller.cleanupPageInProgress();
      return true;
    }

    if (this._isDisputeRoute(route)) {
      const restricted_routing_actions = this._getDisputeStateRouteRestrictionsActions(route);
      if (restricted_routing_actions && _.isFunction(restricted_routing_actions)) {
        return restricted_routing_actions();
      }
    }

    // Now check for unsaved page changes
    const pageApiUpdates = this.controller.getPageApiUpdates();
    console.log('^^^^^END^^^^^');
    console.log(pageApiUpdates);
    if (pageApiUpdates && !_.isEmpty(pageApiUpdates)) {
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


export const IntakeAriRouter = BaseIntakeAriRouter.extend({
  _routesConfig: ariRoutes,
  _appRoutes: {
    'page/1': 'showIntakeAriGeneral',
    'page/2': 'showIntakeAriApplicants',
    'page/3': 'showIntakeAriApplicantOptions',
    'page/4': 'showIntakeAriImprovmentUnits',
    'page/5': 'showIntakeAriInformation',
    'page/6': 'showIntakeAriUnitCosts',
    'page/7': 'showIntakeAriRentIncrease',
    'page/8': 'showIntakeAriUnitTenants',
    [ariRoutes.review_item]: 'showIntakeAriReview',
    [ariRoutes.payment_item]: 'showIntakeAriPayment',
    [ariRoutes.payment_receipt_item]: 'showIntakeAriPaymentReceipt',
    [ariRoutes.payment_return_item]: 'loadIntakeAriPaymentReturnAndShowView',
  }
});

export const IntakePfrRouter = BaseIntakeAriRouter.extend({
  _routesConfig: pfrRoutes,
  _appRoutes: {
    'page/1': 'showIntakePfrGeneral',
    'page/2': 'showIntakeAriApplicants',
    'page/3': 'showIntakeAriApplicantOptions',
    'page/4': 'showIntakePfrRenovationUnits',
    'page/5': 'showIntakePfrUnitTenants',
    [pfrRoutes.review_item]: 'showIntakePfrReview',
    [pfrRoutes.payment_item]: 'showIntakePfrPayment',
    [pfrRoutes.payment_receipt_item]: 'showIntakePfrPaymentReceipt',
    [pfrRoutes.payment_return_item]: 'loadIntakeAriPaymentReturnAndShowView',
  },
});

export { ARI_PAYMENT_STEP_NUMBER, ARI_PAYMENT_RECEIPT_STEP_NUMBER, PFR_PAYMENT_STEP_NUMBER, PFR_PAYMENT_RECEIPT_STEP_NUMBER, 
  ariRoutes, pfrRoutes };