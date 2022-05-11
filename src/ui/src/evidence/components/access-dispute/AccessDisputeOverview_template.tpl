<div class="dac__dispute-overview">
  <div class="dac__icons__site"></div>

  <div class="dac__dispute-overview__info">
    <div class="dac__dispute-overview__title-container clearfix">
      <div class="dac__dispute-overview__title">File<span class="hidden-xs">&nbsp;Number</span>:&nbsp;<strong><%= dispute && dispute.get('file_number') %></strong></div>
      <p class="dac__logout-link">Logout</p>
    </div>
    <div class="dac__dispute-overview__info__content hidden-xs">
      <div class="dac__dispute-overview__info__content__col">
        <div>
          <label class="review-label">Status:&nbsp;</label><span><b><%= dispute && Formatter.toStatusDisplay(dispute.getStatus()) %></b></span>
        </div>
        <div>
          <label class="review-label">Date filed:&nbsp;</label><span><%= dispute && dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : 'Not filed' %></span>
        </div>
        <div>
          <label class="review-label">Hearing date:&nbsp;</label><span><%= hearingDateDisplay %></span>
        </div>
      </div>
      <div class="dac__dispute-overview__info__content__col">
        <div>
          <label class="review-label">Submitter:&nbsp;</label><span><b><%= submitterName || '-' %></b></span>
        </div>
        <div>
          <label class="review-label">Role:&nbsp;</label><span><%= isApplicant ? 'Applicant' : 'Respondent' %> (<%= dispute && (!(dispute.isLandlord() ^ isApplicant)) ? 'Landlord' : 'Tenant' %>)</span>
        </div>
        <div>
          <label class="review-label">Access Code:&nbsp;</label><span><%= accessCode + ' - (User: '+participantInitials+')' %></span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="dac__dispute-overview--mobile visible-xs">
  <div class="dac__dispute-overview__info__content">
    <div class="dac__dispute-overview__info__content__col">
      <div>
        <label class="review-label">Status:&nbsp;</label><span><b><%= dispute && Formatter.toStatusDisplay(dispute.getStatus()) %></b></span>
      </div>
      <div>
        <label class="review-label">Date filed:&nbsp;</label><span><%= dispute && dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : 'Not filed' %></span>
      </div>
      <div>
        <label class="review-label">Hearing date:&nbsp;</label><span><%= hearingDateDisplay %></span>
      </div>
    </div>
    <div class="dac__dispute-overview__info__content__col">
      <div>
        <label class="review-label">Submitter:&nbsp;</label><span><b><%= submitterName %></b></span>
      </div>
      <div>
        <label class="review-label">Role:&nbsp;</label><span><%= isApplicant ? 'Applicant' : 'Respondent' %> (<%= dispute && (!(dispute.isLandlord() ^ isApplicant)) ? 'Landlord' : 'Tenant' %>)</span>
      </div>
      <div>
          <label class="review-label">Access Code:&nbsp;</label><span><%= accessCode + ' - (User: '+participantInitials+')' %></span>
      </div>
    </div>
  </div>
</div>
