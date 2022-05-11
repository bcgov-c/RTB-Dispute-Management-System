import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { routeParse } from '../../routers/mainview_router';

import PageView from '../../../core/components/page/Page';

import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';

import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';

import DecisionInformationView from './composer-sections/DecisionInformation';
import HearingAttendanceView from './composer-sections/HearingAttendance';
import ServiceOfNoticeView from './composer-sections/ServiceOfNotice';
import ServiceOfEvidenceView from './composer-sections/ServiceOfEvidence';
import IssuesSectionView from './composer-sections/IssuesSection';
import BackgroundSectionView from './composer-sections/BackgroundSection';
import AnalysisSectionView from './composer-sections/AnalysisSection';
import ConclusionSectionView from './composer-sections/ConclusionSection';


import template from './ComposerInstancePage_template.tpl';

const loaderChannel = Radio.channel('loader'),
  menuChannel = Radio.channel('menu'),
  documentsChannel = Radio.channel('documents'),
  configChannel = Radio.channel('config');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} composer-page`,

  regions: {
    docDateRegion: '.composer-doc-date',
    docStatusRegion: '.composer-doc-status',


    sectionDecisionInfoRegion: '.composer-section-decision-info',
    sectionHearingAttendanceRegion: '.composer-section-hearing',
    sectionServiceOfNoticeRegion: '.composer-section-notice',
    sectionServiceOfEvidenceRegion: '.composer-section-evidence',
    sectionIssuesRegion: '.composer-section-issues',
    sectionBackgroundRegion: '.composer-section-background',
    sectionAnalysisRegion: '.composer-section-analysis',
    sectionConclusionRegion: '.composer-section-conclusion'
  },

  ui: {
    printIcon: '.header-print-icon',
    closeIcon: '.header-close-icon',
    docUpdateBtn: '.composer-doc-update-btn'
  },

  events: {
    'click @ui.printIcon': function() { },
    'click @ui.closeIcon': 'clickClose',
    'click @ui.docUpdateBtn': 'clickDocUpdate'
  },

  clickPrint() {
    window.print();
  },

  clickClose() {
    menuChannel.trigger('close:active');
    documentsChannel.request('delete:composer', this.model);
    Backbone.history.navigate(routeParse('landing_item'), {trigger: true});
  },

  clickDocUpdate() {
    
  },

  initialize() {
    this.createSubModels();
  },

  _getFileStatusOptions() {
    const display_config = configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_STATUS_DISPLAY') || {};

    return _.map(['OUTCOME_DOC_FILE_SUB_STATUS_NOT_SET',
        'OUTCOME_DOC_FILE_SUB_STATUS_NOT_STARTED',
        'OUTCOME_DOC_FILE_SUB_STATUS_IN_PROGRESS',
        'OUTCOME_DOC_FILE_SUB_STATUS_REVIEW',
        'OUTCOME_DOC_FILE_SUB_STATUS_COMPLETED'],
      function(config_string) {
        const value = configChannel.request('get', config_string);
        return { value, text: display_config[value] };
      });
  },

  createSubModels() {
    console.log(this.model);
    this.docDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Final Documents Date',
      required: false,
      customLink: 'Today',
      customLinkFn() { this.trigger('update:input', Moment().format(InputModel.getDateFormat())) },
      value: this.model.get('outcome_doc_group_model').get('doc_completed_date'),
      apiMapping: 'doc_completed_date'
    });

    this.docStatusModel = new DropdownModel({
      optionData: this._getFileStatusOptions(),
      labelText: 'Document Status',
      errorMessage: null,
      value: this.model.get('outcome_doc_file_model').get('file_sub_status'),
      apiMapping: 'file_sub_status'
    });
  },

  onRender() {
    this.showChildView('docDateRegion', new InputView({ model: this.docDateModel }));
    this.showChildView('docStatusRegion', new DropdownView({ model: this.docStatusModel }));

    this.showChildView('sectionDecisionInfoRegion', new DecisionInformationView({ model: this.model }));
    this.showChildView('sectionHearingAttendanceRegion', new HearingAttendanceView({ model: this.model }));
    this.showChildView('sectionServiceOfNoticeRegion', new ServiceOfNoticeView({ model: this.model }));
    this.showChildView('sectionServiceOfEvidenceRegion', new ServiceOfEvidenceView({ model: this.model }));
    this.showChildView('sectionIssuesRegion', new IssuesSectionView({ model: this.model }));
    this.showChildView('sectionBackgroundRegion', new BackgroundSectionView({ model: this.model }));
    this.showChildView('sectionAnalysisRegion', new AnalysisSectionView({ model: this.model }));
    this.showChildView('sectionConclusionRegion', new ConclusionSectionView({ model: this.model }));
    
    loaderChannel.trigger('page:load:complete');
  }

});
