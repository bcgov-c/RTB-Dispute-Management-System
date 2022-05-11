<% _.escape.each(filter_models, function(filter_model, index) { %>
  <div class="general-filters-row general-filters-row--wrap">
    <div class="my-disputes-title"><%= status_channel.request('get:stage:display', filter_model.get('stage')) %>: </div>
    <div class="<%= filter_model_class_names[index] %> my-disputes-filter"></div>  
  </div>
<% }); %> 