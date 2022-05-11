
<div class="row <%= singleDropdownMode ? 'component-double-selector-single' : '' %>">
  <div class="col-xs-12 <%= singleDropdownMode ? '' : 'col-sm-8' %> component-double-selector-input-container">
    <div class="first-dropdown-container"></div>
    <div class="second-dropdown-container <%= isOtherMode ? 'hidden-item' : '' %>"></div>
    <div class="other-input-container <%= isOtherMode ? '' : 'hidden-item' %>"></div>
    <p class="error-block"></p>
  </div>
  <% if (showValidate) { %>
    <div class="validateContainer col-xs-12 <%= singleDropdownMode ? '' : 'col-sm-4' %>">
        <button class="option-button selected btn-validate btn-disabled">Accept</button>
    </div>
  <% } %>
</div>