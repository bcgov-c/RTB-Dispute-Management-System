import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import AddressView from '../../../../core/components/address/Address';
import DoubleSelectorView from '../../../../core/components/double-selector/DoubleSelector';
import PageItemView from '../../../../core/components/page/PageItem';
import RadioView from '../../../../core/components/radio/Radio';
import template from './Unit_template.tpl';

const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'intake-participant',

  regions: {
    addressRegion: '.participant-address',
    hasUnitTypeRegion: '.participant-use-mail',
    unitTypeRegion: '.participant-mailing-address',
  },

  ui: {
    useDisputeAddress: '.participant-use-dispute-address',
    delete: '.participant-delete-icon'
  },

  events: {
    'click @ui.useDisputeAddress': 'clickUseDisputeAddress',
    'click @ui.delete': 'clickDelete'
  },

  clickDelete() {
    this.model.trigger('delete:full', this.model);
  },
  
  clickUseDisputeAddress() {
    const dispute = disputeChannel.request('get');
    const disputePostalCode = dispute.get('tenancy_zip_postal');

    const addressModel = this.model.get('addressModel');
    const participantAddress = addressModel.getPageApiDataAttrs();
    const updateAddressFn = _.bind(function(modalView) {
      if (modalView) { modalView.close(); }
      addressModel.get('postalCodeModel').set('value', disputePostalCode);
      this.render();
    }, this);

    // Check if values in street, city or postal code to know if there was an existing values.
    // Also check just the streets are different so we don't warn just when updating same address
    if (participantAddress.postalCode && participantAddress.postalCode !== disputePostalCode) {
      modalChannel.request('show:standard', {
        title: 'Use Rental Address?',
        bodyHtml: `<p>Are you sure you want to replace the postal code you have entered with the Main Postal Code <b>${disputePostalCode}</b>?</p>`,
        primaryButtonText: 'Replace',
        onContinueFn: updateAddressFn
      });
    } else {
      updateAddressFn();
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['baseName']);

    this.baseName = this.baseName || 'Unit';

    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model.get('hasUnitTypeModel'), 'change:value', (model, value) => {
      const mailingAddressView = this.getChildView('unitTypeRegion');
      
      if (mailingAddressView && mailingAddressView.isRendered()) {
        mailingAddressView.triggerMethod( value ? 'show' : 'hide', { no_animate: true });
      }
    });
  },

  onRender() {
    this.showChildView('addressRegion', new AddressView({ model: this.model.get('addressModel') }));
    
    this.renderPageItem('hasUnitTypeRegion', new PageItemView({
      stepText: 'If the unit is part of a larger residential property with a shared address, does it have a unique unit identifier (i.e. basement, upper, lower, coach house, etc.)?',
      subView: new RadioView({ model: this.model.get('hasUnitTypeModel') }),
      helpHtml: 'This might mean a basement suite, room rental, upper home, lower home, coach house or laneway.'
    }), true);

    
    this.renderPageItem('unitTypeRegion', new PageItemView({
      stepText: 'Please provide a description of the unit (i.e., basement suite, upper home, lower home, etc.)',
      subView: new DoubleSelectorView({ model: this.model.get('rentDescriptionModel') })
    }), this.model.isSharedAddressSelected());


    // Do a dummy scroll in order to make sure floating headers are correct on re-renders
    this.$el.closest('.persist-area').scroll();
  },

  renderPageItem(regionId, pageItem, showItem=false) {
    this.showChildView(regionId, pageItem);
    if (showItem && pageItem) {
      pageItem.triggerMethod('show', { no_animate: true });
    }
  },


  showErrorMessage(participant_error) {
    console.info(`[Info] participant object error`, participant_error);
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      let childView = this.getChildView(region);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, region);
        return;
      }
      if (childView instanceof PageItemView) {
        childView = childView.subView;
      }

      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }

      if (!childView.$el) {
        console.log(`[Warning] No childView element rendered in DOM to valdiate`, childView);
        return;
      }
      if (!childView.$el.is(':visible')) {
        console.log(`[Info] Skipping validation on hidden childView`, childView);
        return;
      }

      is_valid = childView.validateAndShowErrors() && is_valid;
    }, this);

    return is_valid;
  },

  templateContext() {
    const collection = this.model.collection;
    const unitIndex = collection ? collection.indexOf(this.model) : -1;
    const dispute = disputeChannel.request('get');
    const display_index = unitIndex !== -1 ? unitIndex + 1 : '';

    return {
      disputePostalCode: dispute.get('tenancy_zip_postal'),
      hasUnitType: this.model.isSharedAddressSelected(),
      unitName: `${this.baseName} ${Formatter.toLeftPad(display_index, '0', 3)}`,
    };
  }
});
