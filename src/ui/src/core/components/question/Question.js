/**
 * @fileoverview - View used for rendering YES/NO button pairs.
 * @class core.components.question.QuestionView
 * @memberof core.components.question
 */

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './Question_template.tpl';

const animationChannel = Radio.channel('animations');

const QuestionOptionView = Marionette.View.extend({
  template: _.template(`
    <span data-name="<%= name %>" data-val="<%= value %>">
        <%= text %>
    </span>`),
  tagName: 'div',
  defaultClass: 'option-container',
  className() {
    const extraCssClasses = this.model.get('cssClass');

    return [
      this.defaultClass,
      extraCssClasses ? extraCssClasses : '',
      this.isSelected() ? 'selected' : ''
    ].join(' ');
  },

  isSelected() {
    return this.model.get('question_answer') === this.model.get('value');
  },

  triggers: {
    'click': 'question:option:click'
  }
});

const QuestionOptions = Marionette.CollectionView.extend({
  tagName: 'div',
  childView: QuestionOptionView,

  onChildviewQuestionOptionClick(questionView) {
    if (this.getOption('unselectDisabled')) {
      return false;
    }

    const current_ele = this.$el.find('.option-container.selected *').first();
    const questionOptionModel = questionView.options.model;
    let questionOptionValue = null;

    if (typeof current_ele[0] !== 'undefined' && current_ele[0].dataset instanceof DOMStringMap) {
      questionOptionValue = current_ele[0].dataset.val;
    }

    /**
     * @returns void
     */
    const triggerSelection = () => {
      this.clearSelections();

      const selected_ele = this.$el.find('.option-container *[data-name="' + questionOptionModel.get('name') + '"]');
      selected_ele.closest('.option-container').addClass('selected');

      this.trigger('selection', questionView);
    };

    const beforeClick = this.getOption('beforeClick');

    if (typeof beforeClick === 'function') {
      const beforeClickPromise = beforeClick(questionOptionValue, questionOptionModel.get('value'));

      beforeClickPromise
        .then((changeSelection) => {
          if (changeSelection) {
            triggerSelection();
          }
        })
        .catch(() => {
          console.log('[Notice] Selection cancelled');
        });
    } else {
      triggerSelection();
    }
  },

  clearSelections() {
    this.$el.find('.option-container').removeClass('selected');
  },
});

export default Marionette.View.extend({
  template,
  tagName: 'div',

  defaultClass() {
    return 'intake-yes-no-component';
  },

  className() {
    return `${this.defaultClass()} ${(this.getOption('extraCssClasses') ? this.getOption('extraCssClasses') : '')}
      ${(this.model.get('unselectDisabled') ? ' disabled ' : '')}`;
  },

  regions: {
    questionOptionsRegion: '.step-options-region'
  },

  ui: {
    'error': '.error-block'
  },

  initialize() {
    this.listenTo(this.model, 'change:question_answer', function() {
      this.resetErrorBlockUI();
      this.renderWarning();
      this.trigger('itemComplete');
    }, this);

    this.listenTo(this.model, 'page:itemComplete', (options) => {
      this.resetErrorBlockUI();
      this.renderWarning(options);
    })

    this.listenTo(this.model, 'render', this.render, this);
  },

  updateAnswer(questionView) {
    const questionOptionModel = questionView.options.model;
    this.model.set('question_answer', questionOptionModel.get('value'), {silent: false});
  },

  switchErrorToWarningUI(options) {
    options = options || {};
    const errorEle = this.getUI('error');
    errorEle.addClass('warning hidden-item');

    if (!options.no_animate) {
      animationChannel.request('queue', errorEle, 'slideDown', _.extend({duration: 400}, options));
      animationChannel.request('queue', errorEle, 'scrollPageTo', options);
    } else {
      errorEle.removeClass('hidden-item');
    }
  },

  resetErrorBlockUI() {
    if (this.isRendered()) this.getUI('error').removeClass('warning').html('');
  },

  renderWarning(options) {
    const validator_fn = this.model.get('warningValidator');
    if (typeof(validator_fn) === 'function' && this.model.isValid()) {
      const warning_response = validator_fn(this.model.getData());
      if (warning_response) {
        this.showWarningMessage(warning_response, options);
      }
    }
  },

  showWarningMessage(warning_msg, options) {
    this.showErrorMessage(warning_msg);
    this.switchErrorToWarningUI(options);
  },

  // Displays an error message
  showErrorMessage(error_msg) {
    this.resetErrorBlockUI();
    this.getUI('error').html(error_msg);
  },

  validateAndShowErrors() {
    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  appendCustomView(view) {
    const childView = this.getChildView('questionOptionsRegion');
    childView.addChildView(view, childView ? childView.children.length : 0);
  },

  _findChildModelByName(childView, name) {
    return childView.collection.findWhere({name: name});
  },

  removeOptionView(elementName) {
    const childView = this.getChildView('questionOptionsRegion');
    if (!childView) {
      return;
    }

    const modelCid = this._findChildModelByName(childView, elementName),
      viewCid = modelCid ? childView.children._indexByModel[modelCid.cid] : null;

    console.log(modelCid, viewCid);

    if (viewCid && _.has(childView.children._views, viewCid)) {
      childView.children._views[viewCid].destroy();
    }
  },

  onRender() {
    const answer = this.model.get('question_answer');
    const optionsView = new QuestionOptions({ beforeClick: this.model.get('beforeClick'), unselectDisabled: this.model.get('unselectDisabled'), collection: new Backbone.Collection(_.map(
      this.model.get('optionData'), function(option) { return _.extend({}, option, { question_answer: answer }); })) });

    this.listenTo(optionsView, 'selection', this.updateAnswer);
    this.showChildView('questionOptionsRegion', optionsView);
  }
});
