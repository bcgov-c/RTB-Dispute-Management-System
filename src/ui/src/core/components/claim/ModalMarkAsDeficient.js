/**
 * @fileoverview - Modal that allows you to set a deficient reason on one or more Models
 */

import ModalBaseView from '../modals/ModalBase';
import Radio from 'backbone.radio';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import template from './ModalMarkAsDeficient_template.tpl';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

export default ModalBaseView.extend({
  template,

  id: 'markAsDeficient-modal',
  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      markDeficient: '.continue-button',
    });
  },

  regions: {
    reasonRegion: '.modal-mark-deficient-reason'
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.markDeficient': 'clickMarkDeficient'
    });
  },

  clickMarkDeficient() {
    let reason;
    if (!this.hideReason) {
      const view = this.getChildView('reasonRegion');
      if (!view.validateAndShowErrors()) {
        return;
      }

      const enteredReason = this.reasonModel.getData();
      reason = typeof this.getRemovalReasonFn === 'function' ? this.getRemovalReasonFn(enteredReason) : enteredReason;
    }
    
    if (typeof this.clickMarkDeficientFn === 'function') {
      return this.clickMarkDeficientFn(reason);
    }

    const models = this.collection?.length ? this.collection : [this.model];
    loaderChannel.trigger('page:load');
    Promise.all(models.map(model => {
      model.markAsDeficient(reason);
      return model.save( model.getApiChangesOnly() );
    })).then(() => {
      this.close();
      this.trigger('save:complete');
    })
  },


  /**
   * @param {Collection} [collection] - Can pass in collection if more than one model should be set to deficient
   * @param {Model} [model] - Pass in model if only one model should be set to deficient
   * @param {Boolean} [hideReason] - Param to hide reason textarea
   * @param {Function} [clickMarkDeficientFn] - Override argument which will be run instead of current.  Will use default scope
   * @param {String} [title] - Modal title
   * @param {String} [topHtml] - Top paragraph of modal
   * @param {String} [bottomHtml] - Bottom paragraph of modal
   * @param {Function} [getRemovalReasonFn] - Function to return a string which will be saved as the removal reason
   */
  initialize(options) {
    this.mergeOptions(options, ['title', 'topHtml', 'bottomHtml', 'hideReason', 'getRemovalReasonFn', 'clickMarkDeficientFn']);

    const extraRemovalLength = $.trim(typeof this.getRemovalReasonFn === 'function' ? this.getRemovalReasonFn('') : '').length;
    const actualMaxLength = configChannel.request('get', 'DEFICIENT_REASON_MAX_LENGTH') - extraRemovalLength;
    this.reasonModel = new TextareaModel({
      labelText: 'Removal Reason',
      errorMessage: `Please enter the reason`,
      required: true,
      min: configChannel.request('get', 'DEFICIENT_REASON_MIN_LENGTH'),
      max: actualMaxLength > 0 ? actualMaxLength : null,
      countdown: false,
      displayRows: 2
    });
  },
  
  onRender() {
    if (!this.hideReason) {
      this.showChildView('reasonRegion', new TextareaView({ model: this.reasonModel }));
    }
  },

  templateContext() {
    return {
      title: this.title || 'Remove and Mark Deficient',
      topHtml: this.topHtml,
      bottomHtml: this.bottomHtml
    };
  }

});
