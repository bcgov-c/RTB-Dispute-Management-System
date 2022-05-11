import ReactDOM from 'react-dom';

/**
 * An example of using the mixin creating a JSX view:
 */
/*
// Must import React for the templates to be accepted in the file
import React from 'react';
const Example = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  renderHeader() {
    return <div>my header</div>
  },

  renderFooter() {
    return <div>my footer</div>
  },
  
  template() {
    return (
      <>
        {this.renderHeader()}
        <h1>Hello from JSX!</h1>
        <button onClick={this.helloWorld}>Click me!</button>
        {this.renderFooter()}
      </>
    );
  },
  
  helloWorld() {
   console.log('Look! A onClick handler that does not need jQuery!!!');
  }
});
*/

/**
 * Usage: wrap an instantiated view with jsx abilities using withJsx:
 *   e.g. const jsxView = withJsx(new ExampleView())
 * 
 * Or, apply the mixin directly yourself, that way it can be done at compile time
 *   e.g. const ExampleView = Marionette.View({ ... });
 *        Object.assign(ExampleView.prototype, ViewJsxMixin);
 *        const jsxView = new ExampleView();
 */

const ViewJSXMixin = {
  attachElContent: function attachJsxContent(jsx) {
    ReactDOM.render(jsx, this.el);
  }
};

const withJsx = (wrappedView) => {
  Object.assign(Object.getPrototypeOf(wrappedView), ViewJSXMixin);
  return wrappedView;
};

export { ViewJSXMixin, withJsx };
