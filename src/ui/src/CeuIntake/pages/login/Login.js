import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const LoginPage = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  startDispute() {
    loaderChannel.trigger('page:load');
    let ceuStartUrl = configChannel.request('get', 'CEU_CONFIG')?.START_URL;
    if (!ceuStartUrl) ceuStartUrl = configChannel.request('get', 'CONFIG_ERROR_URL');
    window.location.href = ceuStartUrl;
  },

  className: 'login-page col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4',

  onRender() {
    loaderChannel.trigger('page:load:complete');
  },

  template() {
    return <div>
      <h3>Start New CEU Dispute</h3>
      <form noValidate>
        <button type="button" className="btn btn-primary" onClick={() => this.startDispute()}>Start</button>
      </form>
    </div>;
  },
});

_.extend(LoginPage.prototype, ViewJSXMixin);
export default LoginPage;
