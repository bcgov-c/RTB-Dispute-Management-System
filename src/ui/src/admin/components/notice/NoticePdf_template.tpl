<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Put Document Title Here</title>
<style>
	
	div.pdf_container {
		width:240mm;
    font-family: Arial, Helvetica, sans-serif !important;
    margin-left: auto;
    margin-right: auto;
  }
  
  .pdf_container, .pdf_container table, .pdf_container td {
    font-family: Arial, Helvetica, sans-serif !important;
		font-size:17px;
		line-height:21px;
		padding:0px;
		margin:0px;
  }


  .pdf_container, .pdf_container * {
		font-family:Arial, Helvetica, sans-serif !important;
		font-size:17px;
		line-height:21px;
		padding:0px;
		margin:0px;
  }
	
	div.spacer_min {
		line-height:10px;
	}
	
	div.spacer_sml {
		line-height:20px;
	}
	
	div.spacer_med {
		line-height:30px;
	}
	
	div.spacer_lrg {
		line-height:40px;
	}
	
	.pdf_container p {
		padding:0px;
		margin:0px;
	}
	
	p.organization_title {
		font-size: 18px;
		margin:20px 0px 2px 0px;
	}
	
	p.document_title {
		font-size: 24px; 
		font-weight: bold;
    line-height: 28px;
	}

	p.listitem {
		margin:5px 0px 0px 0px;
  }
  
  .listitem-hearingdetails {
    margin-left: 25px;
  }
	
	p.issue_listitem {
		margin:5px 0px 0px 0px;
	}
	
	p.issue_listitem_none {
		margin:5px 0px 0px 0px;
		color:#ccc;
		font-style: italic;
	}
	
	
	p.issue_listtitle {
		margin:15px 0px 0px 0px;
		font-weight:bold;
	}
	
	p.pregap_listitem {
		margin:15px 0px 0px 0px;
	}
	
	p.text_content {
		margin:10px 0px 0px 0px;
	}
	
	p.rtbtext_content {
		margin:0px;
		padding:10px !important;
		background-color: #f1f1f1;
	}
	
	p.list_header {
		margin:10px 0px 0px 0px;
	}
	
	p.evidence_text_content {
		margin:5px 0px 5px 0px;
	}

	
	div.list_wrapper {
		margin:0px 0px 0px 30px;
	}
	
	ul.bullet_list {
		padding:0px;
		margin:0px;	
	}
	
	ul.bullet_list li {
		padding:0px;
		margin:5px 0px 0px 10px;	
	}
	
	td.main_header {
		font-weight: bold; 
		font-size: 19px; 
	}
	
	td.sectiontitle_onecol {
		border-bottom:1px solid #ccc !important; 
		font-size: 17px;
		padding:7px 0px 2px 0px; 
		font-weight: bold; 
		
	}
	
	td.issuetitle_onecol {
		background-color: #f1f1f1; 
		padding: 5px 10px 5px 10px !important; 
		border-top: 4px solid #bebebe !important; 
		line-height:19px;
	}
	
	td.othertitle_onecol {
		background-color: #f1f1f1; 
		padding: 5px 10px 5px 10px !important;  
		line-height:19px;
		font-weight:bold;
	}

	td.left_twocol {
		border-bottom:1px solid #eaeaea !important; 
		width:50%;
		vertical-align: top;
		padding:5px 0px 5px 0px;
		margin:5px 0px 5px 0px;
	}
	
	
	td.right_twocol {
		border-bottom:1px solid #eaeaea !important; 
		width:50%;
		vertical-align: top;
		padding:5px 0px 5px 0px;
		margin:5px 0px 5px 0px;
  }

  tr:last-child td.left_twocol,
  tr:last-child td.right_twocol { border-bottom: none !important; }
  
  
	table.evidence_item {
		margin-left:10px;
	}
	
	td.evidence_header {
		border-bottom:1px solid #ccc !important; 
		padding:20px 0px 2px 0px; 
		font-weight: bold; 
	}
	
	td.evidence_item {
		border-bottom:1px solid #eaeaea !important; 
		padding:5px 0px 5px 0px; 
	}
	
	td.evidence_context {
		padding-top:10px;
	}
	
	td.rtbcontacttitle_onecol {
		color: #fff; 
		padding:7px 7px 5px 10px !important; 
		height: 35px;
		font-weight: bold; 
		font-size: 18px; 
		background-color: #808080; 
	}
	
	td.rtbcontact_instructions {
		background-color: #f1f1f1; 
		padding:10px;
		margin:0px;
		border-bottom:1px solid #ccc; 
	}
	
	td.rtbleft_twocol {
		border-bottom:1px solid #fff; 
		background-color: #f1f1f1; 
		width:20%;
		vertical-align: top;
		padding:5px 0px 5px 10px;
	}
	
	
	td.rtbright_twocol {
		border-bottom:1px solid #fff; 
		background-color: #f1f1f1; 
		width:80%;
		vertical-align: top;
		padding:5px 0px 5px 5px;
	}
	
	span.non_bold {
		font-weight: normal !important;
	}

