<div class="office-top-search-logout da-access-logout">Logout</div>
<div class="office-top-search-container">
  <div class="clearfix">
    <div class="office-top-search-inputs">
      <div class="office-top-search-input-file-type"></div>
      <div class="office-top-search-input-file-identifier <%= isNewSearch ? 'hidden' : '' %>"></div>

      <div class="office-top-search-input-file-number <%= isFileNumberSearch ? '' : 'hidden' %>"></div>
      <div class="office-top-search-input-file-code <%= isAccessCodeSearch ? '' : 'hidden' %>"></div>
      <div class="office-top-search-input-file-code-type <%= isAccessCodeSearch ? '' : 'hidden' %>"></div>

      <div class="office-top-search-input-btn">
        <button class="btn btn-validate <%= isNewSearch ? 'hidden' : '' %>"><%= submitButtonText %></button>
      </div>
    </div>
  </div>
  <p class="error-block warning da-login-code-type-error <%= codeTypeErrorMsg ? '' : 'hidden-item' %>"><%= codeTypeErrorMsg %></p>
</div>