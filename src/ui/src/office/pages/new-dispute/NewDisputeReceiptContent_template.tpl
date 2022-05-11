<h4 class="er-title visible-email" style="font-weight: bold; padding: 0px; margin: 25px 0px 10px 0px;">Receipt: <%= receiptTitle %></h4>

<p className="er-text" style="text-align: 'left';padding: '0px 0px 0px 0px'; margin: '0px 0px 10px 0px';">
  The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
</p>

<p class="er-subheader" style="border-bottom:1px solid #e3e3e3; margin:0px 0px 10px 0px; padding:5px 5px 2px 0px; color:#8d8d8d;">Dispute Information</p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px; margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">File number: </span>&nbsp; <b><%= dispute.get('file_number') %></b></p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Process: </span>&nbsp; <%= Formatter.toProcessDisplay(dispute.getProcess()) %></p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Applicant type: </span>&nbsp; <%= dispute.isLandlord() ? 'Landlord' : dispute.isTenant() ? 'Tenant' : '-' %></p>		
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Associated file number: </span>&nbsp; <%= dispute.get('cross_app_file_number') || '-' %></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Tenancy status: </span>&nbsp; <%= dispute.isPastTenancy() ? 'Past Tenancy' : 'Current Tenant' %></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Date received: </span>&nbsp; <%= dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : '-' %></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Act: </span>&nbsp; <%= dispute.isMHPTA() ? 'MHPTA' : 'RTA' %></p>	


<p class="er-subheader" style="border-bottom:1px solid #e3e3e3; margin:25px 0px 10px 0px; padding:5px 5px 2px 0px; color:#8d8d8d;">Dispute Address</p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <%= addressDisplay ? addressDisplay : '-' %></p>

<p class="er-subheader" style="border-bottom:1px solid #e3e3e3; margin:25px 0px 10px 0px; padding:5px 5px 2px 0px; color:#8d8d8d;">Primary Applicant</p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Access code: </span>&nbsp; <b><%= primaryApplicant.get('access_code') %></b></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Type: </span>&nbsp; <%= primaryApplicant.getTypeDisplay() %></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Phone number: </span>&nbsp; <%= primaryApplicant.get('primary_phone') %></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;"><%= isBusiness ? 'Business name' : 'Name' %>: </span>&nbsp; <%= primaryApplicant.getDisplayName() %></p>	
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Email address: </span>&nbsp; <%= primaryApplicant.get('email') ? primaryApplicant.get('email') : '-' %></p>	
<% if (isBusiness && !isPrivateMode) { %>
  <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Business contact name: </span>&nbsp; <%= primaryApplicant.getContactName() %></p>	
<% } %>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Hearing options by: </span>&nbsp; <%= Formatter.toHearingOptionsByDisplay(primaryApplicant.get('package_delivery_method')) %></p>	


<p class="er-subheader" style="border-bottom:1px solid #e3e3e3; margin:25px 0px 10px 0px; padding:5px 5px 2px 0px; color:#8d8d8d; ">Application Form(s)</p>
<p class="er-text" style="text-align: left;  padding: 0px 0px 0px 0px;margin: 0px 0px 10px 0px;"><b><%= formTitleDisplay %>:</b> <%= formDescriptionDisplay ? formDescriptionDisplay : '-' %></p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d; ">File(s) submitted: </span><%= formFilesDisplay ? formFilesDisplay : '-' %></p>


<p class="er-subheader" style="border-bottom:1px solid #e3e3e3; margin:25px 0px 10px 0px; padding:5px 5px 2px 0px; color:#8d8d8d; ">Supporting Evidence</p>
<p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d; ">File(s) submitted: </span><%= bulkFilesDisplay ? bulkFilesDisplay : '-' %></p>


<% if (isPartial) { %>
  <table cellpadding="0" cellspacing="0" width="100%" class="er-nesttable-wrapper" style="margin:0px; padding:0px; border-collapse: collapse;"><tbody>
    <tr><td class="er-nesttable-wrapper-td" style="padding:15px 0px 10px 0px">
    <table cellpadding="0" cellspacing="0" width="100%" class="er-alert-table" style="margin:0px; padding: 0px; border-collapse: collapse;"><tbody><tr>
      <td class="er-warning-image" style="width:55px; padding:5px; vertical-align: middle;">
        <img src="<%= COMMON_IMAGE_ROOT + 'Icon_FeedbackReminderRed.png' %>" class="er-warning-icon" style="width:39px; height:39px;"></td>
        <td class="er-warning-text" style="color: #de2f3c; padding:5px;">
          Important:  This application is not submitted - only a placeholder file has been created.  You must upload a copy of the application form and complete payment for this application to be considered filed.  Provide the file number above at an RTB or Service BC office to allow them to locate this this partial submission and complete the process.
        </td></tr></tbody></table>
    </td></tr>
  </tbody></table>
<% } else if (paymentTransaction) { %>

  <p class="er-subheader" style="border-bottom:1px solid #e3e3e3; margin:25px 0px 10px 0px; padding:5px 5px 2px 0px; color:#8d8d8d;">Payment</p>
  <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Payment method: </span>&nbsp; <%= paymentTransaction.isOffice() ? 'Office' + (officePaymentMethod?', '+officePaymentMethod:' payment') : paymentTransaction.isFeeWaiver() ? 'Fee Waiver' : paymentTransaction.isOnline() ? 'Online' : '-' %></p>	
  <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Payment date: </span>&nbsp; <%= Formatter.toDateDisplay(paymentTransaction.get('modified_date')) %></p>	
  <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Payment for: </span>&nbsp; New Application</p>	
  <% if (paymentBy) { %>
    <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Payment by: </span>&nbsp; <%= paymentBy %></p>	 
  <% } %>
  <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;">Payment amount: </span>&nbsp; <%= Formatter.toAmountDisplay(paymentTransaction.get('transaction_amount')) %></p>	

<% } %>
