
<div class="editHearingLink-file-number"><%= fileNumberDisplay %></div>
<div class="editHearingLink-link-role"><%= linkRoleDisplay %></div>
<div class="editHearingLink-file-link-type"><%= linkTypeDisplay %></div>
<div class="editHearingLink-primary <%= isPrimary ? 'hidden' : '' %>"><span class="clickable">Make Primary</span></div>
<div class="editHearingLink-remove error-red <%= isPrimary ? 'hidden' : '' %>">
  <b class="glyphicon glyphicon-remove clickable"></b>
</div>