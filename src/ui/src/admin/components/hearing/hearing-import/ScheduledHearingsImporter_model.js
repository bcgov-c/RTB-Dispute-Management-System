import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const EXPECTED_HEADER_ROWS = [
  `UserID,First Name,Last Name,Region,Date Assigned,Time,Priority`,
  `UserID,First Name,Last Name,Region,Date Assigned,Time,Priority,End Time`
];
const EXPECTED_CSV_LINE_LENGTHS = [7, 8];
const EXPECTED_PRIORITIES = {
  Emergency: true,
  Standard: true,
  Deferred: true,
  Duty: true
};
const MIN_START_TIME = Moment('6:00AM', 'h:mmA');
const MAX_START_TIME = Moment('9:00PM', 'h:mmA');

const userChannel = Radio.channel('users');

export default Backbone.Model.extend({
  defaults: {
    ERROR_REPORT_CODES: {
      0: 'CSV Format',
      1: 'Missing Values',
      2: 'Staff User IDs',
      3: 'Hearing Priorities',
      4: 'Hearing Dates',
      5: 'Hearing Start Times',
      6: 'Hearing End Times (optional)',
    },

    start_date: null,
    end_date: null
  },

  /* Setup filters.  If successfull, no response is returned.  If error, then an error string is returned */
  getFilters() {
    return [
      {
        errorCode: 0,
        // Invalid number of cols test
        filterFn(split_line) {
          
          if (!EXPECTED_CSV_LINE_LENGTHS.includes(split_line.length)) {
            return `Expected ${EXPECTED_CSV_LINE_LENGTHS.join(' or ')} items in the row, but saw ${split_line.length}`;
          }
        },
      },
      {
        errorCode: 1,
        // Empty values test
        filterFn(split_line) {
          if (_.any(split_line, function(val) { return !$.trim(val); })) {
            return `Empty value(s) detected`;
          }
        },
      },
      {
        errorCode: 2,
        // Staff/User ID test, all user cases
        filterFn(split_line) {
          const id_val = split_line[0],
            matches = /^ID\-(\d{1,})$/i.exec(id_val),
            user_id = _.isEmpty(matches) ? null : Number(matches[1]),
            user_model = userChannel.request('get:user', user_id);
          
          if (!user_id) {
            return `Invalid User ID format "${id_val}"`;
          }
          if (!user_model) {
            return `User ${id_val} is not a valid current user in the system`;
          }
          if (!user_model.isArbitrator()) {
            return `User ${id_val} is in the system but does not have the "Arbitrator" role`;
          }
        },
      },
      {
        errorCode: 3,
        // Priority test, string matches acceptable values
        filterFn(split_line) {
          const priority_string = split_line[6];
          if (!_.has(EXPECTED_PRIORITIES, priority_string)) {
            return `Invalid Priority value "${priority_string}".  Must be one of (${_.map(EXPECTED_PRIORITIES, (val, key) => key ).join(', ')})`;
          }
        }
      },
      {
        errorCode: 4,
        // Date test, and scheduled range test
        filterFn: _.bind(function(split_line) {
          const date_val = split_line[4],
            time_val = split_line[5],
            moment_date = Moment(`${date_val} ${time_val}`, 'DD-MMM-YY H:mm:SS');

          if (!moment_date.isValid()) {
            return `Invalid Hearing Date/Time format "${date_val} ${time_val}"`;
          }

          if (moment_date.isBefore(Moment(this.get('start_date')), 'days')) {
            return `Hearing date "${date_val} ${time_val}" is before the schedule period starting on ${Moment(this.get('start_date')).format('DD-MMM-YY')}`;
          }
          if (moment_date.isAfter(Moment(this.get('end_date')), 'days')) {
            return `Hearing date "${date_val} ${time_val}" is after the schedule period ending on ${Moment(this.get('end_date')).format('DD-MMM-YY')}`;
          }
        }, this)
      },
      {
        errorCode: 5,
        // Start time test
        filterFn(split_line) {
          const time_val = split_line[5];
          const time = Moment(time_val, 'H:mm');
          if (time.isBefore(MIN_START_TIME) || time.isAfter(MAX_START_TIME)) {
            return `Invalid Start Time "${time_val}".  Must be between ${MIN_START_TIME.format('hh:mmA')} and ${MAX_START_TIME.format('hh:mmA')}`;
          }
        },
      },
      {
        errorCode: 6,
        // End time test (if provided)
        filterFn: _.bind(function(split_line) {
          if (split_line.length < 8) return;
          const start_time_val = split_line[5];
          const end_time_val = split_line[7];
          const start_time = Moment(start_time_val, 'H:mm');
          const end_time = Moment(end_time_val, 'H:mm');
          
          if (!end_time.isValid() || end_time.isBefore(MIN_START_TIME) || end_time.isAfter(MAX_START_TIME)) {
            return `Invalid End Time "${end_time_val}".  Must be between ${MIN_START_TIME.format('hh:mmA')} and ${MAX_START_TIME.format('hh:mmA')}`;
          } else if (end_time.isSameOrBefore(start_time, 'minute')) {
            return `End Time ${end_time.format('hh:mmA')} must be after the start time of ${start_time.format('hh:mmA')}`;
          }
        }, this)
      },
      
    ];
  },

  // Takes a file uploader instance and runs pre-processing on added CSV file
  startProcessFileUploader(fileUploader) {
    if (!fileUploader || !fileUploader.files.length || !/\.csv$/.test(fileUploader.files.at(0).get('file_name'))) {
      console.log("[Warning] No CSV file was added, nothing to process");
      return;
    }

    const file_model = fileUploader.files.at(0),
      reader = new FileReader();
    reader.onload = _.bind(function(evt) { this.processFileContents(evt.target.result); }, this);

    reader.onerror = _.bind(function() {
      generalErrorFactory.createHandler('foo', () => this.trigger('import:fail', {}));
    }, this);
    
    setTimeout(_.bind(function() {
      reader.readAsText(file_model.get('fileObj'), "UTF-8");
    }, this), 1200);
  },

  processFileContents(file_contents) {
    let lines = file_contents.split('\n'),
      index_offset = 1;
  
    const error_report = {};

    if (!lines || lines.length < 2) {
      error_report[0] = ['Row 0: No hearings in file'];
    } else if (lines.length && !EXPECTED_HEADER_ROWS.some(header => $.trim(header) === $.trim(lines[0]))) {
      error_report[0] = ['Row 0: Missing or invalid Header row'];
    } else {
      lines = lines.splice(1);
      index_offset = 2;
    }

    const filters = this.getFilters();
    _.each(lines, function(line, index) {
      const split_line = $.trim(line).split(',');
      _.each(filters, function(filterObj) {
        const error_msg = filterObj.filterFn(split_line);
        if (error_msg) {
          const formatted_error_msg = `Row ${index+index_offset}: ${error_msg}`;
          if (error_report[filterObj.errorCode]) {
            error_report[filterObj.errorCode].push(formatted_error_msg);
          } else {
            error_report[filterObj.errorCode] = [formatted_error_msg];
          }
        }
      });
    });

    if (_.isEmpty(error_report)) {
      this.trigger('import:success', { hearings_count: lines && lines.length ? lines.length : 0 });
    } else {
      this.trigger('import:fail', error_report);
    }
  },

  setDateRange(start_date, end_date) {
    this.set('start_date', start_date);
    this.set('end_date', end_date);
  }

});