import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import Input_model from '../../../../../core/components/input/Input_model';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';

const BLOCK_CREATE_BATCH_SIZE = 5;

const API_OVERLAP_ERROR_TEXT = "A block already exists in this timeframe for this user";
const CONFLICT_WARNING_TEXT = 'Not added, overlaps existing block';
const SYSTEM_ERROR_TEXT = 'System error adding block';
const ADDED_TEXT = 'Added successfully';
const READY_TO_CONVERT_TEXT = 'Duty conversion pending';
const CONVERTED_TEXT = 'Converted successfully';

const resultColorClasses = {
  warn: 'warning-yellow',
  error: 'error-red',
  success: 'success-green',
};

const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get')

const UploadView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['childIndex']);
  },
  
  template() {
    const blockModel = this.model.get('blockModel');
    const timeFormat = Input_model.getTimeFormat();
    const SCHEDULE_BLOCK_TYPE_DISPLAY = configChannel.request('get', 'SCHEDULE_BLOCK_TYPE_DISPLAY');
    return <div className="bulkAddBlocks-modal__upload__list-item">
      <div className="bulkAddBlocks-modal__upload__list-item__id">{this.childIndex}</div>
      <div className="bulkAddBlocks-modal__upload__list-item__name">{Formatter.toUserDisplay(blockModel.get('system_user_id'))}</div>
      <div className="bulkAddBlocks-modal__upload__list-item__date">{Formatter.toShortWeekdayShortDateYearDisplay(blockModel.get('block_start'))}</div>
      <div className="bulkAddBlocks-modal__upload__list-item__duration">{`${Moment(blockModel.get('block_start')).format(timeFormat)} - ${Moment(blockModel.get('block_end')).format(timeFormat)}`}</div>
      <div className="bulkAddBlocks-modal__upload__list-item__type">{SCHEDULE_BLOCK_TYPE_DISPLAY[blockModel.get('block_type')]}</div>
      <div className={`bulkAddBlocks-modal__upload__list-item__result ${
        this.model.get('isUploadWarning') ? resultColorClasses.warn : this.model.get('isUploadError') ? resultColorClasses.error : resultColorClasses.success
      }`}>{this.model.get('resultText')}</div>
    </div>
  },
});

const UploadsCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: UploadView,
  childViewOptions: (child, index) => ({ childIndex: index+1 }),
  filter(child) {
    return !child.get('pendingUpload');
  }
});

