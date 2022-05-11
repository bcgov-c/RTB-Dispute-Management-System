<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Evidence Viewer - Beta Version</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="evidencePreview-claim-title <%= isRemoved ? 'claim-removed' : '' %>"><%= claimTitle %></div>
      <div class="evidencePreview-claim-evidence-container">
        <div class="evidencePreview-claim-evidence"></div>
        <div class="evidencePreview-top-controls">
          <div class="evidencePreview-note-list-toggle"></div>
          <div class="evidencePreview-prev-next-container">
            <div class="evidencePreview-prev clickable"></div>
            <div class="evidencePreview-next clickable"></div>
            <div class="evidencePreview-prev-next-text"><%= selfEvidencePlacement %>/<%= totalEvidenceCount %></div>
          </div>
        </div>
      </div>

      <div class="evidencePreview-content-container clearfix">
        <div class="evidencePreview-content-region"></div>
        <div class="evidencePreview-info-column <%= !showNotes ? SHOW_LIST_CLASS : '' %>">
          <div class="evidencePreview-notes-column <%= showNotes ? '' : 'hidden-item' %>">
              <div class="evidencePreview-notes-container evidencePreview-evidence-notes">
                <div class="evidencePreview-notes-title-container">
                    <div class="evidencePreview-notes-title">
                      <div class="notes-icon notes-view-icon">
                        <span class="notes-view note-count"><%= evidenceNoteCount %></span>
                      </div>
                      Evidence Notes
                    </div>
                    
                    <div class="evidencePreview-notes-controls">
                      <div class="evidencePreview-notes-add notes-icon notes-add-icon"></div>
                      <div class="evidencePreview-notes-count <%= !evidenceNoteCount ? 'hidden-item' :'' %>"
                        <%= totalEvidenceNoteCount ? '' : "style='visibility:hidden;'" %>
                      >
                        <%= (evidenceNotesBeforeMe === totalEvidenceNoteCount) ? evidenceNotesBeforeMe : evidenceNotesBeforeMe + 1 %>&nbsp;/&nbsp;<%= totalEvidenceNoteCount %>
                      </div>
                      <div class="evidencePreview-notes-nav">
                        <div class="evidencePreview-notes-nav-prev clickable"></div>
                        <div class="evidencePreview-notes-nav-next clickable"></div>
                      </div>
                    </div>
                </div>
                <div class="evidencePreview-notes"></div>
              </div>

              <div class="evidencePreview-notes-container evidencePreview-decision-notes <%= showDecisionNotes ? '' : 'hidden' %>">
                <div class="evidencePreview-notes-title-container">
                    <div class="evidencePreview-notes-title">
                      <div class="notes-icon"></div>
                      Decision Note
                    </div>
                    <div class="evidencePreview-notes-controls">
                    </div>

                    <div class="evidencePreview-notes-controls">
                      <div class="evidencePreview-notes-count"
                        <%= totalDecisionNoteCount ? '' : "style='visibility:hidden;'" %>
                      >
                        <%= (decisionNotesBeforeMe === totalDecisionNoteCount) ? decisionNotesBeforeMe : decisionNotesBeforeMe + 1 %>&nbsp;/&nbsp;<%= totalDecisionNoteCount %>
                      </div>
                      <div class="evidencePreview-notes-nav">
                        <div class="evidencePreview-notes-nav-prev clickable"></div>
                        <div class="evidencePreview-notes-nav-next clickable"></div>
                      </div>
                    </div>
                </div>
                <div class="evidencePreview-notes"></div>
              </div>
          </div>
          <div class="evidencePreview-list-column <%= showNotes ? 'hidden-item' : '' %>">
            <div class="evidencePreview-list-container"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

