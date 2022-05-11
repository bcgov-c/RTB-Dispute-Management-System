<div class="da-upload-page-wrapper <%= isUpload ? 'upload' : '' %>">

  <div class="dac__evidence__dispute-overview"></div>

  <div class="dac__page-header-container">
    <div class="dac__page-header">
      <span class="dac__page-header__icon dac__icons__menu__evidence"></span>
      <span class="dac__page-header__title"><%= !isUpload? 'Submit Evidence' : 'Uploading please wait' %></span>
    </div>
    <div class="dac__page-header__instructions">
      <% if (!isUpload) { %>
        <p>To add evidence to this dispute:</p>
        <ol>
          <li>Find the claim(s) you want to add evidence to. Click "Add files" or "Add something not listed above" </li>
          <li>Follow the instructions to upload your file(s)</li>
          <li>Once you have added all of your file(s), click "Submit" at the bottom of the page</li>
        </ol>
        <p>You are responsible for submitting evidence to prove your position even if it is not listed.</p>

        <%= summaryDisplay %>
      <% } else { %>
        File&nbsp;<b class="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b><%= dispute.get('file_number') %></b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
      <% } %>
    </div>
  </div>

  <div id="evidence-uploads"></div>
  <div id="other-uploads"></div>

  <div class="">
    <p class="error-block"></p>
  </div>

  <div class="spacer-block-30"></div>
  <div class="all-file-upload-ready-count <%= isUpload ? 'hidden' : ''%>">
    <b class="glyphicon glyphicon-download"></b>&nbsp;<span class="file-upload-counter">0</span>&nbsp;ready to submit
  </div>
  <div class="dac__page-buttons">
    <button class="btn btn-lg btn-cancel"><%= isUpload ? 'Cancel Remaining' : 'Cancel' %></button>
    <button class="btn btn-lg btn-standard <%= isUpload ? 'hidden' : ''%>">Submit</button> 
  </div>
  <div class="spacer-block-10"></div>

  <% if (staffLogin) { %>
    <div id="office-uploads"></div>
  <% } %>
  
</div>