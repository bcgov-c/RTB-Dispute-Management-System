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

    loaderChannel.trigger('page:load');
    this.model.markAsDeficient(reason);
    this.model.save( this.model.getApiChangesOnly() ).done(() => {
      this.close();
      this.trigger('save:complete');
    });
  },


  /**
   * @param {Boolean} [hideReason] - optional param to hide reason textarea
   * @param {Function} [clickMarkDeficientFn] - optional argument which will be run instead of current.  Will use default scope
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
