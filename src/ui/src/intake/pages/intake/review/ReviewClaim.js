import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import EvidenceBannerView from '../../../components/evidence/EvidenceBanner';
import Filesize from 'filesize';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const Formatter = Radio.channel('formatter').request('get');
const ReviewClaim = Marionette.View.extend({
  regions: {
    evidenceBannerRegion: '.review-claim-evidence-status'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['issueTitle']);
  },

  onRender() {
    this.renderEvidenceBanner();
  },

  renderEvidenceBanner() {
    this.showChildView('evidenceBannerRegion', new EvidenceBannerView({
      disputeEvidenceCollection: this.model.get('dispute_evidences'),
      useShortMessages: true
    }));
  },

  template() {
    const issueTitle = this.issueTitle;
    const claimDetail = this.model.getApplicantsClaimDetail();
    const remedyDetail = this.model.getApplicantsRemedyDetail();
    const hasClaimInfo = (remedyDetail && remedyDetail.get('amount')) || (claimDetail && claimDetail.get('notice_date'))
        || (claimDetail && claimDetail.get('notice_method')) || (claimDetail && claimDetail.get('description'));

    return (
      <>
        <div className="clearfix" style={{ marginBottom: "20px", fontSize: "16px" }}>
          <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{ margin: "0px", padding: "0px", borderCollapse: "collapse" }}>
            <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr className="er-nesttable-tr">
                  <td className="er-nesttable-header" style={{ minWidth: "110px", width: "10%", textAlign: "center", verticalAlign: "middle", fontWeight: "bold", border: "1px solid #e3e3e3", backgroundColor: "#f0f0f0", padding: "4px", whiteSpace: "nowrap" }}>{claimDetail ? 'Claim' : 'Other'}</td>
                  <td className="er-nesttable-subheader" style={{ padding: "4px 4px 4px 10px", width: "auto", border: "1px solid #e3e3e3" }}>{issueTitle}</td>
                </tr>
                
                <tr className="er-nesttable-tr">
                  <td colSpan="2" className="er-nesttable-item" style={{ padding: "8px", width: "100%", border: "1px solid #e3e3e3" }}>
                    <div className="review-claim-evidence-status"></div>
                    <div className="clearfix" style={{ margin: "18px 10px 0 10px" }}>
                      <div>
                        {(remedyDetail && remedyDetail.get('amount')) ?
                          <p className="er-text" style={{ textAlign: "left", padding: "0px 0px 0px 0px", margin: "0px 0px 5px 0px" }}> <span className="er-label" style={{ padding: "0px 5px 0px 0px", color: "#8d8d8d" }}>Amount requested:</span>{Formatter.toAmountDisplay(remedyDetail.get('amount'))}</p>
                        : null }
                        {(claimDetail && claimDetail.get('notice_date')) ?
                          <p className="er-text" style={{ textAlign: "left", padding: "0px 0px 0px 0px", margin: "0px 0px 5px 0px" }}> <span className="er-label" style={{ padding: "0px 5px 0px 0px", color: "#8d8d8d" }}>Notice delivery date:</span>{Formatter.toDateDisplay(claimDetail.get('notice_date'))}</p>
                        : null }
                        { (claimDetail && claimDetail.get('notice_method')) ?
                          <p className="er-text" style={{ textAlign: "left", padding: "0px 0px 0px 0px", margin: "0px 0px 5px 0px" }}> <span className="er-label" style={{ padding: "0px 5px 0px 0px", color: "#8d8d8d" }}>Notice delivery method:</span>{Formatter.toNoticeMethodDisplay(claimDetail.get('notice_method'))}</p>
                        : null }
                  
                        { (claimDetail && claimDetail.get('description')) ? 
                          <p className="er-text" style={{ textAlign: "left", padding: "0px 0px 0px 0px", margin: "0px 0px 5px 0px" }}>{claimDetail.get('description')}</p>
                        : null }
                      </div>
                  
                      <div style={hasClaimInfo ? { marginTop: "20px" } : null}>
                        {this.renderJsxEvidence()}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </table>
        </div>
      </>
    )
  },

  renderJsxEvidence() {
    if (!this.model.get('dispute_evidences')?.length) return 'None';
    
    const provided_evidences = this.model.get('dispute_evidences')?.getProvided();
    const later_evidences = this.model.get('dispute_evidences')?.getProvideLater();
    const cant_provide_evidences = this.model.get('dispute_evidences')?.getCantProvide();
    const renderFiles = (disputeEvidence) => {
      return disputeEvidence.get('files')?.length ? <>
        {disputeEvidence.get('files').map((file, index) => (<>
            <span class={`${index ? '' : 'hidden' }`}>,&nbsp;</span>
            <span style={{ marginRight: "10px", color: "#8e8e8e" }}>{file.get('file_name')}</span>
            <span style={{ color: "#b5b5b5", fontSize: "14px" }}>({Filesize(file.get('file_size'))})</span>
          </>))}
        </> : null;
    };
    return <>
        {provided_evidences?.length ? <>
          <div style={{ width: "100%", marginRight: "5px", color: "#139b39" }}>Evidence Provided:</div>
          <ul className="review-page-evidence-list">
          {_.map(_.sortBy(provided_evidences, 'required'), (dispute_evidence) => {
            const file_description = dispute_evidence.get('file_description');
            return <>
              <li className="review-page-evidence-item">
                <span><b>{file_description.get('title')}</b>&nbsp;{dispute_evidence.get('required') ? '' : '(Optional)'}</span>
                <span class={`${file_description.get('description') ? '' : 'hidden'}`}>&nbsp;-&nbsp;{file_description.get('description')}</span>
              </li>
              {renderFiles(dispute_evidence)}
            </>
          })}
          </ul>
        </> : null}

        {later_evidences.length ? <>
          <div style={{ width: "100%", color: "#e5b872", marginRight: "5px" }}>Evidence Provided Later:</div>
          <ul className="review-page-evidence-list">
          {_.map(_.sortBy(later_evidences, 'required'), (dispute_evidence) => {
            const file_description = dispute_evidence.get('file_description');
            return <li className="review-page-evidence-item">
              <span><b>{file_description.get('title')}</b>&nbsp;{dispute_evidence.get('required') ? '' : '(Optional)'}</span>
              <span class={`${file_description.get('description') ? '' : 'hidden'}`}>&nbsp;-&nbsp;{file_description.get('description')}</span>
            </li>;
          })}
          </ul>
        </> : null}

        {cant_provide_evidences.length ? <>
          <div style={{ width:"100%", color: "#d80000", marginRight: "5px" }}>Evidence Not Provided:</div>
          <ul className="review-page-evidence-list">
          {_.map(cant_provide_evidences, (dispute_evidence) => {
            const file_description = dispute_evidence.get('file_description');
            return <li className="review-page-evidence-item">
              <span>{file_description.get('title') + ' ' + (dispute_evidence.get('required') ? '' : '(Optional)')}</span>
              <span class={`${file_description.get('description') ? '' : 'hidden'}`}>&nbsp;-&nbsp;{file_description.get('description')}</span>
            </li>;
          })}
          </ul>
        </> : null}
      </>;
    }
});

_.extend(ReviewClaim.prototype, ViewJSXMixin);
export default ReviewClaim;