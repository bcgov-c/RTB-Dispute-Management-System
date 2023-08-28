import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const GeneratedDocOptionThreeView = Marionette.View.extend({ 
  initialize(options) {
    this.mergeOptions(options, ['']);
    this.template = this.template.bind(this);
  },

  template() {
    return <div className=""></div>
  }
});

_.extend(GeneratedDocOptionThreeView.prototype, ViewJSXMixin);
export default GeneratedDocOptionThreeView;