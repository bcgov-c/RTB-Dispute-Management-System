/**
 * Utility methods and functionality for dealing with Marionette.View child views from Marionette.View parents
 */



const ParentViewMixinStatic = {

  /**
   * Finds a child view from a parent using the region name the child was created with.
   * If a child view is found, calls passed-in method on it, with optional params
   * 
   * @param {Marionette.View} parentView - the view that has created the childview using this.showChildView()
   * @param {String} childViewName - the name of the region where the childview was deployed
   * @param {String} methodName - the string name of the method on the child view
   * @param {Array} methodArgs - any arguments to be splat passed to the method
   */
  callChildMethodFromParent(parentView, childViewName, methodName, methodArgs=[]) {
    if (!parentView) return null;
    
    const childView = parentView.getChildView(childViewName);
    if (!childView || !_.isFunction(childView[methodName])) return null;

    return childView[methodName](...methodArgs);
  }
};

/**
 * To be mixed-in directly into Marionette.Views
 */
const ParentViewMixin = {
  /**
   * @param {String} childViewName - the name of the region where the childview was deployed
   * @param {String} eventName - the string name of the event to be triggered on the child view
   * @param {var} eventParams - 
   */
  triggerOnChild: function(childViewName, eventName, eventParams) {
    return ParentViewMixinStatic.callChildMethodFromParent(this, childViewName, 'triggerMethod', [eventName, eventParams]);
  },

  /**
   * @param {String} childViewName - the name of the region where the childview was deployed
   * @param {String} methodName - the string name of the method on the child view
   * @param {Array} methodArgs - any arguments to be splat passed to the method
   */
  callMethodOnChild: function(childViewName, methodName, methodArgs) {
    return ParentViewMixinStatic.callChildMethodFromParent(this, childViewName, methodName, methodArgs);
  }
};

export { ParentViewMixin, ParentViewMixinStatic };
