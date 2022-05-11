

<div class="office-top-main-instructions"><%= instructionsText %></div>
<div class="office-top-main-content-container"></div>

<% if (dispute) { %>
<div class="office-loaded-file-container">
  <div class="da-access-overview-container <%= hideDisputeOverview ? 'hidden' : '' %>"></div>
  <div class="da-access-actions-container">
      <% if (hasMenuActions) { %>
        <div class="da-access-actions-info">The following options are available for this dispute file.&nbsp;<span class="external-link <%= showExternalLinkMsg ? '' : 'hidden'%>"></span><span class="<%= showExternalLinkMsg ? '' : 'hidden'%>">Links are processed through the DisputeAccess site</span></div>
        <div class="error-block warning <%= isFileNumberSearch ? '' : 'hidden' %>">
          <b>File Number searches will show limited options - Search by Access Code above to view all options.</b>
          <p>If the participant does not know their access code, use the&nbsp;<span class="office-view-access-code general-link">Access Code Lookup</span>.</p>
        </div>
        <div class="da-access-menu-container">
            <% if (canDaUpdateContactInfo) { %>
              <div class="da-access-menu-item da-access-menu--da-contact">
                <div class="da-access-menu-icon"><span></span></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to update my contact information</div>
                  <div class="da-access-menu-subtitle">Use this option to add or update your email address and phone number so that you can be contacted by the Residential Tenancy Branch about your dispute.</div>
                </div>
              </div>
            <% } %>
            <% if (canCreateDispute) { %>
              <div class="da-access-menu-item da-access-menu-create">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to submit a new paper application for dispute resolution</div>
                  <div class="da-access-menu-subtitle">Use this option to submit a new paper application for dispute resolution and the associated payment.</div>
                </div>
              </div>
            <% } %>
            <% if (canCompleteDispute) { %>
              <div class="da-access-menu-item da-access-menu-complete">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to upload forms to complete a paper application submission</div>
                  <div class="da-access-menu-subtitle">Use this option to complete the creation of a new paper application for dispute resolution and the associated payment.</div>
                </div>
              </div>
            <% } %>
            <% if (canUpdateCreatedDispute) { %>
              <div class="da-access-menu-item da-access-menu-update-created">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to submit an updated paper application form to address errors or omissions</div>
                  <div class="da-access-menu-subtitle">Use this option to upload a replacement application form to fix your original application errors or omissions.</div>
                </div>
              </div>
            <% } %>
            <% if (canRecordPayment) { %>
              <div class="da-access-menu-item da-access-menu-payment">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to record an office payment</div>
                  <div class="da-access-menu-subtitle">Use this option to record an office payment for an application that has already been filed.</div>
                </div>
              </div>
            <% } %>
            <% if (canRecordFeeWaiver) { %>
              <div class="da-access-menu-item da-access-menu-fee-waiver">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to record a fee waiver</div>
                  <div class="da-access-menu-subtitle">Use this option to submit fee waiver information with fee waiver proof of income for an application that has already been filed.</div>
                </div>
              </div>
            <% } %>
            <% if (canDaUploadEvidence) { %>
              <div class="da-access-menu-item da-access-menu--da-evidence">
                <div class="da-access-menu-icon"><span></span></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to submit evidence</div>
                  <div class="da-access-menu-subtitle">Use this option to submit your evidence files to the dispute and get a receipt that you can use to make sure that you provide all evidence to the respondents in the dispute.</div>
                </div>
              </div>
            <% } %>
            <% if (canDaRecordServiceOfNotice) { %>
              <div class="da-access-menu-item da-access-menu--da-notice-pos">
                <div class="da-access-menu-icon"><span></span></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to record the service of notice to respondents</div>
                  <div class="da-access-menu-subtitle">Use this option to record when and how you served respondents in this dispute and to upload associated proof of service.</div>
                </div>
              </div>
            <% } %>
            <% if (canRequestPickup) { %>
              <div class="da-access-menu-item da-access-menu-pickup">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to pick up documents from my dispute file</div>
                  <div class="da-access-menu-subtitle">Use this option to provide documents to dispute participants and mark them as delivered.</div>
                </div>
              </div>
            <% } %>
            <% if (canRequestSubstituteService) { %>
              <div class="da-access-menu-item da-access-menu-substitute">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to submit a paper application for substituted service</div>
                  <div class="da-access-menu-subtitle">Use this option to submit a request for a substituted service.</div>
                </div>
              </div>
            <% } %>
            <% if (canRequestAmendment) { %>
              <div class="da-access-menu-item da-access-menu-amendment">
                <div class="da-access-menu-icon"></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to submit a paper request for an amendment</div>
                  <div class="da-access-menu-subtitle">Use this option to submit a request for an amendment.</div>
                </div>
              </div>
            <% } %>
            <% if (canRequestReview) { %>
              <div class="da-access-menu-item da-access-menu-review">
                  <div class="da-access-menu-icon"></div>
                  <div class="da-access-menu-item-inner">
                    <div class="da-access-menu-title">
                      <% if (isReviewFeePaid) { %>
                        I've paid my <%= REVIEW_FEE_AMOUNT_DISPLAY %> filing fee and want to submit my request for review consideration
                      <% } else { %>
                        I want to pay <%= REVIEW_FEE_AMOUNT_DISPLAY %> and submit a request for review consideration
                      <% } %>
                    </div>
                    <div class="da-access-menu-subtitle">Use this option to submit a request for review consideration (time restrictions apply).</div>
                  </div>
              </div>
            <% } %>
            <% if (canRequestCorrection) { %>
              <div class="da-access-menu-item da-access-menu-correction">
                  <div class="da-access-menu-icon"></div>
                  <div class="da-access-menu-item-inner">
                    <div class="da-access-menu-title">I want to submit a paper request for a correction on a decision or order</div>
                    <div class="da-access-menu-subtitle">Use this option to submit a request for a correction.</div>
                  </div>
              </div>
            <% } %>
            <% if (canRequestClarification) { %>
              <div class="da-access-menu-item da-access-menu-clarification">
                  <div class="da-access-menu-icon"></div>
                  <div class="da-access-menu-item-inner">
                    <div class="da-access-menu-title">I want to submit a paper request for clarification on a decision or order</div>
                    <div class="da-access-menu-subtitle">Use this option to submit a request for clarification.</div>
                  </div>
              </div>
            <% } %>
            <% if (canRequestAccessCodeRecovery) { %>
              <div class="da-access-menu-item da-access-menu-access-code">
                <div class="da-access-menu-icon"><span></span></div>
                <div class="da-access-menu-item-inner">
                  <div class="da-access-menu-title">I want to recover my Access Code by email</div>
                  <div class="da-access-menu-subtitle">Use this option to recover a lost Access Code so that you can use all available online features.</div>
                </div>
              </div>
            <% } %>

        </div>
      <% } else { %>
        There are no options available at this time.
      <% } %>
  </div>
</div>
<% } %>
