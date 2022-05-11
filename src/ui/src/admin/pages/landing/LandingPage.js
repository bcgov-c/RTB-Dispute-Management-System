import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import { routeParse } from '../../routers/mainview_router';
import template from './LandingPage_template.tpl';

const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');


export default PageView.extend({
  template,
  className: 'landing-page',

  regions: {
    pocJsx: '#test-jsx'
  },

  events: {
    'click .test-create-users-link': function() {
      Backbone.history.navigate(routeParse('test_create_users_item'), { trigger: true });
    }
  },

  onRender() {
    loaderChannel.trigger('page:load:complete');
  },
  
  templateContext() {
    const RUN_MODE = configChannel.request('get', 'RUN_MODE');
    const API_ROOT_URL = configChannel.request('get', 'API_ROOT_URL');
    const SWAGGER_URL = configChannel.request('get', 'SWAGGER_URL');
    const INTAKE_URL = configChannel.request('get', 'INTAKE_URL');
    const DISPUTE_ACCESS_URL = configChannel.request('get', 'DISPUTE_ACCESS_URL');
    const OFFICE_SUBMISSION_URL = configChannel.request('get', 'OFFICE_SUBMISSION_URL');
    const HARDCODED_DISPUTES = configChannel.request('get', 'HARDCODED_DISPUTES');
      
    return {
      BUILD_INFO,
      HARDCODED_DISPUTES,
      Formatter,
      routeParse,
      isAdmin: sessionChannel.request('is:active:admin'),
      isCmsOnlyMode: false,
      isProd: RUN_MODE === 'production',
      isDev: RUN_MODE === 'development',
      isStaging: RUN_MODE === 'staging',
      isSiteminder: sessionChannel.request('is:login:siteminder'),
      API_ROOT_URL,
      INTAKE_URL,
      DISPUTE_ACCESS_URL,
      OFFICE_SUBMISSION_URL,
      SWAGGER_URL,
      runModeDisplay: RUN_MODE === 'staging' ? 'Test/Staging' : Formatter.capitalize(RUN_MODE)
    };
  }
});