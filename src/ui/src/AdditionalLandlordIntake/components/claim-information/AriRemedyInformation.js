import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import TextareaView from '../../../core/components/textarea/Textarea';
import template from './AriRemedyInformation_template.tpl';

const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className() { return `step intake-remedy ${this.model.get('cssClass')}`; },

  ui: {
    delete: '.evidence-claim-delete',
  },

  regions: {
    amountRegion: '.amount',
    completedDateRegion: '.notice-due-date',
    descriptionRegion: '.text-description',
  },

  events: {
    'click @ui.delete': 'clickDelete',
  },

  clickDelete() {
    
    const deleteFn = () => {
      loaderChannel.trigger('page:load');
      this.model.get('remedyModel').destroy()
      .always(() => {
        const collection = this.model.collection;
        if (collection) {
          collection.remove(this.model);
          collection.trigger('delete:complete', this);
        }
        loaderChannel.trigger('page:load:complete');
      });
    };
    
    //Remove this modal and just delete without confirmation if no associated data has been entered (expense not associated to improved units or rent increases)
    if (this.model.hasAssociatedUnitData()) {
      this.showDeleteConfirmation(deleteFn.bind(this));
    } else {
      deleteFn();
    }
  },

  showDeleteConfirmation(deleteFn) {
    const isValidAmount = !!this.model.getAmount();
    modalChannel.request('show:standard', {
      title: `Delete Capital Expense?`,
      bodyHtml: (isValidAmount ? `<p><b>Remove ${Formatter.toAmountDisplay(this.model.getAmount())} capital expense?</b></p>` : '')+
      `<p>This will permanently delete this capital expense and any associations to improved units or rent increases in future steps of this application process. This action cannot be undone.</p>
      <p>Are you sure you want to delete this capital expense?</p>`,
      primaryButtonText: 'Yes, Delete',
      onContinueFn: (modalView) => {
        modalView.close();
        deleteFn();
      }
    });
  },

  initialize() {
    this.warningMsg = this.model.validateAndGetExpenseWarningMsg();
    
    this.listenTo(this.model, 'show:warning', warningMsg => {
      this.warningMsg = warningMsg;
      this.render();
    });
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      console.log(childView);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, region);
        return;
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

      is_valid = childView.validateAndShowErrors() & is_valid;
    }, this);
    return is_valid;
  },


  onRender() {
    this._renderChildViewIfModelsExist('amountRegion', InputView, this.model.get('amountModel'), 'remedyUseAmount');
    this._renderChildViewIfModelsExist('completedDateRegion', InputView, this.model.get('completedDateModel'), 'remedyUseAssociatedDate');
    this._renderChildViewIfModelsExist('descriptionRegion', TextareaView, this.model.get('textDescriptionModel'), 'remedyUseTextDescription');
  },

  _renderChildViewIfModelsExist(region, viewClass, childModel, modelField) {
    if (childModel && this.model.get(modelField)) {
      this.showChildView(region, new viewClass({ model: childModel }));
    }
  },

  templateContext() {
    return {
      showDelete: this.model.collection && this.model.collection.length > 1,
      warning: this.warningMsg,
    };
  }

});
