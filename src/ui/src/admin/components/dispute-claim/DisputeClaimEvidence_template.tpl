<div class="dispute-issue-evidence-item-inner
    <%= showArrows ? 'dispute-issue-evidence-show-arrows' : '' %>
    <%= noFilesReferenced ? 'not-file-referenced' : '' %>
    <%= noFilesConsidered ? 'not-file-considered' : '' %>
    <%= isEvidenceRemoved ? 'claim-removed' : '' %>"
  
  data-file-description-id="<%= file_description_id || null %>"
  
  >
  <div class="dispute-issue-evidence-upload-type <%= participant_model && participant_model.isRespondent() ? 'respondent-upload' : 'applicant-upload' %>"></div>
  <div class="dispute-issue-evidence-content <%= (showThumbnails === true) ? 'show-thumbnails' : '' %>">
    <span class="dispute-issue-evidence-title"><%= isDeficient ? ('(ID: '+id+')') : ''%> <%= '<b>'+title+'</b>'+(description ? ' - '+description : '') %></span>
    <% if (files && files.length && showSubmitterInfo) { %>
      <div class="dispute-issue-evidence-submitted-info">
        <span><%= participantDisplayName %></span>
        <% if (offsetToHearing) { %>
          &nbsp;-&nbsp;
          <span class="dispute-issue-evidence-submitted-date">Latest file added:&nbsp;<span class="<%= showOffsetWarning ? 'error-red' : ''%>"><%= offsetToHearing + ' day'+(offsetToHearing===1?'':'s') + ' '+beforeAfterText+' latest hearing.' %></span></span>
        <% } %>
      </div>
    <% } %>
    <span class="dispute-issue-evidence-files <%= files.length ? '' : 'hidden-item' %>">
      <% files.each(function(file_model, index) { %>
        <% var fileDupObj = fileDupTranslations && _.escape.has(fileDupTranslations, file_model.id) ? fileDupTranslations[file_model.id] : null %>
        <% var noteLength = file_model.getEvidenceNotes().length; %>
        <% var hasDecision = !!file_model.getDecisionNotes().length; %>
        
        <div class="dispute-issue-evidence-file file-card
            <%= file_model.isReferenced() ? '' : 'not-file-referenced' %>
            <%= file_model.isConsidered() ? '' : 'not-file-considered' %>"
            data-file-id="<%= file_model.get('file_id') %>"
          >
          <div class="file-card-content">
            <% if (showThumbnails === true) { %>
              <div class="file-card-image-wrapper">
                <% if (enableEvidenceFileViewer) { %>
                  <% if (hideDups && fileDupObj ? fileDupObj.isFirst : true) { %>
                    <div class="file-card-note-icon">
                      <% var evidenceNotesCount = file_model.getEvidenceNotes({ force_refresh: true }).length; %>
                      <% if (evidenceNotesCount) { %>
                        <div class="notes-icon notes-view-icon">
                          <span class="notes-view note-count"><%= evidenceNotesCount %></span>
                        </div>
                      <% } else { %>
                        <div class="notes-icon notes-add-icon"></div>
                      <% } %>
                    </div>
                  <% } %>
                  <% if (file_model.isViewable()) { %>
                    <div class="file-card-viewable-icon"></div>
                  <% } %>
                <% }%>

                <div class="file-card-image">
                  <img src="<%= LoaderImg %>" />
                  <img class="hidden" src="<%= file_model.getThumbnailURL() %>" />
                </div>
                <div class="file-card-image-metadata">
                  <%= file_model.getMetadataDisplay() %>
                </div>
              </div>
            <% } %>
            
            <div class="file-card-description <%= hideDups && fileDupObj ? 'non-first-dup' : '' %>">
              <div class="file-card-title-container <%= !showArbControls ? 'file-display-card-description-no-controls' : '' %>" >
                <% if (showThumbnails !== true && enableEvidenceFileViewer && (hideDups && fileDupObj ? fileDupObj.isFirst : true)) { %>
                  <span class="dispute-issue-evidence-file-notes hidden-print clickable <%= noteLength ? '' : 'dispute-issue-evidence-file-notes--empty' %>"><%= noteLength %></span>
                <% } %>
                <span class="dispute-issue-evidence-file-referenced hidden-print <%= hasDecision ? 'dispute-issue-evidence-file-referenced--decision' : ''%>
                  <%= showArbControls && (hideDups && fileDupObj ? fileDupObj.isFirst : true) ? '' : 'hidden' %> <%= clickableArbControls ? 'clickable': '' %>"></span>
                <span class="dispute-issue-evidence-file-considered hidden-print <%= showArbControls && (hideDups && fileDupObj ? fileDupObj.isFirst : true) ? '' : 'hidden' %> <%= clickableArbControls ? 'clickable': '' %>"></span>
                
                <% if (hideDups && fileDupObj && !fileDupObj.isFirst) { %>
                  <span><%= file_model.get('file_name') %></span>
                <% } else { %>
                  <a href="javascript:;" class="filename-download"><%= file_model.get('file_name') %></a>
                <% } %>
              </div>
              <div class="dispute-issue-evidence-file-details">
                <span>&nbsp;(</span>
                <span class="dispute-issue-evidence-filesize"><%= Formatter.toFileSizeDisplay(file_model.get('file_size')) %></span>
                <span class="">,&nbsp;</span>
                <span class="dispute-issue-evidence-filedate <%= fileIsPastThresholdFn(file_model) ? 'error-red' : ''%>"><%= Formatter.toDateDisplay(file_model.get('file_date')) %></span>
                <span class="file-orignal-and-submitter-name <%= showDetailedNames ? '' : 'hidden' %>">
                  <span>,&nbsp;</span>
                  <span><%= file_model.get('original_file_name') ? file_model.get('original_file_name') : '-' %></span>
                  <span>,&nbsp;</span>
                  <span><%= file_model.get('submitter_name') ? file_model.get('submitter_name') : '-' %></span>
                </span>
                <% if (fileDupObj) { %>
                  <span class="">,&nbsp;</span>
                  <span class="dispute-filename-dup error-red" data-dup-id="<%= fileDupObj.text %>">&nbsp;<%= fileDupObj.text %></span>
                <% } %>
                <span>)</span>
              </div>

              <% if (index !== files.length - 1) { print('<span class="list-comma">, </span>'); } %>
            </div>
          </div>
        </div>
      <% }) %>
    </span>
    <span class="dispute-issue-evidence-no-files standard-list-empty <%= files.length ? 'hidden-item' : '' %>">
      No files added
    </span>

  </div>
</div>
