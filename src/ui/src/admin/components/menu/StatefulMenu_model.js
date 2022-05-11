import Backbone from 'backbone';
import Radio from 'backbone.radio';
import MenuItemCollection from './MenuItem_collection';
import InputModel from '../../../core/components/input/Input_model';
import { MenuConfig } from './MenuConfig';
import { routes, routeParse } from '../../routers/mainview_router';

const menuChannel = Radio.channel('menu');
const disputeHistoryChannel = Radio.channel('disputeHistory');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');

export default Backbone.Model.extend({
  defaults: {
    sessionSettings: null,
    searchModel: null,
    menuItems: null
  },

  initialize() {
    if (!this.get('searchModel')) {
      this.set('searchModel', new InputModel({
        inputType: 'dispute_number',
        required: true,
        errorMessage: 'Enter the dispute number',
        maxLength: 9
      }));
    }

    if (!this.get('menuItems')) {
      this.set('menuItems', new MenuItemCollection());
    }

    menuChannel.on('close:active', this.closeActive, this);
    menuChannel.on('close:dispute', this.closeDispute, this);
    menuChannel.on('close:cms', this.closeCms, this);
    menuChannel.on('add:dispute', this.addDisputeDataToMenu, this);
    menuChannel.on('add:dispute:item', this.addMenuItem, this);
    menuChannel.on('add:group:item', this.appendMenuItemToGroup, this);
    menuChannel.on('add:title:item', this.addTitleItem, this);
    menuChannel.on('update:menu:item', this.updateMenuItem, this);
    menuChannel.on('scroll:to:item', this.scrollToMenuItem, this);
    menuChannel.reply('get:config', this.getMenuData, this);
    menuChannel.reply('get:active', this.getActive, this);
    menuChannel.reply('get:items', function() {
      return this.get('menuItems');
    }, this);

    const getMenuItemFromItemIds = (itemIds) => {
      if (itemIds && !_.isArray(itemIds)) {
        itemIds = [itemIds];
      }
      return this.get('menuItems').find(menuItem => _.contains(itemIds, menuItem.get('item_id')));
    };
    const setCountAndRender = (menuItem, count) => {
      if (menuItem) {
        // Don't allow setting negative counts
        if (Number(count) < 0) {
          count = 0;
        }
        menuItem.set('count', count);
        menuItem.trigger('render');
      }
    };

    menuChannel.on('update:item:count', function(itemIds, newCount) {
      // Supports passing multiple IDs, the first match will be returned.
      // Useful for finding arb VS io versions of menu tabs
      const matchingMenuItem = getMenuItemFromItemIds(itemIds);
      setCountAndRender(matchingMenuItem, newCount);
    }, this);

    menuChannel.on('add:to:item:count', function(itemIds, countToAdd) {
      countToAdd = countToAdd || 0
      const matchingMenuItem = getMenuItemFromItemIds(itemIds);
      if (matchingMenuItem) {
        setCountAndRender(matchingMenuItem, (matchingMenuItem.get('count') || 0) + countToAdd);
      }
    }, this);

    const arbToIoDashboardRoutes = {
      'arb-unassigned': 'io-unassigned',
      'arb-disputes': 'io-disputes',
      'my-tasks': 'my-tasks-io',
      'arb-my-hearings': 'landing',
      'my-activities': 'my-activities-io'
    };
    const ioToArbDashboardRoutes = _.invert(arbToIoDashboardRoutes);
    const getRouteReplacement = (route, lookup={}) => {
      let match;
      Object.keys(lookup).forEach(key => {
        // Don't route from landing to anywhere - it's only included for My Hearings to route TO
        if (!match && key !== 'landing' && route.indexOf(key) > -1) match = lookup[key];
      });
      return match;
    };
    menuChannel.on('dashboard:toggle', (menuItem) => {
      if (!menuItem) return;
      const dashboardOptions = { enable_dashboard_toggle: true };
      const route = Backbone.history.fragment || '';
      const group = menuItem.get('group');
      let newRoute;
      let newGroup;

      if (group === 'arb_dashboard') {
        // switch to IO
        this.closeGroup(group);
        newGroup = 'io_dashboard';
        newRoute = getRouteReplacement(route, arbToIoDashboardRoutes);
      } else if (group === 'io_dashboard') {
        // switch to Arb
        this.closeGroup(group);
        newGroup = 'arb_dashboard';
        newRoute = getRouteReplacement(route, ioToArbDashboardRoutes);
      }

      if (!newGroup) return;

      this.addDashboard(newGroup, dashboardOptions);
      if (this.get('sessionSettings')) {
        this.get('sessionSettings').set({
          menu: {
            ...this.get('sessionSettings')?.get('menu'),
            activeDashboardGroup: newGroup
          }
        });
      }
      this.get('menuItems').trigger('refresh:menu');
      
      if (newRoute) {
        Backbone.history.navigate(newRoute, { trigger: true });
      } else {
        // Update counts manually if no page nav/refresh will occur
        loaderChannel.trigger('page:load');
        this.trigger('load:counts', () => loaderChannel.trigger('page:load:complete'));
      }
    });
    
    this.listenTo(sessionChannel, 'logout:complete', this.clearMenu, this);
  },

  clearMenu() {
    this.set('menuItems', new MenuItemCollection());
  },

  update(route, route_params) {
    const menu_item_to_activate = _.invert(routes)[route];
    if (!menu_item_to_activate) {
      console.log("[Error] Couldn't find menu item", route, route_params);
      return;
    }

    const dispute_guid = route.indexOf(':dispute_guid') !== -1 ? _.first(route_params) : null;
    const param_id = route.indexOf(':param_id') !== -1 ? _.last(route_params) : null;
    const menu_config = this.getMenuData(menu_item_to_activate);
    if (menu_config && menu_config.dynamic) {
      // In a dynamic mode, pass the param_id along as the item_id
      this.setActive(param_id);
    } else if (dispute_guid) {
      // In a dispute mode, pass the dispute_guid along
      // If no dispute was already added, add one in
      if (!this.getMenuItem('overview_item', dispute_guid)) {
        this.addDisputeModel(disputeHistoryChannel.request('get', dispute_guid));
      }

      this.addMenuItem(menu_item_to_activate, dispute_guid);
      this.setActive(menu_item_to_activate, dispute_guid);
    } else {
      this.setActive(menu_item_to_activate);
    }
  },

  getMenuItem(item_id, dispute_guid=null) {
    if ($.trim(item_id).match('scheduled_hearings_')) {
      item_id = 'scheduled_hearings_item';
    } else if ($.trim(item_id).match('schedule_manager_')) {
      item_id = 'schedule_manager_item';
    }
    return this.get('menuItems').findWhere( _.extend({ item_id }, dispute_guid ? { dispute_guid } : {}));
  },

  // Hardcode some dashboard configurations into the menu??
  addDashboard(dashboard_name, dashboardOptions={}) {
    if (!MenuConfig || !MenuConfig.STEP_COLLECTIONS || !MenuConfig.STEP_COLLECTIONS[dashboard_name]) {
      console.log(`[Error] Can't find a dashboard ${dashboard_name}`);
      return;
    }
    const dashboard_config = MenuConfig.STEP_COLLECTIONS[dashboard_name];
    
    this.addTitleItem(Object.assign({ group: dashboard_name }, dashboard_config, dashboardOptions ));
    _.each(dashboard_config.menu_items, function(menu_item_name) {
      this.addMenuItem(menu_item_name);
    }, this);
  },

  addDisputeDataToMenu(fileNumber, disputeGuid) {
    this.addTitleItem({
      title: `Dispute: ${fileNumber}`,
      group: 'dispute',
      dispute_guid: disputeGuid,
      enable_dispute_buttons: true
    });

    _.each(MenuConfig.defaultDisputeMenuItems, function(menuItemName) {
      this.addMenuItem(menuItemName, disputeGuid);
    }, this);
  },

  addDisputeModel(dispute_model) {
    if (!dispute_model || !dispute_model.get('file_number')) {
      console.log(`[Info] Need a disputeModel in menu addDispute. Skipping add`);
      return;
    }
    
    this.addDisputeDataToMenu(dispute_model.get('file_number'), dispute_model.get('dispute_guid'));
  },

  updateMenuItem(item_data) {
    if (!item_data.item_id) {
      console.log(`[Error] No item_id can't update item data`, item_data);
      return;
    }

    const menu_items = this.get('menuItems');
    const menu_item = menu_items.findWhere({item_id: String(item_data.item_id)})
    if (menu_item) {
      menu_item.set(item_data);
      this.get('menuItems').trigger('reset');
    }

  },

  appendMenuItemToGroup(item_data) {
    const menuItems = this.get('menuItems'),
      group_items = menuItems.where(_.extend(
          { group: item_data.group },
          item_data.dispute_guid ? { dispute_guid: item_data.dispute_guid } : {}
      ));
    if (!group_items || !group_items.length) {
      console.log('[Warning] No group found to add to');
      return;
    }

    // Check and don't add a duplicate ID to the group
    if (_.find(group_items, function(m) { return m.get('item_id') === item_data.item_id })) {
      console.log('[Info] Menu item exists, not adding to group');
      return;
    }
    
    
    const last_group_index = menuItems.indexOf(group_items.slice(-1)[0]);
    menuItems.add(item_data, {at: last_group_index+1})
  },

  addTitleItem(titleData) {
    titleData = titleData || {};
    if (this.getMenuItem(titleData.title, titleData.dispute_guid)) {
      return;
    }
    if (!titleData.title) {
      return;
    }
    
    this.get('menuItems').add(_.extend({
        item_id: titleData.title,
        is_title: true,
        created_date: Moment().toISOString(),
      }, titleData)
    );
  },

  getMenuData(menu_item_name) {
    if ($.trim(menu_item_name).match('scheduled_hearings_')) {
      menu_item_name = 'scheduled_hearings_item';
    }

    const menu_config = (MenuConfig || {})[menu_item_name];
    if (!menu_config) {
      console.log(`[Warning] Invalid menu item for ${menu_item_name}`);
      return;
    }
    return menu_config ? _.extend({}, menu_config) : null;
  },

  addMenuItem(menu_item_name, dispute_guid=null) {
    if (!MenuConfig || !MenuConfig[menu_item_name]) {
      console.log(`[Warning] Invalid menu item for ${menu_item_name}`);
      return;
    }
    if (!routes || !routes[menu_item_name]) {
      console.log(`[Warning] No routes for menu item ${menu_item_name}`);
    }
    // Don't add if it already exists
    if (this.getMenuItem(menu_item_name, dispute_guid)) {
      return;
    }

    this.get('menuItems').add(
      _.extend({
        dispute_guid,
        navigation_link: routeParse(menu_item_name, dispute_guid),
        created_date: Moment().toISOString(),
      }, MenuConfig[menu_item_name])
    );
  },


  setAllMenuItemsToInactive() {
    this.get('dashboards').each(function(dashboard) {
      _.each(dashboard.getActive(), function(menu_item) {
        menu_item.set('active', false, {silent: true});
      });
    });
    this.get('disputes').each(function(dispute_menu) {
      _.each(dispute_menu.getActive(), function(menu_item) {
        menu_item.set('active', false, {silent: true});
      });
    });
  },

  getActive() {
    return this.get('menuItems').findWhere({ active: true });
  },

  setActive(item_id, dispute_guid=null) {
    const menu_item = this.getMenuItem(item_id, dispute_guid),
      active_item = this.getActive();
    if (!menu_item) {
      console.log(`[Warning] No menu item found for ${item_id}, ${dispute_guid}`);
      return;
    }
    if (menu_item === active_item) {
      return;
    } else if (active_item){
      active_item.set('active', false);
    }
    menu_item.set('active', true);
  },

  closeDispute(dispute_guid) {
    const dispute_menu_items = this.get('menuItems').where({ dispute_guid });
    if (!_.isEmpty(dispute_menu_items)) {
      this.get('menuItems').remove(dispute_menu_items, { silent: true });
    }
  },

  closeCms(subGroup) {
    const cms_menu_items = this.get('menuItems').where({ sub_group: subGroup });
    if (!_.isEmpty(cms_menu_items)) {
      this.get('menuItems').remove(cms_menu_items, { silent: true });
    }
  },

  closeGroup(groupId) {
    const groupMenuItems = this.get('menuItems').where({ group: groupId });
    if (groupMenuItems && groupMenuItems.length) {
      this.get('menuItems').remove(groupMenuItems, { silent: true });
    }
  },

  /**
   * Closes the current menu tab and any associated tabs
   * @param {Object} options 
   * @param {Boolean} options.single_removal - Only remove the current active tab, and no associated ones
   */
  closeActive(options) {
    options = options || {};
    const active_item = this.getActive();
    
    if (!active_item) {
      return;
    }

    const sub_group = active_item.get('sub_group'),
      to_remove = sub_group && !options.single_removal ? this.get('menuItems').where({ sub_group }) : [active_item];
    
    // Check for any open tabs in the same subgroup and close them
    this.get('menuItems').remove(to_remove, { silent: true });
  }


});