const BulkAddBlocksUploads = Marionette.View.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['collection', 'dutyUsers', 'firstDutyUserId', 'dutiesPerDay']);

    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    this.SCHED_BLOCK_TYPE_DUTY = configChannel.request('get', 'SCHED_BLOCK_TYPE_DUTY');
    this.uploadCollection = this.createCollection();
    this.blockCreationComplete = false;
    this.blockConversionComplete = false;
    this.listenTo(this.uploadCollection, 'change:pendingUpload', () => this.render());
    
    setTimeout(() => this.startUploads(), 500);
  },

  createCollection() {
    const uploadCollection = new Backbone.Collection();
    this.collection.forEach(block => {
      uploadCollection.add({
        blockModel: block,
        pendingUpload: true,
        resultText: null,
        isUploadWarning: false,
        isUploadError: false,
      });
    });

    return uploadCollection;
  },

  startUploadAtIndex(index, uploadCollection=null) {
    const uploadModel = (uploadCollection || this.uploadCollection).at(index);
    if (!uploadModel) return Promise.resolve();
    if (!this.blockCreationComplete && uploadModel.get('resultText')) return Promise.resolve(uploadModel);
    return new Promise((res, rej) => uploadModel.get('blockModel').save(uploadModel.get('blockModel').getApiChangesOnly()).done(() => {
      return res(uploadModel);
    }).fail(err => {
      return rej({ model: uploadModel, err });
    }));
  },

  startUploads() {
    const numBlocksToCreate = this.uploadCollection.length;
    let blockStartIndex = 0;
    let blockCompleteIndex = 0;
    
    const uploadModelAndResultPromise = () => new Promise(res => (
      this.startUploadAtIndex(blockStartIndex++)
        .then(model => {
          if (model) {
            model.set(Object.assign({
              pendingUpload: false,
            }, model.get('resultText') ? null : { resultText: ADDED_TEXT }));
          }
        }, ({ model, err={} }) => {
          const resultData = (err.status === 400 && err.responseJSON === API_OVERLAP_ERROR_TEXT) ? {
            resultText: CONFLICT_WARNING_TEXT,
            isUploadWarning: true,
            pendingUpload: false,
          } : {
            resultText: SYSTEM_ERROR_TEXT,
            isUploadError: true,
            pendingUpload: false,
          };
          model.set(resultData);
        })
        .finally(() => {
          blockCompleteIndex++;
          res();
        })
    ));

    const withRunNextUpload = (action) => {
      action().finally(() => {
        if (this.cancelUploads || blockCompleteIndex >= numBlocksToCreate) {
          this.blockCreationComplete = true;
          this.startDutyConversion();
        } else {
          withRunNextUpload(action);
        }
      });
    };

    // Start first batch of block saves
    withRunNextUpload(() => {
      const promisesToRun = Array.apply(null, Array(BLOCK_CREATE_BATCH_SIZE)).map(i => uploadModelAndResultPromise());
      return Promise.all(promisesToRun);
    });
  },

  startDutyConversion() {
    const onCompleteFn = () => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    };
    if (!this.blockCreationComplete || this.cancelUploads) {
      return onCompleteFn();
    }

    if (!this.dutyUsers?.length || !this.dutiesPerDay) {
      this.blockConversionComplete = true;
      return onCompleteFn();
    }

    const findWorkingItemForUser = (userId, items=[]) => (
      items.find(i => i.get('blockModel')?.get('system_user_id') === userId)
    );

    // Find working blocks that can be converted to duty
    const workingBlocksPerDay = {};
    this.uploadCollection.forEach(b => {
      const blockModel = b.get('blockModel');
      if (!blockModel?.isTypeWorking() || blockModel?.isNew()) return;
      const hasDutyOwner = !!this.dutyUsers.find(u => u.id === blockModel?.get('system_user_id'));
      if (hasDutyOwner) {
        const momentStart = Moment.tz(blockModel.get('block_start'), this.RTB_OFFICE_TIMEZONE_STRING);
        const dateStr = momentStart.isValid() ? momentStart.format('YYYY-MM-DD') : null;
        if (!workingBlocksPerDay[dateStr]) workingBlocksPerDay[dateStr] = [];
        workingBlocksPerDay[dateStr].push(b);
      }
    });

    const uploadItemsToConvert = [];
    let dutyIndexToUse = this.dutyUsers.map(user => user.id).indexOf(this.firstDutyUserId);
    let nextDutyUser = this.dutyUsers[dutyIndexToUse];
    Object.keys(workingBlocksPerDay).sort().forEach(key => {
      let dailyDutiesCreated = 0;
      const uploadItemsForDay = workingBlocksPerDay[key];
      let matchingItem;
      
      // Try to go by duty rotation order first when creating daily duties
      while (dailyDutiesCreated < this.dutiesPerDay && dailyDutiesCreated < uploadItemsForDay.length) {
        matchingItem = findWorkingItemForUser(nextDutyUser.id, uploadItemsForDay);
        if (matchingItem) {
          dailyDutiesCreated++;
          uploadItemsToConvert.push(matchingItem);
        }
        // Whether user matched or not, go to next duty
        // NOTE: This is where load balancing logic could come in
        dutyIndexToUse = (dutyIndexToUse + 1) % this.dutyUsers.length
        nextDutyUser = this.dutyUsers[dutyIndexToUse];
      }
    });

    // Process items for re-save as duty
    uploadItemsToConvert.forEach(item => {
      item.get('blockModel')?.set({ block_type: this.SCHED_BLOCK_TYPE_DUTY });
      item.set('resultText', READY_TO_CONVERT_TEXT);
      uploadItemsToConvert.push(item);
    });

    const numBlocksToConvert = uploadItemsToConvert.length;
    let blockStartIndex = 0;
    let blockCompleteIndex = 0;
    
    const uploadModelAndResultPromise = () => new Promise(res => {
      return this.startUploadAtIndex(blockStartIndex++, uploadItemsToConvert)
        .then(model => {
          if (model) {
            model.set(Object.assign({
              pendingUpload: false,
              resultText: CONVERTED_TEXT,
            }));
          }
        }, ({ model, err={} }) => {
          const resultData = (err.status === 400 && err.responseJSON === API_OVERLAP_ERROR_TEXT) ? {
            resultText: CONFLICT_WARNING_TEXT,
            isUploadWarning: true,
            pendingUpload: false,
          } : {
            resultText: SYSTEM_ERROR_TEXT,
            isUploadError: true,
            pendingUpload: false,
          };
          model.set(resultData);
        })
        .finally(() => {
          blockCompleteIndex++;
          res();
        })
    });

    const withRunNextUpload = (action) => {
      action().finally(() => {
        if (this.cancelUploads || blockCompleteIndex >= numBlocksToConvert) {
          this.blockConversionComplete = true;
          onCompleteFn();
        } else {
          withRunNextUpload(action);
        }
      });
    };

    // Update UI state and then start first batch of block conversions
    this.render();
    withRunNextUpload(() => {
      const promisesToRun = Array.apply(null, Array(1)).map(i => uploadModelAndResultPromise());
      return Promise.all(promisesToRun);
    });
  },


  clickClose() {
    this.model.trigger('close');
  },

  clickCancel() {
    loaderChannel.trigger('page:load');
    this.cancelUploads = true;
  },

  clickRetryErrors() {
    const blocksToRemove = this.uploadCollection.filter(m => !m.get('isUploadError'));
    this.uploadCollection.remove(blocksToRemove, { silent: true });

    this.uploadCollection.forEach(m => {
      m.set({
        isUploadError: false,
        pendingUpload: true,
        resultText: null,
      }, { silent: true });
    });
    this.blockCreationComplete = false;
    this.blockConversionComplete = false;
    this.render();
    this.startUploads();
  },

  clickDownloadCsv() {
    const timeFormat = Input_model.getTimeFormat();
    const SCHEDULE_BLOCK_TYPE_DISPLAY = configChannel.request('get', 'SCHEDULE_BLOCK_TYPE_DISPLAY');
    const csvFilename = `ScheduleManager_BulkAddBlocks_${Moment().format('MM_DD_YYYY')}.csv`;
    
    const csvFileLines = [];
    csvFileLines.push(['ID', 'Name', 'Block Date', 'Block Duration', 'Block Type', 'Result']);
    this.uploadCollection.forEach((m, index) => {
      const blockModel = m.get('blockModel');
      csvFileLines.push([
        index+1,
        Formatter.toUserDisplay(blockModel.get('system_user_id')),
        Formatter.toShortWeekdayShortDateYearDisplay(blockModel.get('block_start')),
        `${Moment(blockModel.get('block_start')).format(timeFormat)} - ${Moment(blockModel.get('block_end')).format(timeFormat)}`,
        SCHEDULE_BLOCK_TYPE_DISPLAY[blockModel.get('block_type')],
        m.get('resultText'),
      ])
    });

    // Enclose all csv items and start download
    filesChannel.request('download:csv', csvFilename, csvFileLines.map(line => line.map(item => `"${item}"`)));
  },

  onRender() {
    this.showChildView('uploadsRegion', new UploadsCollectionView({ collection: this.uploadCollection }));
  },

  regions: {
    uploadsRegion: '.bulkAddBlocks-modal__upload__list'
  },

  template() {
    const completedBlocks = this.uploadCollection.filter(m => !m.get('pendingUpload'));
    const numWarningBlocks = completedBlocks.filter(m => m.get('isUploadWarning')).length;
    const numErrorBlocks = completedBlocks.filter(m => m.get('isUploadError')).length;
    const uploadCountDisplay = `${completedBlocks.length}/${this.uploadCollection.length}`

    const uploadDisplay = `block${completedBlocks.length===1?'':'s'} processed`;
    const uploadDetailsDisplay = !this.blockConversionComplete ? `${this.blockCreationComplete?', converting Duty blocks':''}, please wait...` :
      `<span className="success-green"> - Process Complete: ${
        completedBlocks.length - numWarningBlocks - numErrorBlocks
      } block(s) added</span><span className="warning-yellow">, ${numWarningBlocks
      } block(s) not added due to overlap</span><span className="error-red">, ${numErrorBlocks} system error(s).</span>`;

    return <>
      <div className="bulkAddBlocks-modal__upload__progress"><b>{uploadCountDisplay}</b> {uploadDisplay}<span dangerouslySetInnerHTML={{__html:uploadDetailsDisplay }}/></div>
      <div className="bulkAddBlocks-modal__upload__list-header">
        <div className="bulkAddBlocks-modal__upload__list-item__id">ID</div>
        <div className="bulkAddBlocks-modal__upload__list-item__name">Name</div>
        <div className="bulkAddBlocks-modal__upload__list-item__date">Block Date</div>
        <div className="bulkAddBlocks-modal__upload__list-item__duration">Block Duration</div>
        <div className="bulkAddBlocks-modal__upload__list-item__type">Block Type</div>
        <div className="bulkAddBlocks-modal__upload__list-item__result">Result</div>
      </div>
      <div className="bulkAddBlocks-modal__upload__list"></div>


      {this.blockConversionComplete && numErrorBlocks ? (
        <div className="bulkAddBlocks-modal__upload__error error-red">
          There were system errors adding blocks, this may have been caused by network or internet issues.  The errors listed above with the result of "{SYSTEM_ERROR_TEXT}". You can retry adding the error blocks by clicking the "Retry Error Blocks" button below. You can also download a .csv report of the above and add the error blocks manually in the schedule manager.
        </div>
      ) : null}

      {this.renderJsxButtons(numErrorBlocks)}
    </>;
  },

  renderJsxButtons(numErrorBlocks) {
    return <>
      <div className="bulkAddBlocks-modal__upload__buttons">
        {this.blockConversionComplete ?
        <>
          <span className="general-link" onClick={() => this.clickDownloadCsv()}>Download .csv of process results</span>
          {numErrorBlocks ? <button className="btn btn-standard btn-lg" onClick={() => this.clickRetryErrors()}>Retry Error Blocks</button> : null}
          <button className="btn btn-standard btn-lg" onClick={() => this.clickClose()}>Close</button>
        </>
        : <button className="btn btn-lg btn-cancel" onClick={() => this.clickCancel()}>Cancel Remaining</button>}
      </div>
    </>;
  }

});

_.extend(BulkAddBlocksUploads.prototype, ViewJSXMixin)
_.extend(UploadView.prototype, ViewJSXMixin)

export { BulkAddBlocksUploads };
