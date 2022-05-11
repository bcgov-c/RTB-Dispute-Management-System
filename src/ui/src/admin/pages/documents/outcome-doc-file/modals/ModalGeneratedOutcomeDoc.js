import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import GeneratedOutcomeDocPreview from './GeneratedOutcomeDocPreview';
import template from './ModalGeneratedOutcomeDoc_template.tpl';

const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');
const filesChannel = Radio.channel('files');
const sessionChannel = Radio.channel('session');

export default ModalBaseView.extend({
  template,
  id: 'addNotice-modal',

  className: 'modal modal-rtb-default',

  regions: {
    previewRegion: '#decision-preview',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      download: '.btn-upload'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.download': 'clickDownload' 
    });
  },

  clickDownload() {
    const decisionForDownload = new GeneratedOutcomeDocPreview({
      model: this.model,
      enableWordMode: true,
      signature: this.signature
    }).render();

    const decisionHtml = `<html>${decisionForDownload.$el.html()}</html>`;
    filesChannel.request('download:html', decisionHtml, `${this.docTitle}.doc`);
    setTimeout(() => this.close(), 100);
  },

  toDataURL(url) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.signature = reader.result;
        this.isLoaded = true;
        this.render();
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  },

  initialize(options) {
    this.mergeOptions(options, []);
    this.loggedInUser = sessionChannel.request('get:user');
    const signatureFile = filesChannel.request('get:commonfile', this.loggedInUser.getProfile().get('signature_file_id'));

    if (signatureFile) {
      this.isLoaded = false;
      this.signature = this.toDataURL(signatureFile.getDisplayURL());
    } else {
      this.isLoaded = true;
    }
    this.docConfig = documentsChannel.request('config:file', this.model.get('file_type')) || {};
    this.decision_template_ids = configChannel.request('get', 'decision_template_ids') || {};
    this.docTitle = $.trim(`${this.docConfig.code} ${(this.docConfig || {}).title}`);
  },

  onRender() {
    this.showChildView('previewRegion', new GeneratedOutcomeDocPreview({ model: this.model, signature: this.signature }));
  },

  templateContext() {
    return {
      modalTitle: `Generate ${this.docTitle}`,
      isLoaded: this.isLoaded
    };
  }
});