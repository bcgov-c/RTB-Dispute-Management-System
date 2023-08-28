/**
 * @fileoverview - Simple modal that saves amendment information upon confirm button press
 */
import Radio from 'backbone.radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import template from './ModalAmendmentConfirm_template.tpl';

const configChannel = Radio.channel('config');

const participantChannel = Radio.channel('participants');

export default ModalBaseView.extend({
  template,
  id: 'amendmentConfirm-modal',

  regions: {
    amendedByRegion: '.amendment-by',
    amendmentRtbInitRegion: '.amendment-rtb-init',
    amendmentRespondentInitRegion: '.amendment-respondent-init',
    amendedNoteRegion: '.amendment-note'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      continue: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.continue': 'clickSave',
    });
  },

  clickSave() {
    if (!this.getChildView('amendedByRegion').validateAndShowErrors()) {
      return;
    }

    this.trigger('save', _.extend(
      this.amendmentByModel.getPageApiDataAttrs(),
      this.amendmentRtbInitModel.getPageApiDataAttrs(),
      this.amendmentNoteModel.getPageApiDataAttrs()
    ));
  },

  initialize(options={}) {
    if (!options || !options.title || !options.bodyHtml) {
      const error_msg = `[Error] Missing required attributes for change amendment modal`;
      throw error_msg;
    }
    /**
     * @param {String} title
     * @param {String} bodyHtml
     * @param {Boolean} isRtbInitiated - Sets is_internally_initiated field
     */
    this.mergeOptions(options, ['title', 'bodyHtml', 'isRtbInitiated']);
    this.createAmendmentModels();
    this.setupListeners();
  },
  
  createAmendmentModels() {
    this.amendmentByModel = new DropdownModel({
      optionData: this.getAmendmentParticipantOptionData(participantChannel.request(`get:applicants`)),
      labelText: "Amendment By",
      defaultBlank: true,
      value: null,
      required: !this.isRtbInitiated,
      cssClass: this.isRtbInitiated ? 'optional-input' : null,
      apiMapping: 'amendment_submitter_id'
    });

    this.amendmentRtbInitModel = new CheckboxModel({
      html: 'RTB Initiated',
      required: false,
      checked: !!this.isRtbInitiated,
      apiMapping: 'is_internally_initiated',
    });

    this.amendmentRespondentInitModel = new CheckboxModel({
      html: 'Respondent Initiated',
      required: false,
      checked: false,
    });

    this.amendmentNoteModel = new InputModel({
      labelText: "Amendment Note",
      cssClass: 'optional-input',
      required: false,
      apiMapping: 'amendment_description',
      maxLength: configChannel.request('get', 'AMENDMEND_NOTE_MAX_LENGTH')
    });
  },

  getAmendmentParticipantOptionData(participants) {
    return (participants || []).filter(p => !p.isNew()).map(p => ({ value: String(p.id), text: p.getContactName() }) );
  },

  setupListeners() {
    this.listenTo(this.amendmentRespondentInitModel, 'change:checked', (model, checked) => {
      this.amendmentByModel.set({
        optionData: this.getAmendmentParticipantOptionData(participantChannel.request(`get:${checked ? 'respondents' : 'applicants'}`)),
        value: null,
      });
      this.amendmentByModel.trigger('render');
    });

    this.listenTo(this.amendmentRtbInitModel, 'change:checked', (model, checked) => {
      this.amendmentByModel.set({
        required: !checked,
        cssClass: checked ? 'optional-input' : ''
      });
      this.amendmentByModel.trigger('render');
    });
  },

  onRender() {
    this.showChildView('amendedByRegion', new DropdownView({ model: this.amendmentByModel }));
    this.showChildView('amendmentRtbInitRegion', new CheckboxView({ model: this.amendmentRtbInitModel }));
    this.showChildView('amendmentRespondentInitRegion', new CheckboxView({ model: this.amendmentRespondentInitModel }));
    this.showChildView('amendedNoteRegion', new InputView({ model: this.amendmentNoteModel }));
  },

  templateContext() {
    return {
      title: this.title,
      bodyHtml: this.bodyHtml
    };
  }
});
