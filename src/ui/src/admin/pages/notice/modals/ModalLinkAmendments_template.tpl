<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Link Amendments</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="notice-filters-container clearfix">
        <div class="notice-amendment-type-filters"></div>
      </div>

      <div class="modal-body-inner">

        <div class="">
          <span class="generic-label">Associated Notice:</span>&nbsp;<span class=""><%= parentNoticeTitle %></span>
        </div>
        <div class="">
          <span class="generic-label">Amendment Added By:</span>&nbsp;<span class=""><%= Formatter.toUserDisplay(created_by) %>, <%= Formatter.toDateAndTimeDisplay(created_date) %></span>
        </div>
        <div class="">
          <span class="generic-label">Amendment Document</span>&nbsp;
          <%= _.escape.isEmpty(noticeFileModels) ? '-' : '' %>
          <% _.escape.each(noticeFileModels, function(noticeFileModel, index) { %>
            <% if (index !== 0) { print(',&nbsp;') } %>
            <span><a href="javascript:;" data-file-id="<%= noticeFileModel.get('file_id') %>" class="filename-download"><%= noticeFileModel.get('file_name') %></a></span>
          <% }) %>
        <span class="">&nbsp;<%= '('+noticeCreationTypeDisplay+')' %></span>
        </div>
        
        <div class="notice-amendment-available-amendments-msg <%= hasAvailableAmendments ? '' : 'hidden' %>">
          Select the amendments that are associated to this dispute notice
        </div>
        <div class="notice-amendment-available-amendments"></div>

        <div class="link-amendments-button-container upload-button-container">
          <button type="button" class="btn btn-lg btn-default btn-cancel">
            <span>Cancel</span>
          </button>
          <button type="button" class="btn btn-lg btn-default btn-primary">
            <span>Link Amendments</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</div>
  