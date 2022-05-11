<% if (!isNonParticipatory) { %>
<!--NOTE THIS SECTION ONLY APPEARS IF THE PROCESS  IS PARTICIPATORY-->
<table id="conducted-hearings-participatory" style="width:100%;">
	<tr><td colspan="2" class="sectiontitle_onecol">
		Conducted Hearing(s)
	</td></tr>
  
  <% if (allHearingsParticipationComplete) { %>
    <% allHearings.each(function(hearing, index) { %>
    <% if (index > 0) print('<tr><td><div class="spacer_sml">&nbsp;</div></td></tr>'); %>
    <% var hearingParticipants = hearing && hearing.getParticipations().filter(function(p) { return p.didAttend(); }); %>
    <!--NOTE THIS SECTION IS ONLY DISPLAYED IF HEARING INFORMATION IS COMPLETE IN DMS (ALL PARTICPATION SET FOR ACTIVE USERS) -->	
    <tr><td colspan="2">
      <p class="text_content">Participatory Hearing:&nbsp;<b><%= Formatter.toDateDisplay(hearing.get('local_start_datetime')) %> at <%= Formatter.toTimeDisplay(hearing.get('local_start_datetime')) %></b></p>
    </td></tr>
    <tr>
      <td class="left_twocol">
        <% var attendingHearingApplicants = _.escape.filter(hearingParticipants, function(_p) { return _p.isApplicant(); }); %>
        <% if (!attendingHearingApplicants.length) { %>
          <p class="list_header">No one attended the hearing on behalf of the&nbsp;<b><%= isDisputeLandlord ? 'Landlord' : 'Tenant' %></b></p>
        <% } else { %>
        <p class="list_header">Attending on behalf of the&nbsp;<b><%= isDisputeLandlord ? 'Landlord' : 'Tenant' %></b></p>
        <div class="list_wrapper_twocol">
        <ul class="bullet_list">
          <% _.escape.each(attendingHearingApplicants, function(hp, index) { %>
            <% var p = hp.get('participant_model') %>
            <% if (p) { %>
              <li><b><%= p.getDisplayName() %></b>&nbsp;- <%= isDisputeLandlord ? 'Landlord' : 'Tenant' %> (<%= p.getInitialsDisplay() %>)</li>
            <% } else { %>
              <li><b>Other Attendee</b>&nbsp;(<%= hp.getInitialsDisplay() %>)</li>
            <% } %>
          <% }); %>
        </ul>
        </div>
        <% } %>
      </td>
      <td class="right_twocol">
        <% var attendingHearingRespondents = _.escape.filter(hearingParticipants, function(_p) { return _p.isRespondent(); }); %>
        <% if (!attendingHearingRespondents.length) { %>
          <p class="list_header">No one attended the hearing on behalf of the&nbsp;<b><%= isDisputeLandlord ? 'Tenant' : 'Landlord' %></b></p>
        <% } else { %>
        <p class="list_header">Attending on behalf of the&nbsp;<b><%= isDisputeLandlord ? 'Tenant' : 'Landlord' %></b></p>
        <div class="list_wrapper_twocol">
        <ul class="bullet_list">
          <% _.escape.each(attendingHearingRespondents, function(hp, index) { %>
            <% var p = hp.get('participant_model') %>
            <% if (p) { %>
              <li><b><%= p.getDisplayName() %></b>&nbsp;- <%= isDisputeLandlord ? 'Tenant' : 'Landlord' %> (<%= p.getInitialsDisplay() %>)</li>
            <% } else { %>
              <li><b>Other Attendee (<%= hp.getInitialsDisplay() %>)</b></li>
            <% } %>
          <% }); %>
        </ul>
        </div>
        <% } %>
      </td>
    </tr>
    <% }) %>
  <% } else { %>
	<!--NOTE THIS SECTION IS ONLY DISPLAYED IF HEARING INFORMATION IS INCOMPLETE IN DMS (I.E. ANY PARTICPATION NOT SET FOR ACTIVE USERS) -->
	<tr><td colspan="2">
		<p class="text_content">--- HEARING PARTICIPATION INFORMATION IS NOT COMPLETE IN DMS - NO INFORMATION INSERTED - COMPLETE THE HEARING PARTICIPATION FOR ALL HEARINGS IN DMS TO AUTO-POPULATE THIS SECTION OF THE DECISION ---</p>
  </td></tr>
  <% } %>
</table>
	
<div class="spacer_sml">&nbsp;</div>

<% } else { %>	
<!--NOTE THIS SECTION ONLY IS DISPLAYED IF NON-PARTICIPATORY-->
<table id="conducted-hearings-non-participatory" style="width:100%;">
<tr><td class="sectiontitle_onecol">
  Conducted Hearing(s)
</td></tr>
<tr><td>
  <p class="text_content"><b>EX PARTE PROCEEDING (DIRECT REQUEST PROCEEDING)</b></p>
  <p class="text_content">
    <% if (isDisputeLandlord) { %>
      <% if (isMHPTA) { %>
        This decision dealt with an Application for Dispute Resolution by the Landlord for an Order of Possession and a Monetary Order based on an undisputed 10 day Notice to End Tenancy for Unpaid Rent pursuant to sections 48 and 60 of the Act. Pursuant to section 48(4) of the Act, the decision in this matter was made without a participatory hearing and based on the written submissions of the Landlord.
      <% } else { %>
        This decision dealt with an Application for Dispute Resolution by the Landlord for an Order of Possession and a Monetary Order based on an undisputed 10 day Notice to End Tenancy for unpaid rent pursuant to sections 55 and 67 of the Act. Pursuant to section 55(4) of the Residential Tenancy Act (the "Act"), the decision in this matter was made without a participatory hearing and based on the written submissions of the Landlord.
      <% } %>
    <% } else if (!isMHPTA) { %>
      Pursuant to section 38.1 of the Residential Tenancy Act, the decision in this matter was made without a participatory hearing.  The decision was based on a Tenant's Application for Dispute Resolution by Direct Request and the written submissions of the Tenant.
    <% } %>
  </p>
</td></tr>
</table>

<div class="spacer_sml">&nbsp;</div>
<% } %>