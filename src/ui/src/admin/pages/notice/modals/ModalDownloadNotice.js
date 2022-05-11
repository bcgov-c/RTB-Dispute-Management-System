import Radio from 'backbone.radio';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import EditorModel from '../../../../core/components/editor/Editor_model';
import EditorView from '../../../../core/components/editor/Editor';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import NoticePreviewView from '../../../components/notice/NoticePreview';
import template from './ModalDownloadNotice_template.tpl';
import word_template from '../../../components/notice/NoticeWordPdf_template.tpl';

const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');

const ModalDownloadNotice = ModalBaseView.extend({
  template,
  id: 'addNotice-modal',
  
  className: `${ModalBaseView.prototype.className || ''} downloadNotice-modal`,
  
  regions : {
    specialInstructionsText: '.special-instructions',
    useSpecialInstructions: '.use-special-instructions',
    disputeNoticeTitleRegion: '.dispute-notice-title',
    noticePreview: '#notice-preview',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      download: '.btn-upload',
      specialInstructions: '.special-instructions'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.download': 'clickDownload' 
    });
  },

  clickDownload() {
    const view = this.getChildView('specialInstructionsText');
    if (!view.validateAndShowErrors()) {
      return;
    }

    const noticeForDownload = this.createNoticePreviewView({ templateToUse: word_template }).render();

    if (this.useSpecialInstructionsModel.getData()) {
      noticeForDownload.updateSpecialInstructions( this.specialInstructionsModel.getData() );
      noticeForDownload.showSpecialInstructions();
    } else {
      noticeForDownload.hideSpecialInstructions(true);
    }

    const noticeHtml = `<html>${noticeForDownload.$el.html()}</html>`;
    filesChannel.request('download:html', noticeHtml, `${this.disputeNoticeTitleModel.getData()}.doc`);
    setTimeout(() => this.close(), 100);
  },


  initialize(options) {
    this.mergeOptions(options, ['noticePreviewClass', 'noticePreviewOptions']);

    if (!this.noticePreviewClass) {
      this.noticePreviewClass = NoticePreviewView;
    }
    
    this.NOTICE_ASSOCIATED_TO_APPLICANT = configChannel.request('get', 'NOTICE_ASSOCIATED_TO_APPLICANT');
    this.activeHearing = hearingChannel.request('get:active');
    this.dispute = disputeChannel.request('get');

    this.createSubModels();
    this.setupListeners();
  },

  getDefaultNoticeTitle() {
    return `DisputeNotice_${this.dispute.get('file_number')}_${Moment().format('DD-MM-YYYY')}`;
  },

  createSubModels() {
    const hasHearingInstructions = this.dispute && this.dispute.isHearingRequired() && this.activeHearing && $.trim(this.activeHearing.get('special_instructions'));

    this.disputeNoticeTitleModel = new InputModel({
      labelText: 'Word .doc title',
      errorMessage: "Enter a Notice Title",
      required: true,
      disabled: false,
      value: this.model.get('notice_title') || this.getDefaultNoticeTitle(),
      apiMapping: 'notice_title'
    });

    this.useSpecialInstructionsModel = new CheckboxModel({
      html: 'Include Special Instructions',
      checked: hasHearingInstructions,
      required: true
    });

    this.specialInstructionsModel = new EditorModel({
      required: false, // Default to not required, will be reset on-render UI toggle
      disabled: !this.useSpecialInstructionsModel.get('checked'),
      errorMessage: 'Enter special instructions or uncheck "Include Special Instructions" above',
      isEmailable: false,
      maxLength: configChannel.request('get', 'NOTICE_SPECIAL_INSTRUCTIONS_MAX_LENGTH'),
      trumbowygOptions: {
        btns: [
          ['strong', 'em'],
          ['unorderedList', 'orderedList'],
          ['historyUndo', 'historyRedo'],
          ['removeformat']
        ],
      },
      value: hasHearingInstructions && this.activeHearing ? $.trim(this.activeHearing.get('special_instructions')) : null
    });
  },

  setupListeners() {
    this.listenTo(this.specialInstructionsModel, 'change:value', this._onChangeSpecialInstructions, this);
    this.listenTo(this.useSpecialInstructionsModel, 'change:checked', this._onChangeUseSpecialInstructions, this);
    this.listenTo(this.specialInstructionsModel, 'change:required', this._setNoticeRequired, this);
  },

  _setNoticeRequired(model, value) {
    const instructionsView = this.getChildView('specialInstructionsText');
    if (instructionsView) {
      instructionsView.render();
      if (value) {
      this.specialInstructionsModel.set({ disabled: false });
      } else {
      this.specialInstructionsModel.set({ disabled: true, value: null });
      }
      this.getChildView('specialInstructionsText').render();
    }
  },

  _onChangeSpecialInstructions(model, value) {
    const previewView = this.getChildView('noticePreview');
    previewView.updateSpecialInstructions(value);
  },

  _onChangeUseSpecialInstructions(model, value) {
    const previewView = this.getChildView('noticePreview');
    if (!previewView) {
      return;
    }
    if (value) {
      this.getUI('specialInstructions').show();
      previewView.showSpecialInstructions();
    } else {
      this.getUI('specialInstructions').hide();
      previewView.hideSpecialInstructions();
    }
    this.specialInstructionsModel.set({
      required: value
    });
  },

  _getViewsToValidate() {
    return ['disputeNoticeTitleRegion', 'specialInstructionsText'];
  },

  createNoticePreviewView(extraNoticeOptions) {
    return new (this.noticePreviewClass)(_.extend({
      model: this.model,
      templateData: {
        // Use the participatory template for downloads except if Non-Participatory process
        isParticipatoryHearing: this.dispute.getProcess() !== configChannel.request('get', 'PROCESS_WRITTEN_OR_DR'),
      }
    }, this.noticePreviewOptions, extraNoticeOptions));
  },


  onRender() {
    this.showChildView('disputeNoticeTitleRegion', new InputView({ model: this.disputeNoticeTitleModel }));
    const process = this.dispute.getProcess();
    if (process) {
      this.showChildView('useSpecialInstructions', new CheckboxView({ model: this.useSpecialInstructionsModel }));
      this.showChildView('specialInstructionsText', new EditorView({ model: this.specialInstructionsModel })); 
      this.showChildView('noticePreview', this.createNoticePreviewView());

      this._onChangeUseSpecialInstructions(null, this.useSpecialInstructionsModel.getData());
      if (this.activeHearing && this.activeHearing.get('special_instructions')) {
        this._onChangeSpecialInstructions(null, this.specialInstructionsModel.getData());
      }
    }
  },

  templateContext() {
    const disputeProcess = this.dispute.getProcess();
    return {
      Formatter,
      disputeProcess
    };
  }
});

export default ModalDownloadNotice;