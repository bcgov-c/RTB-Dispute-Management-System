<div class="cms-archive-info-header-container">
  <div class="cms-archive-info-header">New Information</div>
  <div class="cms-archive-add-note-container">
    <div class="cms-archive-add-note cms-archive-add-note-link-text cms-archive-add-note-icon">Add Note</div>
    <div class="cms-archive-add-edit-link cms-archive-add-note-link-text cms-archive-edit-link-icon">Edit Link</div>
  </div>
</div>

<div class="cms-archive-new-information-container">
  <div class="">
    <label class="review-label">Linked File:</label>&nbsp;
    <span class="cms-archive-dms-file-link <%= dms_file_guid ? 'general-link' : '' %>">
      <%= dms_file_number ? dms_file_number : '-' %>
    </span>
  </div>
  <div class="">
    <label class="review-label">Audit Notes:</label>&nbsp;
    <% if (notes && notes.length) { %>
      <% _.escape.each(_.escape.sortBy(notes, function(note) { return -Moment(note.created_date).unix(); }), function(note) { %>
        <div style="padding: 10px 0 3px 10px;">
          <span class="cms-latest-note-description"><%= note ? note.cms_note : '' %></span>&nbsp;
          <% if (note) { %>
              <span class="cms-archive-note-by-and-date"><%= '(' + note.created_by+' - ' + Formatter.toDateDisplay(note.created_date) + ')' %></span>
          <% } %>
        </div>
      <% }) %>
    <% } else { %>
      -
    <% } %>
  </div>  
</div>

<div class="cms-archive-information-container">
  <div class="">
    <label class="review-label">Number of CMS Records:</label>&nbsp;<span><b><%= cms_record_count %></b></span>
  </div>

  <div class="cms-archive-clone-viewing-row">
    <label class="review-label">Viewing:</label>&nbsp;
      <% _.escape.each(cms_records, function(record, index) { %>
        <span class="<%= cloneNumber === index ? 'cms-archive-viewing-clone' : 'general-link' %> cms-archive-record-switch" id="<%= index %>">
          <%= String(index+1)+'. ' + CMS_STATUS_DISPLAYS[record.dispute_status] + ' ' + (record.created_date ? ' - Created ' : '') + ' ' +
          (record.created_date ? Formatter.toDateDisplay(record.created_date, 'utc') : '') %>
        </span>
      <% }); %>   
  </div>

  <div class="cms-archive-jump-to-section">
    <label class="review-label">Jump to Section:</label>&nbsp;
    <span class="jump-to-dispute general-link cms-archive-jump-link">Dispute</span> |
    <span class="jump-to-applicants general-link cms-archive-jump-link">Applicants</span> |
    <span class="jump-to-agents general-link cms-archive-jump-link">Agents</span> |
    <span class="jump-to-respondents general-link cms-archive-jump-link">Respondents</span> |
    <span class="jump-to-hearing general-link cms-archive-jump-link">Hearing</span> |
    <span class="jump-to-outcome general-link cms-archive-jump-link">Outcome</span> |
    <span class="jump-to-audit general-link cms-archive-jump-link">Audit</span>

  </div>
</div>