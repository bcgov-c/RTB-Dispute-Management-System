import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import UtilityMixin from '../../utilities/UtilityMixin';
import TaskModel from './Task_model';
import TaskCollection from './Task_collection';
import InputModel from '../input/Input_model';
import Email_model from '../email/Email_model';
import Formatter from '../formatter/Formatter';
import emailTemplate from './emails/EmailTaskAssignmentError_template.tpl';

const api_dispute_tasks_load_name = 'disputetasks';
const api_owner_tasks_load_name = 'ownertasks';

const apiChannel = Radio.channel('api');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const documentsChannel = Radio.channel('documents');
const taskChannel = Radio.channel('tasks');

const TaskCreator = Marionette.Object.extend({
  /**
   * @param {Number} [docGroupId] - Optional id of the associated outcome doc group
   * @param {Number} [docRequestModel] - Optional associated outcome doc request model
   */
  initialize(options) {
    this.mergeOptions(options, ['docGroupId', 'docRequestModel']);
    this.docGroups = documentsChannel.request('get:all');
    
    // If every document was created by the same user, use that user
    this.docsHaveSameCreator = this.docGroups.length && this.docGroups.map(group => group.get('created_by')).every((val, i, arr) => val === arr[0]);
  },

  /**
   * @param {Number} taskData.task_activity_type - Must pass task_activity_type in the data so the dependent params can be looked up
   */
   submitExternalTask(taskData={}) {
    if (!taskData.task_activity_type) {
      console.log("[Warning] Need a task activity type");
      return new Promise(res=>res());
    }
    const TASK_ACTIVITY_TYPE_OS_CORRECTION = configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_CORRECTION');
    const TASK_ACTIVITY_TYPE_OS_CLARIFICATION = configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_CLARIFICATION');
    const TASK_ACTIVITY_TYPE_OS_REV_REQUEST = configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_REV_REQUEST');
    const TASK_ACTIVITY_TYPE_DA_CORRECTION = configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_CORRECTION');
    const TASK_ACTIVITY_TYPE_DA_CLARIFICATION = configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_CLARIFICATION');
    const TASK_ACTIVITY_TYPE_DA_REV_REQUEST = configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_REV_REQUEST');
    const TASK_ACTIVITY_TYPE_DA_SUB_SERVICE = configChannel.request('get', 'TASK_ACTIVITY_TYPE_DA_SUB_SERVICE');
    const TASK_ACTIVITY_TYPE_OS_AMENDMENT = configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_AMENDMENT');
    const TASK_ACTIVITY_TYPE_OS_SUB_SERVICE = configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_SUB_SERVICE');
    const UNASSIGNED_TASK_OWNER_IO = configChannel.request('get', 'UNASSIGNED_TASK_OWNER_IO');
    const UNASSIGNED_TASK_OWNER_ARB = configChannel.request('get', 'UNASSIGNED_TASK_OWNER_ARB');
    const TASK_SUB_TYPE_IO = configChannel.request('get', 'TASK_SUB_TYPE_IO');
    const TASK_SUB_TYPE_ARB = configChannel.request('get', 'TASK_SUB_TYPE_ARB');
    const isOsTask = (configChannel.request('get', 'OS_TASK_ACTIVITY_TYPES') || []).includes(taskData.task_activity_type);
    const isDaTask = (configChannel.request('get', 'DA_TASK_ACTIVITY_TYPES') || []).includes(taskData.task_activity_type);
    const isReview = [TASK_ACTIVITY_TYPE_OS_REV_REQUEST, TASK_ACTIVITY_TYPE_DA_REV_REQUEST].includes(taskData.task_activity_type);
    const isSimpleCorrection = (this.docRequestModel && this.docRequestModel.isSimpleCorrection());
    const taskModel = taskChannel.request('create:by:activityType', taskData.task_activity_type, taskData);
    
    this.queueUserFallbackData = {
      task_owner_id: isReview ? UNASSIGNED_TASK_OWNER_ARB : UNASSIGNED_TASK_OWNER_IO,
      task_sub_type: isReview ? TASK_SUB_TYPE_ARB : TASK_SUB_TYPE_IO,
    };
    this.unassignedFallbackData = {
      task_owner_id: null,
      task_sub_type: TASK_SUB_TYPE_IO,
    };
    
    this.sourceSite = isOsTask ? 'Office' : isDaTask ? 'Dispute Access' : null;
    
    if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_OS_CORRECTION) {
      return isSimpleCorrection ? this.saveWithQueueUser(taskModel) : this.saveWithAutoAssign(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_OS_CLARIFICATION) {
      return this.saveWithAutoAssign(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_OS_REV_REQUEST) {
      return this.saveWithQueueUser(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_DA_CORRECTION) {
      return isSimpleCorrection ? this.saveWithQueueUser(taskModel) : this.saveWithAutoAssign(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_DA_CLARIFICATION) {
      return this.saveWithAutoAssign(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_DA_REV_REQUEST) {
      return this.saveWithQueueUser(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_DA_SUB_SERVICE) {
      return this.saveAsUnassigned(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_OS_AMENDMENT) {
      return this.saveAsUnassigned(taskModel);
    } else if (taskData.task_activity_type === TASK_ACTIVITY_TYPE_OS_SUB_SERVICE) {
      return this.saveAsUnassigned(taskModel);
    }
    return new Promise(res=>res());
  },

  saveWithAutoAssign(taskModel) {
    this.setAutoAssignUser(taskModel);
    return !taskModel.isAssigned() ?
      // If the auto-assign user could not be found, save directly as queue task
      this.saveWithQueueUser(taskModel)
      : 
      // Otherwise, then save task to the auto-assign user
      Promise.all([taskModel.save()]).catch(() => this.saveWithQueueUser(taskModel));
  },

  saveWithQueueUser(taskModel) {
    taskModel.set(this.queueUserFallbackData || {});

    return !taskModel.isAssigned() ?
      // If the queue user could not be found, save directly as unassigned with an email
      this.saveAsUnassignedAndSendEmail(taskModel)
      : 
      // Otherwise, then save task to the queue user
      Promise.all([taskModel.save()]).catch(() => this.saveAsUnassignedAndSendEmail(taskModel));
  },

  saveAsUnassignedAndSendEmail(taskModel) {
    taskModel.set('task_text', `${taskModel.get('task_text')}-- TASK AUTO-ASSIGNMENT FAILED DUE TO INVALID CONFIGURATION`);
    return Promise.all([this.saveAsUnassigned(taskModel), this.sendTaskEmail(taskModel)]);
  },

  saveAsUnassigned(taskModel) {
    taskModel.set(this.unassignedFallbackData || {});
    return new Promise((res, rej) => taskModel.save().then(res, rej));
  },

  sendTaskEmail(taskModel) {
    const dispute = disputeChannel.request('get');
    const emailModel = new Email_model({
      email_to: configChannel.request('get', 'EMAIL_SUPPORT_TO'),
      email_from: configChannel.request('get', 'EMAIL_FROM_DEFAULT'),
      subject: 'Task Auto-Assignment Failure',
      dispute_guid: dispute.get('dispute_guid'),
      html_body: emailTemplate({
        userId: taskModel.get('task_owner_id'),
        associatedTo: taskModel.getSubTypeDisplay(),
        fileNumber: (dispute && dispute.get('file_number')) || '-',
        dateTime: Formatter.toDateAndTimeDisplay(Moment()),
        sourceSite: this.sourceSite,
        accessCode: (dispute && dispute.get('accessCode')) || '-',
      })
    });
    // Always accept the result of the email send.  It's our final error warning
    return new Promise(res => emailModel.save().done(res).fail(() => res()));
  },

  setAutoAssignUser(taskModel) {
    let matchingGroup;
    let taskOwnerId;
    let taskSubType;
    if (this.docGroupId) matchingGroup = this.docGroups.findWhere({ outcome_doc_group_id: this.docGroupId });
    else if (this.docsHaveSameCreator) matchingGroup = this.docGroups.at(0);

    if (matchingGroup) {
      taskOwnerId = matchingGroup.get('created_by');
      taskSubType = matchingGroup.get('created_by_role_id');
    }

    if (taskOwnerId) taskModel.set('task_owner_id', taskOwnerId);
    if (taskSubType) taskModel.set('task_sub_type', taskSubType);
  },

});


const TaskManager = Marionette.Object.extend({
  channelName: 'tasks',

  radioRequests: {
    load: 'loadDisputeTasksPromise',
    'load:by:owner': 'loadOwnerTasksPromise',
    'get:by:dispute': 'getAllDisputeTasks',
    'task:creator': 'getTaskCreator',
    'create:by:activityType': 'createTaskByActivityType',
    'parse:task:response': 'parseTaskCollectionResponseFromApi',
    'get:task:dueDate': 'getTaskDueDateFromNow',
    'config:activityTypes': 'getConfigAllActivityTypes',
    'config:activityType': 'getConfigActivityTypeById',
    'task:optionData': 'getTaskDropdownOptionData',

    clear: 'clearDisputeTaskData',
    'clear:dispute': 'clearDisputeData',
    'cache:current': 'cacheCurrentData',
    'cache:load': 'loadCachedFor'
  },

  /**
   * Saves current dispute tasks data into internal memory.  Can be retreived with loadCachedData().
   */
  cacheCurrentData() {
    const active_dispute = disputeChannel.request('get');
    if (!active_dispute || !active_dispute.get('dispute_guid')) {
      return;
    }
    this.cached_data[active_dispute.get('dispute_guid')] = this._toCacheData();
  },

  clearDisputeData(disputeGuid) {
    if (_.has(this.cached_data, disputeGuid)) {
      delete this.cached_data[disputeGuid];
    }
  },

  /**
   * Loads any saved cached values for a dispute_guid into this TaskManager.
   * @param {string} dispute_guid - The dispute guid to lookup.
   */
  loadCachedFor(dispute_guid) {
    if (!_.has(this.cached_data, dispute_guid)) {
      console.log(`[Warning] No cached task data found for ${dispute_guid}`);
      return;
    }

    const cache_data = this.cached_data[dispute_guid];
    this.disputeTasks = cache_data.disputeTasks;
  },


  /**
   * Converts the current data into an object which can be loaded from later.
   */
  _toCacheData() {
    return {
      disputeTasks: this.disputeTasks
    };
  },

  initialize() {
    this.cached_data = {};
    this.disputeTasks = new TaskCollection();
    this.configTasks = {};
  },

  /**
   * Clears the current tasks in memory.
   * Does not flush any cached data.
   */
  clearDisputeTaskData() {
    this.disputeTasks = new TaskCollection();
  },

  parseTaskCollectionResponseFromApi(taskCollection, searchParams, response) {
    response = response || {};
    taskCollection.lastUsedFetchIndex = searchParams.index;
    taskCollection.lastUsedFetchCount = searchParams.count;
    taskCollection.totalAvailable = response.total_available_records;
    taskCollection.reset(response.results, { silent: true });
  },

  loadDisputeTasksPromise(dispute_guid, searchParams) {
    if (!dispute_guid) {
      console.log(`[Error] Need a dispute_guid for get:all tasks`);
      return;
    }

    searchParams = searchParams || {};

    // Apply some default index/counts in case of errors
    const default_index = 0;
    const default_count = 999990;
    searchParams = _.extend({
      index: default_index,
      count: default_count
    }, searchParams);

    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_dispute_tasks_load_name}/${dispute_guid}?${$.param(searchParams)}`
    }).done(response => {
      this.parseTaskCollectionResponseFromApi(this.disputeTasks, searchParams, response);
      dfd.resolve(this.disputeTasks);
    }).fail(dfd.reject);
    return dfd.promise();
  },

  loadOwnerTasksPromise(user_id, searchParams) {
    if (!user_id) {
      console.log(`[Error] Need user ID for load:by:owner`);
      return;
    }

    searchParams = searchParams || {};

    // Apply some default index/counts in case of errors
    const default_index = 0;
    const default_count = 999990;
    searchParams = _.extend({
      index: default_index,
      count: default_count
    }, searchParams);
    const dfd = $.Deferred();

    apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_ROOT_URL')}${api_owner_tasks_load_name}/${user_id}?${$.param(searchParams, true)}`
    }).done(response => {
      const ownerTasks = new TaskCollection();
      this.parseTaskCollectionResponseFromApi(ownerTasks, searchParams, response);
      dfd.resolve(ownerTasks);
    }).fail(dfd.reject);
    return dfd.promise();
  },


  getAllDisputeTasks() {
    return this.disputeTasks;
  },

  getTaskCreator(taskCreatorOptions={}) {
    return new TaskCreator(taskCreatorOptions);
  },

  // Create task with values pre-populated from activtyType
  createTaskByActivityType(activityType, extraTaskData={}) {
    const activityTypeConfig = this.getConfigActivityTypeById(activityType);
    const task_due_date = activityTypeConfig.due_date_offset ? this.getTaskDueDateFromNow(activityTypeConfig.due_date_offset, activityTypeConfig.due_date_time) : null;
    return new TaskModel(Object.assign({
      task_activity_type: activityType,
      task_priority: activityTypeConfig.priority,
      task_type: activityTypeConfig.task_type || configChannel.request('get', 'TASK_TYPE_SYSTEM'),
    }, task_due_date ? { task_due_date } : {}, extraTaskData));
  },

  getConfigAllActivityTypes() {
    if (_.isEmpty(this.configTasks)) {
      this.configTasks = configChannel.request('get', 'task_activity_types') || {};
    }

    return this.configTasks;
  },

  getConfigActivityTypeById(activityTypeId) {
    const activityTypesConfig = this.getConfigAllActivityTypes();
    return activityTypesConfig && _.has(activityTypesConfig, activityTypeId) ? activityTypesConfig[activityTypeId] : {};
  },

  getTaskDueDateFromNow(dayOffset, timeOffset=null) {
    const timezoneString = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    let taskDueDate = dayOffset ? Moment().add(dayOffset, 'days') : Moment();
    if (timeOffset && taskDueDate && taskDueDate.isValid() && timeOffset && timezoneString) {
      taskDueDate = Moment(`${taskDueDate.format(InputModel.getDateFormat())} ${timeOffset}`,
          `${InputModel.getDateFormat()} ${InputModel.getTimeFormat()}`);
      taskDueDate = Moment.tz(taskDueDate, timezoneString);
    }

    return taskDueDate.isValid() ? taskDueDate : null;
  },

  // options.filtered - only the filtered 
  // options.ui_filters - adds UI search all dropdowns
  getTaskDropdownOptionData(options={}) {
    // Create 3 dropdown items unless we are only showing filtered 
    const uiOptions = options.ui_filters ? [
      { text: "All Activity Types", value: '-3', RestrictTaskActivityTypeList: [] },
      { text: "OS Initiated Only", value: '-2', RestrictTaskActivityTypeList: configChannel.request('get', 'OS_TASK_ACTIVITY_TYPES') },
      { text: "DA Initiated Only", value: '-1', RestrictTaskActivityTypeList: configChannel.request('get', 'DA_TASK_ACTIVITY_TYPES') },
    ] : [];
    const activityTypesLookup = this.getConfigAllActivityTypes();
    let activityTypes = Object.entries(activityTypesLookup);
    if (options.filtered) activityTypes = activityTypes.filter(([id, taskType]) => taskType.unassigned_mytask_filter);
    return [...uiOptions, ...activityTypes.map(([id, taskType]) => ({ value: String(taskType.id), text: taskType.title }))];
  },

});

_.extend(TaskManager.prototype, UtilityMixin);

const taskManagerInstance = new TaskManager();

export default taskManagerInstance;
