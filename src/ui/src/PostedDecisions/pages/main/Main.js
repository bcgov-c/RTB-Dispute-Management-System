import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { polyglot } from '../../assets/locales';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import FileModel from '../../../core/components/files/File_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import { IconShowAll, IconShowMore, IconSearch, IconSearchAgain } from '../../assets/images';
import './Main.scss';
import { DecisionSearch } from './decisions-search/DecisionSearch';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const DEFAULT_DECISION_DISPLAY_AMOUNT = 10;
export const RADIO_FILTER_CODES = {
  PROPERTIES: 1,
  FREE_TEXT: 2,
  DECISION_ID: 3,
};

const PostedDecisions = Marionette.View.extend({
  initialize(options) {
    this.parent = options.parent;
    this.template = this.template.bind(this);
    this.createSubModels();
    this.createSubViews();
    this.setupListeners();
    this.count = DEFAULT_DECISION_DISPLAY_AMOUNT;
    this.animationChannel = Radio.channel('animations');
    this.Formatter = Radio.channel('formatter').request('get');
    this.configChannel = Radio.channel('config');
    this.decisionsChannel = Radio.channel('decisions');
    this.loaderChannel = Radio.channel('loader');
    this.searchButtonDisabled = false;
    this.searchResultsHidden = true;

    this.LANDLORD_CODE = String(this.configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'));
    this.TENANT_CODE = String(this.configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'));
    this.DROPDOWN_CODE_HOME = String(this.configChannel.request('get', 'DISPUTE_TYPE_RTA'));
    this.DROPDOWN_CODE_MH_PARK = String(this.configChannel.request('get', 'DISPUTE_TYPE_MHPTA'));
  },

  createSubViews() {
    this.decisionSearchView = new DecisionSearch({ model: this.model, searchOption: this.disputeTypeFiltersModel.getData() });
    this.filterView = new RadioView({ model: this.disputeTypeFiltersModel, displayTitle: 'Search by:' });
  },

  createSubModels() {
    this.disputeTypeFiltersModel = new RadioModel({
      optionData: this.getDisputeFilters(),
      value: RADIO_FILTER_CODES.PROPERTIES,
    });
  },

  setupListeners() {
    this.listenTo(this.disputeTypeFiltersModel, 'change:value', () => {
      this.model.trigger('filter:update', this.disputeTypeFiltersModel.getData());
    });
    this.listenTo(this.model, 'form:disabled', (decisionData) => {
      this.searchButtonDisabled = true;
      this.searchResultsHidden = false;
      this.disputeTypeFiltersModel.set({ valuesToDisable: [RADIO_FILTER_CODES.PROPERTIES, RADIO_FILTER_CODES.FREE_TEXT, RADIO_FILTER_CODES.DECISION_ID] });
      this.loadFilteredDecisions(decisionData);
    });
  },

  search() {
    this.model.trigger('search:clicked', this.count);
  },

  reset() {
    this.searchButtonDisabled = false;
    this.searchResultsHidden = true;
    this.count = DEFAULT_DECISION_DISPLAY_AMOUNT;
    this.disputeTypeFiltersModel.set({ valuesToDisable: [] });
    this.render();
    this.model.trigger('search:reset');
  },

  downloadFile(decision) {
    const file_url = decision.file_url ? decision.file_url : "";
    const decisionFile = new FileModel({ file_url });
    decisionFile.download();
  },

  loadFilteredDecisions(decisionData) {
    const formatDeadlineToEndOfDay = (date) => Moment(date).add(1, 'day').toISOString();
    const requestData = {
      ...(decisionData?.disputeType ? { DisputeType: decisionData.disputeType } : null),
      ...(decisionData?.tenancyEnded ? { TenancyEnded: decisionData.tenancyEnded } : null),
      ...(decisionData?.disputeProcess ? { DisputeProcess: decisionData.disputeProcess } : null),
      ...(decisionData?.disputeSubType ? { DisputeSubType: decisionData.disputeSubType } : null),
      ...(decisionData?.businessNames ? { BusinessNames: decisionData.businessNames } : null),
      ...(decisionData?.hearingAttendance ? { HearingAttendance: decisionData.hearingAttendance } : null),
      ...(decisionData?.decisionDateGreaterThan ? { DecisionDateGreaterThan: decisionData.decisionDateGreaterThan } : null),
      ...(decisionData?.decisionDateLessThan ? {DecisionDateLessThan: formatDeadlineToEndOfDay(decisionData?.decisionDateLessThan) } : null),
      ...(decisionData?.includedClaimCodes ? {IncludedClaimCodes: decisionData.includedClaimCodes} : null),
      ...(decisionData?.query ? { Query: decisionData.query } : null),
      // Always search for .pdf, this is part of the db decision id
      ...(decisionData?.decisionId ? { AnonDecisionId: `${decisionData.decisionId}.pdf` } : null),
      count: this.count,
    };
    
    const disputeTypeFiltersModel = this.disputeTypeFiltersModel.getData();
    const loadRequestType = disputeTypeFiltersModel === RADIO_FILTER_CODES.FREE_TEXT ? 'load:fulltext:decisions'
      : 'load:filtered:decisions';
    this.loaderChannel.trigger('page:load');
    this.decisionsChannel.request(loadRequestType, requestData).then((response) => {
      this.searchResults = response;
      this.render();
      this.loaderChannel.trigger('page:load:complete');
      const searchResultsEle = this.getUI('searchResults');
      this.animationChannel.request('queue', $(searchResultsEle) , 'scrollPageTo', {is_page_item: true});
    }).catch(err => {
      if (err.status === 200) {
        this.searchResults = { posted_decisions: [], total_available_records: 0, total_database_records: null, earliest_record_date: null };
        this.render();
        const searchResultsEle = this.getUI('searchResults');
        this.loaderChannel.trigger('page:load:complete');
        this.animationChannel.request('queue', $(searchResultsEle) , 'scrollPageTo', {is_page_item: true});
        return;
      }
      generalErrorFactory.createHandler('POSTED.DECISIONS.LOAD', () => this.reset())(err);
      this.loaderChannel.trigger('page:load:complete');
    })
  },

  showMore() {
    this.count += DEFAULT_DECISION_DISPLAY_AMOUNT;
    this.search();
    this.render();
  },

  getDisputeFilters() {
    return  [
      { value: RADIO_FILTER_CODES.PROPERTIES, text: 'Find decisions by dispute properties (recommended)'},
      { value: RADIO_FILTER_CODES.FREE_TEXT, text: 'Free text'},
      { value: RADIO_FILTER_CODES.DECISION_ID, text: 'Decision ID'}
    ]
  },

  /* Marionette Methods */

  className: 'posted-decisions',
  regions: {
    filterRegion: '.posted-decisions__filter__checkbox',
    decisionSearchRegion: '.decision-search',
    resultsRegion: '.posted-decisions__results__searched' 
  },
  ui: {
    searchButton: '.posted-decisions__buttons__search',
    searchAgainButton: '.posted-decisions__buttons__refresh',
    searchResults: '.posted-decisions__results',
  },

  onBeforeRender() {
    /* DOM was not fully re-rendering jsx inside of renderJsxSearchResult causing some text elements to not appear after searching for a second time */
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
    if (this.filterView.isRendered() && this.decisionSearchView.isRendered()) {
      this.detachChildView('filterRegion');
      this.detachChildView('decisionSearchRegion');
    }
  },

  onRender() {
    this.showChildView('filterRegion', this.filterView.render());
    this.showChildView('decisionSearchRegion', this.decisionSearchView);
  },

  template() {
    return (
      <>
        {/* Page Header + Description */}
        <div className="posted-decisions__wrapper">
          <span className="posted-decisions__header__img"/>
          <div className="posted-decisions__header">
            <span className="posted-decisions__header__title"><span className="posted-decisions__header__mobile-img"/>{polyglot.t('postedDecisions.pageHeader')}</span>
            <span className="posted-decisions__header__body" dangerouslySetInnerHTML={{ __html: polyglot.t('postedDecisions.pageDescriptionHtml', 
            { url: this.Formatter.toUrlDisplay("legacy decision search tool", "http://www.housing.gov.bc.ca/rtb/search.html") }) }}/>
          </div>
        </div>
        {/* Filter */}
        <div className="posted-decisions__filter">
          <div className="posted-decisions__filter__checkbox"></div>
        </div>
        {/* Decision Search */}
        <div className="decision-search"></div>
        <div className="posted-decisions__buttons">
          <button className="btn btn-lg posted-decisions__buttons__search" onClick={() => this.search()}  disabled={this.searchButtonDisabled}>
            <img className="posted-decisions__buttons__refresh__icon" src={IconSearch}/>
            Search
          </button>
          <button className={`btn btn-lg posted-decisions__buttons__refresh ${this.searchResultsHidden ? 'hidden' : '' }`} onClick={() => this.reset()}>
            <img className="posted-decisions__buttons__refresh__icon" src={IconSearchAgain}/>
            Search Again
          </button>
        </div>
        {/* Results */}
        <div className="posted-decisions__results" hidden={this.searchResultsHidden}>
          { this.renderJsxSearchResult() }
        </div>
      </>
    )
  },

  renderJsxSearchResult() {
    if (this.searchResults) {
      return (
        <>
          <span className="posted-decisions__results__searched">
            {this.searchResults.total_database_records !== null && this.searchResults.earliest_record_date !== null ?
              `Searched ${this.searchResults.total_database_records} decisions starting ${this.Formatter.toDateDisplay(this.searchResults.earliest_record_date)}`
              : ''
            }
          </span>
          <div className="posted-decisions__results__title">
            <span className="posted-decisions__results__title__text">
              {`Viewing Search Results ${this.searchResults.posted_decisions.length}/${this.searchResults.total_available_records}`}
            </span>
          </div>
          {this.searchResults.posted_decisions.length > 0 ?
            <>
              {this.searchResults.posted_decisions.map((decision, index) => {
                return (
                  <div className="posted-decisions__results__decision" key={index}>
                    <span className="posted-decisions__results__decision__title">
                      <span className="posted-decisions__results__decision__title__name">{this.renderJsxDecisionName(decision)}</span>
                      <span className="posted-decisions__results__decision__title__download" onClick={ () => this.downloadFile(decision) }>[ Download Decision ]</span>
                    </span>
                    <span className="posted-decisions__results__decision__body">
                      {decision.search_result_summary}
                    </span>
                  </div>
                )
              })}
                {this.searchResults.posted_decisions.length < this.searchResults.total_available_records ?
                <span className="posted-decisions__results__footer--show-more" onClick={() => this.showMore()}>
                  <img className="posted-decisions__results__footer__image" src={ IconShowMore }/>
                  <span>Show more</span>
                </span>
                :
                <span className="posted-decisions__results__footer">
                  <img className="posted-decisions__results__footer__image" src={ IconShowAll }/>
                  <span>All results displayed</span>  
                </span>
              }
            </>
          : 
          <div className="posted-decisions__results__decision">
            <span>No Results Found - click 'Search Again' to try a new search</span>
          </div>
          }
        </>
      );
    }
  },

  renderJsxDecisionName(decision) {
    return `Decision: ${this.renderJsxDecisionAnonNameText(decision)}`;
  },

  renderJsxDecisionAnonNameText(decision) {
    return decision.anon_decision_id ? decision.anon_decision_id : 'Not Available';
  },

});

_.extend(PostedDecisions.prototype, ViewJSXMixin);
export { PostedDecisions }