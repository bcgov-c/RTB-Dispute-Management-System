<table id="conclusion" style="width:100%;">
  <tr><td class="sectiontitle_onecol">
    Conclusion
  </td></tr>
  <tr><td>
  <p class="text_content">
    <% if (isMHPTA) { %>
      This decision is made on authority delegated to me by the Director of the Residential Tenancy Branch under Section 9.1(1) of the Manufactured Home Park Tenancy Act.
    <% } else { %>
      This decision is made on authority delegated to me by the Director of the Residential Tenancy Branch under Section 9.1(1) of the Residential Tenancy Act.
    <% } %>
    <div class="spacer_med">&nbsp;</div>
    <% if (signature) { %>
      <div class="decision_signature_card">
        <div class="decision_signature_wrapper">
          <img class="decision_signature" height="175" width="290" src="<%= signature %>"/>
        </div>
      </div>
    <% } else { %>
      <p> ----Signature---- </p>
    <% } %>
  </p>
  </td></tr>
</table>

<div class="spacer_sml">&nbsp;</div>