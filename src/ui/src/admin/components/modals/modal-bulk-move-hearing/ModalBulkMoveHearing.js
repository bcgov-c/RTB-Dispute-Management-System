import React from 'react';
import ReactDOM from 'react-dom';
import Radio from 'backbone.radio';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import HearingModel from '../../../../core/components/hearing/Hearing_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import BulkMoveCollection from './BulkMove_collection';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import BulkMoveTable from './BulkMoveTable';
import BulkMoveSelectedHearing from './bulk-move-selected-hearing/BulkMoveSelectedHearing';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import './ModalBulkMoveHearing.scss';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const filesChannel = Radio.channel('files');

const FEATURE_TEXT_DESCRIPTION_HTML = 
`Use the search to locate all hearings for a target arbitrator for a time period. You can then go through the list one by one
and reassign (exchange) and delete booked hearings and delete empty hearings. At the end of the process you can export the list
and complete manual actions (i.e rescheduling). <b>IMPORTANT:</b> Only use this process when other users are not modifying the schedule.`

const PROCESSES_ENDED_HTML = `<b>Process Ended</b>. The list of records included in this process are displayed below. If you need a copy of these records to fix errors
or manually process skipped hearings you should download the .csv file now. After you close this window you will not be able to obtain this list again.`

const DATE_START_AFTER_END_TIME_ERROR = 'Start date and time must be before end date and time';
const DATE_START_AFTER_NOW_TIME_ERROR = 'Start date and time must be after current date and time';
const BACKGROUND_CHANGE_ERROR_MSG = 'The hearing could not be reassigned to the selected hearing because the data was changed in the background while this process was being run.  You can try this again manually';

const PROCESSED_HEARING_ERROR_OBJ = { color: '#ff0000', text: 'ERROR', style: 'normal' };
const PROCESSED_HEARING_DELETE_SUCCESS_OBJ = { color: '#339966', text: 'Deleted', style: 'normal' };
const PROCESSED_HEARING_SKIP_SUCCESS = { color: '#ff0000', text: 'Skipped', style: 'normal' };
const PROCESSED_HEARING_SKIP_ON_HOLD_SUCCESS = { color: '#ff0000', text: 'Skipped - Hearing on hold', style: 'normal' };
const PROCESSED_HEARING_REASSIGN_SUCCESS = { color: '#2B9241', text: 'Reassigned', style: 'normal' };
const UNPROCESSED_HEARING_OBJ = { color: '#8b8b8b', text: 'Not Processed Yet', style: 'italic' };

const EMPTY_ONLY_DROPDOWN_VALUE = '1';
const BOOKED_DROPDOWN_VALUE = '2';
const EMPTY_AND_BOOKED_DROPDOWN_VALUE = '3';

