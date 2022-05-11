<div class="ep-table-wrapper">
<table cellpadding="0" cellspacing="0" width="100%" class="ep-single-column-pairs" style="font-size:<%=RECEIPT_FONT_SIZE_PX%>px; margin:0px; padding:0px;">
  <tr>
    <td class="ep-single-column-left" style="width:30%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:<%=RECEIPT_FONT_SIZE_PX%>px;">File number:</span>
    </td>
    <td class="ep-single-column-right" style="width:70%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span style="font-size:<%=RECEIPT_FONT_SIZE_PX%>px;"><b><%= dispute.get('file_number') %></b></span>
    </td>
  </tr>
  <tr>
    <td class="ep-single-column-left" style="width:30%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:<%=RECEIPT_FONT_SIZE_PX%>px;">Added for:</span>
    </td>
    <td class="ep-single-column-right" style="width:70%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span style="font-size:<%=RECEIPT_FONT_SIZE_PX%>px;"><%= isApplicant ? 'Applicant' : 'Respondent' %> <%= isLandlord ? 'Landlord' : 'Tenant' %> - Initials <%= participantInitials %></span>
    </td>
  </tr>
  <tr>
    <td class="ep-single-column-left" style="width:30%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:<%=RECEIPT_FONT_SIZE_PX%>px;">Submitted by:</span>
    </td>
    <td class="ep-single-column-right" style="width:70%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span style="font-size:<%=RECEIPT_FONT_SIZE_PX%>px;"><%= submitterName %></span>
    </td>
  </tr>
  <tr>
    <td class="ep-single-column-left" style="width:30%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:<%=RECEIPT_FONT_SIZE_PX%>px;">Date of submission:</span>
    </td>
    <td class="ep-single-column-right" style="width:70%; padding-bottom:5px; font-size:<%=RECEIPT_FONT_SIZE_PX%>px">
      <span style="font-size:<%=RECEIPT_FONT_SIZE_PX%>px;"><%= Formatter.toDateDisplay(Moment()) %></span>
    </td>
  </tr>
</table>
</div>