import Radio from 'backbone.radio';
import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import { DocTitles } from '../../DecGenLookups';
import DecisionHeaderBanner from './DecisionHeaderBanner';
import DecisionHeaderContent from './DecisionHeaderContent';

const Formatter = Radio.channel('formatter').request('get');

export default GeneratedOutcomeDocSection.extend({
  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.isMHPTA = this.data[DecGenData.dispute].isMHPTA();
  },

  onRender() {
    this.renderLinkedDisputesOnUI('content', DecisionHeaderContent);
  },

  ui: {
    content: '.decision_header_content'
  },

  template() {
    return <>
      {this.renderJsxHeader()}
      <div className="decision_header_content"></div>
      <br/>
    </>
  },

  renderJsxHeader() {
    const latestHearing = this.data[DecGenData.hearings]?.getLatest();
    const primaryFileNumber = latestHearing?.getPrimaryDisputeHearing()?.getFileNumber() || this.data[DecGenData.dispute].get('file_number');
    const secondaryDisputeHearings = latestHearing?.getSecondaryDisputeHearings() || [];

    const renderJsxSecondaries = () => {
      if (this.templateData[DecGenData['DecisionHeader:hideLinkedFileNumbers']] || !secondaryDisputeHearings?.length) return;
      return <div className="align_right"><span className="light_text">Additional File Number(s): </span><b>{secondaryDisputeHearings.map(dh => dh.getFileNumber()).join(', ')}</b></div>
    };

    return <>
      {DecisionHeaderBanner(this.data)}
      <div className="align_right">
        <span className="light_text">{secondaryDisputeHearings.length ? 'Primary':''} File Number: </span><b>{primaryFileNumber}</b>
      </div>
      {renderJsxSecondaries()}
      <div className="align_right">
        <span className="light_text">{DocTitles[this.data[DecGenData.currentDoc].get('file_type')]} Dated: </span>{Formatter.toFullDateDisplay(this.data[DecGenData.currentDocSet].get('doc_completed_date'))}
      </div>
    </>
  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.hearings]: true,
      [DecGenData.currentDoc]: true,
      [DecGenData.currentDocSet]: true,
      [DecGenData.linkedDisputes]: DecisionHeaderContent.getDataToLoad(),
    };
  },
});