const ModalBulkMoveHearings = ModalBaseView.extend({
  id: 'moveHearings_modal',

  initialize() {
    this.template = this.template.bind(this);
    this.createViewVars();
    this.createSubModels();
    this.setupListeners();
  },

  createViewVars() {
    this.loadHearingsClicked = false;
    this.showNoMatchMessage = false;
    this.processComplete = false;
    this.batchDeleteActive = false;
    this.batchDeleteClicked = false;
    this.activeHearingModel = null
    this.activeRowId = null;
    this.dateErrorText = null;
    this.displayDateError = false;
    this.bulkMoveCollection = new BulkMoveCollection()
  },

  createSubModels() {
    this.assignedArbModel = new DropdownModel({
      labelText: 'Assigned Arbitrator',
      errorMessage: 'Select an Arbitrator',
      defaultBlank: true,
      optionData: this.getArbOptions(),
      required: true,
      value: null
    });

    this.reassignStartDateModel = new InputModel({
      labelText: 'Hearings that start at',
      errorMessage: 'Enter start date',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
      value: null,
      minDate: Moment(),
    });

    this.reassignStartTimeModel = new InputModel({
      labelText:' ',
      errorMessage: 'Enter start time',
      inputType: 'time',
      required: true,
      minTime: configChannel.request('get', 'HEARING_MIN_BOOKING_TIME'),
      maxTime: configChannel.request('get', 'HEARING_MAX_BOOKING_TIME'),
      value: null
    });

    this.reassignEndDateModel = new InputModel({
      labelText: ' ',
      errorMessage: 'Enter end date',
      inputType: 'date',
      allowFutureDate: true,
      required: true,
      value: null,
      minDate: Moment(),
    });

    this.reassignEndTimeModel = new InputModel({
      labelText: ' ',
      errorMessage: 'Enter end time',
      inputType: 'time',
      minTime: configChannel.request('get', 'HEARING_MIN_BOOKING_TIME'),
      maxTime: configChannel.request('get', 'HEARING_MAX_BOOKING_TIME'),
      value: null,
      required: true,
    });

    this.hearingBookingTypeModel = new DropdownModel({
      labelText: 'Hearing Booking',
      optionData: [{text: 'Empty Only', value: EMPTY_ONLY_DROPDOWN_VALUE}, {text: 'Booked Only', value: BOOKED_DROPDOWN_VALUE}, {text: 'Both', value: EMPTY_AND_BOOKED_DROPDOWN_VALUE}],
      required: true,
      value: EMPTY_ONLY_DROPDOWN_VALUE
    });

    this.reassignInactiveModel = new CheckboxModel({
      html: 'Include inactive staff **',
      checked: false,
    })
  },

  setupListeners() {
    this.listenTo(this.bulkMoveCollection, 'reassign:hearing', (hearingModel) => {
      this.hearingActionWithStateCheck(this.reassignHearing, hearingModel)
    });

    this.listenTo(this.bulkMoveCollection, 'delete:hearing', (bulkHearingModel) => {
      if (!bulkHearingModel.getHearingModel()) return;
      this.hearingActionWithStateCheck(this.deleteHearing, bulkHearingModel.getHearingModel())
    });

    this.listenTo(this.reassignInactiveModel, 'change:checked', (model, value) => {
      const inactiveClicked = value;
      this.assignedArbModel.set({ optionData: this.getArbOptions({ inactive: inactiveClicked }) });
      this.render();
    });
  },

  getArbOptions(options={ inactive: false }) {
    return _.sortBy(_.map(userChannel.request('get:arbs', { all: options.inactive }), function(arbitrator) {
      return { text: `${Formatter.toUserLevelDisplay(arbitrator)}: ${!arbitrator.isActive()?'** ':''}${arbitrator.getDisplayName()}`, value: String(arbitrator.id), isActive: arbitrator.isActive() };
    }), function(option) { return ((option.isActive && option.text) || 'zzzz').toLowerCase(); });
  },

  validateAndShowErrors() {
    let isValid = true;
    this.displayDateError = false;
    
    const timeAndDateRegions = ['assignedArbRegion', 'reassignStartDateRegion', 'reassignStartTimeRegion', 'reassignEndDateRegion', 'reassignEndTimeRegion'];
    (timeAndDateRegions || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    const startDate = Moment(`${this.reassignStartDateModel.getData({ format: 'date' })}T${this.reassignStartTimeModel.getData({ iso: true })}`);
    const endDate = Moment(`${this.reassignEndDateModel.getData({ format: 'date' })}T${this.reassignEndTimeModel.getData({ iso: true })}`);
    if (!startDate.isBefore(endDate) && startDate.isValid() && endDate.isValid()) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = DATE_START_AFTER_END_TIME_ERROR;
      this.render();
    } else if (startDate.isBefore(Moment()) && startDate.isValid() && endDate.isValid()) {
      isValid = false;
      this.displayDateError = true;
      this.dateErrorText = DATE_START_AFTER_NOW_TIME_ERROR;
      this.render();
    }

    return isValid;
  },

  loadHearings() {
    if(!this.validateAndShowErrors()) return;

    const startDate =`${this.reassignStartDateModel.getData({ format: 'date' })}T${this.reassignStartTimeModel.getData({ iso: true })}`;
    const endDate = `${this.reassignEndDateModel.getData({ format: 'date' })}T${this.reassignEndTimeModel.getData({ iso: true })}`;
    const assignedArb = this.assignedArbModel.getData();

    const searchParams = {
      StartDate: startDate,
      EndDate: endDate
    };

    loaderChannel.trigger('page:load');
    hearingChannel.request('get:by:owner', assignedArb, searchParams).done((hearings) => {
      if(!hearings) return;
      this.processHearings(hearings);

      if (this.bulkMoveCollection.length) {
        this.activeHearingModel = this.bulkMoveCollection.at(0);
        this.activeRowId = 0;
        this.loadHearingsClicked = true;
        this.showNoMatchMessage = false;
        this.disableInputs();
      } else {
        this.showNoMatchMessage = true;
      }
    })
    .fail(generalErrorFactory.createHandler('ADMIN.OWNER.HEARINGS.LOAD', () => this.render()))
    .always(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    });
  },

  processHearings(hearings) {
    let hearingsArray = [];
    const isLoadEmptyHearingsSelected = this.hearingBookingTypeModel.getData() === EMPTY_ONLY_DROPDOWN_VALUE;
    const isLoadBookedHearingsSelected = this.hearingBookingTypeModel.getData() === BOOKED_DROPDOWN_VALUE;

    hearings.daily_hearings.forEach((hearingObj) => {
      hearingObj.hearings = hearingObj.hearings.filter((hearing) => {
        if (isLoadEmptyHearingsSelected) return !hearing.associated_disputes.length;
        else if (isLoadBookedHearingsSelected) return hearing.associated_disputes.length;
        
        return hearing;
      });
      hearingsArray = [...hearingsArray, ...hearingObj.hearings];
    })

    hearingsArray.forEach((hearing) => {
      hearing.hearing_owner = Number(this.assignedArbModel.getData());
    })

    this.bulkMoveCollection.reset(hearingsArray.map((hearing) => {
      return {
        hearingModel: new HearingModel(hearing)
      }
    }));
  },

  disableInputs() {
    const modelsToDisable = [this.assignedArbModel, this.reassignStartDateModel, this.reassignStartTimeModel, this.reassignEndDateModel, this.reassignEndTimeModel, this.hearingBookingTypeModel];
    modelsToDisable.forEach(model => model.set({ disabled: true }));
  },

  setUnprocessedHearings() {
    this.bulkMoveCollection.map(bulkHearingModel => bulkHearingModel.get('moveOperationResult') ? bulkHearingModel : bulkHearingModel.set({ moveOperationResult: UNPROCESSED_HEARING_OBJ }))
  },

  endProcess() {
    if (!this.loadHearingsClicked) return this.close();

    this.batchDeleteActive = false;
    modalChannel.request('show:standard', {
      title: `Exit Bulk Move Hearings`,
      bodyHtml: `
      <p>Are you sure you want to exit this process without completing it? Press Cancel if you want to return to the bulk move hearing process.</p>`,
      onContinueFn: (_modalView) => {
        _modalView.close();
        this.setUnprocessedHearings();
        this.processComplete = true;
        this.render();
        this.$el.show();
      },
      onCancelFn: (_modalView) => {
        if (this.batchDeleteClicked) {
          this.batchDeleteActive = true;
          this.batchDeleteAllUnassignedHearings();
        }

        _modalView.close();
      }
    });
  },

  displayBatchDeleteAllModal() {
    modalChannel.request('show:standard', {
      title: `Delete all unassigned hearings?`,
      bodyHtml: `
      <p>Are you sure you want to delete all unassigned hearings?</p>`,
      onContinueFn: (_modalView) => {
        _modalView.close();
        this.batchDeleteActive = true;
        this.batchDeleteClicked = true;
        this.batchDeleteAllUnassignedHearings();
        this.$el.show();
      }
    });
  },

  batchDeleteAllUnassignedHearings() {
    const deleteHearingsAtIndex = (index) => {
      if (!this.batchDeleteActive || this.processComplete) return;
      const bulkHearingModel = this.bulkMoveCollection.at(index);
      const hearingModel = bulkHearingModel.get('hearingModel');

      if (!hearingModel.id) return;

      if (hearingModel.isReserved()) {
        this.skipHearing(PROCESSED_HEARING_SKIP_ON_HOLD_SUCCESS);
        return deleteHearingsAtIndex(this.activeRowId);
      } else {
        return this.deleteHearing(hearingModel).then(() => {
          deleteHearingsAtIndex(this.activeRowId);
        })
      }
    }

    deleteHearingsAtIndex(this.activeRowId);
  },

  goToNextHearing() {
    this.activeRowId = this.bulkMoveCollection.indexOf(this.activeHearingModel);
    const nextHearingModel = this.bulkMoveCollection.at(this.activeRowId + 1);
    if (nextHearingModel) {
      this.setAndRenderActiveHearingModel(nextHearingModel);
    } else if (this.activeRowId >= this.bulkMoveCollection.length - 1) {
      this.setAndRenderActiveHearingModel(this.activeHearingModel);
      this.activeRowId = this.activeRowId + 1;
    }

    this.render();
  },

  skipHearing(operationResult) {
    this.activeHearingModel.set({ moveOperationResult: operationResult ? operationResult : PROCESSED_HEARING_SKIP_SUCCESS });
    this.goToNextHearing();
  },

  reassignHearing(reassignHearingModel) {
    const reassignHearingPromise = () => new Promise((res, rej) => (
      hearingChannel.request('reassign', this.activeHearingModel.id, reassignHearingModel.id).done(() => {
        // Manually update the modified dates to fake atomicity on the reassign->delete
        const nowWithPadding = Moment().add(5, 'seconds');
        reassignHearingModel.set({ modified_date: nowWithPadding });
        res();
      }).fail(rej)
    ));
    const deleteHearingPromise = () => new Promise((res, rej) => reassignHearingModel.destroy().done(res).fail(rej));

    reassignHearingPromise()
      .then(() => deleteHearingPromise())
      .then(() => {
        this.activeHearingModel.set({ moveOperationResult: PROCESSED_HEARING_REASSIGN_SUCCESS });
      }).catch((err) => {
        this.activeHearingModel.set({ moveOperationResult: PROCESSED_HEARING_ERROR_OBJ, errorMessage: err.responseText });
      }).finally(() => {
        loaderChannel.trigger('page:load:complete');
        this.goToNextHearing();
      })
  },

  hearingActionWithStateCheck(hearingActionFn, hearingModel) {
    if (!hearingModel) return;

    const showInvalidHearingStateModal = () => {
      this.$el.hide();
      hearingChannel.request('show:invalid:modal').finally(() => {
        this.$el.show();
        this.activeHearingModel.set({ moveOperationResult: PROCESSED_HEARING_ERROR_OBJ, errorMessage: BACKGROUND_CHANGE_ERROR_MSG });
        this.goToNextHearing();
      });
    };

    return hearingModel.withStateCheck(
      hearingActionFn.bind(this, hearingModel),
      showInvalidHearingStateModal.bind(this)
    );
  },

  deleteHearing(hearingModel) {
    if (!hearingModel) return;

    const deleteHearingPromise = () => new Promise((res, rej) => hearingModel.destroy().done(res).fail(rej));
    return deleteHearingPromise().then(() => {
      this.activeHearingModel.set({ moveOperationResult: PROCESSED_HEARING_DELETE_SUCCESS_OBJ });
    }).catch((err) => {
      this.activeHearingModel.set({ moveOperationResult: PROCESSED_HEARING_ERROR_OBJ, errorMessage: err.responseText });
    }).finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.goToNextHearing();
    })
  },

  /* CSV download + helpers fn start */
  downloadCsv() {
    const lines = this.convertCurrentViewDataToCsv();
    const startDate =`${Moment(this.reassignStartDateModel.getData()).format('MMM D')}`;
    const endDate = `${Moment(this.reassignEndDateModel.getData()).format('MMM D')}`;

    this._createAndDownloadCsvFile(`BulkMove_${this.assignedArbModel.getSelectedText()}__${startDate}-${endDate}`, lines);
  },

  convertCurrentViewDataToCsv() {
    const headers = ['HearingId', 'Date Assigned', 'Start Time', 'End Time', 'Duration', 'Priority', 'Files', 'Primary File', 'Link', 'Result', 'Error Message'];

    const allLines = [headers];
    this.bulkMoveCollection.forEach((bulkHearingModel) => {
      const hearingModel = bulkHearingModel.getHearingModel();
      if (!hearingModel) return;

      const hearingId = hearingModel.id;
      const dateAssigned = hearingModel.get('local_start_datetime') ? Formatter.toDateDisplay(hearingModel.get('local_start_datetime')) : '-'; 
      const startTime = hearingModel.get('local_start_datetime') ? Formatter.toTimeDisplay(hearingModel.get('local_start_datetime')) : '-';
      const endTime = hearingModel.get('local_end_datetime') ? Formatter.toTimeDisplay(hearingModel.get('local_end_datetime')) : '-';
      const duration = hearingModel.get('local_start_datetime') && hearingModel.get('local_end_datetime') ? 
        Formatter.toDuration(hearingModel.get('local_start_datetime'), hearingModel.get('local_end_datetime')) 
        : '-';
      const priority = hearingModel.get('hearing_priority') ? Formatter.toUrgencyDisplay(hearingModel.get('hearing_priority')) : '';
      const primaryDispute = hearingModel.getPrimaryDisputeHearing();
      const files = hearingModel.get('associated_disputes') ? hearingModel.get('associated_disputes').length : '';
      const primaryFile = primaryDispute ? primaryDispute.get('file_number') : '';
      const link = hearingModel.getDisputeHearingLinkShortDisplay() ? hearingModel.getDisputeHearingLinkShortDisplay() : '';
      const resultText = bulkHearingModel.get('moveOperationResult') ? bulkHearingModel.get('moveOperationResult').text : 'Not Processed Yet';
      const errorMessage = bulkHearingModel.get('errorMessage') ? bulkHearingModel.get('errorMessage') : '';

      const line = [
        `${hearingId}`,
        `${dateAssigned}`,
        `${startTime}`,
        `${endTime}`,
        `${duration}`,
        `${priority}`,
        `${files}`,
        `${primaryFile}`,
        `${link}`,
        `${resultText}`,
        `${errorMessage}`
      ]

      allLines.push(line);

    });

    return allLines.map(line => line.map(item => `"${item}"`));
  },

  _createAndDownloadCsvFile(filenameStart, csvFileLines) {
    const csvFilename = `${filenameStart}_${Moment().format('MM-DD-YYYY')}.csv`;
    filesChannel.request('download:csv', csvFilename, csvFileLines);
  },

  /* CSV download + helpers fn end */

  setAndRenderActiveHearingModel(hearingModel) {
    this.activeHearingModel = hearingModel;
    this.activeRowId = this.bulkMoveCollection.indexOf(hearingModel);
    this.getChildView('bulkMoveTableRegion').setActiveRowId(this.activeRowId);
    this.getChildView('bulkMoveTableRegion').render();
  },

  renderMoveHearingView() {
    this.showChildView('selectedHearingRegion', new BulkMoveSelectedHearing({ model: this.activeHearingModel, collection: this.bulkMoveCollection }));
  },

  onBeforeRender() {
    if (!this.processComplete) this.processComplete = ((this.activeRowId >= this.bulkMoveCollection.length) && !!this.bulkMoveCollection.length);
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    if (!this.processComplete) {
      this.showChildView('assignedArbRegion', new DropdownView({ model: this.assignedArbModel }));
      this.showChildView('reassignStartDateRegion', new InputView({ model: this.reassignStartDateModel }));
      this.showChildView('reassignStartTimeRegion', new InputView({ model: this.reassignStartTimeModel }));
      this.showChildView('reassignEndDateRegion', new InputView({ model: this.reassignEndDateModel }));
      this.showChildView('reassignEndTimeRegion', new InputView({ model: this.reassignEndTimeModel }));
      this.showChildView('hearingBookingTypeRegion', new DropdownView({ model: this.hearingBookingTypeModel }));
    }

    if (!this.loadHearingsClicked && !this.processComplete) this.showChildView('reassignInactiveRegion', new CheckboxView({ model: this.reassignInactiveModel }));

    if (this.loadHearingsClicked && (this.activeHearingModel || this.processComplete)) this.showChildView('bulkMoveTableRegion', new BulkMoveTable({ collection: this.bulkMoveCollection, initHearingRowId: this.activeHearingModel.id }));
    if (this.loadHearingsClicked && this.activeHearingModel && !this.processComplete) this.renderMoveHearingView()
  },

  regions: {
    assignedArbRegion: '.move-hearing__filters__assigned-arb',
    reassignStartDateRegion: '.move-hearing__filters__start-date',
    reassignStartTimeRegion: '.move-hearing__filters__start-time',
    reassignEndDateRegion: '.move-hearing__filters__end-date',
    reassignEndTimeRegion: '.move-hearing__filters__end-time',
    reassignInactiveRegion: '.move-hearing__inactive-staff',
    bulkMoveTableRegion: '.move-hearing__bulk-move-table',
    selectedHearingRegion: '.move-hearing__selected-hearing',
    hearingBookingTypeRegion: '.move-hearing__hearing-booking-type'
  },

  template() {
    const tableLength = this.bulkMoveCollection.length;
    const renderTableStats = () => {
      if (!this.loadHearingsClicked || !this.activeHearingModel) return;
        return (
          <div className="move-hearing__stats">
            <span className="move-hearing__stats__download" onClick={() => this.downloadCsv()}>Download a .csv of the list</span>
            { !this.processComplete ? <span><b>{this.activeRowId}/{tableLength}</b> hearings processed</span> : null }
          </div>
        )
    }

    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Bulk Move Hearings</h4>
          </div>
          <div className="modal-body move-hearing">
            { this.processComplete ? this.renderJsxProcessComplete(renderTableStats) : this.renderJsxBulkMoveHearings(renderTableStats) }
          </div>
        </div>
      </div>
    )
  },

  renderJsxBulkMoveHearings(renderTableStats) {
    const renderNoMatchMessage = () => this.showNoMatchMessage ?  <span className="standard-list-empty">No matching hearings located for this time period</span> : null;
    const renderHearingDateError = () => this.displayDateError ? <p className="error-block">{this.dateErrorText}</p> : null;
    const renderSkipButton = () => this.loadHearingsClicked && this.activeRowId < this.bulkMoveCollection.length && !this.batchDeleteActive ? <button className="btn-primary btn-standard" onClick={() => this.skipHearing()}>Skip Hearing</button> : null;
    const renderDeleteAllButton = () => this.loadHearingsClicked && this.hearingBookingTypeModel.getData() === EMPTY_ONLY_DROPDOWN_VALUE && this.activeRowId <= 0 ? 
      <div className="move-hearing__delete-all btn btn-lg btn-delete-all" onClick={() => this.displayBatchDeleteAllModal()}>Batch Delete All</div> : null;

    return (
      <>
        <span dangerouslySetInnerHTML={{__html: FEATURE_TEXT_DESCRIPTION_HTML }} />
        <div className="move-hearing__filters">
          <div className="move-hearing__filters__assigned-arb"></div>
          <div className="move-hearing__filters__start-date"></div>
          <div className="move-hearing__filters__start-time"></div>
          <span className="move-hearing__filters__to">to</span>
          <div className="move-hearing__filters__end-date"></div>
          <div className="move-hearing__filters__end-time"></div>
          <div className="move-hearing__hearing-booking-type"></div>
          <button className="move-hearing__filters__search-button btn-primary btn-standard" disabled={this.loadHearingsClicked} onClick={() => this.loadHearings()}>Load Hearings</button>
        </div>
        { renderHearingDateError() }
        <div className="move-hearing__inactive-staff"></div>
        { renderNoMatchMessage() }
        <div className="move-hearing__bulk-move-table"></div>
        { renderTableStats() }
        <div className="move-hearing__selected-hearing"></div>
        <div className="move-hearing__button-wrapper">
          { renderDeleteAllButton() }
          <div className="move-hearing__end-process">
            <button className="btn btn-lg btn-default" onClick={() => this.endProcess()}>End Process</button>
            { renderSkipButton() }
          </div>
        </div>
      </>
    )
  },

  renderJsxProcessComplete(renderTableStats) {

    return (
      <>
        <span className="move-hearing__summary-text" dangerouslySetInnerHTML={{__html: PROCESSES_ENDED_HTML }}></span>
        <div className="move-hearing__bulk-move-table"></div>
        {renderTableStats()}
        <div className="move-hearing__end-process">
          <button className="btn btn-lg btn-default btn-cancel cancel-button" onClick={() => this.close()}>Close</button>
        </div>
      </>
    )
  }
})

_.extend(ModalBulkMoveHearings.prototype, ViewJSXMixin);
export default ModalBulkMoveHearings