import React from 'react';
import ReactDOM from 'react-dom';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
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
import ExternalCustomObj_model from '../../../core/components/custom-data-objs/external/ExternalCustomObj_model';
import ModalReportViewer from '../../components/reports/ModalReportViewer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import '../../../CeuIntake/components/data-channel-helpers/CeuConfigHelper';
import './CEUComplaintsPage.scss';
import Icon_Menu_Hide_OVR from '../../static/Icon_Menu_Hide_OVR.png';
import Icon_Menu_Hide from '../../static/Icon_Menu_Hide.png';
import Icon_Menu_Show_OVR from '../../static/Icon_Menu_Show_OVR.png';
import Icon_Menu_Show from '../../static/Icon_Menu_Show.png';
import CloseFileIcon from '../../static/Icon_AdminBar_ClosePage.png';
import BackIcon from '../../static/Icon_Admin_Prev.png';
import { routeParse } from '../../routers/mainview_router';

const RADIO_CODE_VIEW_ALL = 1;
const SORT_CREATED_DATE_FIRST = 1;
const DEFAULT_DROPDOWN_COUNT = '40';
const DROPDOWN_COUNT_CODE_ALL = "ALL";

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const reportsChannel = Radio.channel('reports');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const CEUComplaintsPage = PageView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['complaintId'])

    this.CEU_STATUS_PENDING = configChannel.request('get', 'CEU_STATUS_PENDING');
    this.CEU_STATUS_SUBMITTED = configChannel.request('get', 'CEU_STATUS_SUBMITTED');
    this.CEU_STATUS_PROCESSED = configChannel.request('get', 'CEU_STATUS_PROCESSED');
    this.CEU_STATUS_COMPLETED = configChannel.request('get', 'CEU_STATUS_COMPLETED');
    this.CEU_STATUS_DISPLAY = configChannel.request('get', 'CEU_STATUS_DISPLAY') || {};

    this.ceuComplaints = customDataObjsChannel.request('get:external');
    this.activeCeuComplaint = null;
    this.isLoaded = false;
    this.createSubModels();
    this.setupListeners();

    this.index = 0;
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
        { text: `${DEFAULT_DROPDOWN_COUNT}`, value: `${DEFAULT_DROPDOWN_COUNT}` },
      ],
      labelText: '',
      defaultBlank: false,
      value: DEFAULT_DROPDOWN_COUNT,
      disabled: true,
    });
  },

  setupListeners() {
    const resetIndexAndLoad = () => {
      this.index = 0;
      this.loadCEUComplaints();
    };
    this.listenTo(this.ceuStatusFilterModel, 'change:value', () => resetIndexAndLoad());
    this.listenTo(this.ceuDateFilterModel, 'change:value', () => resetIndexAndLoad());
    this.listenTo(this.ceuResultsCountModel, 'change:value', () => resetIndexAndLoad());
    
    this.stopListening(this.ceuComplaints, 'click:view');
    this.listenTo(this.ceuComplaints, 'click:view', (model) => {
      loaderChannel.trigger('page:load');
      return Backbone.history.navigate(routeParse('ceu_complaints_param_item', null, model.id), { trigger: true });
    });
  },

  loadCEUComplaints() {
    this.isLoaded = false;
    const countToUse = this.ceuResultsCountModel.getData();
    const options = Object.assign({ 
      Statuses: this.ceuStatusFilterModel.getSelectedOption().Statuses,
      Index: this.index,
      Count: countToUse === DROPDOWN_COUNT_CODE_ALL ? 999999 : countToUse,
      SortBy: SORT_CREATED_DATE_FIRST,
    }, this.ceuDateFilterModel.getData() ? { CreatedDate: this.ceuDateFilterModel.getData({ format: 'date' }) } : {});

    loaderChannel.trigger('page:load');
    
    // Load initial list, and if an initial complaintId was provided, ensure that that model is loaded
    customDataObjsChannel.request('load:external', options)
      .then(() => {
        if (!this.complaintId) return;
        const complaintModel = new ExternalCustomObj_model({ external_custom_data_object_id: this.complaintId });
        return complaintModel.fetch()
          .then(() => this.ceuComplaints.add(complaintModel, { merge: true }));
      })
      .catch(() => generalErrorFactory.createHandler('EXTERNAL.CUSTOM.LOAD'))
      .then(() => {
        this.activeCeuComplaint = this.complaintId && this.ceuComplaints.findWhere({ external_custom_data_object_id: Number(this.complaintId) });
        return this.loadActiveComplaint();
      })
      .finally(() => {
        if (!this.activeCeuComplaint) {
          // Remove any initial CEU complaint param if it was not able to be loaded
          Backbone.history.navigate(routeParse('ceu_complaints_item'), { trigger: false, replace: true });
        }
        this.isLoaded = true;
        this.render();
        loaderChannel.trigger('page:load:complete')
      });
  },

  async loadActiveComplaint() {
    if (!this.activeCeuComplaint) return
    await customDataObjsChannel.request('load:external:files', this.activeCeuComplaint.id)
      .then(extFilesCollection => {
          this.activeCeuComplaint.extFilesCollection = extFilesCollection;
        },
        generalErrorFactory.createHandler('EXTERNAL.CUSTOM.LOAD.FILES')
      )
  },

  async openSearchModel() {
    // NOTE: Load all report metadata when opening CEU search
    await reportsChannel.request('load');
    const reports = reportsChannel.request('get');
    const ceuSearchReportTitles = configChannel.request('get', 'REPORT_VIEWER__CEU_SEARCH')?.map(data => data.reportTitle) || [];
    const availableReports = ceuSearchReportTitles.map(reportTitle => {
      return reports.find(r => r.get('title') === reportTitle);
    }).filter(r => r);
    modalChannel.request('add', new ModalReportViewer({ availableReports, useFormBuilder: true }));
  },

  closeCEUComplaintView() {
    return Backbone.history.navigate(routeParse('ceu_complaints_item'), { trigger: true });
  },

  regions: {
    ceuStatusFilterRegion: '.ceu-complaints__status',
    ceuDateFilterRegion: '.ceu-complaints__date',
    ceuResultsCountRegion: '.ceu-complaints__results-count',
    ceuTableRegion: '.ceu-complaints__table',
    ceuComplaintRegion: '.ceu-complaints__complaint'
  },

  onBeforeRender() {
    // Re-render was called, view was not destroyed, and so the template didn't get re-rendered completely.
    // Calling React to manually unmount the DOM if this view is being re-rendered
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    if (!this.isLoaded) return;
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
    <span className="ceu-complaints__list general-link" onClick={() => this.closeCEUComplaintView()}>
      <img src={BackIcon} alt="" />
      <span className="ceu-complaints__list__text">&nbsp;Complaints list</span>
    </span> : null;
    return (
      <>
        <div className="header-page-title-container">
          <div className="header-page-title">CEU Complaints</div>
          {renderBackButton()}
          <div className="subpage dispute-overview-header-right-container">
            <div className="dispute-overview-header-right">
              <span className="header-search-icon dispute-overview-header-icon" onClick={() => this.openSearchModel()}></span>
              <div className="dispute-overview-refresh-item">
                <span className="dispute-overview-refresh-text">{Formatter.toLastModifiedTimeDisplay(Moment())}</span>
                <div className="dispute-overview-header-icon header-refresh-icon" onClick={() => this.loadCEUComplaints()}></div>
              </div>
              {renderCloseIcon()}
            </div>
          </div>
        </div>

        {this.renderJsxListFilters()}
        <div className="ceu-complaints__complaint"></div>
      </>
    )
  },

  renderJsxListFilters() {
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
        
        {this.renderJsxPaginationRow()}
        <div className={`ceu-complaints__table ${this.activeCeuComplaint ? 'hidden' : ''}`}></div>
      </>
    )
  },

  renderJsxPaginationRow() {
    if (this.activeCeuComplaint) return;
    const countToUse = this.ceuResultsCountModel.getData({ parse: true });
    const prevPage = () => {
      if (this.index <= 0) return;
      this.index -= 1;
      this.loadCEUComplaints();
    };
    const nextPage = () => {
      if (((this.index+1) * countToUse) >= this.ceuComplaints.totalAvailable) return;
      this.index += 1;
      this.loadCEUComplaints();
    };

    const loadedResultsCount = (this.index*countToUse)+this.ceuComplaints.length;
    const paginationResultsText = `Showing ${loadedResultsCount ? (this.index*countToUse)+1 : 0}-${loadedResultsCount} of ${this.ceuComplaints.totalAvailable} record${this.ceuComplaints.totalAvailable===1?'':'s'}`;
    return <div className="ceu-complaints__filters__total-count general-filters-row">
      <div>
        <span>{paginationResultsText}</span>
        {this.index <= 0 ? <img src={Icon_Menu_Hide} /> : <img src={Icon_Menu_Hide_OVR} className="clickable" onClick={() => prevPage()} />}
        {((this.index+1) * countToUse) >= this.ceuComplaints.totalAvailable ? <img src={Icon_Menu_Show} /> : <img src={Icon_Menu_Show_OVR} className="clickable" onClick={() => nextPage()} />}
      </div>
    </div>;
  },


});

_.extend(CEUComplaintsPage.prototype, ViewJSXMixin);
export default CEUComplaintsPage;