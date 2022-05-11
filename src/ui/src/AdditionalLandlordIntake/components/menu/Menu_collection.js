import Backbone from 'backbone';

const MenuModel = Backbone.Model.extend({
  defaults: {
    step: null,
    text: null,
    active: false,
    disabled: false,
    visited: false,
    unreachable: false
  }
});

export default Backbone.Collection.extend({
  model: MenuModel,

  initialize(models, options) {
    this.paymentStep = options.paymentStep;
    this.paymentReceiptStep = options.paymentReceiptStep;
  },

  setActiveStep(active_step_number) {
    const activeMenuModel = this.findWhere({ step: active_step_number });
    if (!activeMenuModel) {
      console.debug("[Error] Couldn't find a menu item for step ", active_step_number);
      return;
    }
    this.each(function(menuStep) {
      if (menuStep === activeMenuModel) {
        menuStep.set({
          active: true,
          disabled: false,
          visited: true
        });
      } else {
        menuStep.set(_.extend({
            // Set any steps past the active step to disabled
            active: false,
          },
          menuStep.get('step') > active_step_number && menuStep.get('visited') ? { disabled: true } : {}
        ));
      }
    });
  }
});
