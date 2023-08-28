import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const documentsChannel = Radio.channel('documents');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');
const noticeChannel = Radio.channel('notice');

const EMAIL_CONTENT_CLASS = 'email-content';
const EMAIL_TABLE_IGNORE_CLASS = 'editor-ignore';
const EMAIL_P_IGNORE_CLASS = 'clearfloats';
const EMAIL_ONLY_CLASS = `show-if-email`;
const PICKUP_NOTICE_ONLY_CLASS = `show-if-pickup-confirmation`;

const getDateDisplayWithOffsetFn = (offset) => {
  const timezone = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
  return Formatter.toDateDisplay(Moment.tz({}, timezone).add(offset, 'days'), timezone);
};

// By default, clear all styles entered. NOTE:
// `css(attr, '');` removes that property from an element if it has already been directly applied, whether in the HTML style attribute,
// through jQuery's .css() method, or through direct DOM manipulation of the style property. It does not, however, remove a style that has
// been applied with a CSS rule in a stylesheet or <style> element.
const defaultBlankCss = {
  fontSize: '',
  fontWeight: '',
  padding: '',
  margin: '',
  color: '',
  listStyleType: '',
  display: '',
  height: '',
  border: '',
  borderTop: '',
  width: '',
  borderCollapse: '',
  borderSpacing: '',
};
const createCssResetData = (extraCss) => Object.assign({}, defaultBlankCss, extraCss);
const defaultListItemCss = {
  fontSize: '16px',
  lineHeight: '21px',
  padding: '4px 0px 0px 0px',
  margin: '0px',
  color: '#727272',
};

