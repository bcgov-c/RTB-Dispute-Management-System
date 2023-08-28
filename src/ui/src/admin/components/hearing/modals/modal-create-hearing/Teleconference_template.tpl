<div>
  <table style="width:100%;">
    <thead></thead>
    <tbody>
      <tr>
        <td class="hearing-details" width="250px" style="width:250px;vertical-align:top;">
          Teleconference Number:
        </td>
        <td>
          <% if (primary_conf_data && primary_conf_data.phone_number) { %>
            <b><%= primary_conf_data.phone_number %></b>
            <% if (secondary_conf_data && secondary_conf_data.phone_number) { %>
              or<br/><%= secondary_conf_data.phone_number %>
            <% } %>
          <% } else if (secondary_conf_data && secondary_conf_data.phone_number) { %>
            <%= secondary_conf_data.phone_number %>
          <% } %>
        </td>
      </tr>
      <tr>
        <td class="hearing-details" width="250px" style="width:250px;vertical-align:top;">
          Teleconference Access Code:
        </td>
        <td>
          <b><%= access_code %></b>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<br/>
<p>Please call into your hearing using the teleconference access code above.</p>
