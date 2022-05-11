
<div class="office-top-main-instructions"></div>
<% if (!isUpload) { %>
  <div class="office-top-main-content-container"></div>
  <div class="da-access-overview-container"></div>
<% } %>

<% if (renderAsReceipt) { %>
<div class="office-sub-page-view">
  <div class="da-page-header-title hidden-print">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text">Payment completed</span>
  </div>

  <div class="office-page-receipt-container"></div>

  <div class="office-sub-page-buttons">
    <button class="btn btn-lg btn-cancel">Main Menu</button>
    <span class="office-receipt-logout general-link">Logout</span>
  </div>
</div>
<% } else { %>
<div class="office-sub-page-view da-upload-page-wrapper <%= isUpload ? 'upload' : '' %>">
  <div class="da-page-header-title">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text"><%= isUpload ? 'Uploading fee waiver proof please wait' : 'Complete fee waiver' %></span>
  </div>
  <div class="office-page-fee-waiver-container"></div>
</div>
<% } %>