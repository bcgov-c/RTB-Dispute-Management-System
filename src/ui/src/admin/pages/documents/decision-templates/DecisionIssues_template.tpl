<table id="included-issues" style="width:100%;">
  <tr><td class="sectiontitle_onecol">
    Issues
  </td></tr>
  <tr><td>
  <% if (dispute_claims.all(function(dispute_claim) { return dispute_claim.allOutcomesComplete(); })) { %>
    
    <% if (isLinkTypeMulti && secondaryDisputeHearingsDisplay) { %>
      -- TODO: ONLY CURRENT DISPUTE ISSUES SHOWN.  WORK IN PROGRESS DISPLAYING ALL ISSUES FOR LINKED DISPUTES HERE TOO. --
      <p class="text_content"><b>File Number: <%= dispute.get('file_number') %></b>&nbsp;(<%= isDisputeLandlord ? 'Landlord' : 'Tenant' %> Application) </p><!--NOTE THIS IS NOT IN SINGLE FILE DECISIONS-->
    <% } %>
    
    
    <% if (!dispute_claims.isEmpty()) { %>
      <p class="text_content">
        <% if (!isMHPTA) { %>
          The hearing was convened in response to an Application for Dispute Resolution (the Application) pursuant to the Residential Tenancy Act ("The Act") for the following issues:
        <% } else { %>
          The hearing was convened in response to an Application for Dispute Resolution (the Application) pursuant to the Manufactured Home Park Tenancy Act ("The Act") for the following issues:
        <% } %>
      </p>

      <div class="list_wrapper">
      <ul class="bullet_list">
      <% dispute_claims.each(function(dispute_claim) { %>
        <li>
          <%= dispute_claim.getClaimTitle() %>
          <%= dispute_claim.isMonetaryIssue() ? '('+Formatter.toAmountDisplay(dispute_claim.getAmount(), true)+')' : '' %>
        </li>
      <% }) %>
      </ul>
      </div>
    <% } %>
    
    <div class="spacer_min">&nbsp;</div>

    <% if (!_.escape.isEmpty(removedDisputeClaims)) { %>
      <p class="text_content">The following issues were withdrawn, amended or severed (removed) by the arbitrator in the hearing and will not be addressed in this decision:</p>
      <div class="list_wrapper">
      <ul class="bullet_list">
        <% _.escape.each(removedDisputeClaims, function(dispute_claim) { %>
          <li><%= dispute_claim.getClaimTitle() %>
            <% if (dispute_claim.hasOutcomeAmend() || dispute_claim.isAmended()) { %>
              <p class="" style="font-style:italic; color:#696969; margin-top: 5px;"><b>Removed through amendment by arbitrator</b>&nbsp;- The Applicant requested to withdraw this issue from consideration. Pursuant to the Act, I have amended the Application and withdrawn this issue.</p>
            <% } else if (dispute_claim.hasOutcomeDismissed() || dispute_claim.hasOutcomeSever()) { %>
              <p class="" style="font-style:italic; color:#696969; margin-top: 5px;"><b><%= dispute_claim.hasOutcomeSever() ? 'Severed' : 'Dismissed' %></b>&nbsp;- Residential Tenancy Branch Rules of Procedure, Rule 2.3 states that, if, in the course of the dispute resolution proceeding, the Arbitrator determines that it is appropriate to do so, the Arbitrator may sever or dismiss the unrelated disputes contained in a single application with or without leave to apply. Aside from the application to cancel the Notice(s) to End Tenancy, I am exercising my discretion to dismiss these issues identified in the application&nbsp;<b>with<%= dispute_claim.hasOutcomeDismissedWithoutLeave() ? 'out' : '' %> leave to reapply</b>&nbsp;as these matters are not related. Leave to reapply is not an extension of any applicable time limit.</p>
            <% } %>
          </li>
        <% }); %>
      </ul>
      </div>
      <div class="spacer_min">&nbsp;</div>
    <% } %>
    

    <% if (!_.escape.isEmpty(remainingDisputeClaims) && !_.escape.isEmpty(removedDisputeClaims)) { %>
      <p class="text_content">This decision is based on the following issues:</p>
      <div class="list_wrapper">
      <ul class="bullet_list">
      <% _.escape.each(remainingDisputeClaims, function(dispute_claim) { %>
        <li>
          <%= dispute_claim.getClaimTitle() %>
          <%= dispute_claim.isMonetaryIssue() ? '('+Formatter.toAmountDisplay(dispute_claim.getAmount(), true)+')' : '' %>
        </li>
      <% }) %>
      </ul>
      </div>
    <% } %>
  <% } else { %>
    <p class="text_content">--- SEVERED AND INCLUDED ISSUES ARE NOT COMPLETE IN DMS - NO INFORMATION INSERTED - TO HAVE THIS SECTION AUTO POPULATE YOU MUST INDICATE IF ALL ISSUES ARE SEVERED OR INCLUDED IN THE HEARING TOOLS ---</p>
  <% } %>
  </td></tr>
</table>
<div class="spacer_sml">&nbsp;</div>
