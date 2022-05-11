<table id="background-evidence" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		Background and Evidence</span>
	</td></tr>
	<tr><td>
	<p class="text_content">I have reviewed all written submissions and evidence before me; however, only the evidence relevant to the issues and findings in this matter are described in this Decision.</p>
  
  <% if (isNonParticipatory) { %>
    <!--NOTE THIS SECTION IS ONLY INCLUDED IF NON-PARTICIPATORY-->
    <% if (isDisputeLandlord) { %>
      <p class="text_content">The landlord submitted the following evidentiary material:</p>
      <div class="list_wrapper">
      <ul class="bullet_list">
        <li>A copy of a residential tenancy agreement which was signed by the landlord and the tenant(s) on ----m, d, y-----, indicating a monthly rent of $---.--, due on the ---payment period---- for a tenancy commencing on ----m, d, y-----;</li>
        <li>A copy of a 10 Day Notice to End Tenancy for Unpaid Rent (the 10 Day Notice) dated ----m, d, y----, for $--.-- in unpaid rent. The 10 Day Notice provides that the tenant had five days from the date of service to pay the rent in full or apply for Dispute Resolution or the tenancy would end on the stated effective vacancy date of ----m, d, y----;</li>
        <li>A copy of a witnessed Proof of Service Notice to End Tenancy form which indicates that the 10 Day Notice was posted to the tenant's door/personally served to the tenant at -----time not am/pm----- on ----m, d, y----; and </li>
        <li>A Direct Request Worksheet showing the rent owing and paid during the relevant portion of this tenancy.</li>
      </ul>
      </div>
    <% } else { %>
      <p class="text_content">The tenant submitted the following evidentiary material:</p>
      <div class="list_wrapper">
      <ul class="bullet_list">
        <li>A copy of a residential tenancy agreement which was signed by the landlord and the tenant(s) on ----m, d, y-----, indicating a monthly rent of $---.--, and a Security Deposit/Pet Damage Deposit of $---.--, for a tenancy commencing on ----m, d, y-----;</li>
        <li>A copy of a receipt dated ----m, d, y----, for $---.-- of pet damage deposit, paid by the tenant;</li>
        <li>A copy of a notice to vacate which was signed by the tenant on ----m, d, y-----, indicating the tenancy would end as of ----m, d, y-----;</li>
        <li>A copy of a Tenant Notice of Forwarding Address for the Return of Security Deposit and/or Pet Damage Deposit (the Forwarding Address) dated ----m, d, y-----;</li>
        <li>A copy of a Proof of Service Tenant's Forwarding Address for Return of Security Deposit and/or Pet Damage Deposit form (Proof of Service of the Forwarding Address) which indicates that the Forwarding Address was sent to the landlord by registered mail on -----time am/pm----- on —---m, d, y----;</li>
        <li>A copy of a Canada Post Customer Receipt containing the Tracking Number to confirm the Forwarding Address was sent to the landlord on ----m, d, y-----; and</li>
        <li>A copy of a Tenant's Direct Request Worksheet for an Expedited Return of Security Deposit and/or Pet Damage Deposit, showing the amount of deposits paid by the tenant, any deductions authorized by the tenant, and any partial amounts reimbursed by the landlord.</li>
      </ul>
      </div>
    <% } %>
  <% } else { %>
    
    <% if (referencedApplicantFileModels && referencedApplicantFileModels.length) { %>
      <!--NOTE THIS SECTION IS ONLY INCLUDED IF NON-PARTICIPATORY AND THERE IS EVIDENCE MARKED AS REFERENCED, ONE BULLET IN LIST PER REFERENCED EVIDENCE ITEM-->
      <p class="text_content">The <%= isDisputeLandlord ? 'landlord' : 'tenant' %><%= applicants.length > 1 ? '(s) ' : ' ' %>submitted the following evidentiary material:</p>
      <div class="list_wrapper">
        
      <ul class="bullet_list">
        <% _.escape.each(referencedApplicantFileModels, function(fileModel) { %>
          <% var decisionNotes = fileModel.getDecisionNotes(); %>
          <% var decisionNote = decisionNotes.length && decisionNotes.at(0); %>
          <li><%= fileModel.get('file_name') %> (<%= Formatter.toFileSizeDisplay(fileModel.get('file_size')) %>)<%= decisionNote ? ': '+decisionNote.get('note') : ''%></li>
        <% }); %>
      </ul>
      </div>
    <% } %>

    <% if (referencedRespondentFileModels && referencedRespondentFileModels.length) { %>
      <!--NOTE THIS SECTION IS ONLY INCLUDED IF NON-PARTICIPATORY AND THERE IS EVIDENCE MARKED AS REFERENCED, ONE BULLET IN LIST PER REFERENCED EVIDENCE ITEM-->
      <p class="text_content">The <%= isDisputeLandlord ? 'tenant' : 'landlord' %><%= respondents.length > 1 ? '(s) ' : ' ' %>submitted the following evidentiary material:</p>
      <div class="list_wrapper">
        
      <ul class="bullet_list">
        <% _.escape.each(referencedRespondentFileModels, function(fileModel) { %>
          <% var decisionNotes = fileModel.getDecisionNotes(); %>
          <% var decisionNote = decisionNotes.length && decisionNotes.at(0); %>
          <li><%= fileModel.get('file_name') %> (<%= Formatter.toFileSizeDisplay(fileModel.get('file_size')) %>)<%= decisionNote ? ': '+decisionNote.get('note') : ''%></li>
        <% }); %>
      </ul>
      </div>
    <% } %>

  <% } %>
  </td></tr>
</table>
	
<div class="spacer_sml">&nbsp;</div>