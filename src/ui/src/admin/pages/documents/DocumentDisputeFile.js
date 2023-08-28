import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeClaimEvidenceView from '../../components/dispute-claim/DisputeClaimEvidence';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import template from './DocumentDisputeFile_template.tpl';

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item',

  regions: {
    evidenceListRegion: '.dispute-file-contents'
  },

  ui: {
    editIcon: '.edit-file-icon',
    deleteIcon: '.delete-file-icon'
  },

  events: {
    'click @ui.editIcon': 'clickEditFile',
    'click @ui.deleteIcon': 'clickDeleteFile',
  },

  clickEditFile() {
    const modalAddFiles = new ModalAddFiles({
      processing_options: {
        maxNonVideoFileSize: configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES'),
        errorModalTitle: 'Adding Documents',
        maxNonVideoFileSize: 50 * 1024 * 1024
      }, // 50MB
      model: this.model,
      files: this.model.get('files'),
      title: 'Add/Edit Internal Documents',
      isDescriptionRequired: false,
      showDelete: false,
      autofillRename: true,
      fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE')
    });
    modalChannel.request('add', modalAddFiles);

    this.listenTo(modalAddFiles, 'removed:modal', () => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    });
  },

  clickDeleteFile() {
    const modal = new ModalMarkAsDeficientView({
      topHtml: '<p>Warning: This will move files into the deficient documents section.  A reason for this removal is required and will be stored with the removed documents for future reference.</p>',
      bottomHtml: '<p>Are you sure you want to move the associated application and files to deficient documents?<br/>This action cannot be undone.</p>',
      model: this.model,
      getRemovalReasonFn: (enteredReason) => `Dispute document removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
    });
    this.listenTo(modal, 'save:complete', () => this.model.trigger('refresh:page'));
    modalChannel.request('add', modal);
  },

  initialize(options) {
    this.mergeOptions(options, ['showControls']);
    const isAmendment = configChannel.request('get', 'AMENDMENT_FORM_CODES')?.includes(this.model.getDescriptionCode());
    this.showControls = isAmendment ? false : this.showControls;
  },

  onRender() {
    this.showChildView('evidenceListRegion', new DisputeClaimEvidenceView({
      model: this.model,
      showSubmitterInfo: true
    }));
  },

  templateContext() {
    const fileDescription = this.model.get('file_description');
    return {
      Formatter,
      showControls: this.showControls,
      isDeficient: fileDescription && fileDescription.get('is_deficient'),
      isDeficientReasonDisplay: fileDescription ? (fileDescription.get('is_deficient_reason') || '-') : '-'
    };
  }
});