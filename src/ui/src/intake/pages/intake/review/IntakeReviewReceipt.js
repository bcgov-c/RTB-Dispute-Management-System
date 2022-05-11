import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ReviewClaimView from './ReviewClaim';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');
const claimsChannel = Radio.channel('claims');

const IntakeReviewReceipt = Marionette.View.extend({

  regions: {
    claimsListRegion: '.review-claims-list',
    supportingClaimRegion: '.review-claims-supporting',
  },

  initialize(options) {
    this.mergeOptions(options, ['showEdit']);
    this.template = this.template.bind(this);
    this.respondents = participantsChannel.request('get:respondents');
  },

  onRender() {
    this.showChildView('claimsListRegion', new Marionette.CollectionView({
      childView: ReviewClaimView,
      collection: claimsChannel.request('get:full'),
      filter(model) {
        return !model.isFeeRecovery();
      },
      childViewOptions(model) {
        const issue_config = model.getClaimConfig();
        return {
          issueTitle: issue_config && issue_config.issueTitle ? issue_config.issueTitle : 'Issue code - ' + model.get('claim_code')
        };
      },
      filter(child) {
        // Never show hidden external claims - unless they are fee recovery issues
        return !child.isHiddenExternal() || child.isFeeRecovery();
      }
    }));

    this.showChildView('supportingClaimRegion', new ReviewClaimView({
      issueTitle: "Other supporting information",
      model: claimsChannel.request('get:supporting')
    }));
  },

  renderJsxReviewReceiptHtml() {
    const dispute = disputeChannel.request('get');
    const isLandlordApplication = dispute.isLandlord();
    const isPastTenancy = dispute.isPastTenancy();

    const applicantTypeDisplay = isLandlordApplication ? 'Landlord' : 'Tenant';
    const actTypeDisplay = dispute.isMHPTA() ? 'MHPTA (Manufactured home or trailer)' : 'RTA (Residential)';
    const addressDisplay = dispute.getAddressStringWithUnit();
    const tenancyStatusDisplay = isPastTenancy ? 'Tenant has moved out' : 'Tenant is still living in or renting the unit or site';

    // Applicant / Respondent info:
    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY');
    const applicants = participantsChannel.request('get:applicants');
    const primaryApplicantId = participantsChannel.request('get:primaryApplicant:id');
    const respondents = this.respondents;
    const showEdit = this.showEdit;

    const renderJsxReviewApplicants = () => {
      return (
        applicants.map((applicant, index) =>  {
          const isPrimary = primaryApplicantId && applicant.get('participant_id') === primaryApplicantId;
          const isBusiness = applicant.isBusiness();
          const typeDisplay = PARTICIPANT_TYPE_DISPLAY[applicant.get('participant_type')];
          return <div className="clearfix" style={{ marginBottom: "20px" }} key={index}>
            <p className="er-subheader" style={{ borderBottom: "1px solid #e3e3e3", margin: "5px 0px 10px 0px", padding: "5px 5px 2px 0px", color: "#8d8d8d" }}>{(isLandlordApplication ? 'Landlord ' : 'Tenant ') + (index+1)  }</p>
            <div style={{ margin: "10px 10px 0 0" }}>
              <div>
                {isPrimary ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px'}}><strong>Primary applicant contact</strong></span></p>
                : null }
                <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Name:</span><b>{applicant.getDisplayName()}</b></p>
                <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Type:</span>{typeDisplay}</p>
                { isPrimary ?
                <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Receive Notice of Dispute Resolution Proceeding package by:</span>{Formatter.toHearingOptionsByDisplay(applicant.get('package_delivery_method'))}</p>
                : null }

                { applicant.get('address') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}>
                    {applicant.getAddressStringWithUnit()}
                  </p>
                : null }

                { applicant.get('mail_address') ? 
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}>
                    Mail: {applicant.getMailingAddressString()}
                  </p>
                : null }

              </div>

              <div>
                { isBusiness ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Business Contact:</span><b>{applicant.getContactName()}</b></p>
                : null }

                { applicant.get('email') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Email:</span>{applicant.get('email')}</p>
                : null }

                { applicant.get('fax') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Fax:</span>{applicant.get('fax')}</p>
                : null }

                { applicant.get('primary_phone') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Daytime Phone:</span>{applicant.get('primary_phone')}</p>
                : null }

                { applicant.get('secondary_phone') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Other Phone:</span>{applicant.get('secondary_phone')}</p>
                : null }
              </div>
            </div>
          </div>
         })
      )
    }

    const renderJsxReviewRespondents = () => {
      return (
        respondents.map((applicant, index) => {
          const isBusiness = applicant.isBusiness();
          const typeDisplay = PARTICIPANT_TYPE_DISPLAY[applicant.get('participant_type')];
          return <div className="clearfix" style={{ marginBottom: "20px" }} key={index}>
            <p className="er-subheader" style={{ borderBottom: "1px solid #e3e3e3", margin: "5px 0px 10px 0px", padding: "5px 5px 2px 0px", color: "#8d8d8d" }}>{( isLandlordApplication ? 'Tenant ' : 'Landlord ') + (index+1)}</p>
            <div style={{ margin: "10px 10px 0 0" }}>
              <div>
                <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Name:</span><b>{applicant.getDisplayName()}</b></p>
                <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Type:</span>{typeDisplay}</p>

                { applicant.get('address') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}>{applicant.getAddressStringWithUnit()}</p>
                : null }

                { applicant.get('mail_address') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}>{applicant.getMailingAddressString()}</p>
                : null }
              </div>

              <div>
                { isBusiness ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Business Contact:</span><b>{applicant.getContactName()}</b></p>
                : null }

                { applicant.get('email') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Email:</span>{applicant.get('email')}</p>
                : null }

                { applicant.get('fax') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Fax:</span>{applicant.get('fax')}</p>
                : null }

                { applicant.get('primary_phone') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Daytime Phone:</span>{applicant.get('primary_phone')}</p>
                : null }

                { applicant.get('secondary_phone') ?
                  <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Other Phone:</span>{applicant.get('secondary_phone')}</p>
                : null }
              </div>
            </div>
          </div>
         })
      )
    }

    return (
      <>
        <div style={{ marginBottom: "20px", fontSize: "16px", wordBreak: "break-word" }}>
          <span className="er-title" style={{fontWeight: "bold", padding: "0px", margin: "25px 0px 10px 0px", marginRight: "15px", fontSize: "18px"}}>General dispute information</span>
          { showEdit ? <a href="#page/1" className={`review-edit-button hidden-print`}>edit</a> : null }

          <div>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Applicant type:</span>{applicantTypeDisplay}</p>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Act:</span>{actTypeDisplay}</p>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Rental address:</span>{addressDisplay}</p>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Tenancy Start:</span>{dispute.get('tenancy_start_date') ? Formatter.toDateDisplay(dispute.get('tenancy_start_date')) : '-'}</p>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Rent:</span>{dispute.get('rent_payment_amount') === null ? ' - ' : `${Formatter.toAmountDisplay(dispute.get('rent_payment_amount'))}, ${Formatter.toRentIntervalDisplay(dispute.get('rent_payment_interval'))}`}</p>  
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Security Deposit:</span>{dispute.get('security_deposit_amount') ? Formatter.toAmountDisplay(dispute.get('security_deposit_amount')) : 'No'}</p>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Pet Damage Deposit:</span>{dispute.get('pet_damage_deposit_amount') ? Formatter.toAmountDisplay(dispute.get('pet_damage_deposit_amount')) : 'No' }</p>
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Tenancy Status:</span>{tenancyStatusDisplay}</p>
            { isPastTenancy ?
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Date tenancy ended: </span> {Formatter.toDateDisplay(dispute.get('tenancy_end_date'))}</p>
            : null } 
            <p className="er-text" style={{textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px'}}> <span className="er-label" style={{padding: '0px 5px 0px 0px', color: '#8d8d8d'}}>Associated application: </span> {dispute.get('cross_app_file_number') ? 'Yes ('+ dispute.get('cross_app_file_number') +')' : 'No'}</p>
          </div>
        </div>

        <div className="clearfix" style={{ marginTop: "40px", marginBottom: "20px", fontSize: "16px", wordBreak: "break-word" }}>
          <span className="er-title" style={{fontWeight: "bold", padding: "0px", margin: "25px 0px 10px 0px", marginRight: "15px", fontSize: "18px"}}>Applicants&nbsp;<span style={{fontWeight: "normal"}}>(that filed the dispute)</span></span>
          { showEdit ? <a href="#page/2" className={`review-edit-button hidden-print`}>edit</a> : null }

          <div>
              {renderJsxReviewApplicants()}
          </div>
        </div>

        <div style={{ marginBottom: "20px", fontSize: "16px", wordBreak: "break-word" }}>
          <span className="er-title" style={{fontWeight: "bold", padding: "0px", margin: "25px 0px 10px 0px", marginRight: "15px", fontSize: "18px"}}>Respondents&nbsp;<span style={{fontWeight: "normal"}}>(the dispute is against)</span></span>
          { showEdit ? <a href="#page/4" className={`review-edit-button hidden-print`}>edit</a> : null }

          <div>
            {renderJsxReviewRespondents()}
          </div>
        </div>

        <div className="review-section" style={{ marginTop: "40px" }}>
          <span className="er-title" style={{fontWeight: "bold", padding: "0px", margin: "25px 0px 10px 0px", marginRight: "15px", fontSize: "18px"}}>Issues and evidence</span>
          { showEdit ? <a href="#page/6" className={`review-edit-button hidden-print`}>edit</a> : null }

          <div className="review-claims">
            <div className="review-claims-list"></div>
            <div className="review-claims-supporting"></div>
          </div>
        </div>
      </>
    )
  },
  
  template() {
    return this.renderJsxReviewReceiptHtml();
  },
});

_.extend(IntakeReviewReceipt.prototype, ViewJSXMixin);
export default IntakeReviewReceipt;