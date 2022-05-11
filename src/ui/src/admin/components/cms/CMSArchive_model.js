import DynamicMenuInstanceModel from '../menu/DynamicMenuInstance_model';
import { routeParse } from '../../routers/mainview_router';

export default DynamicMenuInstanceModel.extend({
  defaults: {
    menu_config_name: 'cms_item',
  },

  initialize() {
    DynamicMenuInstanceModel.prototype.initialize.call(this);
    this.set('id', this.get('file_number'));
  },

  getMenuItem() {
    const menu_cms_item = DynamicMenuInstanceModel.prototype.getMenuItem.call(this);
    if (!menu_cms_item) {
      return;
    }
    
    menu_cms_item.sub_group = this.get('file_number');
    menu_cms_item.navigation_link = routeParse(this.get('menu_config_name'), null, this.get('file_number'));
    return menu_cms_item;
  },

	getCMSRecord(index) {
    const cmsRecords = this.get('cms_records');
		if (!_.isArray(cmsRecords) || cmsRecords.length <= index) {
			return;
		}
		return cmsRecords[index];
	}

});