</style>
</head>

<body>
<div id="pdf-container" class="pdf_container">

<table id="document-header" style="width:100%;">
	<tr><td>
  <!-- PDF Image -->
  <img width="90" border="0" class="" style="width:100%; max-width:120px; position:relative; left:-10px; border-style: none;" src="data:image/jpeg;base64,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" >
	<!-- end PDF Image -->
	</td>
	<td>
		<p class="organization_title">Residential Tenancy Branch</p>
		<p class="document_title"><%= noticeTitleDisplay %></p>
	</td></tr>
	</table>
	
	<div class="spacer_sml">&nbsp;</div>
	
	<table id="document-details" style="width:100%;">
	<tr><td>
		<p class="listitem"><%= Formatter.toDateDisplay(new Date()) %></p>
		<p class="listitem"><b>File Number:</b>&nbsp;<%= dispute.get('file_number') %></p>
    <p class="listitem"><b>Act:</b>&nbsp;<%= dispute.isMHPTA() ? 'MHPTA (Manufactured Home Park Tenancy Act)' : 'RTA (Residential Tenancy Act)' %></p>
    <% if (hearing && (hearing.isCrossApp() || hearing.isCrossRepeatApp() || hearing.isRepeatedApp()) && _.escape.isArray(otherLinkedFileNumbers) && otherLinkedFileNumbers.length) { %>
      <p class="listitem"><b>Associated application(s):</b>&nbsp;<%= otherLinkedFileNumbers.join(', ') %></p>
    <% } %>
	</td></tr>
	</table>
	
	<div class="spacer_med">&nbsp;</div>
	
	<table id="important-information" style="width:100%;">
	<tr><td class="main_header">
		Important Information 
	</td></tr>
	<tr><td>
    <% if (isParticipatoryHearing) { %>
      <p class="text_content">The Residential Tenancy Branch has received an Application for Dispute Resolution and a hearing has been scheduled.</p>
    <% } else { %>
      <p class="text_content">The Residential Tenancy Branch has received an application for a<%= isLandlord ? 'n Order of Possession / ' : ' ' %>Monetary Order from your <%= isLandlord ? 'landlord' : 'tenant' %>.</p>
      
      <% if (isLandlord) { %>
        <p class="text_content">When a tenant receives a 10 Day Notice to End Tenancy for Unpaid Rent or Utilities, they have five days to either pay the rent in full or dispute the notice. If the tenant does neither of these within the five day period, landlords have the option to get an Order of Possession through a Direct Request.</p>
      <% } else if (isTenant) { %>
        <p class="text_content">When a landlord receives a forwarding address and the tenancy has ended, they have 15 days to either return the deposit(s) or apply to the Residential Tenancy Branch to retain part or all of the deposit(s). If the landlord does neither of these within the 15 day period, tenants have the option to apply for a monetary order through a Direct Request for the return of their deposit(s).</p>
      <% } %>

      <p class="text_content">In this type of proceeding, an adjudicator or arbitrator considers a <%= isLandlord ? 'landlord' : 'tenant' %>'s application based only on the <%= isLandlord ? 'landlord' : 'tenant' %>'s written evidence - verbal testimony from any party is not included. An adjudicator or arbitrator may grant a<%=isLandlord ? 'n Order of Possession along with a ' : ' ' %>monetary order for <%= isLandlord ? 'any unpaid rent or utilities ' : 'the return of the deposit(s) ' %>and the application filing fees. The decision and order(s) (if applicable) are sent to the <%= isLandlord ? 'landlord' : 'tenant' %>. Only the decision is mailed to the <%= isLandlord ? 'tenant' : 'landlord' %>.</p>

      <% if (isLandlord) { %>
        <p class="text_content">The direct request procedure is specific to unpaid rent and/or utilities and the recovery of the application filing fee only.</p> 
      <% } %>
    <% } %>
	</td></tr>
	</table>
	
	<div class="spacer_med">&nbsp;</div>
	
	<table id="filed-by" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		<span>An Application for Dispute Resolution Has Been Filed By</span><span class="non_bold">&nbsp;(Applicants)</span>
	</td></tr>
	<tr><td>
    <% applicants.filter(function(a) { return !a.isAssistant(); }).forEach(function(applicant) { %>
      <p class="listitem"><%= isLandlord ? 'Landlord' : 'Tenant' %> <%= applicant.getTypeDisplay() ? '('+applicant.getTypeDisplay()+')' : '' %>:
      &nbsp;<b><%= applicant.getDisplayName() %></b></p>
    <% }); %>
    <% var applicantAgents = applicants.filter(function(a) { return a.isAssistant(); }); %>
    <% if (applicantAgents.length) { %>
      <p class="pregap_listitem"><b>With the following agent(s) or advocate(s)</b></p>
    <% } %>
    <% applicantAgents.forEach(function(applicant) { %>
      <p class="listitem"><%= isLandlord ? 'Landlord' : 'Tenant' %> <%= applicant.getTypeDisplay() ? applicant.getTypeDisplay() : '' %>:
      &nbsp;<b><%= applicant.getDisplayName() %></b></p>
    <% }); %>
	</td></tr>
	</table>
	
	<div class="spacer_sml">&nbsp;</div>
	
	<table id="filed-against" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		<span>The Claim(s) are Against</span><span class="non_bold">&nbsp;(Respondents)</span>
	</td></tr>
	<tr><td>
    <% respondents.filter(function(r) { return !r.isAssistant(); }).forEach(function(respondent) { %>
      <p class="listitem"><%= isLandlord ? 'Tenant' : 'Landlord' %> <%= respondent.getTypeDisplay() ? '('+respondent.getTypeDisplay()+')' : '' %>:
      &nbsp;<b><%= respondent.getDisplayName() %></b></p>
    <% }); %>
    <% var respondentAgents = respondents.filter(function(r) { return r.isAssistant(); }); %>
    <% if (respondentAgents.length) { %>
      <p class="pregap_listitem"><b>With the following agent(s) or advocate(s)</b></p>
    <% } %>
    <% respondentAgents.forEach(function(respondent) { %>
      <p class="listitem"><%= isLandlord ? 'Tenant' : 'Landlord' %> <%= respondent.getTypeDisplay() ? respondent.getTypeDisplay() : '' %>:
      &nbsp;<b><%= respondent.getDisplayName() %></b></p>
    <% }); %>
	</td></tr>
	</table>
	
	<div class="spacer_sml">&nbsp;</div>

	<table id="dispute-address" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		Dispute Address
	</td></tr>
	<tr><td>
		<p class="listitem"><%= tenancyUnitDisplay ? '<span>'+tenancyUnitDisplay+'</span>&nbsp;' : '' %><b><%= tenancyAddressDisplay %></b></p>
		<p class="listitem"><%= tenancyCityDisplay %>, British Columbia, <%= tenancyPostalDisplay %></p>
	</td></tr>
  </table>
  
  <% if (hearing && isParticipatoryHearing) { %>
  <div class="spacer_sml">&nbsp;</div>
	<table id="hearing-information" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
    Hearing Information
	</td></tr>
	<tr><td>
    <p class="listitem">Date:&nbsp;<b><%= Formatter.toWeekdayDateDisplay(hearing.get('local_start_datetime'), RTB_OFFICE_TIMEZONE_STRING) %></b></p>
    <p class="listitem">Time:&nbsp;<b><%= Formatter.toTimeDisplay(hearing.get('local_start_datetime'), RTB_OFFICE_TIMEZONE_STRING) %>&nbsp;Pacific Time</b></p>
    <% if (hearing.isConference()) { %>
      <% if (hearing.get('hearing_details')) { %>
        <p class="listitem">
          <div class="listitem-hearingdetails">
            <%= hearing.get('hearing_details') %>
          </div>
        </p>
      <% } else if (hearing.get('conference_bridge_id') && conferenceBridgeData.dial_in_description1 && conferenceBridgeData.dial_in_number1 && conferenceBridgeData.dial_in_description2 && conferenceBridgeData.dial_in_number2 && conferenceBridgeData.participant_code) { %>
        <p class="listitem"><%= conferenceBridgeData.dial_in_description1 %>:&nbsp;<span><%= Formatter.toPhoneDisplay(conferenceBridgeData.dial_in_number1) %></span></p>
        <p class="listitem"><%= conferenceBridgeData.dial_in_description2 %>:&nbsp;<span><%= Formatter.toPhoneDisplay(conferenceBridgeData.dial_in_number2) %></span></p>
        <p class="listitem">Participant Access Code:&nbsp;<span><%= conferenceBridgeData.participant_code %></span></p>
      <% } %>
    <% } else if (hearing.get('hearing_location')) { %>
      <p class="listitem"><%= hearing.get('hearing_location') %></p>
    <% } %>
    </td></tr>
  </table>
  <% } %>
	
	<!-- Special Instructions - OPTIONAL -->
	<div class="spacer_sml">&nbsp;</div>
	
	<table id="special-instructions-container" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		Special Instructions
	</td></tr>
	<tr><td>
		<p id="special-instructions-html" class="listitem"></p>
	</td></tr>
	</table>
	<!-- END Special Instructions - OPTIONAL -->
  
  <% if (isParticipatoryHearing) { %>
  <!-- Participatory Instructions -->
	<div class="spacer_sml">&nbsp;</div>
	<table id="Participatoryservice-instructions" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
      General Information
	</td></tr>
	<tr><td>
		<p class="text_content">The applicant is required to give the Residential Tenancy Branch proof that this notice and copies of all supporting documents were served to the respondent.</p>
		<div class="list_wrapper">
		<ul class="bullet_list">
      <li>It is important to have evidence to support your position with regards to the claim(s) listed on this application. For more information see the Residential Tenancy Branch website on submitting evidence at&nbsp;<a href="http://www.gov.bc.ca/landlordtenant/submit">www.gov.bc.ca/landlordtenant/submit</a>.</li>
      <li>Residential Tenancy Branch Rules of Procedure apply to the dispute resolution proceeding. View the Rules of Procedure at&nbsp;<a href="http://www.gov.bc.ca/landlordtenant/rules">www.gov.bc.ca/landlordtenant/rules</a>.</li>
      <li>Parties (or agents) must participate in the hearing at the date and time assigned.</li>
      <li>The hearing will continue even if one participant or a representative does not attend.</li>
      <li>A final and binding decision will be sent to each party no later than 30 days after the hearing has concluded.</li>
      <li>In most cases, an applicant can withdraw this dispute any time before the scheduled proceeding by notifying the other party and logging back in to your application at&nbsp;<a href="<%= INTAKE_LOGIN_URL %>"><%= INTAKE_LOGIN_URL %></a>&nbsp;with your BCeID and selecting the withdraw button.  If you withdraw this dispute, you must notify the other party in writing and no proceeding will take place.  Your filing fee will not be refunded.  You can also withdraw your application by contacting the Residential Tenancy Branch by phone at 1-800-665-8779</li>
		</ul>
		</div>
	</td></tr>
	</table>
  <% } else if (!isParticipatoryHearing) { %>
  <!-- DR Instructions -->
	<div class="spacer_sml">&nbsp;</div>
  
	<table id="DRservice-instructions" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		Documents to be Served to the Respondent(s)
	</td></tr>
	<tr><td>
		<p class="text_content">The applicant is required to give the Residential Tenancy Branch proof that this notice and copies of all supporting documents were served to the respondent.</p>
		<div class="list_wrapper">
		<ul class="bullet_list">
      <% if (isLandlord) { %>
        <li>A copy of all pages of the 10 Day Notice to End Tenancy for Unpaid Rent or Utilities (form RTB-30)</li>
        <li>A copy of the Proof of Service - Notice to End Tenancy and Written Demand for Utility Payment (form RTB-34)</li>
        <li>A copy of the Direct Request Worksheet (form RTB-46)</li>
        <li>A copy of the tenancy agreement (including the addendum if there is one)</li>
        <li>When payment for utilities is required, a copy of the written demand informing the tenant of the amount and due date, a copy of related utility bills, and proof of service of the written demand for utilities using Proof of Service - Notice to End Tenancy and Written Demand to Pay Utilities (form RTB-34)</li>
        <li>A copy of all Notices of Rent Increase since the tenancy began, if rent has increased</li>
        <li>If any rent was received after the 10 Day Notice to End Tenancy was issued, a copy of any receipts issued to the tenant</li>
      <% } else { %>
        <li>A copy of the signed tenancy agreement showing the initial amount of rent, the amount of security deposit required, and if applicable, the amount of pet damage deposit required;</li>
        <li>If a pet damage deposit was accepted after the tenancy began, a receipt for the deposit;</li>
        <li>A copy of the forwarding address given to the landlord (form RTB-47 is recommended, but not required) or a copy of the condition inspection report with the forwarding address provided;</li>
        <li>A completed Proof of Service of Forwarding Address (form RTB-41);</li>
        <li>A Tenant's Direct Request Worksheet (form RTB-40); and</li>
        <li>The date the tenancy ended.</li>
      <% } %>
		</ul>
		</div>
	</td></tr>
	</table>
  <!-- END DR Instructions - OPTIONAL -->
  <% } %>
	
	<div class="spacer_lrg">&nbsp;</div>
	
	<table id="application-header" style="width:100%;">
	<tr><td class="main_header">
		Application for Dispute Resolution
	</td></tr>
	<tr><td class="sub_header">
		Date Application Submitted to the Residential Tenancy Branch:&nbsp;<%= Formatter.toDateDisplay(dispute.get('submitted_date')) %>
	</td></tr>
	</table>
  
  <% if (primaryApplicant) { %>
	<div class="spacer_min">&nbsp;</div>
	<table id="primary-applicant" style="width:100%;">
	<tr><td colspan="2" class="sectiontitle_onecol">
		Applicant contact
	</td></tr>
	<tr><td colspan="2">
		<p class="text_content">The following person is designated as the applicant's primary contact. Respondents can contact this person to attempt to resolve this issue outside of the Residential Tenancy Branch dispute resolution process.</p>
	</td></tr>
	<tr>
		<td class="left_twocol">
			<p class="listitem">Applicant Contact:&nbsp;<b><%= primaryApplicant.getContactName() %></b></p>
		</td>
		<td class="right_twocol">
      <% if (Formatter.toPhoneDisplay(primaryApplicant.get('primary_phone'), primaryApplicant.get('primary_phone_ext'))) { %>
        <p class="listitem">Phone:&nbsp;<%= Formatter.toPhoneDisplay(primaryApplicant.get('primary_phone'), primaryApplicant.get('primary_phone_ext')) || '-' %></p>
      <% } %>
      
      <% if (primaryApplicant.get('address')) { %>
        <% if (primaryApplicant.get('mail_address') && isParticipatoryHearing) { %>
          <p class="listitem">Address:&nbsp;<%= primaryApplicant.getAddressStringWithUnit() %></p>
        <% } %>
        <p class="pregap_listitem"><b><%= isParticipatoryHearing ? 'Address for Service of Documents' : 'Address' %>:</b></p>
        <% if (primaryApplicant.get('mail_address') && isParticipatoryHearing) { %>
          <p class="listitem"><%= primaryApplicant.getMailingAddressString() %></p>
        <% } else { %>
          <p class="listitem"><%= primaryApplicant.getAddressStringWithUnit() %></p>
        <% } %>
      <% } %>
		</td>
	</tr>
  </table>
  <% } %>

  <div class="spacer_med">&nbsp;</div>
	<table id="applicant-information" style="width:100%;">
	<tr><td colspan="2" class="sectiontitle_onecol">
		Applicant Information
	</td></tr>
	<tr><td colspan="2">
		<p class="text_content">
      <% if (isParticipatoryHearing) { %>
        Respondents must provide all applicants with copies of any evidence submitted to the Residential tenancy branch.
      <% } else { %>
        The Direct Request process is based solely on written submissions from the applicant(s).  Respondent(s)&nbsp;<u>do not</u>&nbsp;serve documents or evidence to the applicant(s) or to the Residential Tenancy Branch.
      <% } %>
    </p>
	</td></tr>
	<% applicants.filter(function(a) { return !a.isAssistant(); }).forEach(function(applicant) { %>
    <tr>
      <td class="left_twocol">
        <p class="listitem"><%= isLandlord ? 'Landlord' : 'Tenant' %> <%= applicant.getTypeDisplay() ? '('+applicant.getTypeDisplay()+')' : '' %>:&nbsp;<b><%= applicant.getContactName() %></b></p>
      </td>
      <td class="right_twocol">
        <% if (Formatter.toPhoneDisplay(applicant.get('primary_phone'), applicant.get('primary_phone_ext'))) { %>
          <p class="listitem">Phone:&nbsp;<%= Formatter.toPhoneDisplay(applicant.get('primary_phone'), applicant.get('primary_phone_ext')) || '-' %></p>
        <% } %>
        
        <% if (applicant.get('address')) { %>
          <% if (applicant.get('mail_address') && isParticipatoryHearing) { %>
            <p class="listitem">Address:&nbsp;<%= applicant.getAddressStringWithUnit() %></p>
          <% } %>
          <p class="pregap_listitem"><b><%= isParticipatoryHearing ? 'Address for Service of Documents' : 'Address' %>:</b></p>
          <% if (applicant.get('mail_address') && isParticipatoryHearing) { %>
            <p class="listitem"><%= applicant.getMailingAddressString() %></p>
          <% } else { %>
            <p class="listitem"><%= applicant.getAddressStringWithUnit() %></p>
          <% } %>
        <% } %>
      </td>
    </tr>
  <% }); %>
  </table>
  
	<div class="spacer_sml">&nbsp;</div>
	
	<table id="respondent-information" style="width:100%;">
	<tr><td colspan="2" class="sectiontitle_onecol">
		Respondent Information
	</td></tr>
	<tr><td colspan="2">
    <% if (isParticipatoryHearing) { %>
      <p class="text_content">Each respondent has been assigned a unique Dispute Access Code for submitting evidence to the Residential Tenancy Branch. Evidence must be served to the Residential Tenancy Branch and to each applicant as soon as possible. Instructions for evidence processing are included in this package. Deadlines are critical. Intentional delay may affect the outcome of the hearing. Late evidence may or may not be considered by the arbitrator. To learn about serving evidence, visit the Residential Tenancy Branch website on submitting evidence at&nbsp;<a href="http://www.gov.bc.ca/landlordtenant/submit">www.gov.bc.ca/landlordtenant/submit</a></p>
    <% } %>
  </td></tr>
  <% respondents.forEach(function(respondent) { %>
	<tr>
		<td class="left_twocol">
      <p class="listitem"><%= isLandlord ? 'Tenant' : 'Landlord' %> <%= respondent.getTypeDisplay() ? '('+respondent.getTypeDisplay()+')' : '' %>:&nbsp;<b><%= respondent.getDisplayName() %></b></p>
      <% if (isParticipatoryHearing) { %>
        <p class="listitem respondent-access-code">Dispute Access Code:&nbsp;<b><%= respondent.get('access_code') %></b></p>
      <% } %>
		</td>
		<td class="right_twocol">
      <% if (Formatter.toPhoneDisplay(respondent.get('primary_phone'), respondent.get('primary_phone_ext'))) { %>
        <p class="listitem">Phone:&nbsp;<%= Formatter.toPhoneDisplay(respondent.get('primary_phone'), respondent.get('primary_phone_ext')) || '-'%></p>
      <% } %>

      <% if (respondent.get('address')) { %>
        <% if (respondent.get('mail_address') && isParticipatoryHearing) { %>
          <p class="listitem">Address:&nbsp;<%= respondent.getAddressStringWithUnit() %></p>
        <% } %>
        <p class="pregap_listitem"><b><%= isParticipatoryHearing ? 'Address for Service of Documents' : 'Address' %>:</b></p>
        <% if (respondent.get('mail_address') && isParticipatoryHearing) { %>
          <p class="listitem"><%= respondent.getMailingAddressString() %></p>
        <% } else { %>
          <p class="listitem"><%= respondent.getAddressStringWithUnit() %></p>
        <% } %>
      <% } %>
		</td>
  </tr>
  <% }) %>
  </table>
	
	<div class="spacer_med">&nbsp;</div>
	
	<table id="dispute-information" style="width:100%;">
	<tr><td class="sectiontitle_onecol">
		Dispute Information
	</td></tr>
	<tr><td>
		<p class="listitem">The following information has been provided to the Residential Tenancy Branch and describes the claims made against the respondent(s)</p>
	</td></tr>
	</table>
	
	<div class="spacer_sml">&nbsp;</div>
  <div class="disputeclaims">
    <% let claim_index = 0; %>
    <% disputeClaims.each(function(disputeClaim) { %>
      <% if (disputeClaim.isFeeRecovery()) { return; } %>
      <% claim_index++; %>

      <table class="issue_item" style="width:100%;">
      <tr><td class="issuetitle_onecol">
        <span class="issuetitle_num"><%= Formatter.toLeftPad(claim_index) %> -&nbsp;</span><%= disputeClaim.getClaimTitle() %>
      </td></tr>
      <tr><td class="evidence_context">
        <% if (disputeClaim.getAmount()) { %>
          <p class="issue_listitem"><%= Formatter.toAmountDisplay(disputeClaim.getAmount()) %></p>
        <% } %>
        <% if (disputeClaim.getNoticeDeliveryDate()) { %>
          <p class="issue_listitem"><b>Notice delivery date:</b>&nbsp;<%= Formatter.toDateDisplay(disputeClaim.getNoticeDeliveryDate()) %></p>
        <% } %>
        <% if (disputeClaim.getNoticeDeliveryMethod()) { %>
          <p class="issue_listitem"><b>Notice delivery method:</b>&nbsp;<%= Formatter.toNoticeMethodDisplay(disputeClaim.getNoticeDeliveryMethod()) %></p>
        <% } %>
      </td></tr>
      <tr><td>
        <p class="issue_listtitle"><b>Applicant's dispute description</b></p>
        <p class="issue_listitem"><%= disputeClaim.getDescription() %></p>
      </td></tr>
      <tr class="evidence-title">
        <td class="evidence_header">
          Supporting Evidence 
        </td>
      </tr>
      <% var applicantEvidences = disputeClaim.getApplicantUploadedEvidence(); %>
      <% if (applicantEvidences.length > 0) { %>      
        <% _.escape.each(applicantEvidences, function(evidence) { %>
          <% var uploadedIntakeFiles = evidence.get('files') && evidence.get('files').getUploadedIntake(); %>
          <tr class="evidence-item">
            <td>
              <p class="listitem"><b><%= evidence.getTitle() %></b></p>
              <p class="evidence_text_content"><u>Description</u>:&nbsp;<%= evidence.getDescription() ? evidence.getDescription() : 'No description provided at time of application' %>
                <% if (uploadedIntakeFiles.length) { %>
                  &nbsp;(<%= uploadedIntakeFiles.length %> file<%= uploadedIntakeFiles.length === 1?'':'s'%>)
                <% } %>
              </p>
            </td>
          </tr>
        <% }); %>
      <% } else { %>
        <tr class="evidence-item">
          <td class="evidence_context">
            <p class="evidence_text_content">No evidence submitted at time of application</p>
          </td>
        </tr>
      <% } %>
      </table>
      
      <div class="spacer_med">&nbsp;</div>
    <% }); %>
  </div>
  
  <% var feeClaims = disputeClaims.filter(function(disputeClaim) { return disputeClaim.isFeeRecovery(); }); %>
  <% if (feeClaims.length) { %>
    <% var disputeClaim = feeClaims[0]; %>
    <% claim_index ++ %>
    <table class="issue_item" style="width:100%;">
      <tr><td class="issuetitle_onecol">
        <span class="issuetitle_num"><%= Formatter.toLeftPad(claim_index) %> -&nbsp;</span><%= disputeClaim.getClaimTitle() %>
      </td></tr>
      <tr><td class="evidence_context">
        <p class="issue_listitem_none">No additional information available</p>
      </td></tr>
    </table>
    <div class="spacer_med">&nbsp;</div>
  <% } %>

  <% if (hasSupportingTA || hasSupportingMOW || hasSupportingBulk) { %>
    <table id="other-supporting-information" class="issue_item" style="width:100%;">
    <tr><td class="othertitle_onecol">
      Other supporting information
    </td></tr>
      <% if (hasSupportingTA) { %>
        <tr class="evidence-item"><td class="evidence_context">
          <p class="listitem"><b><%= supportingTitleTA %></b></p>
          <p class="evidence_text_content"><u>Description</u>:&nbsp;<%= supportingDescriptionTA ? supportingDescriptionTA : 'No description provided at time of application' %>
            <% if (supportingFilesCountTA) { %>
              &nbsp;(<%= supportingFilesCountTA %> file<%= supportingFilesCountTA === 1?'':'s'%>)
            <% } %>
          </p>
        </td></tr>
      <% } %>
      <% if (hasSupportingMOW) { %>
        <tr class="evidence-item"><td class="evidence_context">
          <p class="listitem"><b><%= supportingTitleMOW %></b></p>
          <p class="evidence_text_content"><u>Description</u>:&nbsp;<%= supportingDescriptionMOW ? supportingDescriptionMOW : 'No description provided at time of application' %>
            <% if (supportingFilesCountMOW) { %>
              &nbsp;(<%= supportingFilesCountMOW %> file<%= supportingFilesCountMOW === 1?'':'s'%>)
            <% } %>
          </p>
        </td></tr>
      <% } %>
      <% if (hasSupportingBulk) { %>
        <tr class="evidence-item"><td class="evidence_context">
          <p class="listitem"><b><%= supportingTitleBulk %></b></p>
          <p class="evidence_text_content"><u>Description</u>:&nbsp;<%= supportingDescriptionBulk ? supportingDescriptionBulk : 'No description provided at time of application' %>
            <% if (supportingFilesCountBulk) { %>
              &nbsp;(<%= supportingFilesCountBulk %> file<%= supportingFilesCountBulk === 1?'':'s'%>)
            <% } %>
          </p>
        </td></tr>
      <% } %>
    </table>
  <% } %>

  <div class="spacer_lrg">&nbsp;</div>
	
	<table id="rtb-contact-information" style="width:100%; border-spacing: 0px; " cellpadding="0" cellspacing="0" border="0">
	<tr><td colspan="2" class="rtbcontacttitle_onecol">
		Residential Tenancy Branch Contact Information
	</td></tr>
	<tr><td colspan="2" class="rtbcontact_instructions" >
		<% if (isParticipatoryHearing) { %>
      If contacting the Residential Tenancy Branch with questions about this application by email please include your File Number and Dispute Access Code. If contacting the Residential Tenancy Branch or Service BC office in person, please have your File Number and Dispute Access Code available.
    <% } else { %>
      If contacting the Residential Tenancy Branch with questions about this application, please have the File Number and Dispute Access Code available.
    <% } %>
	</td></tr>
	<tr>
		<td class="rtbleft_twocol">
			<p class="listitem">Email:</p>
		</td>
		<td class="rtbright_twocol">
			<p class="listitem"><a href="mailto:HSTRO@gov.bc.ca">HSRTO@gov.bc.ca</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <p>
			<p class="listitem"><b>Note:</b>&nbsp;Evidence cannot be submitted by email</p>
		</td>
	</tr>
	<tr>
		<td class="rtbleft_twocol">
			<p class="listitem">Website:</p>
		</td>
		<td class="rtbright_twocol">
			<p class="listitem"><a href="http://www.gov.bc.ca/landlordtenant">www.gov.bc.ca/landlordtenant</a></p>
		</td>
	</tr>
	<tr>
		<td class="rtbleft_twocol">
			<p class="listitem">Information Line:</p>
		</td>
		<td class="rtbright_twocol">
			<p class="listitem">1-800-665-8779 (toll-free)</p>
			<p class="listitem"><b>Note:</b>&nbsp;Do not call this number for your hearing</p>
		</td>
	</tr>
	<tr>
		<td class="rtbleft_twocol">
			<p class="listitem">In Person:</p>
		</td>
		<td class="rtbright_twocol">
			<p class="listitem"><strong>Lower Mainland</strong></p>
			<p class="listitem">400 - 5021 Kingsway, Burnaby BC V5H 4A5</p>
		</td>
	</tr>
	<tr>
		<td class="rtbleft_twocol">
			<p class="listitem">Service BC:</p>
		</td>
		<td class="rtbright_twocol">
			<p class="listitem"><a href="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc">www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc</a></p>
		</td>
	</tr>

	</table>
	

	
</div>	<!-- end pdf_container -->
</body>
</html>
