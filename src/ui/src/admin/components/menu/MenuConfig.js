import Radio from 'backbone.radio';
const configChannel = Radio.channel('config');

const _defaultOptions = {
  UAT_TOGGLING: {}
};
// Holds the configuration and names for the pre-set menu dashboards
const _configCreationFn = (options) => {
  options = options || _defaultOptions;
  const disputeMenuItems = [];
  const configData = {
    STEP_COLLECTIONS: {
      // Admin dashboards
      general_dashboard: {
        title: null, // No name on the general menu
        menu_items: ['landing_item']
      },

      admin_dashboard: {
        title: null,
        menu_items: ['users_item', 'common_files_item']
      },

      report_viewer_dashboard: {
        title: null,
        menu_items: ['reports_item']
      },

      ceu_complaints_dashboard: {
        title: null,
        menu_items: ['ceu_complaints_item']
      },

      schedule_manager_dashboard: {
        title: null,
        menu_items: ['schedule_manager_item']
      },

      scheduler_dashboard: {
        menu_items: ['scheduled_hearings_item']
      },

      search_dashboard: {
        title: ' ',
        menu_items: [],
      },
      
      arb_dashboard: {
        title: 'Arb Dashboard',
        menu_items: ['my_disputes_arb_item', 'my_hearings_arb_item', 'my_tasks_item', 'my_activities_item', 'unassigned_arb_item'],
      },
      
      io_dashboard: {
        title: 'IO/Admin Dashboard',
        menu_items: ['my_disputes_io_item', 'my_tasks_item_io', 'my_activities_io_item', 'unassigned_io_item'],
      }
    },
    
    // Dispute item tabs
    // Intended order: dispute, evidence, hearing, notice, tasks, communications, history, documents, payments.
    defaultDisputeMenuItems: ['overview_item', 'evidence_item'],
    overview_item: {
      item_id: 'overview_item',
      group: 'dispute',
      rank: 1,
      title: 'Dispute View'
    },

    evidence_item: {
      item_id: 'evidence_item',
      group: 'dispute',
      rank: 2,
      title: 'Evidence'
    },

    hearing_item: {
      item_id: 'hearing_item',
      group: 'dispute',
      rank: 3,
      title: 'Hearings'
    },

    notice_item: {
      item_id: 'notice_item',
      group: 'dispute',
      rank: 4,
      title: 'Notice'
    },

    document_item: {
      item_id: 'document_item',
      group: 'dispute',
      rank: 5,
      title: 'Documents'
    },

    task_item: {
      item_id: 'task_item',
      group: 'dispute',
      rank: 6,
      title: 'Tasks'
    },

    communication_item: {
      item_id: 'communication_item',
      group: 'dispute',
      rank: 7,
      title: 'Communications'
    },

    history_item: {
      item_id: 'history_item',
      group: 'dispute',
      rank: 8,
      title: 'History'
    },

    payment_item: {
      item_id: 'payment_item',
      group: 'dispute',
      rank: 9,
      title: 'Payments'
    },

    composer_item: {
      // item_id will be provided dynamically
      // title will be updated dynamically
      group: 'dispute',
      title: 'Composer',
      rank: 10,
      dynamic: true
    },

    // Dashboard dispute items
    search_item: {
      // item_id will be provided dynamically
      // title will be updated dynamically
      group: 'search_dashboard',
      title: 'Search',
      dynamic: true
    },

    landing_item: {
      item_id: 'landing_item',
      group: 'general_dashboard',
      title: 'Welcome'
    },

    all_disputes_item: {
      item_id: 'all_disputes_item',
      group: 'general_dashboard',
      title: 'All Disputes',
      visited: false
    },

    users_item: {
      item_id: 'users_item',
      group: 'admin_dashboard',
      title: 'User Management',
    },

    common_files_item: {
      item_id: 'common_files_item',
      group: 'admin_dashboard',
      title: 'Common Files',
    },

    reports_item: {
      item_id: 'reports_item',
      group: 'report_viewer_dashboard',
      title: 'Operational Reports',
    },

    schedule_manager_item: {
      item_id: 'schedule_manager_item',
      group: 'schedule_manager_dashboard',
      title: 'Work Schedule',
      enable_count_display: true
    },

    ceu_complaints_item: {
      item_id: 'ceu_complaints_item',
      group: 'ceu_complaints_dashboard',
      title: 'CEU Complaints',
      enable_count_display: false
    },

    my_tasks_item: {
      item_id: 'my_tasks_item',
      group: 'arb_dashboard',
      title: 'My Tasks',
      enable_count_display: true
    },

    my_tasks_item_io: {
      item_id: 'my_tasks_item_io',
      group: 'io_dashboard',
      title: 'My Tasks',
      enable_count_display: true
    },

    my_activities_item: {
      item_id: 'my_activities_item',
      group: 'arb_dashboard',
      title: 'My Recent Activity',
      enable_count_display: false
    },

    my_activities_io_item: {
      item_id: 'my_activities_io_item',
      group: 'io_dashboard',
      title: 'My Recent Activity',
      enable_count_display: false
    },

    my_disputes_io_item: {
      item_id: 'my_disputes_io_item',
      group: 'io_dashboard',
      title: 'My Disputes',
      enable_count_display: true
    },

    unassigned_io_item: {
      item_id: 'unassigned_io_item',
      group: 'io_dashboard',
      title: 'Unassigned'
    },

    my_disputes_arb_item: {
      item_id: 'my_disputes_arb_item',
      group: 'arb_dashboard',
      title: 'My Disputes',
      enable_count_display: true
    },

    unassigned_arb_item: {
      item_id: 'unassigned_arb_item',
      group: 'arb_dashboard',
      title: 'Unassigned'
    },

    my_hearings_arb_item: {
      item_id: 'my_hearings_arb_item',
      group: 'arb_dashboard',
      title: ((options || {}).UAT_TOGGLING || {}).SHOW_SCHEDULE_MANAGEMENT ? 'My Schedule' : 'My Hearings'
    },    

    cms_item: {
      title: 'Archive Dispute',
      group: 'cms_dashboard',
      dynamic: true
    },

    scheduled_hearings_item: {
      item_id: 'scheduled_hearings_item',
      group: 'scheduler_dashboard',
      title: 'Schedule',
    }
  };

  _.each(configData, function(val, key) {
    if (_.isObject(val) && val.group === 'dispute' && !val.dynamic) {
      disputeMenuItems.push(key);
    }
  });

  configData.disputeMenuItems = disputeMenuItems;
  return configData;
};

const _stateful_config = _configCreationFn();

export const MenuConfig = _stateful_config;

export const refreshMenuConfig = () => (
  _.extend(_stateful_config, _configCreationFn({
    UAT_TOGGLING: configChannel.request('get', 'UAT_TOGGLING') || {}
  }))
)