// NOTE: This formatter will have to be maintained and updated as email templates are updated
const EmailTemplateFormatter = Marionette.Object.extend({
  EMAIL_ONLY_CLASS,
  PICKUP_NOTICE_ONLY_CLASS,
  EMAIL_CONTENT_CLASS,
  EMAIL_TABLE_IGNORE_CLASS,
  EMAIL_P_IGNORE_CLASS,
  // The scraped html for each element that is allowable in emails.  Avoid using these where manual style application can also be used;
  // that seems to be a better approach in Trumbowyg.  The templates are still provided here for reference.
  EMAIL_EDITOR_HTML_TEMPLATES: {
    p: `<p class="body-text" style="font-size: 16px; line-height: 21px; color: #666; padding: 0px 0px 0px 0px;margin: 0px 0px 10px 0px;"></p>`,
    h4: `<h4 class="body-title" style="font-size: 15px; font-weight: bold; padding: 0px; margin: 20px 0px 10px 0px;"></h4>`,
    ol: `<ol class="sublist" style="padding: 0px 0px 10px 0px; margin: 5px 0px 10px 30px; font-size:16px; line-height:21px;"><li style="padding: 4px 0px 0px 0px; margin: 0px; color: #727272; font-size:16px; line-height:21px;"></li></ol>`,
    ul: `<ul class="sublist" style="padding: 0px 0px 10px 0px; margin: 5px 0px 10px 30px; font-size:16px; line-height:21px;"><li style="padding: 4px 0px 0px 0px; margin: 0px; list-style-type: square; color: #727272; font-size:16px; line-height:21px;"></li></ul>`,
    hr: `<hr style="display:block; height:1px; border:0px; background-color:#dedede; margin:0px 0px 10px 0px; padding:0px;">`,

    table: `<table class="body-table" style="width:100%; border: solid 1px #dedede; border-collapse: collapse; border-spacing: 0;	margin-top: 15px; color: #666; font-size: 15px;"></table>`,
    td: `<td style="border: solid 1px #dedede; border-collapse: collapse; border-spacing: 0;"></td>`,

    p_spacer: `<p class="clearfloats" style="height:15px; margin:0px; padding:0px;">&nbsp;</p>`
  },
  DMS_LINK_CLASS: 'dms-link',
  DMS_P_CLASS: 'body-text',
  DMS_LIST_CLASS: 'sublist',

  DMS_P_CSS: createCssResetData({
    fontSize: '16px',
    lineHeight: '21px',
  }),
  DMS_LINK_CSS: createCssResetData({
    color: '#989898',
    textDecoration: 'underline'
  }),
  DMS_OL_LI_CSS: createCssResetData(defaultListItemCss),
  DMS_UL_LI_CSS: createCssResetData(Object.assign({}, defaultListItemCss, {
    listStyleType: 'square',
  })),

  // NOTE for tables: Don't reset all other vars to default
  // Many styles and widths are set via the resize plugin, so leave them
  DMS_TABLE_CSS: ({
    border: 'solid 1px #dedede',
    borderCollapse: 'collapse',
    borderSpacing: '0',
    marginTop: '15px',
    color: '#666',
    fontSize: '15px'
  }),
  DMS_TABLE_TR_CSS: {
    margin: '0'
  },
  DMS_TABLE_TD_CSS: {
    border: 'solid 1px #dedede',
    borderCollapse: 'collapse',
    borderSpacing: '0',
    margin: '0',
    padding: '5px'
  },

  // Provides replacement functionality
  mergeFieldConversions: {
    '<file_number>': (contextData={}) => {
      const dispute = contextData?.dispute || disputeChannel.request('get');
      return dispute.get('file_number');
    },
    '{file_number}': (contextData={}) => {
      const dispute = contextData?.dispute || disputeChannel.request('get');
      return dispute.get('file_number');
    },
    '{now_plus_1_day}': () => getDateDisplayWithOffsetFn(1),
    '{now_plus_3_days}': () => getDateDisplayWithOffsetFn(3),
    '{now_plus_21_days}': () => getDateDisplayWithOffsetFn(21),
    '{primary_applicant_access_code}': (contextData={}) => {
      const primaryApplicant = contextData?.primary || participantsChannel.request('get:primaryApplicant');
      return primaryApplicant?.get('access_code');
    },
    '{primary_applicant_name}': (contextData={}) => {
      const primaryApplicant = contextData?.primary || participantsChannel.request('get:primaryApplicant');
      return primaryApplicant?.getContactName();
    },
    '{primary_applicant_first_name}': (contextData={}) => {
      const primaryApplicant = contextData?.primary || participantsChannel.request('get:primaryApplicant');
      const contactName = primaryApplicant?.getContactName();
      if (!contactName) return;
      const nameParts = String(contactName).split(/\s+/g);
      return nameParts.length ? nameParts[0] : contactName;
    },
    '{dispute_rental_address}': (contextData={}) => {
      const dispute = contextData?.dispute || disputeChannel.request('get');
      return dispute?.getCompleteAddress();
    },
    '{initial_submission_date}': (contextData={}) => {
      const dispute = contextData?.dispute || disputeChannel.request('get');
      return dispute?.get('submitted_date') ? Formatter.toFullDateDisplay(dispute.get('submitted_date')) : '';
    },
    '{comma_separated_respondent_list}': (contextData={}) => {
      const respondents = contextData?.respondents || participantsChannel.request('get:respondents');
      return respondents?.map(p => p.getDisplayName()).join(', ');
    },
    '{comma_separated_applicant_list}': (contextData={}) => {
      const applicants = contextData?.applicants || participantsChannel.request('get:applicants');
      return applicants?.map(p => p.getDisplayName()).join(', ');
    },
    '{dispute_access_url}': () => configChannel.request('get', 'DISPUTE_ACCESS_URL'),
    '{intake_url}': () => configChannel.request('get', 'INTAKE_URL'),
    '{additional_landlord_intake_url}': () => {
      const INTAKE_URL = configChannel.request('get', 'INTAKE_URL');
      return INTAKE_URL && INTAKE_URL.replace('/Intake', '/AdditionalLandlordIntake');
    },
    '{secondary_file_numbers}': (contextData={}) => {
      const targetHearing = contextData?.hearing || hearingChannel.request('get:latest');
      return targetHearing?.getSecondaryDisputeHearings()?.map(dh => dh.getFileNumber()).join(', ') || '-'
    },
    '{recipient_access_code}': (contextData={}) => contextData?.recipientModel?.get('access_code') || '',
    '{recipient_first_name}': (contextData={}) => contextData?.recipientModel?.get('first_name') || contextData?.recipientModel?.get('bus_contact_first_name') || '',
    '{notice_service_deadline_date}': (contextData={}) => {
      const notice = contextData?.notice || noticeChannel.request('get:active');
      return notice?.get('service_deadline_date') ? Formatter.toFullDateAndTimeDisplay(notice.get('service_deadline_date'), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING')) : '';
    },
    '{notice_service_second_service_deadline_date}': (contextData={}) => {
      const notice = contextData?.notice || noticeChannel.request('get:active');
      return notice?.get('second_service_deadline_date') ? Formatter.toFullDateAndTimeDisplay(notice.get('second_service_deadline_date'), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING')) : '';
    },
    '{linked_file_numbers}': (contextData={}) => {
      const targetHearing = contextData?.hearing || hearingChannel.request('get:latest');
      return targetHearing?.getDisputeHearings()?.map(dh => dh.getFileNumber()).join(', ') || '-'
    },
    '{hearing_start_date}': (contextData={}) => {
      const targetHearing = contextData?.hearing || hearingChannel.request('get:latest');
      return targetHearing?.get('hearing_start_datetime') ? Formatter.toFullDateAndTimeDisplay(targetHearing?.get('hearing_start_datetime'), configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING')) : '';
    }
  },

  validateMergeFields(html='') {
    if (!html) html = this.html;
    // Find any open merge fields that don't match
    
    const htmlOnly = html.replace(/<style.*?<\/style>/gms, '');

    // Current limitation - only { } style merge fields are validated    
    const mergePairs = [...htmlOnly.matchAll(/{.*?}/gms)];
    const mergeErrors = {};

    const allMergeKeys = {};
    [...Object.keys(this.mergeFieldConversions),
      ...Object.keys(this.mergeFieldRanges),
      ...Object.values(this.mergeFieldRanges).map(obj => obj.endTag)
    ].forEach(val => allMergeKeys[val] = true);
    
    mergePairs.forEach(pair => {
      if (!allMergeKeys[pair[0]]) mergeErrors[pair[0]] = true;
    });
    
    return Object.keys(mergeErrors);
  },

  mergeFieldRanges: {
    '{start_show_paper}': {
      endTag: '{end_show_paper}',
      validate() {
        const dispute = disputeChannel.request('get');
        return dispute && dispute.isCreatedPaper();
      }
    },
    '{start_show_created_online}': {
      endTag: '{end_show_created_online}',
      validate() {
        const dispute = disputeChannel.request('get');
        return dispute && dispute.isCreatedIntake();
      }
    },
    '{start_show_corrected}': {
      endTag: '{end_show_corrected}',
      validate(contextData={}) {
        return contextData && contextData.outcomeDocFiles?.[0]?.get('file_sub_type') === configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_CORR');
      }
    },
    '{start_show_reviewed}': {
      endTag: '{end_show_reviewed}',
      validate(contextData={}) {
        return contextData && contextData.outcomeDocFiles?.[0]?.get('file_sub_type') === configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_REVIEW');
      }
    },
    '{start_show_op}': {
      endTag: '{end_show_op}',
      validate(contextData={}) {
        const opCode = "OP";
        return contextData && contextData.outcomeDocFiles?.filter(docFile => {
          const docConfig = documentsChannel.request('config:file', docFile.get('file_type'));
          return docConfig?.code === opCode;
        }).length;
      }
    },
    '{start_show_mn}': {
      endTag: '{end_show_mn}',
      validate(contextData={}) {
        const mnCode = "MN";
        return contextData && contextData.outcomeDocFiles?.filter(docFile => {
          const docConfig = documentsChannel.request('config:file', docFile.get('file_type'));
          return docConfig?.code === mnCode;
        }).length;
      }
    },
    '{start_show_ars_deadline}': {
      endTag: '{end_show_ars_deadline}',
      validate(contextData={}) {
        const notice = contextData?.notice || noticeChannel.request('get:active');
        return notice?.get('has_service_deadline');
      }
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['html', 'emailModel']);
    if (this.html && this.html.length) {
      this.createMergeHtml();
    }
  },

  load(html, contextData={}) {
    this.emailModel = null;
    this.html = html;
    this.createMergeHtml(contextData);
  },

  createMergeHtml(contextData={}) {
    this.mergedHtml = this.applyConversionsTo(this.html, contextData);
  },

  applyConversionsTo(html='', contextData={}) {
    let mergedHtml = html;
    const allMergeFieldConversions = Object.assign({}, this.mergeFieldConversions);

    Object.keys(this.mergeFieldRanges).forEach(mergeRangeStart => {
      const mergeRangeEnd = this.mergeFieldRanges[mergeRangeStart].endTag;
      const isValid = this.mergeFieldRanges[mergeRangeStart].validate.bind(this)(contextData);
      const regExp = new RegExp(`${mergeRangeStart}.*?${mergeRangeEnd}`, 'gms');
      if (isValid) {
        // Remove tags only - treat them as merge fields and remove them on next step
        allMergeFieldConversions[mergeRangeStart] = '';
        allMergeFieldConversions[mergeRangeEnd] = '';
      } else {
        // Otherwise, remove all text between the merge tags, including tags
        mergedHtml = mergedHtml.replaceAll(regExp, '');
      }
    });

    Object.keys(allMergeFieldConversions).forEach(mergeField => {
      const fieldConversion = allMergeFieldConversions[mergeField];
      mergedHtml = mergedHtml.replaceAll(mergeField, _.isFunction(fieldConversion) ? fieldConversion.bind(this)(contextData) : fieldConversion);
    });

    return mergedHtml;
  },

  getHtml() {
    return this.html;
  },

  getMergedHtml() {
    return this.mergedHtml;
  },

  // If no email content tag is found, returns full passed-in html
  getEmailContentFromHtml(fullHtmlStr) {
    let html = fullHtmlStr;
    try {
      const tempEle = $('<div></div>');
      tempEle.html(fullHtmlStr);
      const emailContent = tempEle.find(`.${EMAIL_CONTENT_CLASS}`)[0];
      html = $.trim($(emailContent).html());
    } catch (err) {
      console.log(err);
    }
    return html;
  },

});

const _emailTemplateFormatterInstance = new EmailTemplateFormatter();
export default _emailTemplateFormatterInstance;
