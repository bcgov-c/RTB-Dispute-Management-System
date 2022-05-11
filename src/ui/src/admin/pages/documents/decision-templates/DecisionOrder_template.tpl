<table id="order" style="width:100%;">
  <tr><td class="sectiontitle_onecol">
    Order
  </td></tr>
  <tr><td>
  <p class="text_content">

    <% if (isIssueMN) { %>
      <p><b>I AUTHORIZE AND ORDER</b>&nbsp;that the Landlord(s)/Tenant(s), --------------------, pay to the Landlord(s)/Tenant(s) -----------------, the sum of $--------.”</p>
      <div class="spacer_med">&nbsp;</div>
    <% } else if (isIssueOP) { %>
      <p><b>I AUTHORIZE AND ORDER YOU, Tenant(s),</b> ------------------, and all occupants or any guests or other persons occupying the above noted rental unit, to deliver full and peaceable vacant possession and occupation of the above noted rental unit to the Landlord(s), -----------------, not later than 1:00 p.m. on ------------ .
      <div class="spacer_med">&nbsp;</div>
    <% } %>
    
    <% if (isIssueMN) { %>
      <p><b>THIS ORDER</b>&nbsp;may be filed in the Provincial Court of British Columbia (Small Claims Division) and enforced as a judgment or an order of that court.</p>
      <div class="spacer_med">&nbsp;</div>
    <% } else if (isIssueOP) { %>
      <p><b>THIS ORDER</b>&nbsp;is issued pursuant to section 55 of the Act.</p>
      <div class="spacer_med">&nbsp;</div>
    <% } %>

    <% if (signature) { %>
      <div class="decision_signature_card">
        <div class="decision_signature_wrapper">
          <img class="decision_signature" height="175" width="290" src="<%= signature %>"/>
        </div>
      </div>
    <% } else { %>
      <p>----- Signature Block -----</p>
    <% } %>
  </p>
  </td></tr>
</table>

<div class="spacer_sml">&nbsp;</div>