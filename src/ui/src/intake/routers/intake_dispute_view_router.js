import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import BackboneRoutefilter from 'backbone.routefilter';
import Radio from 'backbone.radio';

const sessionChannel = Radio.channel('session');

export const IntakeDisputeViewRouter = Marionette.AppRouter.extend({
  _appRoutes: {
    'view/hearings': 'showIntakeDisputeViewHearings',
    'view/notices': 'showIntakeDisputeViewNotices',
    'view/requests': 'showIntakeDisputeViewRequests',
    'view/evidence': 'showIntakeDisputeViewEvidence',
    'view/emails': 'showIntakeDisputeViewEmails',
    'view/documents': 'showIntakeDisputeViewDocuments',
    'view/payments': 'showIntakeDisputeViewPayments',
    'view': 'showIntakeDisputeViewDispute',
  },

  initialize() {
    this.processAppRoutes(this.controller,  this._appRoutes);
  },

  changeController(newController) {
    this.controller = newController;
    this.processAppRoutes(this.controller,  this._appRoutes);
  },

  cancelRoute(optionalAction) {
    if (optionalAction && _.isFunction(optionalAction)) {
      optionalAction();
    }
    return false;
  },

  // This is always exectuted before the route is performed.
  // Returning false from this method cancels any routing.
  // Part of backbone.routefilter third party library.
  before(route) {
    if (!sessionChannel.request('is:authorized')) {
      console.debug(`[Warning] User is not authorized in intake_dispute_view_router`);
      return this.cancelRoute(() => Backbone.history.navigate('login', {trigger: true, replace: true}));
    }
    if (!this.controller.canAccessDisputeView()) {
      return this.cancelRoute(() => Backbone.history.navigate('list', {trigger: true, replace: true}));
    }
  }

});
