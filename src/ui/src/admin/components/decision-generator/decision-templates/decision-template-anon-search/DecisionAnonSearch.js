import React from 'react';
import Radio from 'backbone.radio';
import DecGenData from '../../DecGenData';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';

const configChannel = Radio.channel('config');

export default GeneratedOutcomeDocSection.extend({
  template() {
    if (!configChannel.request('get', 'UAT_TOGGLING')?.SHOW_OUTCOME_PUBLIC_DOCS) return;
    if (!this.data[DecGenData.currentDoc].isPublicSearchable()) return;
    const anonDisplay = this.data[DecGenData.currentDocSet]?.getAnonymousDocId();
    if (!anonDisplay) return;
    return <>
      <p className="search_instructions">
        The contents of this decision, including any orders granted within the decision, can be verified online.  Go to <b>{configChannel.request('get', 'POSTED_DECISIONS_URL')}</b> and enter the Decision ID: <b>{anonDisplay}</b>.
      </p>
    </>;
  }
}, {
  getDataToLoad() {
    return {
      [DecGenData.currentDocSet]: true
    };
  }
});