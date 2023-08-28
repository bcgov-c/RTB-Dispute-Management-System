<div class="">
  <% _.escape.each(listData, function(listDataItem) { %>
    <div class="evidencePreview-list-outer <%= listDataItem.isRemoved ? 'claim-removed' : '' %>">
      <div class="evidencePreview-list-title"><%= listDataItem.title %></div>
        <% _.escape.each(listDataItem.data, function(evidenceData) { %>
          <div class="evidencePreview-list-inner <%= evidenceData.isRemoved ? 'claim-removed' : '' %>">
            <div class="evidencePreview-list-title dispute-issue-evidence-show-arrows">
              <div class="dispute-issue-evidence-upload-type <%= evidenceData.evidenceModel && evidenceData.evidenceModel.get('isRespondent') ? 'respondent-upload' : 'applicant-upload' %>"></div>
              <%= evidenceData.title %>
            </div>
            <% _.escape.each(evidenceData.files, function(fileModel) { %>
              <% var noteLength = fileModel.getEvidenceNotes().length; %>
              <% var hasDecision = !!fileModel.getDecisionNotes().length; %>

              <div class="evidencePreview-list-file-container file-card
                <%= fileModel.id === highlightedFileId ? 'evidencePreview-highlight' : '' %>
                <%= fileModel.isReferenced() ? '' : 'not-file-referenced' %>
                <%= fileModel.isConsidered() ? '' : 'not-file-considered' %>" 
                data-file-id="<%= fileModel.id %>"
                data-evidence-id="<%= (evidenceData.evidenceModel || {getId:function(){}}).getId() %>"
              >
                <div class="file-card-description">
                  <div class="file-card-title-container">
                    <% if (!hideArbControls) { %>
                      <span class="dispute-issue-evidence-file-notes <%= noteLength ? '' : 'dispute-issue-evidence-file-notes--empty' %>"><%= noteLength %></span>
                      <span class="dispute-issue-evidence-file-referenced hidden-print <%= hasDecision ? 'dispute-issue-evidence-file-referenced--decision' : ''%>"></span>
                      <span class="dispute-issue-evidence-file-considered"></span>
                    <% } %>
                    <span class="evidencePreview-filename-no-extension"><%= fileModel.getTrimmedName(hideArbControls ? 38 : 30) %></span>
                  </div>
                </div>
              </div>
            <% }); %>
          </div>
        <% }); %>
    </div>
  <% }); %>
</div>