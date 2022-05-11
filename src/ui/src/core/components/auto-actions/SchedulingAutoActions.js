
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import ModalBaseView from '../modals/ModalBase';
import './NoticeAutoActions.scss';
import LoaderImg from '../../static/loader_blue_lrg.gif';
import SuccessAnimation from '../../static/DMS_BlueCompleteCheckAnim_sml.gif';
import ScheduleBlock_model from '../../../admin/components/scheduling/schedule-blocks/ScheduleBlock_model';
import ModalAddBlock from '../../../admin/components/calendar/block-calendar/ModalAddBlock';

const INIT_DELAY = 1000;
const SUCCESS_DELAY = 2500;

const INSERT_BLOCK_CONFLICT_ERROR = `Blocks exist in this timeframe`;

const PROGRESS_LANGUAGE = {
  start: "Initializing",
  setOwner: 'Setting task owner',
  createBlocks: 'Creating working schedule blocks',
  setStatus: 'Setting request implemented',
  cancel: 'Process Cancelled Before Completing',
  success: 'Process Completed Successfully',
  cleanup: 'Process encountered an error - cleaning up',
  cleanupBlocks: 'Cleanup: Deleting created schedule blocks',
};

const schedulingChannel = Radio.channel('scheduling');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const ModalGenerateAndSendNotice = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    // this.model will be the ScheduleRequestModel to create the blocks from    

    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');
    this.RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');

    this.blocksToCreate = [];

    this.isErrorState = false;
    this.isSuccessState = false;
    this.progressLog = [];
    this.resultsLog = [];

    this.addToProgressLog(PROGRESS_LANGUAGE.start, { noRender: true });
  },

  addToProgressLog(processLogItem, options={}) {
    this.progressLog.push(processLogItem);
    if (this.isRendered() && !options?.noRender) this.render();
  },

  addSuccessResult(msg) {
    this.resultsLog.push(`${msg} - success`);
  },

  addErrorResult(msg) {
    this.resultsLog.push(`${msg} - error`);
  },

  addNotStartedResult(msg) {
    this.resultsLog.push(`${msg} - not started`);
  },

  addCancelledResult(msg) {
    this.resultsLog.push(`${msg} - cancelled`);
  },  

  startAutoInsert() {
    this.originalStatus = this.model.get('request_status');
    this.isSuccessState = false;
    this.isErrorState = false;
    
    let skipHandling = false;
    let encounteredError = false;
    this.resultsLog.push(`Schedule Request ID: ${this.model.id}`);
    this.resultsLog.push(`Process started: ${Formatter.toDateAndTimeDisplay(Moment())}`);

    this.addToProgressLog(PROGRESS_LANGUAGE.setOwner);
    this.saveRequestOwner()
      .catch(err => {
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.setOwner);
        this.addNotStartedResult(PROGRESS_LANGUAGE.createBlocks);
        this.addNotStartedResult(PROGRESS_LANGUAGE.setStatus);
        throw err;
      })
      .then(() => {
        if (skipHandling) return Promise.resolve();
        this.addSuccessResult(PROGRESS_LANGUAGE.setOwner);
        this.addToProgressLog(PROGRESS_LANGUAGE.createBlocks);
        return this.startAddBlockProcess();
      })
      .catch(err => {
        if (encounteredError) throw err;
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.createBlocks);
        this.addNotStartedResult(PROGRESS_LANGUAGE.setStatus);
        throw err;
      })
      .then((didComplete=false) => {
        skipHandling = !didComplete;
        if (skipHandling) return Promise.resolve();
        this.addSuccessResult(PROGRESS_LANGUAGE.createBlocks);
        this.addToProgressLog(PROGRESS_LANGUAGE.setStatus);
        return this.saveRequestStatusComplete();
      })
      .catch(err => {
        if (encounteredError) throw err;
        encounteredError = true;
        this.addErrorResult(PROGRESS_LANGUAGE.setStatus);
        throw err;
      })
      .then(() => {
        const onFinishFn = () => {
          this.model.trigger('autoAction:success');
          this.close();
        };
        if (skipHandling) return onFinishFn();

        this.isSuccessState = true;
        this.addSuccessResult(PROGRESS_LANGUAGE.setStatus);
        this.addToProgressLog(PROGRESS_LANGUAGE.success);
        setTimeout(() => onFinishFn(), SUCCESS_DELAY);
      })
      .catch(err => {
        console.debug(err);
        this.addToProgressLog(PROGRESS_LANGUAGE.cleanup);
        const blocksToReset = this.blocksToCreate.filter(b => !b.isNew());
        this.resetCreatedBlocks()
          .then(() => {
            if (blocksToReset.length) this.addSuccessResult(PROGRESS_LANGUAGE.cleanupBlocks);
            else this.addNotStartedResult(PROGRESS_LANGUAGE.cleanupBlocks);
          }, () => {
            this.addErrorResult(PROGRESS_LANGUAGE.cleanupBlocks);
          })
          .finally(() => {
            this.isErrorState = true;
            this.render();
          });
      });
  },

  saveRequestOwner() {
    this.model.set('request_owner', sessionChannel.request('get:user')?.id);
    return new Promise((res, rej) => this.model.save(this.model.getApiChangesOnly()).done(res).fail(rej));
  },

  saveRequestStatusComplete() {
    this.model.set('request_status', configChannel.request('get', 'SCHED_REQ_STATUS_IMPLEMENTED'));
    return new Promise((res, rej) => this.model.save(this.model.getApiChangesOnly()).done(res).fail(rej));
  },

  startAddBlockProcess() {
    const startDate = Moment(this.model.get('request_start'));
    const endDate = Moment(this.model.get('request_end'));
    const blockModel = new ScheduleBlock_model({
      block_type: this.model.getScheduleBlockType(),
      block_start: startDate,
      block_end: endDate,
      system_user_id: this.model.get('request_submitter'),
    });

    const modalView = new ModalAddBlock({
      blockOwner: userChannel.request('get:user', this.model.get('request_submitter')),
      desiredBlockType: this.model.getScheduleBlockType(),
      desiredBlockStart: startDate,
      desiredBlockEnd: endDate,
      model: this.model,
      hideControls: true,
      
      blockModel,
    });

    // Returns boolean True if process completed successfully
    return new Promise((res, rej) => {
      let saveSuccess = false;
      let isCancelled = false;
      this.listenToOnce(this.model, 'addBlock:blocksCreated', (blocksToCreate) => {
        this.blocksToCreate = blocksToCreate;
      });
      this.listenToOnce(this.model, 'addBlock:complete', (result) => {
        saveSuccess = result;
        loaderChannel.trigger('page:load:complete');
      });
      this.listenToOnce(this.model, 'addBlock:cancel', () => {
        isCancelled = true;
      });
      this.listenToOnce(modalView, 'removed:modal', () => {
        if (saveSuccess) res(true);
        else if (isCancelled) res(false)
        else rej();
      });
      modalChannel.request('add', modalView);
    });
  },
  
  resetCreatedBlocks() {
    const createdBlocks = this.blocksToCreate.filter(b => !b.isNew());
    return new Promise((res, rej) => {
      Promise.allSettled(createdBlocks.map(b => b.destroy()))
        .then((results=[]) => {
          const errorResult = results.find(r => r.status === 'rejected');
          if (errorResult) {
            rej(errorResult);
          } else {
            res();
          }
        });
      });
  },

  errorClose() {
    this.model.trigger('autoAction:error');
    this.close();
  },

  id: 'noticeAutoAction_modal',
  
  onRender() {
    if (this.progressLog.length) return;
  },

  template() {
    const title = this.isErrorState ? 'Auto Insert Schedule Error' : `Auto Inserting Schedule`;
    const contentRenderFn = this.isSuccessState ? this.renderJsxSuccessState :
      this.isErrorState ? this.renderJsxErrorState :
      this.renderJsxProgressMode;

    return <div className="modal-dialog">
      <div className="modal-content clearfix">
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
        </div>
        <div className="modal-body clearfix">
          {contentRenderFn.bind(this)()}
        </div>
      </div>
    </div>;
  },

  renderJsxProgressMode() {
    const latestEntry = this.progressLog.length && this.progressLog.slice(-1);
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__title"></div>
        <div className="noticeAutoAction_modal__loading-container__img-container">
          <img src={LoaderImg} alt="Loading" />
        </div>
        <div className="noticeAutoAction_modal__loading-container__info">{latestEntry}</div>
      </div>
    </>
  },

  renderJsxErrorState() {
    return <>
      <div className="autoAction_modal__error-state">
        <p>Errors were encountered during the auto insertion of this schedule request. This can happen if your internet connection is lost or a system error ocurred. You can use the information below to manually implement and complete this schedule request. If errors like this keep occurring, please provide the error details below to the RTB support team.</p>
        <div className="autoAction_modal__error-results-container">
          <label className="general-modal-label">Error Details</label>
          <div className="autoAction_modal__error-results">
            {this.resultsLog.map((logItem, i) => (
              <div key={`err-${i}`} className="autoAction_modal__error-result">{logItem}</div>
            ))}
          </div>
        </div>

        <div className="modal-button-container">
          <button type="button" className="btn btn-lg btn-cancel" onClick={() => this.errorClose()}>Close</button>
        </div>

      </div>
    </>
  },

  renderJsxSuccessState() {
    return <>
      <div className="noticeAutoAction_modal__loading-container">
        <div className="noticeAutoAction_modal__loading-container__success">
          <img className="noticeAutoAction_modal__loading-container__success__img" src={`${SuccessAnimation}?t=${Math.random()}`} alt="Success" />
          Process Completed Successfully!
        </div>
      </div>
    </>
  },

});

