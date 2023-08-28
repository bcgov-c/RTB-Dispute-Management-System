import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import IntakeParticipantView from '../../../../core/components/participant/IntakeParticipant';
import IntakeParticipantModel from '../../../../core/components/participant/IntakeParticipant_model';
import ParticipantModel from '../../../../core/components/participant/Participant_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import template from './ModalAddParty_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const participantChannel = Radio.channel('participants');
const amendmentChannel = Radio.channel('amendments');

export default Marionette.View.extend({
  template,

  regions: {
    participantRegion: '#addParty_participant',
    amendmentByRegion: '.amendment-by',
    amendmentRtbInitRegion: '.amendment-rtb-init',
    amendmentRespondentInitRegion: '.amendment-respondent-init',
    amendmentNoteRegion: '.amendment-note'
  },

  ui: {
    amend: '#addPartyAmend',
    save: '#addPartySave',
    cancel: '#addPartyCancel',
    close: '.close-x'
  },

  events: {
    'click @ui.close': 'clickClose',
    'click @ui.cancel': 'clickClose',
    'click @ui.save': 'clickSave',
    'click @ui.amend': 'clickAmend'
  },

  clickSave() {
    const participantView = this.getChildView('participantRegion');
    if (participantView.validateAndShowErrors()) {
      loaderChannel.trigger('page:load');
      this._applyModelUpdates();
      this._saveParticipant();
    }

  },

  clickAmend() {
    const participantView = this.getChildView('participantRegion');
    const amendmentByView = this.getChildView('amendmentByRegion');

    if (participantView.validateAndShowErrors() & (amendmentByView ? amendmentByView.validateAndShowErrors() : true)) {
      loaderChannel.trigger('page:load');
      this._applyModelUpdates();
      const creation_method = this.participantType === 'Respondent' ? 'add:respondent' : 'add:applicant';
      amendmentChannel.request(creation_method, this.participantModel, {
        amendment_description: this.amendmentNoteModel.getData(),
        amendment_submitter_id: this.amendmentByModel.getData()
      }).done(() => {
        this.participantModel.set('is_amended', true);
        this._saveParticipant();
      }).fail(
        generalErrorFactory.createHandler('ADMIN.AMENDMENT.PARTY.CREATE', () => {
          Radio.channel('modals').request('remove', this);
          loaderChannel.trigger('page:load:complete');
        })
      );
    }
  },

  clickClose() {
    // Make sure to clean up model
    if (this.participantModel.isNew() && this.participantCollection) {
      this.participantCollection.remove(this.participantModel);
    }
    Radio.channel('modals').request('remove', this);
  },

  initialize(options) {
    if (!options.collection) {
      console.log(`[Error] Need a collection to add participant to`);
      return;
    }
    this.mergeOptions(options, ['is_post_notice', 'participantType', 'enableKnownContact']);
    this.participantCollection = options.collection;

    this.participantModel = new ParticipantModel({
      // Default value to person
      participant_type: configChannel.request('get', 'PARTICIPANT_TYPE_PERSON'),
    });
    this.participantCollection.add(this.participantModel);

    this.intakeParticipantModel = new IntakeParticipantModel({
      participantTypeUI: configChannel.request('get', 'PARTICIPANT_TYPE_UI_ALL'),
      participantModel: this.participantModel,
      noEmailOptOut: true,
      isRespondent: this.participantType === 'Respondent',
      useMailAddressValidation: false
    });

    this.intakeParticipantModel.get('addressModel').setToRequired();

    if (this.intakeParticipantModel.get('isRespondent')) {
      this.intakeParticipantModel.get('hearingOptionsByModel').set('cssClass', 'optional-input');
    }

    this.createAmendmentModels();
    this.setupListeners();
  },

  createAmendmentModels() {
    this.amendmentByModel = new DropdownModel({
      optionData: this.getAmendmentParticipantOptionData(participantChannel.request('get:applicants')),
      labelText: "Amendment By",
      required: true,
      defaultBlank: true,
      value: null,
      apiMapping: 'amendment_submitter_id'
    });

    this.amendmentRtbInitModel = new CheckboxModel({
      html: 'RTB Initiated',
      required: false,
      checked: false,
      apiMapping: 'is_internally_initiated'
    });

    this.amendmentRespondentInitModel = new CheckboxModel({
      html: 'Respondent Initiated',
      required: false,
      checked: false
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
    return (participants || []).filter(p => !p.isNew()).map(p => ({ value: p.id, text: p.getContactName() }) );
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


  _applyModelUpdates() {
    this.participantModel.set(this.intakeParticipantModel.getUIDataAttrs(), {silent: true});
  },

  _saveParticipant() {
    const creation_method = this.participantType === 'Respondent' ? 'create:respondent' : 'create:applicant';
    const options = { no_tou: true };

    participantChannel.request(creation_method, this.participantModel, options)
      .done(() => this.trigger('save:complete', this.participantModel))
      .fail(
        generalErrorFactory.createHandler('ADMIN.PARTY.CREATE', () => {
          Radio.channel('modals').request('remove', this);
          loaderChannel.trigger('page:load:complete');
        })
      );
  },

  onRender() {
    this.showChildView('participantRegion', new IntakeParticipantView({
      model: this.intakeParticipantModel,
      noHeader: true,
      enablePackageMethod: true,
      packageMethodOptional: this.intakeParticipantModel.get('isRespondent'),
      disableEmailOptOut: true,
      enableUnitType: true,
      enableKnownContact: this.enableKnownContact,
    }));

    if (this.is_post_notice) {
      this.showChildView('amendmentByRegion', new DropdownView({ model: this.amendmentByModel }));
      this.showChildView('amendmentRtbInitRegion', new CheckboxView({ model: this.amendmentRtbInitModel }));
      this.showChildView('amendmentRespondentInitRegion', new CheckboxView({ model: this.amendmentRespondentInitModel }));
      this.showChildView('amendmentNoteRegion', new InputView({ model: this.amendmentNoteModel }));
    }
  },

  attachElContent(html) {
    // Have to attach modals this way so that the 'modal' class in the template is top-level
    this.setElement(html);
    return this;
  },

  templateContext() {
    return this.options;
  }
});
