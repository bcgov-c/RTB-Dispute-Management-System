import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionHeaderBanner from '../decision-template-header/DecisionHeaderBanner';
import { DocTitles } from '../../DecGenLookups';
import { DecGenPageBreak } from '../DecGenPageBreak';

export default GeneratedOutcomeDocSection.extend({
  
  template() {
    return <>
      {/* Section 1c) */}
      {this.renderJsxDocTitle()}
    </>;
  },

  renderJsxDocTitle() {
    const docTitle = DocTitles[this.data[DecGenData.currentDoc]?.get('file_type')];
    const showBanner = !this.data[DecGenData.currentDoc].isOrderOfPossession() && !this.data[DecGenData.currentDoc].isMonetaryOrder();
    return <>
      {showBanner ? <>
        {DecGenPageBreak}
        {DecisionHeaderBanner(this.data)}
        <br/>
      </> : null}
      <div className="doc_title">{String(docTitle || '').toUpperCase()}</div>
      {showBanner ? <br/> : null}
    </>;
  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.currentDoc]: true,
    };
  },
});
