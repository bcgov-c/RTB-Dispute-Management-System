import React from 'react';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import GarbageCanIcon from '../../../../static/Icon_AdminPage_Delete.png';
import RadioView from '../../../../../core/components/radio/Radio';
import RadioModel from '../../../../../core/components/radio/Radio_model';
import ErrorIcon from '../../../../static/Icon_Alert_SML.png';

const filesChannel = Radio.channel('files');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');

const ALL_VALUES_FILTER_VALUE = 0;

const UploadView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['activeRowId', 'isEditMode', 'index', 'isDutySelected']);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const emergencyPriorityOption = [{ value:  Formatter.toUrgencyDisplay(configChannel.request('get', 'DISPUTE_URGENCY_EMERGENCY')), text: Formatter.toUrgencyDisplay(configChannel.request('get', 'DISPUTE_URGENCY_EMERGENCY')) }];
    const dutyPriorityOption = [{ value:  Formatter.toUrgencyDisplay(configChannel.request('get', 'DISPUTE_URGENCY_DUTY')), text: Formatter.toUrgencyDisplay(configChannel.request('get', 'DISPUTE_URGENCY_DUTY')) }];
    const userId = this.model.get('userId')?.split('-')?.pop();
    const hearingOwner = userChannel.request('get:user', Number(userId));
    let hearingPriorityOptionData = this.getPriorityOptions();
    if (hearingOwner?.isEmergencyScheduler() || this.model.get('priority') === "Emergency") hearingPriorityOptionData = [...hearingPriorityOptionData, ...emergencyPriorityOption];
    if ((hearingOwner?.isDutyScheduler() || this.model.get("priority" === "Duty")) && this.isDutySelected) hearingPriorityOptionData = [...hearingPriorityOptionData, ...dutyPriorityOption];

    this.hearingPriorityModel = new DropdownModel({
      optionData: hearingPriorityOptionData,
      defaultBlank: false,
      required: true,
      value: this.model.get('priority') ? this.model.get('priority') : null,
    });
  },

  setupListeners() {
    this.listenTo(this.hearingPriorityModel, 'change:value', (model, value) => {
      this.model.set({ priority: value });
      this.collection.trigger('priority:updated', this.model);
    });
  },

  getPriorityOptions() {
    return _.map(['DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED'],
    function(code) {
      const value = configChannel.request('get', code);
      return { value: Formatter.toUrgencyDisplay(value), text: Formatter.toUrgencyDisplay(value) };
    });
  },

  deleteHearing() {
    this.collection.remove(this.model);
    const nextIndex = this.index < this.collection.length ? this.index : this.collection.length - 1
    this.collection.trigger('click:row', nextIndex);

    this.collection.trigger('delete:hearing', this.model);
  },

  clickRow() {
    if (this.isEditMode && this.activeRowId !== this.index) this.collection.trigger('click:row', this.index);
  },

  onRender() {
    const isRowSelected = this.activeRowId === this.index;
    if (isRowSelected && this.isEditMode) this.showChildView('priorityRegion', new DropdownView({ model: this.hearingPriorityModel }));
  },

  regions: {
    priorityRegion: '.upload-table__list-item__priority'
  },
  
  template() {
    const isRowSelected = this.activeRowId === this.index;
    return <div className={`upload-table__list-item${isRowSelected && this.isEditMode ? '--active' : ''} ${this.isEditMode ? 'upload-table__editable-row' : ''} upload-table__editable-row-height`} onClick={() => this.clickRow()}>
      <div className={`upload-table__list-item__id${isRowSelected && this.isEditMode ? '__delete' : ''}`}>{isRowSelected && this.isEditMode ? <img className="upload-table__delete" onClick={() => this.deleteHearing()} src={GarbageCanIcon}/> : this.model.get('userId')}</div>
      <div className="upload-table__list-item__first-name">{this.model.get('firstName')}</div>
      <div className="upload-table__list-item__last-name">{this.model.get('lastName')}</div>
      <div className="upload-table__list-item__region">{this.model.get('region')}</div>
      <div className="upload-table__list-item__date">{this.model.get('date')}</div>
      <div className="upload-table__list-item__start-time">{this.model.get('startTime')}</div>
      <div className="upload-table__list-item__end-time">{this.model.get('endTime')}</div>
      <div className="upload-table__list-item__priority">{this.model.get('priority')}</div>
    </div>
  },

});

const UploadsCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: UploadView,

  childViewOptions(model, index) {
    return {
      collection: this.getOption('collection'),
      activeRowId: this.getOption('activeRowId'),
      isEditMode: this.getOption('isEditMode'),
      isDutySelected: this.getOption('isDutySelected'),
      index
    }
  }
});

