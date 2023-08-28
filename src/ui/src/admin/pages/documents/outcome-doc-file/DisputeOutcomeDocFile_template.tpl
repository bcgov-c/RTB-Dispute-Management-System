<div class="outcome-doc-file-title">
  <% if (showDelete) { %>
    <div class="outcome-doc-file-delete-btn clickable"></div>
  <% } %>
  <span><%= titleDisplay %></span>
</div>
<div class="outcome-doc-file-uploads-container">
  <div class="outcome-doc-file-uploads"></div>
  <% if (showUploadDelete) { %>
    <div class="outcome-doc-file-uploads-delete-btn clickable"></div>
  <% } %>
</div>
<div class="outcome-doc-file-status"></div>

<div class="outcome-doc-file-comment"></div>
<div class="outcome-doc-file-visible" <%= hasUploadedFile ? '' : 'style="visibility:hidden;"' %> ></div>

<div class="outcome-doc-file-source"></div>
<div class="outcome-doc-file-source-btn-container">
  <button class="btn btn-lg btn-standard outcome-doc-file-source-btn <%= showSourceButton ? '' : 'hidden' %>">
    <%= sourceButtonText %>
  </button>
</div>  
