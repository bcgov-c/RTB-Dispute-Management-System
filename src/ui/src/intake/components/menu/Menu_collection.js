import Backbone from 'backbone';

const MenuModel = Backbone.Model.extend({
  defaults: {
    step: null,
    text: null,
    active: false,
    disabled: false,
    visited: false,
    unreachable: false,
    route: null,
  }
});

export default Backbone.Collection.extend({
  model: MenuModel,

  setActiveStep(active_step_number, options={}) {
    const activeMenuModel = this.findWhere({ step: active_step_number });
    if (!activeMenuModel) {
      console.debug("[Error] Couldn't find a menu item for step ", active_step_number);
      return;
    }
    this.each(function(menuStep) {
      let menuData = {};
      if (menuStep === activeMenuModel) {
        menuData = {
          active: true,
          disabled: false,
          visited: true
        };
      } else {
        // Remove active/selected style from any other menu item
        menuData = Object.assign({
            active: false,
          },
          // When in a sequential intake, set visited steps to disabled
          !options.single && menuStep.get('step') > active_step_number && menuStep.get('visited') ? { disabled: true } : {}
        );
      }
      menuStep.set(menuData);
    });
  },

});
