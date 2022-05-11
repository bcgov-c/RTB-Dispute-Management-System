import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import './BulkMoveTable.scss';

const Formatter = Radio.channel('formatter').request('get');

const EmptyBulkMoveItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No matching hearings located for this time period</div>`)
});

const BulkMoveItem = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['activeRowId']);
  },

  onDomRefresh() {
    if (this.activeRowId === this.model.get('hearingModel').id) document.getElementById("bulk-move__list__item--active").scrollIntoView();
  },

  template() {
    const hearingModel = this.model.get('hearingModel') ? this.model.get('hearingModel') : this.model; 
    const hearingId = hearingModel.id;
    const dateAssigned = hearingModel.get('local_start_datetime') ? Formatter.toDateDisplay(hearingModel.get('local_start_datetime')) : '-'; 
    const startTime = hearingModel.get('local_start_datetime') ? Formatter.toTimeDisplay(hearingModel.get('local_start_datetime')) : '-';
    const endTime = hearingModel.get('local_end_datetime') ? Formatter.toTimeDisplay(hearingModel.get('local_end_datetime')) : '-';
    const duration = hearingModel.get('local_start_datetime') && hearingModel.get('local_end_datetime') ? 
      Formatter.toDuration(hearingModel.get('local_start_datetime'), hearingModel.get('local_end_datetime')) 
      : '-';
    const priority = hearingModel.get('hearing_priority') ? Formatter.toUrgencyDisplay(hearingModel.get('hearing_priority'), { urgencyColor: true }) : '';
    const primaryDispute = hearingModel.getPrimaryDisputeHearing();
    const files = hearingModel.get('associated_disputes') ? hearingModel.get('associated_disputes').length : null;
    const primaryFile = primaryDispute ? primaryDispute.get('file_number') : null;
    const link = hearingModel.getDisputeHearingLinkShortDisplay();
    const resultText = this.model.get('moveOperationResult') ? this.model.get('moveOperationResult').text : null;
    const resultColor = this.model.get('moveOperationResult') ? this.model.get('moveOperationResult').color : null;
    const resultFontStyle = this.model.get('moveOperationResult') ? this.model.get('moveOperationResult').style : 'normal';

    return (
      <div className={`bulk-move__list__item${this.activeRowId === hearingModel.id ? '--active' : ''}`} id={this.activeRowId === hearingModel.id ? 'bulk-move__list__item--active' : ''}>
        <div className="bulk-move__hearing-id">{hearingId}</div>
        <div className="bulk-move__date-assigned">{dateAssigned}</div>
        <div className="bulk-move__start-time">{startTime}</div>
        <div className="bulk-move__end-time">{endTime}</div>
        <div className="bulk-move__duration">{duration}</div>
        <div className="bulk-move__priority" dangerouslySetInnerHTML={{ __html: priority }}></div>
        <div className="bulk-move__files">{files}</div>
        <div className="bulk-move__primary-file">{primaryFile}</div>
        <div className="bulk-move__link">{link}</div>
        <div className="bulk-move__result" style={{color: resultColor, fontStyle: resultFontStyle}}>{resultText}</div>
      </div>
    )
  }
});

_.extend(BulkMoveItem.prototype, ViewJSXMixin);

const BulkMoveListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: BulkMoveItem,
  emptyView: EmptyBulkMoveItemView,

  childViewOptions(model, index) {
    return {
      collection: this.options.collection,
      activeRowId: this.options.activeRowId,
      index
    }
  }
});

const BulkMoveTable = Marionette.View.extend({
  regions: {
    bulkMoveList: '.bulk-move__list'
  },

  initialize(options) {
    this.mergeOptions(options, ['collection', 'initHearingRowId']);
    this.template = this.template.bind(this);
    this.activeRowId = this.initHearingRowId || null;
  },

  setActiveRowId(hearingId) {
    this.activeRowId = hearingId;
  },

  onRender() {
    this.showChildView('bulkMoveList', new BulkMoveListView({ activeRowId: this.activeRowId, collection: this.collection }));
  },

  template() {
    return (
      <>
        <div className="bulk-move__list__header">
          <div className="bulk-move__hearing-id">HearingId</div>
          <div className="bulk-move__date-assigned">Date Assigned</div>
          <div className="bulk-move__start-time">Start Time</div>
          <div className="bulk-move__end-time">End Time</div>
          <div className="bulk-move__duration">Duration</div>
          <div className="bulk-move__priority">Priority</div>
          <div className="bulk-move__files">Files</div>
          <div className="bulk-move__primary-file">Primary File</div>
          <div className="bulk-move__link">Link</div>
          <div className="bulk-move__result">Result</div>
        </div>
        <div className="bulk-move__list"></div>
      </>
    )
  }
});

_.extend(BulkMoveTable.prototype, ViewJSXMixin);
export default BulkMoveTable