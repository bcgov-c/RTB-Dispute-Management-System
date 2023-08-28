<div class="page-loading-message-container <%= isLoaded ? 'hidden': '' %>">
  Loading...
</div>
<div class="<%= isLoaded ? '': 'hidden' %>">
  <div class="header-page-title-container">
    <div class="header-page-title header-page-title-with-img">
      <img class="common-files-header-image" src="<%= require('../../static/Icon_Header_CommonFiles.png') %>" />
      <span>Common Files</span>
    </div>

    <div class="subpage dispute-overview-header-right-container">
      <div class="dispute-overview-header-right">
        <div class="dispute-overview-refresh-item">
          <span class="dispute-overview-refresh-text"><%= Formatter.toLastModifiedTimeDisplay(lastRefreshTime) %></span>
          <div class="dispute-overview-header-icon header-refresh-icon"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="common-files">
    <div class="common-files-header">
      <h4 class="common-files-header-left-wrapper">
        <img class="common-files-header-image" src="<%= require('../../static/Icon_Admin_CmnHelp.png') %>" /> 
        <span>RTB Files</span>
      </h4>
      <div class="common-files-header-right-wrapper">
        <span class="common-files-checkbox" id="common-files-removed-checkbox-1"></span>
        <span class="common-files-checkbox" id="common-files-checkbox-1"></span>
        <img class="common-files-add" id="add-help-file" src="<%= require('../../static/Icon_Admin_Cmn_AddIcon.png') %>" />
        <span class="common-files-add-text" id="add-help-file">Add/Edit File</span>
      </div>
    </div>
    <div class="common-files-help-files">
    </div>
  </div>

  <div class="common-files">
    <div class="common-files-header">
      <h4 class="common-files-header-left-wrapper"><img class="common-files-header-image" src="<%= require('../../static/Icon_Admin_CmnForm.png') %>" /> RTB Forms</h4>
      <div class="common-files-header-right-wrapper">
        <span class="common-files-checkbox" id="common-files-removed-checkbox-2"></span>
        <span class="common-files-checkbox" id="common-files-checkbox-2"></span>
        <img class="common-files-add" id="add-rtb-file" src="<%= require('../../static/Icon_Admin_Cmn_AddIcon.png') %>" />
        <span class="common-files-add-text" id="add-rtb-file">Add/Edit Form</span>
      </div>
    </div>
    <div class="common-files-rtb-forms">
    </div>
  </div>

  <div class="common-files">
    <div class="common-files-header">
      <h4 class="common-files-header-left-wrapper"><img class="common-files-header-image" src="<%= require('../../static/Icon_Admin_CmnSignature.png') %>" /> Document Signatures</h4>
      <div class="common-files-header-right-wrapper">
        <span class="common-files-checkbox" id="common-files-checkbox-3"></span>
        <img class="common-files-add" id="add-document-file" src="<%= require('../../static/Icon_Admin_Cmn_AddIcon.png') %>" />
        <span class="common-files-add-text" id="add-document-file">Add/Edit Signature</span>
        <div class="participant-add-icon"></div>
      </div>
    </div>
    <div class="common-files-document-signature">
    </div>
  </div>

  <% if (showReports) { %>
  <div class="common-files">
    <div class="common-files-header">
      <h4 class="common-files-header-left-wrapper">
        <img class="common-files-header-image" src="<%= require('../../static/Icon_Admin_CmnHelp.png') %>" /> 
        <span>Excel Report Templates</span>
      </h4>
      <div class="common-files-header-right-wrapper">
        <span class="common-files-checkbox" id="common-files-removed-checkbox-4"></span>
        <span class="common-files-checkbox" id="common-files-checkbox-4"></span>
        <img class="common-files-add" id="add-help-file" src="<%= require('../../static/Icon_Admin_Cmn_AddIcon.png') %>" />
        <span class="common-files-add-text" id="add-excel-file">Add/Edit File</span>
      </div>
    </div>
    <div class="common-files-excel-files">
    </div>
  </div>
  <% } %>
</div>
