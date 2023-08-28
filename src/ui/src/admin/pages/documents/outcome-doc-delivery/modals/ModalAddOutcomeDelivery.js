import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import TextareaView from '../../../../../core/components/textarea/Textarea';
import TextareaModel from '../../../../../core/components/textarea/Textarea_model';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import template from './ModalAddOutcomeDelivery_template.tpl';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,
  id: 'addOutcomeDocDelivery',
  attributes: {
    'data-backdrop': 'static',
    'data-keyboard': 'false'
  },
  className: 'modal modal-rtb-default',

  regions: {
    documentRegion: '#addOutcomeDocDelivery_document',
    descriptionRegion: '#addOutcomeDocDelivery_description',
  },

  ui: {
    save: '#addOutcomeDocDelivery_save',
    cancel: '#addOutcomeDocDelivery_cancel',
    close: '.close-x'
  },

  events: {
    'click @ui.close': 'clickClose',
    'click @ui.cancel': 'clickClose',
    'click @ui.save': 'clickSave'
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }
    
    const outcome_doc_files = this.model.getDeliverableOutcomeFiles(),
      matching_file = _.find(outcome_doc_files, function(m) {
        return m.get('outcome_doc_file_id') === this.documentModel.getData({ parse: true });
      }, this);

    if (!matching_file) {
      return;
    }
    loaderChannel.trigger('page:load');
    const created_outcome_delivery = matching_file.createDelivery(_.extend(
      { delivery_method: configChannel.request('get', 'SEND_METHOD_OTHER') },
      this.descriptionModel.getPageApiDataAttrs(),
      (this.deliverySaveData || {})
    ));

    created_outcome_delivery.save()
      .done(() => this.trigger('save:complete', matching_file, created_outcome_delivery))
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.SAVE', () => {
          this.trigger('save:complete', matching_file, created_outcome_delivery);
        });
        handler(err);
      });
  },

  clickClose() {
    Radio.channel('modals').request('remove', this);
  },

  validateAndShowErrors() {
    const regions_to_validate = ['documentRegion', 'descriptionRegion'];

    let is_valid = true;
    _.each(regions_to_validate, function(region_name) {
      const view = this.getChildView(region_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);
    return is_valid;
  },

  initialize(options) {
    if (!(options || {}).model) {
      console.log(`[Error] Need the outcome document group model to add outcome document to`);
      return;
    }
    this.mergeOptions(options, ['deliverySaveData']);
    this.createSubModels();
  },

  _getDocumentOptions() {
    return _.map(this.model.getDeliverableOutcomeFiles(), function(outcome_file_model) {
      return { value: outcome_file_model.id, text: outcome_file_model.get('file_acronym') };
    });
  },

  createSubModels() {
    const documentOptions = this._getDocumentOptions();
    this.documentModel = new DropdownModel({
      optionData: documentOptions,
      labelText: 'Document',
      errorMessage: 'Select the document',
      required: true,
      defaultBlank: true,
      value: ~_.isEmpty(documentOptions) ? documentOptions[0].value : null
    });

    this.descriptionModel = new TextareaModel({
      labelText: 'Deliver to Whom and How',
      errorMessage: 'Enter who the document was delivered to and the delivery details',
      required: true,
      max: configChannel.request('get', 'OUTCOME_DOC_DELIVERY_COMMENT_MAX_LENGTH'),
      displayRows: 4,
      apiMapping: 'delivery_comment'
    });
  },
  
  onRender() {
    this.showChildView('documentRegion', new DropdownView({ model: this.documentModel }));
    this.showChildView('descriptionRegion', new TextareaView({ model: this.descriptionModel }));
  }
});