import Backbone from 'backbone';
import Radio from 'backbone.radio';
import UtilityMixin from '../../../core/utilities/UtilityMixin';

const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');
const modalChannel = Radio.channel('modals');

function _getDisplayTime(record) {
  const displayHours = parseInt(record.expected_duration_minutes / 60),
  displayMinutes = record.expected_duration_minutes % 60,
  displayTime = (displayHours ? displayHours + ' hour' + (displayHours === 1 ? '' : 's') : '' ) +
      ( (displayHours && displayMinutes ) ? ' and ' : '' ) +
      (displayMinutes ? displayMinutes + ' minute' + (displayMinutes === 1 ? '' : 's') : '' );
  return displayTime;
}

function _isMaintenanceImminent(record) {
  const offset = configChannel.request('get', 'MAINTENANCE_WARNING_OFFSET_MINUTES') || 0;
  return Moment().add(offset, 'minutes').isAfter(Moment(record._utcStartTime), 'minute');
}

function _showMaintenanceModal(modal_options, template_options) {
  modal_options = modal_options || {};
  template_options = template_options || {};

  modalChannel.request('show:standard', _.extend({
    modalCssClasses: 'maintenanceModal',
    title: `Site Maintenance Reminder`,
    bodyHtml: _.template(`<p>This is a reminder that this Residential Tenancy Branch online system will be offline for maintenance on:</p>
        <p class="modal-maintenance-date"><%= Moment(record._utcStartTime).format('dddd[,] MMMM Do [at] h:mm A') %></p>
        <% if (showLogout) { %>
          <p class="modal-maintenance-info">You have <%= Moment(record._utcStartTime).toNow(true)%> to complete your work and log out or you will be logged out without warning.</p>
        <% } %>
        <p>The outage is expected to be <b><%= displayTime %> in duration.</b>  During this time, the site will not be available and all users will be logged off the system.  Thank you.</p>`
      )(_.extend({ Moment }, template_options))
    }, modal_options));
}

function showOngoingMaintenanceWarning(record) {
  return _showMaintenanceModal({
    title: 'Site Offline',
    bodyHtml: `<p>This site is offline for maintenance, and expected to be back online on ${Moment(record._utcStartTime).add(record.expected_duration_minutes, 'minutes').format('dddd[,] MMMM Do [at] h:mm A')}.  Please check back after this time.  You are being redirected from the site.</p>`,
    hideAllControls: true
  }, {
    record,
    showLogout: null,
    displayTime: null
  });
}

function showUpcomingMaintenanceWarningLogout(record, logoutFn=null) {
  return _showMaintenanceModal({
    primaryButtonText: 'Logout',
    cancelButtonText: 'Continue',
    onContinueFn() {
      if (_.isFunction(logoutFn)) {
        logoutFn();
      } else {
        Backbone.history.navigate('logout', { trigger: true }); 
      }
    }
  }, {
    record,
    showLogout: false,
    displayTime: _getDisplayTime(record)
  });
}

function showUpcomingMaintenanceWarning(record) {
  return _showMaintenanceModal({
    primaryButtonText: 'Continue',
    hideCancelButton: true,
    onContinueFn(modal) { modal.close(); }
  }, {
    record,
    showLogout: false,
    displayTime: _getDisplayTime(record)
  });
}

export const loadAndCheckMaintenance = (system_id, logoutFn=null) => {
  const MAINTENANCE_CHECK_URL = configChannel.request('get', 'MAINTENANCE_CHECK_URL');
  const MAINTENANCE_SYSTEM_ID_ALL = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_ALL');
  const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING') || 'America/Los_Angeles';
  const active_warning_date_cutoff_hours = (configChannel.request('get', 'MAINTENANCE_WARNING_OFFSET_DAYS') || 1) * 24;
  const dfd = $.Deferred();

  apiChannel.request('call', {
    method: 'GET',
    url: MAINTENANCE_CHECK_URL
  }).done(function(response) {
    response = response || {};
    const activeRecords = [];
    
    _.each(response.maintenance, function(record) {
      if (record.system_id !== system_id && record.system_id !== MAINTENANCE_SYSTEM_ID_ALL) {
        return;
      }

      // Correct the timezone that is returned.  It is in UTC format from server, but should be interpretted as server timezone (PST)
      if ((_.isString(record.start_date_time) ? record.start_date_time : '').endsWith('Z')) {
        record.start_date_time = record.start_date_time.substring(0, record.start_date_time.length - 1);
      }

      const utcStartTime = Moment.tz(record.start_date_time, RTB_OFFICE_TIMEZONE_STRING);
      // Add the parsed start time to the record, it will be used for displays
      record._utcStartTime = utcStartTime;
      activeRecords.push(record);
    });

    // If there is ongoing maintenance, allow the override key to bypass the warning/redirect from maintenance
    const ongoingMaintenanceRecord = _.find(activeRecords, record => record._utcStartTime.isBefore(Moment(), 'minutes'));
    if (ongoingMaintenanceRecord) {
      if (ongoingMaintenanceRecord.override_key && ongoingMaintenanceRecord.override_key === UtilityMixin.util_getParameterByName('userkey')) {
        dfd.resolve();
        return;
      }
      showOngoingMaintenanceWarning(ongoingMaintenanceRecord);
      dfd.reject();
      return;
    }


    const firstActiveRecord = _.min(
      _.filter(activeRecords, function(record) {
        const cutoffDatetime = Moment(record._utcStartTime).subtract(active_warning_date_cutoff_hours, 'hours');
        return !cutoffDatetime.isAfter(Moment(), 'minutes');
      }), function(record) {
        return Number(Moment(record._utcStartTime));
      });
    
    // Only show the maintenance warning if it falls within the cutoff set in the site config
    if (firstActiveRecord !== Infinity && firstActiveRecord) {
      if (_isMaintenanceImminent(firstActiveRecord)) {
        showUpcomingMaintenanceWarningLogout(firstActiveRecord, logoutFn)
      } else {
        showUpcomingMaintenanceWarning(firstActiveRecord);
      }
    }
    dfd.resolve();
  }).fail(function() {
    // If it fails, resolve with empty records
    dfd.resolve();
  });
  return dfd.promise();
};
