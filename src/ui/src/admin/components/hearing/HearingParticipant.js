/**
 * @fileoverview - View that displays participation information for a hearing participant
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import RadioIconView from '../../../core/components/radio/RadioIcon';
import RadioModel from '../../../core/components/radio/Radio_model';
import template from './HearingParticipant_template.tpl';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  className() { return `hearing-participant ${this.getOption('viewMode') ? 'view' : ''}`; },

  regions: {
    participationIconRegion: '.hearing-participant-participation-icons',
    notesRegion: '.hearing-participant-note',
    otherPartyAssociationRegion: '.hearing-participant-other-party-association',
    otherNameRegion: '.hearing-participant-other-name',
    otherTitleRegion: '.hearing-participant-other-title'
  },

  ui: {
    delete: '.hearing-participant-other-name-delete-icon'
  },

  events: {
    'click @ui.delete': 'clickDelete'
  },

  clickDelete() {
    if (this.model.isOther()) {
      if (this.model.collection) this.model.collection.remove(this.model);
    } else {
      this.model.setToUnattended();
      this.updateUIModels();
      this.render();
    }
  },

  validateAndShowErrors() {
    const otherNameView = this.getChildView('otherNameRegion');
    if (this.model.isOther() && otherNameView) {
      return otherNameView.validateAndShowErrors();
    }
    return true;
  },

  getUIDataAttrs() {
    const return_obj = {};
    _.each([
      'participationIconModel', 'partyAssociationDropdown',
      'participationNote', 'participantOtherName', 'participantOtherTitle'], function(name) {
      const model = this[name];
      _.extend(return_obj, (model && model.getPageApiDataAttrs ? model.getPageApiDataAttrs() : {}));
    }, this);

    return return_obj;
  },

  /**
   * @param {String} viewMode - view|edit triggers the UI to change between edit and display mode
   * @param {UnitModel} matchingUnit
   */
  initialize(options) {
    this.mergeOptions(options, ['viewMode', 'matchingUnit']);

    this.HEARING_PARTICIPATION_NAME_MAX_LENGTH = configChannel.request('get', 'HEARING_PARTICIPATION_NAME_MAX_LENGTH');
    this.createEditModels();

    this.listenTo(this.participationIconModel, 'change:value', this.render, this);
    this.listenTo(this.model, 'ui:attendence:set', (isAttended) => {
      this.participationIconModel.set('value', isAttended ? 1 : 0);
    });
  },

  _getPartyAssociationOptions() {
    const dispute = disputeChannel.request('get');
    return [{
        value: configChannel.request('get', 'HEARING_PARTICIPATION_ASSOCIATION_APPLICANT'),
        text: `Applicant - ${dispute.isLandlord()?'Landlord': 'Tenant'}`
      }, {
        value: configChannel.request('get', 'HEARING_PARTICIPATION_ASSOCIATION_RESPONDENT'),
        text: `Respondent - ${dispute.isLandlord()?'Tenant': 'Landlord'}`
      }];
  },

  updateUIModels() {
    const setOptions = { silent: true };
    this.participationIconModel.set('value', this.model.isOther() ? 1 : this.model.get('participation_status'), setOptions);
    this.partyAssociationDropdown.set('value', this.model.get('other_participant_association'), setOptions);
    this.participationNote.set('value', this.model.get('participation_comment'), setOptions);
    this.participantOtherName.set('value', this.model.get('other_participant_name'), setOptions);
    this.participantOtherTitle.set('value', this.model.get('other_participant_title'), setOptions);
  },

  createEditModels() {
    this.participationIconModel = new RadioModel({
      optionData: [{ iconClass: 'hearing-participant-participation-icon-yes', value: 1 },
        { iconClass: 'hearing-participant-participation-icon-no', value: 0 }],
      disabled: this.model.isOther(),
      value: this.model.isOther() ? 1 : this.model.get('participation_status'),
      apiMapping: 'participation_status'
    });
    
    this.partyAssociationDropdown = new DropdownModel({
      optionData: this._getPartyAssociationOptions(),
      labelText: 'Attendee associated to',
      required: true,
      value: this.model.get('other_participant_association'),
      apiMapping: 'other_participant_association'
    });

    this.participationNote = new InputModel({
      labelText: 'Participation Note',
      required: false,
      cssClass: 'optional-input',
      maxLength: configChannel.request('get', 'HEARING_PARTICIPATION_COMMENT_MAX_LENGTH'),
      value: this.model.get('participation_comment'),
      apiMapping: 'participation_comment'
    });

    this.participantOtherName = new InputModel({
      allowedCharacters: InputModel.getRegex('person_name__allowed_chars'),
      restrictedCharacters: InputModel.getRegex('person_name__restricted_chars'),
      labelText: 'Participant Full Name',
      errorMessage: `Please enter participant full name`,
      required: true,
      maxLength: this.HEARING_PARTICIPATION_NAME_MAX_LENGTH,
      value: this.model.get('other_participant_name'),
      apiMapping: 'other_participant_name',
      maxWords: configChannel.request('get', 'HEARING_PARTICIPANT_MAX_NUM_WORDS'),
    });

    this.participantOtherTitle = new InputModel({
      labelText: 'Participant Title',
      errorMessage: 'Please enter participant title',
      cssClass: 'optional-input',
      required: false,
      maxLength: this.HEARING_PARTICIPATION_NAME_MAX_LENGTH,
      value: this.model.get('other_participant_title'),
      apiMapping: 'other_participant_title'
    });
  },

  onRender() {
    if (!this.viewMode) {
      this.showChildView('participationIconRegion', new RadioIconView({
        deselectEnabled: true,
        model: this.participationIconModel
      }));
      this.showChildView('otherPartyAssociationRegion', new DropdownView({ model: this.partyAssociationDropdown }));
      this.showChildView('notesRegion', new InputView({ model: this.participationNote }));
      this.showChildView('otherNameRegion', new InputView({ model: this.participantOtherName }));
      this.showChildView('otherTitleRegion', new InputView({ model: this.participantOtherTitle }));
    }
  },

  templateContext() {
    const participant_model = this.model.get('participant_model');
    const dispute = disputeChannel.request('get');
    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY');
    const APPLICANT_TYPE_DISPLAY = { 0: 'Unknown', 1: dispute.isLandlord()?'Landlord':'Tenant', 2: dispute.isLandlord()?'Tenant':'Landlord' };
    const isOther = this.model.isOther();
    const name = isOther ? this.model.get('other_participant_name') : participant_model ? participant_model.getContactName() : '';
    const landlordOrTenant = isOther ? APPLICANT_TYPE_DISPLAY[this.model.get('other_participant_association') || 0] : this.model.get('landlordOrTenant');

    return {
      isOther,
      displayNameInEdit: isOther ? 'Other Participant' :
        participant_model ? `${this.matchingUnit ? `${this.matchingUnit.getUnitNumDisplayShort()}: ` : ''}${participant_model.getContactName()}` :
        this.model.get('participant_id'),
      landlordOrTenant,
      matchingUnit: this.matchingUnit,
      displayName: `${isOther ? 'Other: ' : ''}${this.matchingUnit ? `${this.matchingUnit.getUnitNumDisplayShort()}: ` : ''}${name}`,
      participantTypeDisplay: isOther ?
          (this.model.get('other_participant_title') ? this.model.get('other_participant_title') : '-') :
          (participant_model ? PARTICIPANT_TYPE_DISPLAY[participant_model.get('participant_type')] :
          this.model.get('other_participant_name')),
      viewMode: this.viewMode,
      isSelectedUnserved: this.participationIconModel.getData() === null
    };
  }
});
