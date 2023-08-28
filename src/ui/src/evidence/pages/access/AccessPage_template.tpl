<div class="dac__access-menu__dispute-overview"></div>

<div class="dac__access-menu">

  <% if (hasMenuActions) { %>
    <% if (showIVDAlert) { %>
      <div class="warning-alert">
        <span>
          DID YOU KNOW? You can view your submitted application, evidence and request(s) by&nbsp;<a href="<%= intakeUrl %>" target="_blank" rel="noopener noreferrer">logging in online with your BCeID</a>. 
          Outcomes and decisions can also be viewed there once they are complete.
        </span>
      </div>
    <% } %>

    <div class="dac__access-menu__info">The following options are available.  What would you like to do?</div>
    
    <% if (showArsDeadlineWarning) { %>
      <div class="warning-alert">
        <span>
          You must indicate to the Residential Tenancy Branch that you served the Notice of Dispute Resolution Proceeding Package using the link below or at the Residential Tenancy Branch or Service BC Centre.
          You must declare service for at least one respondent before&nbsp;<b><%= Formatter.toFullDateAndTimeDisplay(notice.get('service_deadline_date')) %></b>&nbsp;or your hearing and application will be adjourned.
        </span>
      </div>
    <% } %>
    
    <% if (showArsReinstatementDeadlineWarning) { %>
      <div class="warning-alert">
        <span>
          This dispute has been adjourned because you did not declare service to at least one respondent before the declaration deadline&nbsp;<b><%= Formatter.toFullDateAndTimeDisplay(notice.get('service_deadline_date')) %></b>.
          If you have served the respondent(s), you may request to reinstate your hearing by providing proof of service RTB-55 at the link below or at the Residential Tenancy Branch or Service BC Centre by&nbsp;<b><%= Formatter.toFullDateAndTimeDisplay(notice.get('second_service_deadline_date')) %></b>.
          If you do not provide proof that the notice of dispute has been served, your dispute will be deemed withdrawn.
        </span>
      </div>
    <% } %>
    
    <div class="dac__access-menu__items">
      <% if (canRequestReinstatement) { %>
        <div class="dac__access-menu__item dac__access-menu__item--reinstatement">
          <div class="dac__access-menu__item__icon "></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I want to request to reinstate my dispute</div>
            <div class="dac__access-menu__item__subtitle">Use this option to upload your proof of service RTB-55</div>
          </div>
        </div>
      <% } %>
      <% if (canMakePayment) { %>
        <% _.escape.each(payableFees, function(fee) { %>
          <% var feeTypeDisplay = Formatter.toFeeTypeDisplay(fee.get('fee_type')); %>
          <div class="dac__access-menu__item dac__access-menu__item--payment" data-fee-id="<%= fee.id %>">
            <div class="dac__access-menu__item__icon"></div>
            <div class="dac__access-menu__item__content">
              <div class="dac__access-menu__item__title">I want to make a payment <%= fee.get('amount_due') ? '('+Formatter.toAmountDisplay(fee.get('amount_due'), true)+' owing for '+feeTypeDisplay+')' : '' %></div>
              <div class="dac__access-menu__item__subtitle">Use this option to complete an outstanding <%= feeTypeDisplay %> payment associated to your dispute.</div>
            </div>
          </div>
        <% }) %>
      <% } %>
      <% if (canUploadEvidence) { %>
        <div class="dac__access-menu__item dac__access-menu__item--evidence">
          <div class="dac__access-menu__item__icon"></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I want to submit evidence</div>
            <div class="dac__access-menu__item__subtitle">Use this option to submit your evidence files to the dispute and get a receipt that you can use to make sure that you provide all evidence to the respondents in the dispute.</div>
          </div>
        </div>
      <% } %>
      <% if (canUpdateContactInfo) { %>
        <div class="dac__access-menu__item dac__access-menu__item--update-contact">
            <div class="dac__access-menu__item__icon "></div>
            <div class="dac__access-menu__item__content">
              <div class="dac__access-menu__item__title">I want to update my contact information</div>
              <div class="dac__access-menu__item__subtitle">Use this option to add or update your email address and phone number so that you can be contacted by the Residential Tenancy Branch about your dispute.</div>
            </div>
        </div>
      <% } %>
      <% if (canRequestAmendment) { %>
        <div class="dac__access-menu__item dac__access-menu__item--amendment">
            <div class="dac__access-menu__item__icon "></div>
            <div class="dac__access-menu__item__content">
              <div class="dac__access-menu__item__title">I want to submit a paper request for an amendment</div>
              <div class="dac__access-menu__item__subtitle">Use this option to submit a request for an amendment.</div>
            </div>
        </div>
      <% } %>
      <% if (canRecordServiceOfNotice) { %>
        <div class="dac__access-menu__item dac__access-menu__item--service">
          <div class="dac__access-menu__item__icon"></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I want to record the service of notice to respondents</div>
            <div class="dac__access-menu__item__subtitle">Use this option to record when and how you served respondents in this dispute and to upload associated proof of service.</div>
          </div>
        </div>
      <% } %>
      <% if (canRequestCorrection) { %>
        <div class="dac__access-menu__item dac__access-menu__item--correction">
          <div class="dac__access-menu__item__icon "></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I want to request a correction</div>
            <div class="dac__access-menu__item__subtitle">Use this option to request a correction to a decision or an order to correct items like a misspelled name, incorrect address or math error.</div>
          </div>
        </div>
      <% } %>
      <% if (canRequestClarification) { %>
        <div class="dac__access-menu__item dac__access-menu__item--clarification">
            <div class="dac__access-menu__item__icon "></div>
            <div class="dac__access-menu__item__content">
              <div class="dac__access-menu__item__title">I want to request a clarification</div>
              <div class="dac__access-menu__item__subtitle">Use this option to request a clarification to the decision or order. A request for a clarification is not an opportunity to re-open the dispute or ask for a change in the decision or order.</div>
            </div>
        </div>
      <% } %>
      <% if (canRequestSubServ) { %>
        <div class="dac__access-menu__item dac__access-menu__item--sub-serv">
          <div class="dac__access-menu__item__icon "></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I want to submit an application for substituted service</div>
            <div class="dac__access-menu__item__subtitle">Use this option to apply for a special order to serve documents in a different way than the law allows.</div>
          </div>
      </div>
      <% } %>
      <% if (canRequestReview) { %>
        <div class="dac__access-menu__item dac__access-menu__item--review">
          <div class="dac__access-menu__item__icon "></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I've paid my <%= Formatter.toAmountDisplay(reviewFeeAmount, true) %> filing fee and want to submit my request for review consideration</div>
            <div class="dac__access-menu__item__subtitle">Use this option to submit a request for review consideration (time restrictions apply)</div>
          </div>
      </div>
      <% } %>
      <% if (canRequestReviewPayment) { %>
        <div class="dac__access-menu__item dac__access-menu__item--review-payment">
          <div class="dac__access-menu__item__icon "></div>
          <div class="dac__access-menu__item__content">
            <div class="dac__access-menu__item__title">I want to pay <%= Formatter.toAmountDisplay(reviewFeeAmount, true) %> and submit a request for review consideration</div>
            <div class="dac__access-menu__item__subtitle">Use this option to submit a request for review consideration (time restrictions apply)</div>
          </div>
      </div>
      <% } %>
    </div>
  <% } else { %>
    There are no options available at this time.
  <% } %>
  <% if (showSecondaryDisputeWarning) { %>
    <div class="error-block warning">
      <b>This is not the Dispute Access Code for the primary dispute file.</b>&nbsp;Another dispute which is linked to this file is referred to as the 'primary dispute.' To submit an online request for correction, clarification or review on a decision and/or order, please log in using your Dispute Access Code for the primary dispute. If you do not have the Dispute Access Code for the primary dispute, contact the&nbsp;
      <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>.
    </div>
  <% } %>
  <div class="dac__access-menu__help">
    Don't see an option you are expecting?&nbsp;<a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Contact the Residential Tenancy Branch</a>&nbsp;for help.
  </div>
</div>
