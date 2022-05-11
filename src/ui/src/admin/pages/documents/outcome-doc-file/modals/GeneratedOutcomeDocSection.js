import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const hearingChannel = Radio.channel('hearings');
const disputeChannel = Radio.channel('dispute');
const documentsChannel = Radio.channel('documents');

export default Marionette.View.extend({
  
  template(data) {
    const templateToUse = data.templateToUse;
    delete data.templateToUse;
    return templateToUse(data);
  },

  initialize(options) {
    this.mergeOptions(options, ['templateToUse', 'templateData', 'enableWordMode']);

    if (!this.templateToUse) {
      console.log("[Error] Need a template to use for generated outcome doc preview");
      return this;
    }

    this.docConfig = documentsChannel.request('config:file', this.model.get('file_type'));
    this.dispute = disputeChannel.request('get');
    this.hearing = hearingChannel.request('get:active');
  },

  templateContext() {
    return _.extend({ templateToUse: this.templateToUse }, this.templateData);
  }
});