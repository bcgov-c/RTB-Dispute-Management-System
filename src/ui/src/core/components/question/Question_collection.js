/**
 * @class core.components.question.QuestionCollection
 * @memberof core.components.question
 */
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import QuestionModel from './Question_model';

const apiChannel = Radio.channel('api');
export default Backbone.Collection.extend({
  model: QuestionModel,

  saveNew() {
    // Get the url of a new question
    let url;
    const save_data = [];
    
    this.each(function(model) {
      if (model.isNew()) {
        if (!url) {
          url = model.urlRoot();
        }
        save_data.push(model.pickWhitelistedAttrs(model.toJSON()));
      }
    });
    return save_data.length && url ? 
      apiChannel.request('call', {
        url,
        type: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        contentType: "application/json",
        data: JSON.stringify(save_data)
      }) :
      $.Deferred().resolve().promise();
  }
});
