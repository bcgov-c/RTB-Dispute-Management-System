import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import template from './LoginPage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const apiChannel = Radio.channel('api');
const sessionChannel = Radio.channel('session');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,
  className: 'da-login-content',

  ui: {
    login: '.step-next',
  },

  regions: {
    usernameRegion: '#login-username',
    passwordRegion: '#login-password'
  },

  events: {
    'click @ui.login': 'clickLogin'
  },

  clickLogin() {
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }
    
    loaderChannel.trigger('page:load');

    loaderChannel.trigger('page:load');
    apiChannel.request('allow:unauthorized');
    sessionChannel.request('authorize',
      this.getChildView('usernameRegion').model.getData(),
      this.getChildView('passwordRegion').model.getData()
    )
    .done(() => {
      apiChannel.request('restrict:unauthorized');
      const authToken = sessionChannel.request('token');
      sessionChannel.request('authorize:token', authToken);
      localStorage.setItem('authToken', authToken);
    })
    .fail(err => {
      loaderChannel.trigger('page:load:complete')
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
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(name) {
      const component = this.getChildView(name);
      is_valid = is_valid & (component ? component.validateAndShowErrors() : true);
    }, this);

    return is_valid;
  },

  initialize() {
    this.editGroup = ['usernameRegion', 'passwordRegion'];
  },

  onRender() {
    const usernameView = new InputView({
      model: new InputModel({
        autofocus: true,
        labelText: 'Username',
        required: true,
        errorMessage: 'Enter your username',
        value: null
      })
    });

    const passwordView = new InputView({
      model: new InputModel({
        labelText: 'Password',
        required: true,
        errorMessage: 'Enter your password',
        inputType: 'password',
        value: null,
      })
    });
    
    this.showChildView('usernameRegion', usernameView);
    this.showChildView('passwordRegion', passwordView);

    this.listenTo(usernameView, 'input:enter', this.clickLogin, this);
    this.listenTo(passwordView, 'input:enter', this.clickLogin, this);

    this.setInitialFocus();
    loaderChannel.trigger('page:load:complete');
  },

  setInitialFocus() {
    const input_fields = this.$('input, textarea');
    if (input_fields && input_fields.length > 0) {
      $(input_fields[0]).focus();
      $(input_fields[0]).click();
    }
  }

});
