<div class="">
  <div class="search-result-item-header">
    <div class="">
      F#:<span class="cms-archive-search-file-number-link general-link"><%= file_number %></span>&nbsp;
      R#:<span class="cms-archive-search-reference-number-link general-link"><%= reference_number %></span>&nbsp;
    </div>  
  </div>
  <div class="search-result-item-body">
    <div class=""><%= dispute_address ? dispute_address : '-' %></div>
    <div class="">Type: <%= dispute_type === 0 ? 'RTA' : 'MHPTA' %>, <%= applicant_type === 0 ? 'Landlord' : 'Tenant' %></div>
  </div>
</div>

<div class="">
  <div class="search-result-item-header">
    <div class="">Direct Request:&nbsp;<%= direct_request === 0 ? 'Yes' : 'No' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Issues: <%= dispute_codes ? dispute_codes : '-' %></div>
    <div class="">Payment: <%= filing_fee ? Formatter.toAmountDisplay(filing_fee) : '-' %></div>
  </div>
</div>


<div class="">
  <div class="search-result-item-header">
    <div class="">App LName: <%= first_applicant_last_name ? first_applicant_last_name : '-' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Agent LName: <%= first_agent_last_name ? first_agent_last_name : '-' %></div>
    <div class="">Resp LName: <%= first_respondent_last_name ? first_respondent_last_name : '-' %></div>
  </div>
</div>


<div class="">
  <div class="search-result-item-header">
    <div class="">Hearing: <%= hearing_date ? Formatter.toDateDisplay(hearing_date) : 'No' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Joiner: <%= joiner_type === 0 ? 'Parent' : 'Child' %></div>
    <div class="">Cross App: 
      <% if (cross_app_file_number) { %>
        <span class="cms-archive-search-cross-app-number general-link"><%= cross_app_file_number %></span>
      <% } else { %> 
        <span class="cms-archive-search-cross-app-number">-</span>
      <% } %>
    </div>
  </div>
</div>


<div class="">
  <div class="search-result-item-header">
    <div class="">Status:&nbsp;<%= dispute_status ? statusMap[dispute_status] : '-' %></div>
  </div>

  <div class="search-result-item-body">
    <div class="">ARB Code:&nbsp;<%= dro_code ? dro_code : '-' %></div>
    <div class="">DMS File: 
      <% if (dms_file_number) { %>
        <span class="cms-archive-dms-file-number general-link"><%= dms_file_number %></span>
      <% } else { %> 
        <span class="cms-archive-dms-file-number">-</span>
      <% } %>
    </div>
  </div>
</div>


<div class="">
  <div class="search-result-item-header">
    <div class="">Submitted: <%= submitted_date ? Formatter.toDateDisplay(submitted_date) : 'No' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Created: <%= created_date ? Formatter.toDateDisplay(created_date) : '-' %></div>
    <div class="">Modified: <%= last_modified_date ? Formatter.toDateDisplay(last_modified_date) : '-' %></div>
  </div>
</div>