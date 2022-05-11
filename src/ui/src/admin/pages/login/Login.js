import Radio from 'backbone.radio';
import ViewMixin from '../../../core/utilities/ViewMixin';
import Input from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import template from './Login_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const apiChannel = Radio.channel('api');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');
const hearingChannel = Radio.channel('hearings');
const filesChannel = Radio.channel('files');
const applicationChannel = Radio.channel('application');
const disputeHistoryChannel = Radio.channel('disputeHistory');

export default ViewMixin.extend({
  template,
  tagName: 'div',
  className: 'login-page',

  regions: {
    usernameRegion: '#login-username',
    passwordRegion: '#login-password'
  },

  ui: {
    'login_button': 'button'
  },

  events: {
    'click @ui.login_button': 'login'
  },

  login() {
    if (this.validateView()) {
      loaderChannel.trigger('page:load');
      // Before logging in, make sure to clear all app caches before logging in
      applicationChannel.request('clear');
      disputeHistoryChannel.request('clear');

      apiChannel.request('allow:unauthorized');
      sessionChannel.request('authorize',
        this.getChildView('usernameRegion').model.getData(),
        this.getChildView('passwordRegion').model.getData()
      )
      .done(() => {
        apiChannel.request('restrict:unauthorized');
        $.whenAll(hearingChannel.request('load:conferencebridges'), userChannel.request('load:users'), filesChannel.request('load:commonfiles'))
          .always(() => {
            const authToken = sessionChannel.request('token');
            sessionChannel.request('authorize:token', authToken);
            localStorage.setItem('authToken', authToken);
          });
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');

        const isAuthError = err.status === 401;
        if (isAuthError) {
          const view = this.getChildView('passwordRegion');
          if (view) {
            view.showErrorMessage('Invalid username or password');
          }
        } else {
          generalErrorFactory.createHandler('LOGIN')(err);
        }

        setTimeout(() => apiChannel.request('restrict:unauthorized'), 50);
      });
    }
  },

  onChildviewInputEnter() {
    this.login();
  },

  setInitialFocus() {
    const input_fields = this.$('input, textarea');
    if (input_fields && input_fields.length > 0) {
      $(input_fields[0]).focus();
      $(input_fields[0]).click();
    }
  },

  onRender() {
    this.showChildView('usernameRegion', new Input({ model: new InputModel({
        autofocus: true,
        labelText: 'Name',
        required: true,
        errorMessage: 'Enter your username',
        value: null
      })
    }));
    this.showChildView('passwordRegion', new Input({ model: new InputModel({
        labelText: 'Password',
        required: true,
        errorMessage: 'Enter your password',
        inputType: 'password',
        value: null
      })
    }));

    this.setInitialFocus();
    loaderChannel.trigger('page:load:complete');
  }

});