const HearingGenerationUploads = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['collection', 'isDutySelected', 'emergencyUsers', 'firstEmergencyUserId', 'emergenciesPerDay','periodModel', 'startDate', 'endDate', 'duration', 'dailyHearingTimes', 'hearingErrors']);
    this.template = this.template.bind(this);
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.importCollection = this.createImportCollection();
    this.editModeCollection = this.importCollection.clone();
    this.isEditMode = false;
    this.activeRowId = null;

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    let daysOfTheWeekOptionData = [{ text: 'All days', value: ALL_VALUES_FILTER_VALUE }];
    const daysInImportCollection = this.importCollection
      .map((hearing) => ( { text: Moment(hearing.get('date')).format('ddd'), value: Moment(hearing.get('date')).format('dddd'), dayVal: Moment(hearing.get('date')).day() }))
      .filter((hearing, index, self) => (self.findIndex(h => h.value === hearing.value) === index))
      .sort((h1,h2) => h1.dayVal - h2.dayVal);
    daysOfTheWeekOptionData = [...daysOfTheWeekOptionData, ...daysInImportCollection];

    this.daysOfWeekFilterModel = new RadioModel({
      optionData: daysOfTheWeekOptionData,
      required: true,
      value: ALL_VALUES_FILTER_VALUE,
    });

    let hearingTimesOptionData = [{ text: 'All times', value: ALL_VALUES_FILTER_VALUE }];
    const selectedHearingTimes = this.dailyHearingTimes.map((hearings) => ({ text: Formatter.toTimeDisplay(Moment(hearings.get('start_time'), "hh:mm")), value: `${hearings.get('start_time')}:00` }));
    hearingTimesOptionData = [...hearingTimesOptionData, ...selectedHearingTimes];
    this.hearingTimesFilterModel = new RadioModel({
      optionData: hearingTimesOptionData,
      required: true,
      value: ALL_VALUES_FILTER_VALUE,
    });

    const hearingPriorityOptionData = [
      { text: 'All Priorities', value: ALL_VALUES_FILTER_VALUE },
      { text: 'Standard', value: 'Standard' },
      { text: 'Deferred', value: 'Deferred' },
      { text: 'Emergency', value: 'Emergency' },
    ];
    if (this.isDutySelected) hearingPriorityOptionData.push({ text: 'Duty', value: 'Duty' });
    this.hearingPriorityFilterModel = new RadioModel({
      optionData: hearingPriorityOptionData,
      required: true,
      value: ALL_VALUES_FILTER_VALUE,
    });
  },

  setupListeners() {
    this.listenTo(this.editModeCollection, 'click:row', (rowId) => {
      this.activeRowId = rowId;
      this.render();
    });

    this.listenTo(this.editModeCollection, 'delete:hearing', (model) => this.importCollection.remove(model));
    this.listenTo(this.editModeCollection, 'priority:updated', (model) => {
      const modelToUpdate = this.importCollection.find(model);
      modelToUpdate.set({ priority: model.get('priority')});
    });

    this.listenTo(this.daysOfWeekFilterModel, 'change:value', () => this.filterEditModeCollection());
    this.listenTo(this.hearingTimesFilterModel, 'change:value', () => this.filterEditModeCollection());
    this.listenTo(this.hearingPriorityFilterModel, 'change:value', () => this.filterEditModeCollection());
  },

  resetFilters() {
    this.daysOfWeekFilterModel.set({ value: ALL_VALUES_FILTER_VALUE });
    this.hearingTimesFilterModel.set({ value: ALL_VALUES_FILTER_VALUE });
    this.hearingPriorityFilterModel.set({ value: ALL_VALUES_FILTER_VALUE });
  },

  filterEditModeCollection() {
    const filteredCollection = this.importCollection.filter((hearing) => {
      const priorityFilter = this.hearingPriorityFilterModel.getData() ? this.hearingPriorityFilterModel.getData() === hearing.get('priority') : true
      const hearingTimeFilter = this.hearingTimesFilterModel.getData() ? this.hearingTimesFilterModel.getData() === hearing.get('startTime') : true
      const dayOfWeekFilter = this.daysOfWeekFilterModel.getData() ? this.daysOfWeekFilterModel.getData() === Moment(hearing.get('date')).format("dddd") : true
      return priorityFilter && hearingTimeFilter && dayOfWeekFilter;
    })
    this.editModeCollection.reset(filteredCollection);
    this.render();
  },

  createImportCollection() {
    const importCollection = new Backbone.Collection();
    this.collection.forEach(hearing => {
      const user = userChannel.request('get:user', hearing.get('hearing_owner'));
      const displayName = user.getDisplayName();
      const hasCommaInName = displayName.split(", ")?.length === 2;
      const hasOneSpaceInName = displayName.split(" ")?.length === 2;
      let firstName = displayName;
      let lastName = displayName;

      if (hasCommaInName) {
        // Single (comma + space) in name denotes IDIRs, which take the form: "<LastName>, <FirstName> <GovTitle>"
        lastName = displayName.split(", ")[0];
        firstName = displayName.split(", ")[1];
      } else if (hasOneSpaceInName) {
        // Otherwise, assume standard "<FirstName> <LastName>"
        firstName = displayName.split(" ")[0];
        lastName = displayName.split(" ")[1];
      }

      importCollection.add({
        userId: `ID-${hearing.get('hearing_owner')}`,
        firstName,
        lastName,
        region: hearing.get('hearing_region'),
        date: Moment.tz(hearing.get('hearing_start_datetime'), this.RTB_OFFICE_TIMEZONE_STRING).format('DD-MMM-YY'),
        startTime: Moment.tz(hearing.get('hearing_start_datetime'), this.RTB_OFFICE_TIMEZONE_STRING).format('HH:mm:ss'),
        endTime: Moment.tz(hearing.get('hearing_end_datetime'), this.RTB_OFFICE_TIMEZONE_STRING).format('HH:mm:ss'),
        priority: Formatter.toUrgencyDisplay(hearing.get('hearing_priority'))
      });
    });

    return importCollection;
  },

  changeConfiguration() {
    this.collection.trigger('change:selection');
  },

  changeToEditMode(isEdit) {
    this.isEditMode = isEdit;
    if (!isEdit) {
      this.activeRowId = null;
      this.editModeCollection.reset(this.importCollection.models);
      this.resetFilters();
    }
    this.render();
  },

  clickImportHearings() {
    const csvFileLines = this.createFileLines();
    const csvContent = csvFileLines.map(line => line.join(",")).join("\r\n");
    const csvFilename = `ScheduleManager_HearingGeneration_${Moment().format('MM_DD_YYYY')}.csv`;
    const csvBrowserFile = new File([csvContent], csvFilename,{ type: "text/csv" });
    this.collection.trigger('import:hearings', csvBrowserFile);
  },

  clickDownloadCsv() {
    const csvFilename = `ScheduleManager_HearingGeneration_${Moment().format('MM_DD_YYYY')}.csv`;
    const csvFileLines = this.createFileLines();
    // Enclose all csv items and start download
    filesChannel.request('download:csv', csvFileLines, csvFilename, { noColumnQuotes: true });
  },

  clickDownloadErrorsCsv() {
    const csvFileLines = [];
    csvFileLines.push(['Error Text']);
    this.hearingErrors.forEach(error => {
      csvFileLines.push([error])
    })
    
    const csvFilename = `ScheduleManager_HearingGeneration_Errors__${Moment().format('MM_DD_YYYY')}.csv`;
    // Enclose all csv items and start download
    filesChannel.request('download:csv', csvFileLines, csvFilename);
  },

  createFileLines() {
    const csvFileLines = [];
    csvFileLines.push(['UserID', 'First Name', 'Last Name', 'Region', 'Date Assigned', 'Time', 'Priority', 'End Time']);
    this.importCollection.forEach(importHearing => {
      csvFileLines.push([
        importHearing.get('userId'),
        importHearing.get('firstName'),
        importHearing.get('lastName'),
        importHearing.get('region'),
        importHearing.get('date'),
        importHearing.get('startTime'),
        importHearing.get('priority'),
        importHearing.get('endTime'),
      ])
    });

    return csvFileLines;
  },

  onRender() {
    this.showChildView('uploadsRegion', new UploadsCollectionView({ collection: this.isEditMode ? this.editModeCollection : this.importCollection, activeRowId: this.activeRowId, isEditMode: this.isEditMode, isDutySelected: this.isDutySelected }));

    if (this.isEditMode) {
      this.showChildView('daysOfWeekFilterRegion', new RadioView({ model: this.daysOfWeekFilterModel }));
      this.showChildView('hearingTimesFilterRegion', new RadioView({ model: this.hearingTimesFilterModel }));
      this.showChildView('hearingUrgencyFilterRegion', new RadioView({ model: this.hearingPriorityFilterModel }));
    }
  },

  regions: {
    uploadsRegion: '.upload-table__list',
    daysOfWeekFilterRegion: '.hearing-generation__days-of-week',
    hearingTimesFilterRegion: '.hearing-generation__hearing-times',
    hearingUrgencyFilterRegion: '.hearing-generation__hearing-urgency'
  },

  template() {
    return <>
      { this.renderJsxHeader() }
      <div className={`upload-table__filter-wrapper${this.isEditMode ? '--edit' : ''}`}>
        <div className={`upload-table__filters${this.isEditMode ? '--edit' : ''}`}>{ this.isEditMode ? <span>Day of the week:&nbsp;</span> : '' } <div className="hearing-generation__days-of-week"></div></div>
        <div className={`upload-table__filters${this.isEditMode ? '--edit' : ''}`}>{ this.isEditMode ? <span>Hearing times:&nbsp;</span> : '' } <div className="hearing-generation__hearing-times"></div></div>
        <div className={`upload-table__filters${this.isEditMode ? '--edit' : ''}`}>{ this.isEditMode ? <span>Hearing Priorities:&nbsp;</span> : '' } <div className="hearing-generation__hearing-urgency"></div></div>
      </div>
      <div className="upload-table__list-header">
        <div className="upload-table__list-item__id">UserID</div>
        <div className="upload-table__list-item__first-name">First Name</div>
        <div className="upload-table__list-item__last-name">Last Name</div>
        <div className="upload-table__list-item__region">Region</div>
        <div className="upload-table__list-item__date">Date Assigned</div>
        <div className="upload-table__list-item__start-time">Start Time</div>
        <div className="upload-table__list-item__end-time">End Time</div>
        <div className="upload-table__list-item__priority">Priority</div>
      </div>
      <div className="upload-table__list"></div>
      { this.isEditMode ? <div className="hearing-generation__upload-alert upload-table__error">
        <span>
          These hearings will be imported into DMS using the same import feature available in the yearly schedule view. If you need to make extensive
          changes to the generated schedule that cannot be made here, download the .csv, edit the file, and then import it back into DMS in the yearly schedule view.
        </span>
      </div> : null }
      {this.renderJsxButtons()}
    </>
  },

  renderJsxHeader() {
    const totalNumOfHearings = this.importCollection.length;
    const numOfemergencyHearings = this.importCollection.filter(hearing => hearing.get('priority') === 'Emergency').length;
    const numOStandardHearings = this.importCollection.filter(hearing => hearing.get('priority') === 'Standard').length;
    const numOfDeferredHearings = this.importCollection.filter(hearing => hearing.get('priority') === 'Deferred').length;

    if (this.isEditMode) {
      return <p>
            You are now in edit mode. In this mode you can use the filters below to view specific hearings you want to edit, and then click on a hearing row to see the edit options that are available. 
            Any changes to a row will immediately update the generated import hearings. When you are done editing, click the "exit" button to return to the generation process. 
            You can return to edit mode again if you need to make additional changes.
          </p>
    } else {
      return (
        <>
          <div className="hearing-generation__schedule-period">
            <label className="general-modal-label">Generated Date Range:</label>&nbsp;<span className="general-modal-value"><b>{`${Moment(this.startDate).format('ddd')} - ${Formatter.toDateDisplay(Moment(this.startDate))} to ${Moment(this.endDate).format('ddd')} - ${Formatter.toDateDisplay(Moment(this.endDate))}`}, <label className="general-modal-label">{this.duration} {this.duration === 1 ? 'day' : 'days'}</label></b></span>
          </div>
          <div className="hearing-generation__import-stats">
            <span>All Hearings: {totalNumOfHearings}</span>
            <span className="hearing-generation__import-stats__emergency">Emergency: {numOfemergencyHearings}, {Formatter.toPercentageDisplay(numOfemergencyHearings, totalNumOfHearings)}</span>
            <span className="hearing-generation__import-stats__standard">Standard: {numOStandardHearings}, {Formatter.toPercentageDisplay(numOStandardHearings, totalNumOfHearings)}</span>
            <span className="hearing-generation__import-stats__deferred">Deferred: {numOfDeferredHearings}, {Formatter.toPercentageDisplay(numOfDeferredHearings, totalNumOfHearings)}</span>
          </div>
        </>
      );
    }
  },

  renderJsxButtons() {
    if (!this.isEditMode) {
      return <>
        <div className="upload-table__buttons">
          {this.hearingErrors.length ? <>
            <span className="general-link upload-table__error-download" onClick={() =>this.clickDownloadErrorsCsv()}>
              <img src={ErrorIcon} /> Download .csv of errors&nbsp;
            </span>&nbsp;
          </> : null}
          <span className="general-link" onClick={() => this.clickDownloadCsv()}>Download .csv of process results</span>
          <button className="btn btn-lg btn-cancel">Cancel</button>
          <button className="btn btn-lg upload-table__buttons__edit" onClick={() => this.changeToEditMode(true)}>Edit Directly Here</button>
          <button className="btn btn-lg btn-cancel" onClick={() => this.changeConfiguration()}>Change Configuration</button>
          <button className="btn btn-standard btn-lg" onClick={() => this.clickImportHearings()}>Import Hearings</button>
        </div>
      </>;
    } else {
      return <>
        <div className="upload-table__buttons">
          <button className="btn btn-standard btn-lg" onClick={() => this.changeToEditMode(false)}>Exit Edit Mode</button>
        </div>
      </>
    }
  }
});

_.extend(HearingGenerationUploads.prototype, ViewJSXMixin)
_.extend(UploadView.prototype, ViewJSXMixin)

export { HearingGenerationUploads };