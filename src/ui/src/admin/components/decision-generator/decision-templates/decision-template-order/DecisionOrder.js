import React from 'react';
import GeneratedOutcomeDocSection from '../../GeneratedOutcomeDocSection';
import DecGenData from '../../DecGenData';
import DecisionOrder_MergeFields from './DecisionOrder_MergeFields';
import { IssueCodes } from '../../DecGenLookups';
import DecisionDocTitle from '../decision-template-title/DecisionDocTitle';

export default GeneratedOutcomeDocSection.extend({

  initialize() {
    GeneratedOutcomeDocSection.prototype.initialize.call(this, ...arguments);
    this.addCustomMergeFields(DecisionOrder_MergeFields);

    this.filteredIssues = this.data[DecGenData.allIssues].clone().removeAllRemovedClaimsAndEvidence();
    
    this.opIssues = this.filteredIssues.filter(issue => [...IssueCodes.LL_DR_OP, ...IssueCodes.Emergency, ...IssueCodes.LL_OP, ...IssueCodes.LL_OP_STOP,
        ...IssueCodes.LL_OP_TT, ...IssueCodes.TT_OP].includes(issue.get('claim_code')));
    this.mnIssues = this.filteredIssues.filter(issue => [...IssueCodes.LL_DR_MN, ...IssueCodes.TT_DR_MN, ...IssueCodes.MN_LL, ...IssueCodes.MN_LL_Monthly,
        ...IssueCodes.MN_LL_Deposit, ...IssueCodes.MN_TT, ...IssueCodes.MN_Misc, ...IssueCodes.FF].includes(issue.get('claim_code')));
  },
  
  ui: {
    docTitle: '.decision-order__doc-title'
  },

  onRender() {
    // Doc Title is rendered inside order because this section uses a custom header intro line
    const titleSectionView = new DecisionDocTitle({ model: this.model, data: this.data, templateData: this.templateData, generationOptions: this.generationOptions });
    this.getUI('docTitle').replaceWith(
      titleSectionView.render().$el.html()
    );
  },

  template() {
    const renderedErrors = this.renderJsxErrors();
    if (renderedErrors) {
      return <>
        <div className="decision-order__doc-title"></div>
        {renderedErrors}
      </>;
    }

    return this.finalizeRender(<>
      {this.renderJsxIntro()}
      <br/>
      <div className="decision-order__doc-title"></div>
      {
        this.data[DecGenData.currentDoc].isOrderOfPossession() ? this.renderJsxOrderOfPossession()
        : this.data[DecGenData.currentDoc].isMonetaryOrder() ? this.renderJsxMonetaryOrder()
        : `**InsertOrderContent`        
      }
      {this.renderJsxSignature()}
    </>);
  },

  renderJsxIntro() {
    const grantedOpIssues = this.opIssues.filter(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled());
    const issues = (this.data[DecGenData.currentDoc].isOrderOfPossession() && grantedOpIssues.length ?
      [grantedOpIssues[0]]
    : this.data[DecGenData.currentDoc].isMonetaryOrder() ?
      [...grantedOpIssues, ...this.mnIssues]
    : []).filter(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled());

    return this.finalizeRender(<>
      {
        this.data[DecGenData.currentDoc].isOrderOfPossession() ? <div>{`{st_order-possession-act-sections}`}</div> :
        this.data[DecGenData.currentDoc].isMonetaryOrder() ? <div>{`{st_order-possession-monetary-act-sections}`}</div>
        : null
      }
    </>, { issues });
  },

  renderJsxOrderOfPossession() {
    const renderOrderForIssue = (issue) => {
      const isReverseAward = issue.isReverseAward();
      return this.finalizeRender(isReverseAward ? `{st_respondent_possession-order}` : `{st_applicant_possession-order}`, { issue });
    }
    const firstGrantedIssue = this.opIssues.find(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled());
    return firstGrantedIssue ? renderOrderForIssue(firstGrantedIssue) : null;
  },

  renderJsxMonetaryOrder() {
    return <>
      {
        this.mnIssues.find(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled()) ? `{st_single-monetary-order}` : null
      }
    </>
  },

  renderJsxSignature() {
    const signature = this.data[DecGenData.signature];
    return <p className="signature_container">
      {signature?.img ? <img src={signature.img} width={`${signature.dimensions?.width}`} height={`${signature.dimensions?.height}`} />
      : <>**InsertSignatureHere</>}
    </p>;
  },

  renderJsxErrors() {
    const grantedOpIssues = this.opIssues.filter(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled());
    return this.data[DecGenData.currentDoc].isOrderOfPossession() ?
      (grantedOpIssues.length < 1 ? this.wrapHtmlWithError(<div>--- POSSESSION ORDERS CANNOT BE POPULATED WHERE THERE ARE NO GRANTED POSSESSION ISSUES ON THE DISPUTE FILE ---</div>)
        : grantedOpIssues.length > 1 ? this.wrapHtmlWithError(<div>--- POSSESSION ORDERS CANNOT BE POPULATED WHERE MORE THAN ONE POSSESSION IS GRANTED IN DMS ---</div>)
        : this.opIssues.some(issue => !issue.allOutcomesComplete()) ? this.wrapHtmlWithError(<div>--- POSSESSION ORDERS CANNOT BE POPULATED WHERE OUTCOME INFORMATION IS NOT COMPLETED IN DMS ---</div>)
        : null
      )
      : this.data[DecGenData.currentDoc].isMonetaryOrder() ?
      (this.mnIssues.filter(issue => issue.hasOutcomeAwarded() || issue.hasOutcomeSettled()).length < 1 ? this.wrapHtmlWithError(<div>--- MONETARY ORDERS CANNOT BE POPULATED WHERE THERE ARE NO GRANTED MONETARY ISSUES ON THE DISPUTE FILE ---</div>)
        : this.mnIssues.some(issue => !issue.allOutcomesComplete()) ? this.wrapHtmlWithError(<div>--- MONETARY ORDERS CANNOT BE POPULATED WHERE OUTCOME INFORMATION IS NOT COMPLETED IN DMS ---</div>)
        : null
      ) : null;
  },

}, {
  getDataToLoad() {
    return {
      [DecGenData.dispute]: true,
      [DecGenData.allIssues]: true,
      [DecGenData.allParticipants]: true,
      [DecGenData.signature]: true,
    };
  },
  
});
