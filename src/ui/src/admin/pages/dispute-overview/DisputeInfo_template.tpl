
<div class="review-dispute-status-container">
  <div class="review-dispute-status"></div>
</div>

<div class="review-dispute-info-container two-column-edit-container review-information-body">
  <div class="dispute-party-column left-column">
    <div class="review-parties">
      <label class="review-label">Parties:</label>&nbsp;<div class="review-dispute-party-names"></div>
    </div>
    <div class="">
      <label class="review-label">Issue Codes:</label>&nbsp;<span><%= issueCodesDisplay ? '<b>'+issueCodesDisplay+'</b>' : '-' %></span>
    </div>

    <div class="review-dispute-rent-unit"></div>

    <div class="review-dispute-address"></div>

    <div class="review-primary-applicant">
      <label class="review-label">Primary applicant:</label>&nbsp;<span><b><%= primaryApplicant ? primaryApplicant : 'None selected' %></b></span>
    </div>
    <div>
      <label class="review-label">Applicant type:</label>&nbsp;<span><b><%= dispute_sub_type === 1 ? 'Tenant' : dispute_sub_type === 0 ? 'Landlord' : 'None selected' %></b></span>
    </div>

    <div>
      <label class="review-label">Notice Package Preference:</label>&nbsp;<span><b><%= hearingOptionsByDisplay %></b></span>
    </div>
    <div class="review-notice-provided">
      <label class="review-label">Initial Notice Provided:</label>&nbsp;<span><%= initialNoticeDisplay %></span>
    </div>

    <div class="review-hearing-container">
      <div class="">
        <label class="review-label">Latest Hearing:</label>&nbsp;<span><%= hearingDisplay %></span>
      </div>
      <div class="">
        <label class="review-label">Linking Type:</label>&nbsp;<span><%= linkTypeDisplay %></span>
      </div>
      <div class="">
        <label class="review-label">Primary:</label>&nbsp;<span><%= primaryDisputeHearingDisplay %></span>
      </div>
      <div class="">
        <label class="review-label">Secondary:</label>&nbsp;<span><%= secondaryDisputeHearingsDisplay %></span>
      </div>
    </div>

    <div class="review-submitted-date"></div>
    <div class="review-payment-date"></div>
    <div>
      <label class="review-label">Last Modified By:</label>&nbsp;<span><%= Formatter.toUserDisplay( dispute_last_modified_by || modified_by) %>, <%= Formatter.toDateAndTimeDisplay( dispute_last_modified_date || modified_date) %></span>
    </div>
    <div class="">
      <label class="review-label">Storage Location:</label>&nbsp;<span><%= storageLocationDisplay ? storageLocationDisplay : '-' %></span>
    </div>
  </div>

  <div class="dispute-party-column right-column">
    <div class="review-act-type"></div>
    <div class="review-urgency-wrapper">
      <div class="review-urgency"></div>
        <span class="review-urgency-auto-set general-link hidden">&nbsp;Auto-set from issues</span>
    </div>
    <div class="review-complexity-wrapper">
      <div class="review-complexity"></div>
      <span class="review-complexity-auto-set general-link hidden">&nbsp;Auto-set from issues</span>
    </div>
    <div class="">
      <label class="review-label">Type:</label>&nbsp;<span><%= creationMethodDisplay ? creationMethodDisplay : '-' %></span>
    </div>
    <div class="review-cross-app-file-number"></div>
    <div class="review-migration-truth"></div>

    <div class="review-rental-amount-interval-view">
        <label class="review-label">Rent:</label>&nbsp;<span><%= rent_payment_amount === null ? '&nbsp;-&nbsp;' : Formatter.toAmountDisplay(rent_payment_amount) %>,&nbsp;<%= Formatter.toRentIntervalDisplay(rent_payment_interval) %></span>
    </div>
    <div class="review-rent-amount"></div>
    <div class="review-rental-interval"></div>
    <div class="review-security-deposit"></div>
    <div class="review-pet-deposit"></div>

    <div class="review-tenancy-start-date"></div>
    <div class="review-tenancy-status"></div>
    <div class="review-tenancy-end-date"></div>

    <div class="review-tenancy-agreement-files">
      <label class="review-label">Tenancy Agreement:</label>&nbsp;
      <span class="">
        <% if (_.escape.isEmpty(tenancyAgreementFileCollections)) { %>
          <%= tenancyAgreementNoFileDisplay %>
        <% } else { %>
          <% _.escape.each(tenancyAgreementFileCollections, function(fileCollection) { %>
            <% fileCollection.each(function(e_file, index) { %>
              <a href="javascript:;" data-file-id="<%= e_file.get('file_id') %>" class="filename-download"><%= e_file.get('file_name') %></a>
              <% if (e_file.get('file_size')) { %>
                <span class="dispute-issue-evidence-filesize">(<%= Formatter.toFileSizeDisplay(e_file.get('file_size')) %>)</span>
              <% } %>
              <% if (index !== fileCollection.length - 1) { print('<span class="list-comma">, </span>'); } %>
            <% }) %>
          <% }) %>
        <% } %>
      </span>
    </div>

    <div class="review-tenancy-agreement-info">
      <label class="review-label">Agreement Effective:</label>&nbsp;<span><%= tenancyAgreementInfoDisplay %></span>
    </div>

    <div class="review-tenancy-edit-container">
      <div class="review-tenancy-effective-edit"></div>
      <div class="review-tenancy-signed-edit"></div>
    </div>
  </div>
</div>