_.extend(ModalGenerateAndSendNotice.prototype, ViewJSXMixin);


export default {
  startAutoApproveAndScheduleRequest(scheduleRequestModel) {
    if (!scheduleRequestModel) return Promise.reject();

    return new Promise((res, rej) => {
      let saveSuccess;
      scheduleRequestModel.once('autoAction:success', () => {
        saveSuccess = true;
      });
      const modalView = new ModalGenerateAndSendNotice({ model: scheduleRequestModel });
      modalChannel.listenToOnce(modalView, 'removed:modal', () => {
        if (saveSuccess) res();
        else rej();
      });
      modalChannel.request('add', modalView);
      setTimeout(() => modalView.startAutoInsert(), INIT_DELAY);
    });
  },

  checkAutoActionSchedulingConflicts(scheduleRequestModel) {
    const blockOwnerId = scheduleRequestModel.get('request_submitter');
    const startDate = Moment(scheduleRequestModel.get('request_start'));
    const endDate = Moment(scheduleRequestModel.get('request_end'));
    loaderChannel.trigger('page:load');
    return schedulingChannel.request('load:block:collisions:range', startDate, endDate, blockOwnerId)
      .then((conflictingBlocks=[]) => {
        loaderChannel.trigger('page:load:complete');
        if (conflictingBlocks.length) {
          return Promise.reject(INSERT_BLOCK_CONFLICT_ERROR);
        }
        return Promise.resolve();
      });

  }

};