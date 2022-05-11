import Radio from 'backbone.radio';
import IntakePageUnitTenantsBaseView from './IntakePageUnitTenantsBase';

const configChannel = Radio.channel('config');

export default IntakePageUnitTenantsBaseView.extend({
  getCurrentStep() {
    return 5;
  },

  getCustomObjectType() {
    return configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR');
  }
});
