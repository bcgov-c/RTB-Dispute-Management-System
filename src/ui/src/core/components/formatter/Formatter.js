/**
 * @fileoverview - The Formatter singleton object contains various display and formatting methods.  It can be injected into HTML
 * templates and those formatting methods can be directly invoked.
 * The Formatter can be obtained by using the formatterChannel, or `import`ing it directly.
 *
 * @class core.components.formatter.Formatter
 * @memberof core.components.formatter
 * @augments Marionette.Object
 */
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputModel from '../input/Input_model';
import Filesize from 'filesize';

const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const statusChannel = Radio.channel('status');

// Inject the Formatter instance into templates and use its conversion methods
const Formatter = Marionette.Object.extend({
  channelName: 'formatter',

  radioRequests: {
    get: function() { return this; }
  },

  _toDateTimeDisplay(dateString, formattingString, timezoneString=null) {
    if (dateString === null || typeof dateString === "undefined" || dateString === "" || !formattingString) {
      return dateString;
    }
    let momentDate = Moment(dateString);
    try {
      // Apply any timezone offsets first
      if (timezoneString) {
        momentDate = Moment.tz(momentDate, timezoneString);
      }

      momentDate = Moment(momentDate, InputModel.getDateFormat());

      // If date was not valid, then re-initialize it using datestring
      if (!momentDate.isValid()) {
        momentDate = Moment(dateString);
      }
    } catch (err) {
      return dateString;
    }

    return momentDate.format(formattingString);
  },

  toIfUnmodifiedDate(dateString) {
    let ifUnmodifiedDateString = Moment(dateString).toISOString();
    if (ifUnmodifiedDateString === null) {
      ifUnmodifiedDateString = Moment(dateString, 'YYYY-MM-DDTHH:mm:ss.ff').toISOString();
    }
    if (ifUnmodifiedDateString === null) {
      console.log(`[Warning] Couldn't parse date string`);
      return ifUnmodifiedDateString;
    }
    // Remove 'Z' because the server does not accept it
    ifUnmodifiedDateString = ifUnmodifiedDateString.slice(-1) === 'Z' ? ifUnmodifiedDateString.slice(0, -1) : ifUnmodifiedDateString;
    //  Javascript Dates (and Moment, since it is a wrapper to them) only hold 3 millisecond digits
    //  While .NET backend returns 7 digits of precision for milliseconds
    //  So here, pad the millisecond count with '9's to get it to 7 digits and make sure that those digits won't matter for comparison
    return ifUnmodifiedDateString + '9999';
  },

  toLeftPad(str='', padding_character='0', padding_length=2) {
    return String(Array(padding_length).join(padding_character) + str).slice(-1*padding_length);
  },

  toTrimmedString(str, charactersToTrimAt) {
    if ($.trim(str).length <= charactersToTrimAt) return $.trim(str);
    else return `${$.trim(str).slice(0, charactersToTrimAt)}...`;
  },


  toPhoneDisplay(phone_number, extension=null) {
    if (phone_number === null || typeof phone_number === "undefined") {
      return phone_number;
    }
    let phone_display = '';
    if (phone_number.length === 11) {
      phone_display = phone_number.slice(0,1) + ' ';
      phone_number = phone_number.slice(1);
    }
    if (phone_number.length === 10) {
      phone_display += '('+phone_number.slice(0,3)+') '+phone_number.slice(3,6)+'-'+phone_number.slice(6);
    } else {
      phone_display += phone_number;
    }
    return `${phone_display}${extension? `ext ${extension}` : ''}`;
  },

  toDurationFromSecs(seconds, options={ no_minutes: false }) {
    if (seconds < 0) {
      return "";
    } else if (seconds > 0 && seconds < 60) {
      return "0m"
    }
    
    const days = Math.floor(seconds / (3600*24));
    seconds -= days * 3600 * 24;
    let hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    //if no_minutes = true then we round to the closes hour and set minutes to 0 so that it does not display. HOWEVER, minutes are displayed if hours < 1
    if (options.no_minutes && hours > 1) {
        minutes > 29 ? hours += 1 : null;
        minutes = 0;
    }

      return `${days ? `${days}d ` : '' }${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m` : ''}`;
  },

  toDateDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'MMM D, YYYY', timezoneString);
  },

  toFullDateDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'MMMM D, YYYY', timezoneString);
  },

  toLastModifiedTimeDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'ddd, hh:mmA', timezoneString);
  },

  toTimeDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'h:mm A', timezoneString);
  },

  toDateAndTimeDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'MMM D, YYYY h:mm A', timezoneString);
  },

  toFullDateAndTimeDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'MMMM D, YYYY, h:mm A', timezoneString);
  },

  toDateAndTimeWithSecondsDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'MMM D, YYYY h:mm:ss A', timezoneString);
  },

  toWeekdayDateDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'dddd, MMMM D, YYYY', timezoneString);
  },

  toWeekdayShortDateDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'dddd, MMM D', timezoneString);
  },

  toWeekdayShortDateYearDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'dddd, MMM D YYYY', timezoneString);
  },

  toShortWeekdayShortDateYearDisplay(dateString, timezoneString) {
    return this._toDateTimeDisplay(dateString, 'ddd, MMM D YYYY', timezoneString);
  },

  toPeriodFullDateDisplay(periodModel) {
    // Add a correction 6 hours to force the end day selection to be correct
    const endDate = Moment(periodModel.get('period_end')).subtract(6, 'hours');
    return `${this.toPeriodDateDisplay(periodModel.get('period_start'))} to ${this.toPeriodDateDisplay(endDate)}`;
  },

  toPeriodDateDisplay(dateString) {
    const periodFormatString = `ddd - MMM D, YYYY`;
    return this._toDateTimeDisplay(dateString, periodFormatString);
  },

  toIcsDateDisplay(dateString) {
    return `${Moment(dateString).toISOString().replace(/\.\d{3}Z$/, '').replace(/[\.\-\:]/g, '')}Z`;
  },

  toAmountDisplay(amount, no_cents) {
    if (amount === null || typeof amount === "undefined") {
      return amount;
    }
    if (isNaN(parseFloat(amount))) {
        return amount;
    }
    amount = parseFloat(amount).toFixed(2);
    let comma_amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (no_cents === true) {
      comma_amount = comma_amount.indexOf('.') !== -1 ? comma_amount.split('.')[0] : comma_amount;
    } else {
      comma_amount = comma_amount.indexOf('.') === -1 ? comma_amount + '.00' : comma_amount;
    }
    return '$' + comma_amount;
  },

  toAmountDisplayWithNegative(amount, no_cents, use_html=true) {
    const absAmountDisplay = this.toAmountDisplay(Math.abs(amount), no_cents);
    if (amount < 0) {
      return use_html ? `<span class="formatter-negative">(${absAmountDisplay})</span>` : `-${absAmountDisplay}`;
    } else {
      return absAmountDisplay;
    }
  },

  toPartiesDisplay(applicants=[], respondents=[], options={}) {
    const NONE_ADDED_HTML = '<i>None added</i>';
    const getPartyNamesFromParticipants = (participants=[]) => {
      const filteredPartyNames = participants.filter(p => p.isPersonOrBusiness()).map(p => p.getDisplayName());
      return filteredPartyNames.length ? filteredPartyNames.join(', ') : NONE_ADDED_HTML;
    };

    const applicantsDisplay = getPartyNamesFromParticipants(applicants);
    const respondentsDisplay = getPartyNamesFromParticipants(respondents);
    
    return `${options.uppercase && applicantsDisplay? applicantsDisplay.toUpperCase() : applicantsDisplay }&rarr;${options.uppercase && respondentsDisplay ? respondentsDisplay.toUpperCase() : respondentsDisplay}`;
  },

  toPercentageDisplay(dividend, divisor) {
    if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor === 0) return NaN;
    return `${((dividend / divisor) * 100).toFixed(1)}%`;
  },
  
  toIssueCodesDisplay(claimCollection) {
    if (!claimCollection instanceof Backbone.Collection) {
      return null;
    }

    return claimCollection.map(claim => claim.getClaimCodeReadable()).filter(c => c).join(', ');
  },

  toDisputeCreationMethodDisplay(source) {
    const DISPUTE_CREATION_METHOD_DISPLAY = configChannel.request('get', 'DISPUTE_CREATION_METHOD_DISPLAY') || {};
    return _.has(DISPUTE_CREATION_METHOD_DISPLAY, source) ? DISPUTE_CREATION_METHOD_DISPLAY[source] : '-';
  },

  toUrgencyDisplay(urgency, options={urgencyColor: false}) {
    const DISPUTE_URGENCY_DISPLAY = configChannel.request('get', 'DISPUTE_URGENCY_DISPLAY') || {};
    if (!options.urgencyColor) return _.has(DISPUTE_URGENCY_DISPLAY, urgency) ? DISPUTE_URGENCY_DISPLAY[urgency] : '-';

    let urgencyCssClass = '';
    if(Number(urgency) === configChannel.request('get', 'DISPUTE_URGENCY_EMERGENCY')) urgencyCssClass = 'urgency-emergency';
    else if (Number(urgency) === configChannel.request('get', 'DISPUTE_URGENCY_REGULAR')) urgencyCssClass = 'urgency-regular';
    else if (Number(urgency) === configChannel.request('get', 'DISPUTE_URGENCY_DEFERRED')) urgencyCssClass = 'urgency-deferred';

    return  _.has(DISPUTE_URGENCY_DISPLAY, urgency) ? `<span class="${urgencyCssClass}">${DISPUTE_URGENCY_DISPLAY[urgency]}</span>` : '-'
  },

  toComplexityDisplay(complexity) {
    const DISPUTE_COMPLEXITY_DISPLAY = configChannel.request('get', 'DISPUTE_COMPLEXITY_DISPLAY') || {};
    return _.has(DISPUTE_COMPLEXITY_DISPLAY, complexity) ? DISPUTE_COMPLEXITY_DISPLAY[complexity] : '-'
  },

  toStatusDisplay(status) {
    return statusChannel.request('get:status:display', status);
  },

  toStageDisplay(stage) {
    return statusChannel.request('get:stage:display', stage);
  },

  toProcessDisplay(process) {
    const PROCESS_DISPLAY = configChannel.request('get', 'PROCESS_DISPLAY');
    return _.has(PROCESS_DISPLAY, process) ? PROCESS_DISPLAY[process] : '-';
  },

  toRentIntervalDisplay(rent_interval) {
    const mappings = _.object([
      [String(configChannel.request('get', 'RENT_INTERVAL_MONTHLY_FIRST')), 'First day of the month'],
      [String(configChannel.request('get', 'RENT_INTERVAL_MONTHLY_LAST')), 'Last day of the month'],
      [String(configChannel.request('get', 'RENT_INTERVAL_MONTHLY_MIDDLE')), '15th day of the month']
    ]);
    return !$.trim(rent_interval) ? '-' : _.has(mappings, rent_interval) ? mappings[rent_interval] : rent_interval;
  },

  toHearingTypeDisplay(hearing_type) {
    const HEARING_TYPE_DISPLAY = configChannel.request('get', 'HEARING_TYPE_DISPLAY');
    return hearing_type && _.has(HEARING_TYPE_DISPLAY, hearing_type) ? HEARING_TYPE_DISPLAY[hearing_type] : '-';
  },

  toHearingOptionsByDisplay(package_display_method) {
    const HEARING_OPTIONS_BY_DISPLAY = configChannel.request('get', 'HEARING_OPTIONS_BY_DISPLAY');
    return package_display_method && _.has(HEARING_OPTIONS_BY_DISPLAY, package_display_method) ? HEARING_OPTIONS_BY_DISPLAY[package_display_method] : '-';
  },

  toHearingTypeAndTimeDisplay(hearingModel) {
    if (!hearingModel) {
      return;
    }
    return `${this.toHearingTypeDisplay(hearingModel.get('hearing_type'))} - ${this.toTimeDisplay(hearingModel.get('local_start_datetime'))}, ${this.toDateDisplay(hearingModel.get('local_start_datetime'))}`;
  },

  toKnownContactReviewDisplay(knownContact) {
    const PARTICIPANT_KNOWN_CONTACT_NO_ADDR_DISPLAY = configChannel.request('get', 'PARTICIPANT_KNOWN_CONTACT_NO_ADDR_DISPLAY') || {};
    return PARTICIPANT_KNOWN_CONTACT_NO_ADDR_DISPLAY[knownContact] || '-';
  },

  toNoticeMethodDisplay(notice_method) {
    const NOTICE_METHOD_DISPLAY = configChannel.request('get', 'NOTICE_METHOD_TYPES_DISPLAY');
    return _.has(NOTICE_METHOD_DISPLAY, notice_method) ? NOTICE_METHOD_DISPLAY[notice_method] : notice_method;
  },

  toFeeTypeDisplay(feeType) {
    return !feeType ? null :
      feeType === configChannel.request('get', 'PAYMENT_FEE_TYPE_INTAKE') ? configChannel.request('get', 'PAYMENT_FEE_NAME_INTAKE') :
      feeType === configChannel.request('get', 'PAYMENT_FEE_TYPE_REVIEW') ? configChannel.request('get', 'PAYMENT_FEE_NAME_REVIEW') :
      feeType === configChannel.request('get', 'PAYMENT_FEE_TYPE_INTAKE_UNIT_BASED') ? configChannel.request('get', 'PAYMENT_FEE_NAME_INTAKE_UNIT_BASED') :
      configChannel.request('get', 'PAYMENT_FEE_NAME_OTHER');
  },

  toPaymentMethodDisplay(paymentMethod) {
    const PAYMENT_METHOD_DISPLAY = configChannel.request('get', 'PAYMENT_METHOD_DISPLAY') || {};
    return PAYMENT_METHOD_DISPLAY[paymentMethod] || null;
  },

  toUploadedFilesDisplay(fileModels=[]) {
    if (!fileModels.some(fileModel => fileModel.isUploaded())) {
      // If not files uploaded, return nothing, not even span wrapper
      return;
    }
    const COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    let uploadedFilesString = '<span class="dms__files-display__container">';
    (fileModels || []).forEach(fileModel => {

      if (fileModel.isUploaded()) {
        const fileString = `
          <span class="dms__file-display__container">
            <img src="${COMMON_IMAGE_ROOT}Icon_File_email.png" class="er-file-icon" style="padding: 0px; position:relative; top:0px">
            <span class="er-filename dms__file-display__name" style="word-break:break-all; overflow-wrap:break-word; -ms-word-break:break-all; word-wrap:break-word;">${fileModel.get('file_name')}</span>
            <span class="er-filesize dms__file-display__sizes" style="color:#999999; padding-right:5px; font-size:15px;">(${this.toFileSizeDisplay(fileModel.get('file_size'))})<span class="dms__file__comma">,</span></span>
          </span>`;
        uploadedFilesString += fileString;
      }
    });
    
    const uploadedFilesHtml = $(`${$.trim(uploadedFilesString)}</span>`);
    const lastCommaEle = uploadedFilesHtml.find('.dms__file-display__container:last-child .dms__file__comma');
    lastCommaEle.remove();
    return uploadedFilesHtml.html();
  },

  // NOTE: Does this break the pattern of formatter only being used for displays?  Now it has some business logic
  getNoticeDeliveryMethodsFromCodeList(codeList) {
    const ALL_SERVICE_METHODS = configChannel.request('get', 'ALL_SERVICE_METHODS') || {};
    const NOTICE_METHOD_TYPES_DISPLAY = configChannel.request('get', 'NOTICE_METHOD_TYPES_DISPLAY') || {};

    const optionsToReturn = (codeList || []).filter(configCode => ALL_SERVICE_METHODS[configCode]).map(configCode => {
      const configValue = ALL_SERVICE_METHODS[configCode];
      // Always cast as strings, because dropdowns can only handle strings in optionData
      return { value: String(configValue), text: NOTICE_METHOD_TYPES_DISPLAY[configValue] || '-' };
    });

    return !_.isEmpty(optionsToReturn) ? optionsToReturn : null;
  },

  getServiceTypeOptions() {
    const SERVICE_DATE_USED_DISPLAY = configChannel.request('get', 'SERVICE_DATE_USED_DISPLAY') || {};
    return Object.entries(SERVICE_DATE_USED_DISPLAY).map(([value, text]) => ({ value: String(value), text }));
  },

  getServiceDeliveryMethods() {
    const SERVICE_METHOD_TYPE_CODES = configChannel.request('get', 'SERVICE_METHOD_TYPE_CODES');
    return this.getNoticeDeliveryMethodsFromCodeList(SERVICE_METHOD_TYPE_CODES);
  },

  getClaimDeliveryMethods() {
    const CLAIM_NOTICE_METHOD_TYPE_CODES = configChannel.request('get', 'CLAIM_NOTICE_METHOD_TYPE_CODES');
    return this.getNoticeDeliveryMethodsFromCodeList(CLAIM_NOTICE_METHOD_TYPE_CODES);
  },

  decodeHtmlEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  },

  encodeHtmlEntities(htmlString) {
    return $('<div/>').text(htmlString).html();
  },

  toDuration(start_date, end_date) {
    if (!start_date || !end_date) {
      return null;
    }
    start_date = Moment(start_date);
    end_date = Moment(end_date);
    
    const ms = end_date.diff(start_date),
      duration = Moment.duration(ms);

    // NOTE: To fix a bug where 2 hr diff would show as 1 hr 59 min
    if (duration.seconds() === 59) {
      duration.add(1, 'second');
    }

    const duration_hours = duration.hours(),
      duration_minutes = duration.minutes();

    let duration_string = `${duration_hours > 0 ? (duration_hours + ' Hours ') : ' '}${duration_minutes > 0 ? (duration_minutes + ' Minutes') : ''}`;

    // Fix singular vs plurals
    if (duration_hours === 1) {
      duration_string = duration_string.replace('Hours', 'Hour');
    }
    if (duration_minutes === 1) {
      duration_string = duration_string.replace('Minutes', 'Minute');
    }
    return duration_string;
  },

  getBlocksDurationDisplay(blocks=[]) {
    // Return the sum of durations of all blocks as a fraction of an 8-hour working day
    return Number(blocks.reduce((memo, block) => block.getBlockDuration() + memo, 0) / 28800000)?.toFixed(1);  
  },

  toUserDisplay(user_id) {
    return userChannel.request('get:user:name', user_id);
  },

  toFileSizeDisplay(numBytes, filesizeOptions) {
    return Filesize(numBytes, filesizeOptions || {});
  },

  capitalize(s) {
    s = $.trim(s);
    return s.charAt(0).toUpperCase() + s.slice(1);
  },

  fromUTCDateString(dateString) {
    if (!dateString) {
      return dateString;
    }
    return Moment(dateString).toISOString();
  },

  toUserLevelDisplay(userData) {
    const engagementType = userData.getRoleEngagement();
    const subType = userData.getRoleSubtypeId();
    if(!engagementType || !subType) return;

    let level = '';
    switch(engagementType) {
      case 1: case 2: level = 'E'; break;
      case 3: case 4: level = 'C'; break;
      default: return '';
    }

    switch(subType) {
      case 21: level += '1'; break;
      case 22: level += '2'; break;
      case 23: level += 'T'; break;
      case 24: level += 'A'; break;
      case 25: level += '3'; break;
      default: return '';
    }

    return level;
  },

  toUrlDisplay(text, link) {
    return `<a href="${link}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  },

  /**
   * 
   * @param {Integer} unitType - 
   */
  toUnitTypeDisplay(unitType, unitTypeText='') {
    unitType = unitType ? String(unitType) : unitType;
    const RENT_UNIT_TYPE_OTHER = String(configChannel.request('get', 'RENT_UNIT_TYPE_OTHER') || ''); 
    const RENT_UNIT_TYPE_DISPLAY = configChannel.request('get', 'RENT_UNIT_TYPE_DISPLAY') || {};
    
    const unitTypeDisplay = unitType && (
      unitType === RENT_UNIT_TYPE_OTHER ? unitTypeText :
      _.has(RENT_UNIT_TYPE_DISPLAY, unitType) ? RENT_UNIT_TYPE_DISPLAY[unitType] : null
    );
    return unitTypeDisplay;
  },

  toScheduleRequestStatusDisplay(statusValue) {
    return configChannel.request('get', 'SCHEDULE_REQUEST_STATUS_DISPLAY')[statusValue];
 },

 getProvinceStringFromAlphaCode(alphaCode='') {
  if (!alphaCode) return;

  return configChannel.request('get', 'PROVINCE_CODE_MAPPINGS')?.[`${alphaCode}`.toUpperCase()];
 }

});

export default new Formatter();
