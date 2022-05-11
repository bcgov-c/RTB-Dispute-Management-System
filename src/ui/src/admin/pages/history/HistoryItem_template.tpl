<div class="stage-column <%= colourClass %>"><%= Formatter.toStageDisplay(dispute_stage) %></div>
<div class="status-column <%= colourClass %>"><%= Formatter.toStatusDisplay(dispute_status) %></div>
<div class="process-column"><%= process ? Formatter.toProcessDisplay(process) : '-' %></div>
<div class="owner-column <%= owner ? colourClass : '' %>"><%= owner ? Formatter.toUserDisplay(owner) : '-' %></div>
<div class="evidence-column <%= evidence_override ? 'status-override' : '' %>"><%= evidence_override ? 'Override' : 'Rules' %></div>
<div class="start-date-column"><%= Formatter.toDateAndTimeDisplay(status_start_date) %></div>
<div class="duration-column"><%= Formatter.toDurationFromSecs(duration_seconds) ? Formatter.toDurationFromSecs(duration_seconds) : '-' %></div>
<div class="set-by-column"><%= status_set_by ? Formatter.toUserDisplay(status_set_by) : '-' %></div>
