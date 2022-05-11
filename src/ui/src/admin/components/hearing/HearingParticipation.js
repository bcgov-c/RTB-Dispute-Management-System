import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import HearingParticipantCollectionView from './HearingParticipantCollectionView';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');

const HearingParticipation = Marionette.View.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['viewMode', 'unitCollection']);

    this.viewMode = this.viewMode || null;
    this.unitCollection = this.unitCollection || null;
    this.editableRegions = ['hearingPrepTimeRegion', 'hearingDurationRegion', 'methodRegion'];
    this.createSubModels();
    this.hasHearingParticipations = this.model.getParticipations().length;
  },

  createSubModels() {
    this.preparationDurationModel = new InputModel({
      labelText: 'Hearing Prep Time (min)',
      errorMessage: 'Enter the preparation duration in minutes',
      maxLength: 4,
      inputType: 'positive_integer',
      required: false,
      allowZeroAmount: true,
      value: this.model.get('hearing_prep_time'),
      apiMapping: 'hearing_prep_time'
    });

    this.hearingDurationModel = new InputModel({
      labelText: 'Hearing Duration (min)',
      errorMessage: 'Enter the actual hearing duration in minutes',
      maxLength: 4,
      inputType: 'positive_integer',
      required: false,
      value: this.model.get('hearing_duration'),
      apiMapping: 'hearing_duration'
    });

    const prePophearingValue = this.prePopulateHearingMethod();

    this.methodModel = new DropdownModel({
      labelText: 'Hearing Method',
      errorMessage: 'Enter the hearing method',
      defaultBlank: true,
      required: false,
      optionData: this._getHearingMethodOptionsData(),
      value: this.model.get('hearing_method') ? String(this.model.get('hearing_method')) : prePophearingValue ? prePophearingValue : null,
      apiMapping: 'hearing_method'
    });
  },

  _getHearingMethodOptionsData() {
    const HEARING_METHOD_DISPLAYS = configChannel.request('get', 'HEARING_METHOD_DISPLAY');
    return ['HEARING_METHOD_ADJUDICATION', 'HEARING_METHOD_SETTLEMENT', 'HEARING_METHOD_BOTH', 'HEARING_METHOD_OTHER'].map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { value: String(configValue), text: HEARING_METHOD_DISPLAYS[configValue] };
    });
  },

  prePopulateHearingMethod() {
    const hearingMethodAdjudication = configChannel.request('get', 'HEARING_METHOD_ADJUDICATION');
    return String(hearingMethodAdjudication);
  },

  clickAddOther() {
    this.model.createParticipation({
      participant_id: null,
      dispute_guid: disputeChannel.request('get:id')
    });
  },

  validateAndShowErrors() {
    let isValid = true;
    const regionsToValidate = [...this.editableRegions, 'hearingParticipantsRegion'];

    regionsToValidate.forEach((region) => {
      const component = this.getChildView(region);
      if (component) {
        isValid = isValid & component.validateAndShowErrors();
      }
    });
    
    return isValid;
  },

  saveInternalSaveDataToHearingModel() {
    const apiData = {};

    this.editableRegions.forEach((region) => {
      const model = this.getChildView(region);
      if (model) {
        _.extend(apiData, model.getModel().getPageApiDataAttrs());
      }
    });
    this.model.set(apiData);
    const childView = this.getChildView('hearingParticipantsRegion');
    return childView ? childView.saveInternalSaveDataToHearingModel() : true;
  },

  regions: {
    hearingPrepTimeRegion: '.hearing-participation-preparation',
    hearingDurationRegion: '.hearing-participation-duration',
    methodRegion: '.hearing-participation-method',
    hearingParticipantsRegion: '.hearing-participations-collection'
  },

  onRender() {
    this.showChildView('hearingPrepTimeRegion', new EditableComponentView({
      state: 'view',
      label: 'Hearing prep time',
      view_value: this.model.get('hearing_prep_time') ? `${this.model.get('hearing_prep_time')} Min`: '-',
      subView: new InputView({ model: this.preparationDurationModel })
    }));

    this.showChildView('hearingDurationRegion', new EditableComponentView({
      state: 'view',
      label: 'Hearing Duration',
      view_value: this.model.get('hearing_duration') ? `${this.model.get('hearing_duration')} Min`: '-',
      subView: new InputView({ model: this.hearingDurationModel })
    }));

    this.showChildView('methodRegion', new EditableComponentView({
      state: 'view',
      label: 'Hearing Method',
      view_value: this.model.get('hearing_method') ? configChannel.request('get', 'HEARING_METHOD_DISPLAY')[this.model.get('hearing_method')] : '-',
      subView: new DropdownView({ model: this.methodModel })
    }));

    this.showChildView('hearingParticipantsRegion', new HearingParticipantCollectionView({
      viewMode: this.viewMode,
      unitCollection: this.unitCollection,
      collection: this.model.getParticipations()
    }));

    if (!this.viewMode) {
      this.editableRegions.forEach((region) => {
        const component = this.getChildView(region);
        if (component) {
          component.toEditable();
        }
      }, this);
    }
  },

  template() {
    const hasHearingParticipations = this.hasHearingParticipations;

    return (
      <>
        { this.renderJsxParticipationWarningMsg() }
        <div className="hearing-participation-input-container">
          <b className="delivery-time-icon"></b>
          <div className="hearing-participation-group-one">
            <div className="hearing-participation-preparation"></div>
            <div className="hearing-participation-duration"></div>
          </div>
          <div className="hearing-participation-group-two">
            <div className="hearing-participation-method"></div>
          </div>
        </div>
        <div className={`hearing-participations-collection ${hasHearingParticipations ? '' : 'hidden'} `}></div>
      </>
    );
  },

  renderJsxParticipationWarningMsg() {
    let warningMsg = '';

    const currentDispute = disputeChannel.request('get');
    const primaryDisputeHearing = this.model.getPrimaryDisputeHearing();
    const isCurrentlyPrimary = this.model.checkIsDisputePrimaryLink(currentDispute);
    const primaryDisputeHearingDisplay = primaryDisputeHearing ? primaryDisputeHearing.getDisputeLinkHtml() : '-';
    const secondaryDisputeHearingsDisplay = this.model.getSecondaryDisputeHearings().map(model => model.getDisputeLinkHtml()).join(', ') || '-';
    const isCrossRepeatApp = this.model.isCrossRepeatApp();
    const isJoinerApp = this.model.isJoinerApp();
    
    if (isCurrentlyPrimary && (isJoinerApp || isCrossRepeatApp)) {
      return (
        <div className="hearing-participations-warning error-block warning">
          {`On ${isCrossRepeatApp?'cross-repeat':'joiner'} applications additional applicant participation is recorded on the secondary application(s): `}<span dangerouslySetInnerHTML={{__html: secondaryDisputeHearingsDisplay }}/>
        </div>
      );
    } else if (!isCurrentlyPrimary) {
      if (this.model.isCrossApp()) {
        warningMsg = `On cross applications all hearing participation is recorded on the primary application: `;
      } else if (this.model.isRepeatedApp()) {
        warningMsg = `On repeat applications all hearing participation is recorded on the primary application: `;
      } else if (isJoinerApp) {
        warningMsg = `On joiner applications all respondent participation is recorded on the primary application: `;
      } else if (isCrossRepeatApp) {
        warningMsg = `On cross-repeat applications all respondent participation is recorded on the primary application: `;
      }
    }
    if (!warningMsg) return;
    return <div className="hearing-participations-warning error-block warning">{warningMsg}<span dangerouslySetInnerHTML={{__html: primaryDisputeHearingDisplay }}/></div>;
  },
});

_.extend(HearingParticipation.prototype, ViewJSXMixin);
export { HearingParticipation }