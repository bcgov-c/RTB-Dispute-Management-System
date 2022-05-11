import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import template from './ModalAssignHearing_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const DMS_TYPE_CODE = '1';
const EXTERNAL_TYPE_CODE = '2';

const hearingChannel = Radio.channel('hearings');
const searchChannel = Radio.channel('searches');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'assignHearingLink_modal',

  regions: {
    dmsInputRegion: '.editHearingLink-add-dms',
    externalInputRegion: '.editHearingLink-add-external',
    fileTypeRegion: '.editHearingLink-type-dropdown'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      dmsInputBtn: '.editHearingLink-add-dms-btn',
      externalInputBtn: '.editHearingLink-add-external-btn',
      remove: '.glyphicon-remove',
      save: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.remove': 'clickRemove',
      'click @ui.dmsInputBtn': 'clickAddDms',
      'click @ui.externalInputBtn': 'clickAddExternal',
      'click @ui.save': 'clickSaveWithStateCheck'
    });
  },

  _isDmsTypeSelected() {
    return this.fileTypeDropdownModel.getData() === DMS_TYPE_CODE;
  },

  clickSaveWithStateCheck: async function() {
    if (!this.selectedDispute && !this.selectedDisputeGuid) return;
    const showInvalidHearingStateModal = () => {
      this.$el.hide();
      hearingChannel.request('show:invalid:modal').finally(() => {
        this.model.trigger('hearings:refresh');
        this.close();
      });
    };
    const onStateCheckError = () => this.model.trigger('hearings:refresh');

    return this.model.withStateCheck(
      this.clickSave.bind(this, ...arguments),
      showInvalidHearingStateModal.bind(this),
      onStateCheckError.bind(this)
    );
  },

  clickSave() {
    this.model.createDisputeHearing(this._isDmsTypeSelected() ?
      { dispute_guid: this.selectedDisputeGuid } :
      { external_file_id: this.selectedDispute }
    );

    this.model.saveDisputeHearings()
      .done(() => {
        this.model.checkAndUpdateLinkType().always(() => {
          this.trigger('save:complete');
          this.close();
        });
      }).fail(err => {
        loaderChannel.trigger('page:load:complete')
        err = err || {};
        if (hearingChannel.request('check:scheduling:error', err)) {
          const dmsInputView = this.getChildView('dmsInputRegion');
          const errorMessage = 'File is already associated to a hearing.';
          if (dmsInputView) {
            dmsInputView.showErrorMessage(errorMessage);
          } else {
            alert(errorMessage);
          }
          this.model.resetDisputeHearings();
        } else {
          generalErrorFactory.createHandler('ADMIN.DISPUTEHEARING.SAVE', () => {
            this.model.resetDisputeHearings();
          })(err);
        }
      });
  },

  clickRemove() {
    this.selectedDispute = null;
    this.dmsInputModel.set('value', null);
    this.externalInputModel.set('value', null);
    this.render();
  },

  clickAddDms() {
    this.clearSelectedDisputeData();
    
    const dmsInputView = this.getChildView('dmsInputRegion');
    const inputValue = this.dmsInputModel.getData({ parse: true });
    if (!dmsInputView || !dmsInputView.validateAndShowErrors()) {
      return;
    }

    if (this.model.getDisputeHearings().findWhere({ hearing_id: inputValue })) {
      dmsInputView.showErrorMessage("File already linked");
      return;
    }

    loaderChannel.trigger('page:load');
    searchChannel.request('search:dispute', inputValue).done(dispute => {
      if (!dispute?.[0]) {
        dmsInputView.showErrorMessage("Invalid DMS File Number");
      } else {
        this.complexity = dispute[0].dispute_complexity;
        this.selectedDispute = inputValue;
        this.selectedDisputeGuid = dispute[0].dispute_guid;
        this.render();
      }
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
    })
    .always(() => loaderChannel.trigger('page:load:complete'));
  },

  clickAddExternal() {
    this.clearSelectedDisputeData();

    const externalInputView = this.getChildView('externalInputRegion');
    const inputValue = this.externalInputModel.getData({ parse: true });
    if (!externalInputView || !externalInputView.validateAndShowErrors()) {
      return;
    }

    if (this.model.getDisputeHearings().findWhere({ external_file_id: inputValue })) {
      externalInputView.showErrorMessage("File already linked");
    } else {
      this.selectedDispute = inputValue;
    }
    this.render();
  },

  clearSelectedDisputeData() {
    this.selectedDispute = null;
    this.selectedDisputeGuid = null;
  },

  initialize() {
    this.clearSelectedDisputeData();
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.fileTypeDropdownModel = new DropdownModel({
      optionData: [{ value: DMS_TYPE_CODE, text: 'DMS File' }, { value: EXTERNAL_TYPE_CODE, text: 'External File' }],
      labelText: 'File Type',
      value: DMS_TYPE_CODE
    });

    this.dmsInputModel = new InputModel({
      inputType: 'dispute_number',
      labelText: 'DMS File Number',
      errorMessage: 'Enter a DMS File Number',
      maxLength: 9,
      required: true
    });

    this.externalInputModel = new InputModel({
      inputType: 'legacy_dispute_number',
      labelText: 'External File Number',
      errorMessage: 'Enter a File Number',
      minLength: 5,
      maxLength: 8,
      required: true
    });
  },

  setupListeners() {
    this.listenTo(this.fileTypeDropdownModel, 'change:value', function() {
      this.dmsInputModel.set('value', null);
      this.externalInputModel.set('value', null);
      this.clearSelectedDisputeData();
      this.render();
    }, this);
  },

  onRender() {
    const disabled = !!this.selectedDispute;
    this.fileTypeDropdownModel.set({ disabled });
    this.dmsInputModel.set({ disabled });
    this.externalInputModel.set({ disabled });

    this.showChildView('fileTypeRegion', new DropdownView({ model: this.fileTypeDropdownModel }));
    this.showChildView('dmsInputRegion', new InputView({ model: this.dmsInputModel }));
    this.showChildView('externalInputRegion', new InputView({ model: this.externalInputModel }));

    const dmsInputView = this.getChildView('dmsInputRegion');
    const externalInputView = this.getChildView('externalInputRegion');

    this.stopListening(dmsInputView, 'input:enter');
    this.listenTo(dmsInputView, 'input:enter', this.clickAddDms, this);

    this.stopListening(externalInputView, 'input:enter');
    this.listenTo(externalInputView, 'input:enter', this.clickAddExternal, this);
  },

  templateContext() {
    return {
      Formatter,
      isDmsTypeSelected: this._isDmsTypeSelected(),
      selectedDispute: this.selectedDispute,
      complexity: Formatter.toComplexityDisplay(this.complexity),
      hearingDateTimeDisplay: `${Moment(this.model.get('local_start_datetime')).format('ddd, MMM D, YYYY - h:mmA')} - ${
        Moment(this.model.get('local_end_datetime')).format('h:mmA')}`
    };
  }

});
