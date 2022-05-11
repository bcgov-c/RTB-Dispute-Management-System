<table id="notice-service" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		Service of Notice of Dispute Resolution Proceeding
  </td></tr>
	<tr><td>

  <% if (allNoticesProvidedWithServiceInfo) { %>
    <!--NOTE THIS SECTION ONLY APPEARS IF THE NOTICE SERVICE IS SET FOR ALL RESPONDENTS ON ALL NOTICES -->
		<p class="text_content">
      <% if (isNonParticipatory) { %>
        The following documents were considered by the arbitrator as served, deemed served or not served in accordance with sections 82 and 83 of the Act.
      <% } else { %>
        The following documents were considered by the arbitrator as served, deemed received or not served in accordance with section 89 and 90 of the Residential Tenancy Act.
      <% } %>
    </p>
    
    <% if (isLinkTypeMulti && secondaryDisputeHearingsDisplay) { %>
      -- TODO: ONLY CURRENT DISPUTE ISSUES SHOWN.  WORK IN PROGRESS DISPLAYING ALL ISSUES FOR LINKED DISPUTES HERE TOO. --
      <p class="text_content_filenumber">
        <span class="filenum_left_block">&nbsp;&nbsp;</span>&nbsp;&nbsp;<b>File Number: <%= dispute.get('file_number') %></b>&nbsp;(<%= isDisputeLandlord ? 'Landlord' : 'Tenant' %> Application)
      </p>
    <% } %>

    <% _.escape.each(notices, function(notice) { %>
      <p class="text_content"><b>Notice of Dispute Resolution Proceeding</b>&nbsp;(the "Notice") dated&nbsp;<b><%= Formatter.toDateDisplay(notice.get('notice_delivered_date')) %></b></p>
      <div class="list_wrapper">
      <ul class="bullet_list">
        <%= getHtmlForServiceOutcomes(notice.getServices(), !notice.isAssociatedToRespondent()) %>
      </ul>
      </div>
      <div class="spacer_min">&nbsp;</div>
      
      <% _.escape.each(getAmendmentNoticesFor(notice), function(amendmentNotice) { %>
      <p class="text_content"><b>Amendment to an Application for Dispute Resolution</b>&nbsp;(the "Amendment") dated&nbsp;<b><%= Formatter.toDateDisplay(amendmentNotice.get('notice_delivered_date')) %></b> </p>
      <div class="list_wrapper">
      <ul class="bullet_list">
        <%= getHtmlForServiceOutcomes(amendmentNotice.getServices(), !amendmentNotice.isAssociatedToRespondent()) %>
      </ul>
      </div>
      <div class="spacer_min">&nbsp;</div>    
      <% }); %>
      
    <% }); %>
    
  <% } else { %>
    <!--NOTE THIS SECTION ONLY APPEARS IF NOTICE SERVICE IS NOT RECORDED FOR ALL RESPONDENTS IN DMS -->
    <p class="text_content">--- NOTICE SERVICE IS NOT COMPLETE IN DMS FOR ALL NOTICES - NO INFORMATION INSERTED - TO HAVE THIS SECTION AUTO POPULATE YOU MUST INDICATE SERVICE ON ALL NOTICES ---</p>
  <% } %>
	</td></tr>
</table>

<div class="spacer_sml">&nbsp;</div>

<table id="evideence-service" style="width:100%;">
<tr><td class="sectiontitle_onecol">
  Service of Evidence
</td></tr>
<!--NOTE THIS SECTION ONLY APPEARS IF EVIDENCE PACKAGE SERVICE IS RECORDED FOR ALL RESPONDENTS IN DMS -->
<tr><td>

<% if (allEvidenceServiceInfoProvided) { %>
  <% if (isLinkTypeMulti && secondaryDisputeHearingsDisplay) { %>
    -- TODO: ONLY CURRENT DISPUTE ISSUES SHOWN.  WORK IN PROGRESS DISPLAYING ALL ISSUES FOR LINKED DISPUTES HERE TOO. --
    <p class="text_content_filenumber">
      <span class="filenum_left_block">&nbsp;&nbsp;</span>&nbsp;&nbsp;<b>File Number: <%= dispute.get('file_number') %></b>&nbsp;(<%= isDisputeLandlord ? 'Landlord' : 'Tenant' %> Application)
    </p>
  <% } %>

  <p class="text_content"><%= filePackagesLengthEnglishDisplay %> (<%= filePackagesWithFiles.length %>) evidence package<%=filePackagesWithFiles.length===1?' was' : 's were' %> provided to the Residential Tenancy Branch, and considered by the arbitrator as served, deemed served or not served in accordance with
    <% if (isNonParticipatory) { %>
      section 88 and 90 of the Residential Tenancy Act.
    <% } else { %>
      sections 81 and 83 of the Act.
    <% } %>
  </p>

  <% _.escape.each(filePackagesWithFiles, function(filePackage, index) { %>
    <% var creatorModel = filePackage.getPackageCreatorParticipantModel(); %>
    <% var isLandlord = creatorModel && ((creatorModel.isApplicant() && isDisputeLandlord) || (!creatorModel.isApplicant() && !isDisputeLandlord)); %>
    <p class="text_content"><b><%= Formatter.toLeftPad(index+1) %>: <%= isLandlord ? 'Landlord' : 'Tenant' %> evidence</b>&nbsp;package submitted by&nbsp;<b><%= isLandlord ? 'Landlord' : 'Tenant' %> (<%= creatorModel && creatorModel.getInitialsDisplay() %>)</b>&nbsp;on&nbsp;<b><%= Formatter.toDateDisplay(filePackage.get('package_date')) %></b></p>
    <div class="list_wrapper">
    <ul class="bullet_list">
      <%= getHtmlForServiceOutcomes(filePackage.getServices(), isLandlord) %>
    </ul>
    </div>
    <div class="spacer_min">&nbsp;</div>
  <% }); %>
  
<% } else { %>
  <!--NOTE THIS SECTION ONLY APPEARS IF EVIDENCE PACKAGE SERVICE IS NOT RECORDED FOR ALL RESPONDENTS IN DMS -->
  <p class="text_content">--- EVIDENCE PACKAGE SERVICE IS NOT COMPLETE IN DMS - NO INFORMATION INSERTED - TO HAVE THIS SECTION AUTO POPULATE YOU MUST INDICATE RESPONDENT SERVICE ON ALL EVIDENCE PACKAGES ---</p>
<% } %>
</td></tr>
</table>

<div class="spacer_sml">&nbsp;</div>
