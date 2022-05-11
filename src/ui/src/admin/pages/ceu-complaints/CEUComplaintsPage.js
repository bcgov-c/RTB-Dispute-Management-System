import Radio from 'backbone.radio';
import React from 'react';
import RadioView from '../../../core/components/radio/Radio';
import RadioModel from '../../../core/components/radio/Radio_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import PageView from '../../../core/components/page/Page';
import ContextContainer from '../../components/context-container/ContextContainer';
import CEUComplaintsTable from './CEUComplaintsTable';
import CEUComplaintDetailsPage from './CEUComplaintDetailsPage';
import CloseFileIcon from '../../static/Icon_AdminBar_ClosePage.png';
import BackIcon from '../../static/Icon_Admin_Prev.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './CEUComplaintsPage.scss';
import '../../../CeuIntake/components/data-channel-helpers/CeuConfigHelper';

const RADIO_CODE_VIEW_ALL = 1;
const DEFAULT_DROPDOWN_COUNT = '60';
const SORT_CREATED_DATE_FIRST = 1;

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const Formatter = Radio.channel('formatter').request('get');

const CEUComplaintsPage = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);

    this.ceuComplaints = customDataObjsChannel.request('get:external');
    this.activeCeuComplaint = null;

    this.CEU_STATUS_PENDING = configChannel.request('get', 'CEU_STATUS_PENDING');
    this.CEU_STATUS_SUBMITTED = configChannel.request('get', 'CEU_STATUS_SUBMITTED');
    this.CEU_STATUS_PROCESSED = configChannel.request('get', 'CEU_STATUS_PROCESSED');
    this.CEU_STATUS_COMPLETED = configChannel.request('get', 'CEU_STATUS_COMPLETED');
    this.CEU_STATUS_DISPLAY = configChannel.request('get', 'CEU_STATUS_DISPLAY') || {};

    this.createSubModels();
    this.setupListeners();

    this.loadCEUComplaints();
  },

  createSubModels() {
    this.ceuStatusFilterModel = new RadioModel({
      optionData: [
        { text: 'View All', value: RADIO_CODE_VIEW_ALL, Statuses: [this.CEU_STATUS_SUBMITTED, this.CEU_STATUS_PROCESSED, this.CEU_STATUS_COMPLETED] },
        { text: this.CEU_STATUS_DISPLAY[this.CEU_STATUS_SUBMITTED], value: this.CEU_STATUS_SUBMITTED, Statuses: [this.CEU_STATUS_SUBMITTED] },
        { text: this.CEU_STATUS_DISPLAY[this.CEU_STATUS_PROCESSED], value: this.CEU_STATUS_PROCESSED, Statuses: [this.CEU_STATUS_PROCESSED] },
        { text: this.CEU_STATUS_DISPLAY[this.CEU_STATUS_COMPLETED], value: this.CEU_STATUS_COMPLETED, Statuses: [this.CEU_STATUS_COMPLETED] },
      ],
      required: true,
      value: this.CEU_STATUS_SUBMITTED,
    });

    this.ceuDateFilterModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: null,
      required: false,
    });

    this.ceuResultsCountModel = new DropdownModel({
      optionData: [
        { text: '20', value: '20' },
        { text: '40', value: '40' },
        { text: '60', value: '60' }
      ],
      labelText: '',
      defaultBlank: false,
      value: DEFAULT_DROPDOWN_COUNT,
    });
  },

  setupListeners() {
    this.listenTo(this.ceuStatusFilterModel, 'change:value', () => this.loadCEUComplaints());
    this.listenTo(this.ceuDateFilterModel, 'change:value', () => this.loadCEUComplaints());
    this.listenTo(this.ceuResultsCountModel, 'change:value', () => this.loadCEUComplaints());
    
    this.stopListening(this.ceuComplaints, 'click:view');
    this.listenTo(this.ceuComplaints, 'click:view', (model) => {
      loaderChannel.trigger('page:load');
      customDataObjsChannel.request('load:external:files', model.id)
        .then(extFilesCollection => {
            this.activeCeuComplaint = model;
            this.activeCeuComplaint.extFilesCollection = extFilesCollection;
            this.render();
          },
          generalErrorFactory.createHandler('EXTERNAL.CUSTOM.LOAD.FILES')
        )
        .finally(() => {
          loaderChannel.trigger('page:load:complete');
        });
    });
  },

  loadCEUComplaints() {
    const options = Object.assign({ 
      Statuses: this.ceuStatusFilterModel.getSelectedOption().Statuses,
      Count: this.ceuResultsCountModel.getData(),
      SortBy: SORT_CREATED_DATE_FIRST,
    }, this.ceuDateFilterModel.getData() ? { CreatedDate: this.ceuDateFilterModel.getData({ format: 'date' }) } : {});

    loaderChannel.trigger('page:load');
    customDataObjsChannel.request('load:external', options)
      .then(() => this.render())
      .catch(() => generalErrorFactory.createHandler('EXTERNAL.CUSTOM.LOAD'))
      .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  closeCEUComplaintView() {
    this.activeCeuComplaint = null;
    this.render();
  },

  regions: {
    ceuStatusFilterRegion: '.ceu-complaints__status',
    ceuDateFilterRegion: '.ceu-complaints__date',
    ceuResultsCountRegion: '.ceu-complaints__results-count',
    ceuTableRegion: '.ceu-complaints__table',
    ceuComplaintRegion: '.ceu-complaints__complaint'
  },

  onRender() {
    if (this.activeCeuComplaint) {
      this.renderActiveCeuComplaint();
    }
    else {
      this.showChildView('ceuStatusFilterRegion', new RadioView({ model: this.ceuStatusFilterModel }));
      this.showChildView('ceuDateFilterRegion', new InputView({ model: this.ceuDateFilterModel }));
      this.showChildView('ceuResultsCountRegion', new DropdownView({ model: this.ceuResultsCountModel }));
      this.showChildView('ceuTableRegion', new CEUComplaintsTable({ collection: this.ceuComplaints }));
    }
  },

  renderActiveCeuComplaint() {
    if (!this.activeCeuComplaint) return;
    const uploadedFileModels = this.activeCeuComplaint?.extFilesCollection?.models || [];
    const fileCountDisplay = `${uploadedFileModels.length} file${uploadedFileModels.length === 1 ? '' : 's'}`;
    const totalFileSizeDisplay = Formatter.toFileSizeDisplay(uploadedFileModels.reduce((memo, file) => memo + file.get('file_size'), 0));

    this.showChildView('ceuComplaintRegion', ContextContainer.withContextMenu({
      wrappedView: new CEUComplaintDetailsPage({ model: this.activeCeuComplaint }),
      titleDisplay: `<div class="ceu-complaint__title-ref-num">#${this.activeCeuComplaint.get('reference_id')}</div>`,
      menu_title: `Object ID ${this.activeCeuComplaint.id}`,
      menu_states: {
        default: [
          { name: 'Edit', event: 'edit' },
          ...(uploadedFileModels.length ? [{ name: `Download All (${fileCountDisplay}, ${totalFileSizeDisplay})`, event: 'download:all'}] : []),
        ],
        edit: [{ name: 'Save', event: 'save'},
          {name: 'Cancel', event: 'cancel'}],
      },
      menu_events: {
        edit: {
          view_mode: 'edit',
          next: 'edit',
          isEdit: true
        },
        cancel: {
          next: 'default',
          reset: true
        }
      },
      menu_model: this.activeCeuComplaint,
      contextRender: () => this.render(),
      disputeModel: null
    }));
  },

  template() {
    const renderCloseIcon = () => this.activeCeuComplaint ? <img className="ceu-complaints__close-file" src={CloseFileIcon} onClick={() => this.closeCEUComplaintView()}/> : null;
    const renderBackButton = () => this.activeCeuComplaint ? 
    <span className="ceu-complaints__list">
      <img src={BackIcon} alt="" />
      <span className="ceu-complaints__list__text general-link" onClick={() => this.closeCEUComplaintView()}>&nbsp;Complaints list</span>
    </span> : null;
    return (
      <>
        <div className="header-page-title-container">
          <div className="header-page-title">CEU Complaints</div>
          {renderBackButton()}
          <div className="subpage dispute-overview-header-right-container">
          <div className="dispute-overview-header-right">
            <div className="dispute-overview-refresh-item">
              <span className="dispute-overview-refresh-text">{Formatter.toLastModifiedTimeDisplay(Moment())}</span>
              <div className="dispute-overview-header-icon header-refresh-icon" onClick={() => this.loadCEUComplaints()}></div>
            </div>
            {renderCloseIcon()}
          </div>
        </div>
        </div>

        {this.renderJsxCeuTable()}
        <div className="ceu-complaints__complaint"></div>
      </>
    )
  },

  renderJsxCeuTable() {
    return (
      <>
        <div className={`ceu-complaints__filters general-filters-row general-filters-row--dark ${this.activeCeuComplaint ? 'hidden' : ''}`}>
          <div className="ceu-complaints__filters__right">
            <div className="ceu-complaints__status"></div>
          </div>
          <div className="ceu-complaints__filters__left">
            <span className="ceu-complaints__label">Created After</span>
            <div className="ceu-complaints__date"></div>
            <span className="ceu-complaints__label">Results</span>
            <div className="ceu-complaints__results-count"></div>
          </div>
        </div>
        {!this.activeCeuComplaint ? <div className="ceu-complaints__filters__total-count general-filters-row">Showing {this.ceuComplaints.length}/{this.ceuComplaints.totalAvailable} record{this.ceuComplaints.length===1?'':'s'}</div> : null}
        <div className={`ceu-complaints__table ${this.activeCeuComplaint ? 'hidden' : ''}`}></div>
      </>
    )
  }
});

_.extend(CEUComplaintsPage.prototype, ViewJSXMixin);
export default CEUComplaintsPage;