import { routeParse } from '../../routers/mainview_router';
import DynamicMenuInstanceModel from '../../components/menu/DynamicMenuInstance_model';

export default DynamicMenuInstanceModel.extend({
  defaults: {
    menu_config_name: 'composer_item',

    // Required attributes
    outcome_doc_group_model: null,
    outcome_doc_file_model: null,
    
    // Derived attributes
    dispute_guid: null
  },

  // Creates a menu config item for this instance
  getMenuItem() {
    const menu_composer_item = DynamicMenuInstanceModel.prototype.getMenuItem.call(this);
    if (!menu_composer_item) {
      return;
    }

    menu_composer_item.dispute_guid = this.get('dispute_guid');    
    menu_composer_item.title = `${menu_composer_item.title} - ${this.get('outcome_doc_file_model').get('file_acronym')}`;
    menu_composer_item.navigation_link = routeParse(this.get('menu_config_name'), this.get('dispute_guid'), this.id);

    return menu_composer_item;
  },

  initialize() {
    // Check for required params and fill dispute_guid from passed in outcome_doc_file_model
    const outcome_doc_file_model = this.get('outcome_doc_file_model'),
      outcome_doc_group_model = this.get('outcome_doc_group_model');
    if (!outcome_doc_file_model || !outcome_doc_group_model) {
      alert("[Error] Invalid composer created, need OutcomeDocGroup and OutcomeDocFile");
      return;
    } else {
      this.set('dispute_guid', outcome_doc_file_model.get('dispute_guid'));
    }

    DynamicMenuInstanceModel.prototype.initialize.call(this);
  },

  isDocPublic() {
    return this.get('outcome_doc_file_model').isPublic();
  }
});
