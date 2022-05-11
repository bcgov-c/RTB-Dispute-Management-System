import Backbone from "backbone";
import Radio from 'backbone.radio';
import Page from "../../../core/components/page/Page";

const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

const STEP_ONE_ROUTE = 'page/1';

export default Page.extend({
  createPageApiErrorHandler(childView, options={}) {
    return (errorResponse={}) => {
      if (errorResponse?.status === 401) {
        // This is supressed from the generalErrorFactory, so handle it manually here, and auto-logout
        Backbone.history.navigate('logout', { trigger: true });
        return;
      }

      loaderChannel.trigger('page:load:complete');
      const pageNavTo = (route) => {
        loaderChannel.trigger('page:load');
        childView?.cleanupPageInProgress?.bind(childView)();
        setTimeout(() => Backbone.history.navigate(route, { trigger: true }), 25);
      };

      const canRestart = !options.forceLogout;
      modalChannel.request('show:standard', {
        modalCssClasses: 'ceu-error-modal',
        title: `An Error Occurred`,
        bodyHtml: `<p>
            An unexpected network or server error occurred during the above action and the data may be in an incorrect state.
          </p>
          <p style="margin-top:20px;">
            ${canRestart ? `You can can to return to Step 1 to recover your application, or you can log out right away and try again. `:''}If this issue persists, please contact the Compliance Enforcement Unit.
          </p>`
        ,
        primaryButtonText: 'Log out',
        onContinueFn(modelView) {
          modelView.close();
          pageNavTo('logout');
        },
        secondaryButtonText: canRestart ? 'Restart from Step 1' : null,
        onSecondaryFn: canRestart ? (modelView) => {
          modelView.close();
          pageNavTo(STEP_ONE_ROUTE);
        } : null,
        hideCancelButton: true,
        hideHeaderX: true,
      });
    };
  },
});