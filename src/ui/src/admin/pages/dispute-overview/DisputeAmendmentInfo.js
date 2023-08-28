import React from 'react';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalManageSubService from './modals/ModalManageSubService';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const amendmentsChannel = Radio.channel('amendments');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

const DisputeAmendmentInfo = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.dispute = disputeChannel.request('get');
    
    const removedParties = participantsChannel.request('get:removed');
    const removedClaims = claimsChannel.request('get:removed');

    this.listenTo(removedParties, 'update', this.render, this);
    this.listenTo(removedClaims, 'update', this.render, this);
  },

  async clickSubServiceIcon(participantModel) {
    // Always refresh the subservices on click to open sub services
    loaderChannel.trigger('page:load');
    await noticeChannel.request('load:subservices', this.dispute.id);
    loaderChannel.trigger('page:load:complete');
    
    const modalView = new ModalManageSubService({ model: participantModel });
    this.listenTo(modalView, 'removed:modal', () => {
      loaderChannel.trigger('page:load');
      Backbone.history.loadUrl(Backbone.history.fragment);
    });
    
    modalChannel.request('add', modalView);
  },

  clickAmendmentIcon(amendmentToType=null) {
    amendmentsChannel.request('show:modal:view', amendmentToType);
  },

  template() {
    const removedAmendedParties = participantsChannel.request('get:removed').filter(function(p) { return p.isAmendRemoved(); });
    const removedAmendedClaims = claimsChannel.request('get:removed').filter(function(c) { return c.isAmendRemoved(); });
    const getTenantTypeString = (participantModel) => {
      const isApplicant = participantModel.isApplicant();
      if (this.dispute.isTenant()) {
        return isApplicant? 'Tenant' : 'Landlord';
      } else {
        return isApplicant ? 'Landlord' : 'Tenant';
      }
    };
    const AMENDMENT_TO_TYPE_PARTY = configChannel.request('get', 'AMENDMENT_TO_TYPE_PARTY');
    const AMENDMENT_TO_TYPE_ISSUE = configChannel.request('get', 'AMENDMENT_TO_TYPE_ISSUE');
    
    return <div className="amendment-info-container">
      {removedAmendedParties.map(p => {
        const subServices = noticeChannel.request('get:subservices:for:participant', p.id) || []
        return <div className="amendment-info-item">
          <div className="amendment-icon" onClick={() => this.clickAmendmentIcon(AMENDMENT_TO_TYPE_PARTY)}></div>
          {subServices.length ? <div className={`sub-service-icon clickable ${subServices?.[0]?.getRequestStatusImgClass()}`} onClick={()=> this.clickSubServiceIcon(p)}></div> : null}
          <span className="">Party Removed - </span><span className="">{p.getDisplayName()} ({getTenantTypeString(p)})</span>
        </div>
      })}
      {removedAmendedClaims.map(c => (
        <div className="amendment-info-item">
          <div className="amendment-icon" onClick={() => this.clickAmendmentIcon(AMENDMENT_TO_TYPE_ISSUE)}></div>
          <span className="">Issue Removed - </span><span className="">{c.getClaimTitleWithCode()}</span>
        </div>
      ))}
    </div>;
  }
});

_.extend(DisputeAmendmentInfo.prototype, ViewJSXMixin);
export default DisputeAmendmentInfo;