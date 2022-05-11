<div class="da-access-dispute-overview">
  <div class="da-access-dispute-icon da-site-icon"></div>

  <div class="da-access-dispute-info-container">
    <div class="da-access-dispute-info-title-container clearfix">
      <p class="da-access-dispute-info-title">File<span class="hidden-xs">&nbsp;Number</span>:&nbsp;<strong><%= dispute.isNew() ? '--' : dispute.get('file_number') %></strong></p>
    </div>
    <div class="da-access-dispute-info hidden-xs">

      <% if (dispute.isNew()) { %>
        <span>No file is currently open.  If you want to open an existing file use the 'existing' file type search above</span>
      <% } else { %>
        <div class="da-access-dispute-info-column">
          <div>
            <label class="review-label">Status:</label>&nbsp;<span><b><%= Formatter.toStatusDisplay(dispute.getStatus()) %></b></span>
          </div>
          <div>
            <label class="review-label">Payment Due:</label>&nbsp;<span><%= paymentDueDisplay ? paymentDueDisplay : '-' %></span>
          </div>
          <div>
            <label class="review-label">Payment Deadline:</label>&nbsp;<span><%= dueDateDisplay ? dueDateDisplay : '-' %></span>
          </div>
          <div>
            <label class="review-label">Payment Selected:</label>&nbsp;<span><%= paymentMethodDisplay ? paymentMethodDisplay : '-' %></span>
          </div>
        </div>
        <div class="da-access-dispute-info-column">
          <div>
            <label class="review-label">Office User:</label>&nbsp;<span><b><%= userDisplay ? userDisplay : '-' %></b></span>
          </div>
          <div>
            <label class="review-label">Dispute Type:</label>&nbsp;<span><%= dispute.isLandlord() ? 'Landlord' : 'Tenant' %>, <%= dispute.isMHPTA() ? 'MHPTA' : 'RTA' %></span>
          </div>
          <div>
            <label class="review-label">Date filed:</label>&nbsp;<span><%= dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : 'Not filed' %></span>
          </div>
          <div>
            <label class="review-label">Hearing date:</label>&nbsp;<span><%= dispute.get('hearingStartDate') ? Formatter.toDateAndTimeDisplay(dispute.get('hearingStartDate')) : 'Not scheduled' %></span>
          </div>
        </div>
      <% } %>
    </div>
  </div>
</div>

<div class="da-access-dispute-info-mobile visible-xs">
  <div class="da-access-dispute-info">
      <% if (dispute.isNew()) { %>
        <span>No file is currently open. If you want to open an existing file use the 'existing' file type search above</span>
      <% } else { %>
        <div class="da-access-dispute-info-column">
          <div>
            <label class="review-label">Office User:</label>&nbsp;<span><b><%= userDisplay ? userDisplay : '-' %></b></span>
          </div>
          <div>
            <label class="review-label">Status:</label>&nbsp;<span><b><%= Formatter.toStatusDisplay(dispute.getStatus()) %></b></span>
          </div>
          <div>
            <label class="review-label">Payment Due:</label>&nbsp;<span><%= paymentDueDisplay ? paymentDueDisplay : '-' %></span>
          </div>
          <div>
            <label class="review-label">Date Due:</label>&nbsp;<span><%= dueDateDisplay ? dueDateDisplay : '-' %></span>
          </div>
          <div>
            <label class="review-label">Selected Method:</label>&nbsp;<span><%= paymentMethodDisplay ? paymentMethodDisplay : '-' %></span>
          </div>
        </div>
        <div class="da-access-dispute-info-column">
          <div>
            <label class="review-label">Dispute Type:</label>&nbsp;<span><%= dispute.isLandlord() ? 'Landlord' : 'Tenant' %>, <%= dispute.isMHPTA() ? 'MHPTA' : 'RTA' %></span>
          </div>
          <div>
            <label class="review-label">Date filed:</label>&nbsp;<span><%= dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : 'Not filed' %></span>
          </div>
          <div>
            <label class="review-label">Hearing date:</label>&nbsp;<span><%= dispute.get('hearingStartDate') ? Formatter.toDateDisplay(dispute.get('hearingStartDate')) : 'Not scheduled' %></span>
          </div>
        </div>
      <% } %>
  </div>
</div>
