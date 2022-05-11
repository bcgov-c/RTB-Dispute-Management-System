import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import TextareaView from '../../../core/components/textarea/Textarea';
import DisputeFeeViewMixin from './DisputeFeeViewMixin';
import template from './ModalAddDisputeFee_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const ModalAddDisputeFeeView = Marionette.View.extend({
  template,

  regions: {
    feeTypeRegion: '.addFee_fee-type',
    feeAmountRegion: '.addFee_fee-amount',
    feeDueDateRegion: '.addFee_due-date',
    feePayorRegion: '.addFee_payor',
    feeDescriptionRegion: '.addFee_description'
  },

  ui: {
    save: '#addFeeSave',
    cancel: '#addFeeCancel',
    close: '.close-x'
  },

  events: {
    'click @ui.close': 'clickClose',
    'click @ui.cancel': 'clickClose',
    'click @ui.save': 'clickSave',
  },

  clickSave() {
    if (this.validateAndShowErrors()) {
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges();
      this._saveModel();
    }
  },

  clickClose() {
    // Make sure to clean up model
    if (this.model.isNew() && this.model.collection) {
      this.model.collection.remove(this.model);
    }
    Radio.channel('modals').request('remove', this);
  },

  initialize() {
    this.mixin_createSubModels();
    this.setupListeners();
    this.feeTypeModel.trigger('change:value', this.feeTypeModel, this.feeTypeModel.get('value'));

    this.editRegions = ['feeTypeRegion', 'feeAmountRegion', 'feeDueDateRegion', 'feePayorRegion', 'feeDescriptionRegion'];
  },

  setupListeners() {
    this.listenTo(this.feeTypeModel, 'change:value', function(model, value) {
      value = value ? Number(value) : null;
      if (value === configChannel.request('get', 'PAYMENT_FEE_TYPE_INTAKE')) {
        this.amountInputModel.set({
          cssClass: (this.amountInputModel.get('cssClass') || '').replace('optional-input', ''),
          required: true,
          value: Formatter.toAmountDisplay(configChannel.request('get', 'PAYMENT_FEE_AMOUNT_INTAKE')).replace('$',''),
          disabled: true
        });
      } else if (value === configChannel.request('get', 'PAYMENT_FEE_TYPE_REVIEW')) {
        this.amountInputModel.set({
          cssClass: (this.amountInputModel.get('cssClass') || '').replace('optional-input', ''),
          required: true,
          value: Formatter.toAmountDisplay(configChannel.request('get', 'PAYMENT_FEE_AMOUNT_REVIEW')).replace('$',''),
          disabled: true
        });
      } else {
        this.amountInputModel.set({
          cssClass: `${this.amountInputModel.get('cssClass')} optional-input`,
          required: false,
          disabled: false
        });
      }

      const amountView = this.getChildView('feeAmountRegion');
      if (amountView) {
        amountView.render();
      }
    }, this);
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editRegions, function(component_name) {
      const component = this.getChildView(component_name);
      if (component && component.validateAndShowErrors) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  _applyPageModelChanges() {
    _.each(this.editRegions, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        this.model.set(component.model.getPageApiDataAttrs());
      }
    }, this);
  },

  _saveModel() {
    this.model.save(this.model.getApiChangesOnly())
      .done(() => this.trigger('save:complete'))
      .fail(
        generalErrorFactory.createHandler('FEE.CREATE', () => {
          this.model.resetModel();
          this.trigger('save:complete');
        })
      ).always(() => loaderChannel.trigger('page:load:complete'));
  },

  onRender() {
    this.showChildView('feeTypeRegion', new DropdownView({ model: this.feeTypeModel }));
    this.showChildView('feeAmountRegion', new InputView({ model: this.amountInputModel }));
    this.showChildView('feeDueDateRegion', new InputView({ model: this.dueDateModel }));
    this.showChildView('feePayorRegion', new DropdownView({ model: this.payorModel }));
    this.showChildView('feeDescriptionRegion', new TextareaView({ model: this.descriptionModel }));
  },

  attachElContent(html) {
    // Have to attach modals this way so that the 'modal' class in the template is top-level
    this.setElement(html);
    return this;
  }
});

_.extend(ModalAddDisputeFeeView.prototype, DisputeFeeViewMixin);

export default ModalAddDisputeFeeView;