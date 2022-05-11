
<div class="hearing-instructions-preset">
  <p>This hearing will be conducted by TELEPHONE CONFERENCE CALL.  Please use one of the following phone numbers and access code below to join the Telephone Conference Call.</p>
  <p>Do not call more than 5 minutes prior to start time</p>

  <ol>
    <li>
      <div>Phone a number below at the time of the conference start:</div>
      <% _.escape.each(conference_data_items, function(conference_data) { %>
        <% if (!conference_data || !conference_data.phone_number) { return; } %>
        <div class="">
          <span class="hearing-phone-number"><%= Formatter.toPhoneDisplay(conference_data.phone_number) %></span><span><%= conference_data.title %></span>
        </div>
      <% }) %>

    </li>
    <li>Enter the Access Code: <%= access_code %></li>
    <li>Say your FULL NAME and press #</li>
  </ol>

</div>
