/**
 * Contains configuration values that are included with the build, so it is harder to change.
 * @namespace core.components.config.InternalConfig
 * @memberof core.components.config
 */

export default {
  SERVER_DATE_FORMAT: "YYYY-MM-DD",
  SERVER_TIME_FORMAT: "HH:mm:00.000",
  SERVER_DATE_TIME_JOIN: "T",
  SYSTEM_USER_ID: -999,
  SYSTEM_USER_NAME: "System",

  RTB_OFFICE_TIMEZONE_STRING: "America/Los_Angeles",
  RTB_STAFF_CODE_ENCODED: "KlJ0QnJ0YmNvZGUxOA==",
  SBC_STAFF_CODE_ENCODED: "KlNiQ3J0YmNvZGUxOA==",
  RTB_STAFF_USERNAME_DISPLAY: "Office User",

  STAFF_BACKDATE_OFFSET: 35,

  MAINTENANCE_SYSTEM_ID_ALL: 1,
  MAINTENANCE_SYSTEM_ID_INTAKE: 2,
  MAINTENANCE_SYSTEM_ID_DISPUTEACCESS: 3,
  MAINTENANCE_SYSTEM_ID_ADMIN: 4,
  MAINTENANCE_SYSTEM_ID_OFFICE: 5,
  MAINTENANCE_SYSTEM_ID_CEU: 5,

  SYSTEM_LOGIN_TYPE_SITEMINDER: 2,
  SYSTEM_LOGIN_OVERRIDE_CODES: [
    "OG1paGFybG93",
    "MTFjaHJlbm5pZQ==", // CR and MH siteminder accounts
    "MTVtaWhhcmxvdw==",
    "MTBjaHJlbm5pZQ==",
  ], // dev-dms CR MH siteminder account

  ERROR_SITE_INTAKE: 1,
  ERROR_SITE_DISPUTEACCESS: 2,
  ERROR_SITE_OFFICE: 3,
  ERROR_SITE_ADMIN: 4,
  ERROR_SITE_ADDITIONAL_INTAKE: 5,
  ERROR_SITE_CEU: 6,
  ERROR_TYPE_GENERAL: 1,
  ERROR_TYPE_MANUAL: 2,
  ERROR_TYPE_SERVER_ERROR: 3,

  EXTERNAL_DA_ACTION_CONTACT: 1,
  EXTERNAL_DA_ACTION_EVIDENCE: 2,
  EXTERNAL_DA_ACTION_NOTICE: 3,
  EXTERNAL_DA_ACTION_SUBSERV: 4,
  EXTERNAL_DA_ACTION_REINSTATEMENT: 5,

  AMENDMENT_STATUS_ACCEPTED: 1,
  AMENDMENT_SOURCE_MANUAL: 1,

  AMENDMENT_TO_TYPE_DISPUTE: 1,
  AMENDMENT_TO_TYPE_PARTY: 2,
  AMENDMENT_TO_TYPE_ISSUE: 3,

  DISPUTE_TYPE_RTA: 1,
  DISPUTE_TYPE_MHPTA: 2,

  DISPUTE_SUBTYPE_LANDLORD: 0,
  DISPUTE_SUBTYPE_TENANT: 1,

  DISPUTE_CREATION_METHOD_INTAKE: 1,
  DISPUTE_CREATION_METHOD_MANUAL: 2,
  DISPUTE_CREATION_METHOD_ARI_C: 4,
  DISPUTE_CREATION_METHOD_ARI_E: 5,
  DISPUTE_CREATION_METHOD_PFR: 6,
  DISPUTE_CREATION_METHOD_ETL_SP: 99,

  DISPUTE_URGENCY_EMERGENCY: 1,
  DISPUTE_URGENCY_REGULAR: 2,
  DISPUTE_URGENCY_DEFERRED: 3,
  DISPUTE_URGENCY_DUTY: 4,

  DISPUTE_FILES_STORAGE_HOT: 1,
  DISPUTE_FILES_STORAGE_COLD: 2,

  RENT_UNIT_TYPE_OTHER: 7,

  ETL_GENERIC_ACCESS_CODE: "DontUse",

  DISPUTE_MIGRATION_TRUTH_DMS: 1,
  DISPUTE_MIGRATION_TRUTH_CMS: 2,

  DISPUTE_TENANCY_AGREEMENT_SIGNED_LANDLORDS_AND_TENANTS: 1,
  DISPUTE_TENANCY_AGREEMENT_SIGNED_LANDLORDS_ONLY: 2,
  DISPUTE_TENANCY_AGREEMENT_SIGNED_TENANTS_ONLY: 3,
  DISPUTE_TENANCY_AGREEMENT_SIGNED_NOT_SIGNED: 4,

  DISPUTE_FLAG_STATUS_ACTIVE: 1,
  DISPUTE_FLAG_STATUS_INACTIVE: 2,

  USER_ROLE_TYPE_INTERNAL: 1,
  USER_ROLE_TYPE_EXTERNAL: 2,
  USER_ROLE_TYPE_OFFICE: 5,

  USER_ROLE_GROUP_IO: 1,
  USER_ROLE_GROUP_ARB: 2,
  USER_ROLE_GROUP_ADMIN: 4,
  USER_ROLE_GROUP_MANAGEMENT: 5,
  USER_ROLE_GROUP_OTHER: 9,

  USER_ROLE_ACCESS_SUB_TYPE_CEU: 1,
  USER_ROLE_ACCESS_SUB_TYPE_REPORTS: 2,
  USER_ROLE_ACCESS_SUB_TYPE_CEU_REPORTS: 3,

  USER_SUBGROUP_STANDARD: 11,
  USER_SUBGROUP_SENIOR: 12,
  USER_SUBGROUP_SUPERVISOR: 13,
  USER_SUBGROUP_LVL1: 21,
  USER_SUBGROUP_LVL2: 22,
  USER_SUBGROUP_LVL3: 25,
  USER_SUBGROUP_ARB_LEAD: 23,
  USER_SUBGROUP_ADJUDICATOR: 24,
  USER_SUBGROUP_ADMIN: 41,

  USER_ENGAGEMENT_TYPE_FULL_TIME_EMPLOYEE: 1,
  USER_ENGAGEMENT_TYPE_PART_TIME_EMPLOYEE: 2,
  USER_ENGAGEMENT_TYPE_FULL_TIME_CONTRACTOR: 3,
  USER_ENGAGEMENT_TYPE_PART_TIME_CONTRACTOR: 4,

  INVALID_GEOZONE_CODE: 9,
  VICTORIA_GEOZONE_CODE: 1,
  KELOWNA_GEOZONE_CODE: 2,
  BURNABY_GEOZONE_CODE: 3,
  INVALID_GEOZONE_ERROR: 4,

  RENT_INTERVAL_MONTHLY_FIRST: 1,
  RENT_INTERVAL_MONTHLY_LAST: 2,
  RENT_INTERVAL_MONTHLY_MIDDLE: 3,

  CLAIM_GROUP_ROLE_APPLICANT: 1,
  CLAIM_GROUP_ROLE_RESPONDENT: 2,

  CLAIM_STATUS_NOT_VALIDATED: 1,
  CLAIM_STATUS_OPEN: 2,
  CLAIM_STATUS_WITHDRAWN: 3,
  CLAIM_STATUS_RESOLVED: 4,
  CLAIM_STATUS_DISMISSED: 5,
  CLAIM_STATUS_REMOVED: 6,
  CLAIM_STATUS_DELETED: 7,

  CLAIM_SOURCE_INTAKE: 1,
  CLAIM_SOURCE_AMENDMENT: 2,

  REMEDY_STATUS_NOT_SET: 0,
  REMEDY_STATUS_POSSESSION_GRANTED_2DAY: 1,
  REMEDY_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE: 2,
  REMEDY_STATUS_POSSESSION_GRANTED_OTHER_DATE: 3,
  REMEDY_STATUS_MONETARY_GRANTED: 4,
  REMEDY_STATUS_OTHER_ISSUE_GRANTED: 5,
  REMEDY_STATUS_DISMISSED_WITH_LEAVE: 10,
  REMEDY_STATUS_DISMISSED_NO_LEAVE: 11,
  REMEDY_STATUS_SETTLED: 15,
  REMEDY_STATUS_SETTLED_MONETARY: 16,
  REMEDY_STATUS_SETTLED_POSSESSION_2DAY: 17,
  REMEDY_STATUS_SETTLED_POSSESSION_SPECIFIC_DATE: 18,
  REMEDY_STATUS_SETTLED_POSSESSION_OTHER_DATE: 19,
  REMEDY_STATUS_NO_JURISDICTION: 20,
  REMEDY_STATUS_NOT_DECIDED: 21,
  REMEDY_STATUS_REMOVE_AMEND: 25,
  REMEDY_STATUS_REMOVE_SEVER: 30,

  REMEDY_SUB_STATUS_REAPPLY: 1,
  REMEDY_SUB_STATUS_NO_REAPPLY: 2,
  REMEDY_SUB_STATUS_POSSESSION_GRANTED_2DAY: 101,
  REMEDY_SUB_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE: 102,
  REMEDY_SUB_STATUS_POSSESSION_GRANTED_OTHER_DATE: 103,
  REMEDY_SUB_STATUS_DISMISSED_WITH_LEAVE: 105,
  REMEDY_SUB_STATUS_DISMISSED_NO_LEAVE: 106,
  REMEDY_SUB_STATUS_REMOVE_AMEND: 110,
  REMEDY_SUB_STATUS_REMOVE_SEVER: 115,
  
  REMEDY_STATUS_REASON_AMEND_REMOVED_BY_APPLICANT: 1,
  REMEDY_STATUS_REASON_SEVER_NOT_RELATED: 2,
  REMEDY_STATUS_REASON_AMEND_REMOVED_BY_RESPONDENT: 3,
  REMEDY_STATUS_REASON_AMEND_REMOVED: 4,
  
  REMEDY_SOURCE_INTAKE: 1,
  REMEDY_SOURCE_AMENDMENT: 2,

  PARTICIPANT_TYPE_BUSINESS: 1,
  PARTICIPANT_TYPE_PERSON: 2,
  PARTICIPANT_TYPE_AGENT_OR_LAWYER: 3,
  PARTICIPANT_TYPE_ADVOCATE_OR_ASSISTANT: 4,
  PARTICIPANT_TYPE_UI_ALL: 4,

  PARTICIPANT_STATUS_NOT_VALIDATED: 0,
  PARTICIPANT_STATUS_VALIDATED: 1,
  PARTICIPANT_STATUS_NOT_PARTICIPATING: 2,
  PARTICIPANT_STATUS_REMOVED: 4,
  PARTICIPANT_STATUS_DELETED: 5,

  PARTICIPANT_CONTACT_METHOD_EMAIL: 1,
  PARTICIPANT_CONTACT_METHOD_PHONE_MAIL: 2,

  HEARING_LINKING_SEARCH_TYPE_DISPUTE: 1,
  HEARING_LINKING_SEARCH_TYPE_HEARING: 2,

  HEARING_TYPE_CONFERENCE: 1,
  HEARING_TYPE_FACE_TO_FACE: 2,

  HEARING_METHOD_ADJUDICATION: 1,
  HEARING_METHOD_SETTLEMENT: 2,
  HEARING_METHOD_BOTH: 3,
  HEARING_METHOD_OTHER: 4,

  HEARING_PRIORITY_EMERGENCY: 1,
  HEARING_PRIORITY_STANDARD: 2,
  HEARING_PRIORITY_DEFERRED: 3,
  HEARING_PRIORITY_DUTY: 4,

  HEARING_PRIORITY_EMERGENCY_TEXT: "Emergency",
  HEARING_PRIORITY_STANDARD_TEXT: "Standard",
  HEARING_PRIORITY_DEFERRED_TEXT: "Deferred",
  HEARING_PRIORITY_DUTY_TEXT: "Duty",

  COMPLEXITY_SIMPLE: 1,
  COMPLEXITY_STANDARD: 2,
  COMPLEXITY_COMPLEX: 3,

  HEARING_PARTICIPATION_ASSOCIATION_APPLICANT: 1,
  HEARING_PARTICIPATION_ASSOCIATION_RESPONDENT: 2,

  DISPUTE_HEARING_ROLE_PRIMARY: 1,
  DISPUTE_HEARING_ROLE_SECONDARY: 2,

  DISPUTE_HEARING_LINK_TYPE_SINGLE: 1,
  DISPUTE_HEARING_LINK_TYPE_CROSS: 2,
  DISPUTE_HEARING_LINK_TYPE_JOINER: 3,
  DISPUTE_HEARING_LINK_TYPE_REPEATED: 4,
  DISPUTE_HEARING_LINK_TYPE_CROSS_REPEAT: 5,

  PROCESS_ORAL_HEARING: 1,
  PROCESS_WRITTEN_OR_DR: 2,
  PROCESS_REVIEW_REQUEST: 3,
  PROCESS_REVIEW_HEARING: 4,
  PROCESS_JOINER_REQUEST: 5,
  PROCESS_JOINER_HEARING: 6,
  PROCESS_RENT_INCREASE: 7,

  PROCESS_OUTCOME_OTHER: 14,

  EVIDENCE_METHOD_UPLOAD_NOW: 100,
  EVIDENCE_METHOD_UPLOAD_LATER: 101,
  EVIDENCE_METHOD_MAIL: 103,
  EVIDENCE_METHOD_DROP_OFF: 104,
  EVIDENCE_METHOD_CANT_PROVIDE: 105,

  EVIDENCE_CATEGORY_DEFAULT: 0,
  EVIDENCE_CATEGORY_MONETARY_WORKSHEET: 1,
  EVIDENCE_CATEGORY_TENANCY_AGREEMENT: 2,
  EVIDENCE_CATEGORY_NON_ISSUE_EVIDENCE: 3,
  EVIDENCE_CATEGORY_ISSUE: 4,
  EVIDENCE_CATEGORY_PAYMENT: 5,
  EVIDENCE_CATEGORY_DECISION: 6,
  EVIDENCE_CATEGORY_NOTICE: 7,
  EVIDENCE_CATEGORY_GENERAL: 8,
  EVIDENCE_CATEGORY_BULK: 9,
  EVIDENCE_CATEGORY_SERVICE_EVIDENCE: 10,
  EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL: 11,
  EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST: 12,

  COMMONFILE_TYPE_HELP_FILE: 1,
  COMMONFILE_TYPE_RTB_FORM: 2,
  COMMONFILE_TYPE_DOCUMENT: 4,
  COMMONFILE_TYPE_REPORT: 9,

  COMMONFILE_STATUS_ARCHIVED: 2,

  FILE_TYPE_USER_EXTERNAL_EVIDENCE: 1,
  FILE_TYPE_NOTICE: 2,
  FILE_TYPE_INTERNAL: 3,
  FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE: 4,
  FILE_TYPE_COMMON: 5,
  FILE_TYPE_SYSTEM: 6,
  FILE_TYPE_ANONYMOUS_EXTERNAL: 7,
  FILE_TYPE_OTHER: 8,
  FILE_TYPE_RECORDED_HEARING: 10,

  FILE_STATUS_NOT_REVIEWED: 0,
  FILE_STATUS_ACCEPTED: 1,
  FILE_STATUS_NOT_ACCEPTED: 2,

  FILE_METHOD_DONT_HAVE: 105,

  FILE_PACKAGE_TYPE_INTAKE: 1,
  FILE_PACKAGE_TYPE_EVIDENCE: 2,
  FILE_PACKAGE_TYPE_OFFICE: 3,
  FILE_PACKAGE_TYPE_LEGACY_SP: 4,

  SEND_METHOD_EMAIL: 1,
  SEND_METHOD_PICKUP: 2,
  SEND_METHOD_MAIL: 3,
  SEND_METHOD_OTHER: 4,

  NOTE_LINK_DISPUTE: 0,
  NOTE_LINK_PARTICIPANT: 1,
  NOTE_LINK_CLAIM: 2,
  NOTE_LINK_FILEDESCRIPTION: 3,
  NOTE_LINK_NOTICE: 4,
  NOTE_LINK_HEARING: 5,
  NOTE_LINK_EVIDENCE: 6,
  NOTE_LINK_DISPUTE_INFO: 7,
  NOTE_LINK_EVIDENCE_FILE: 8,
  NOTE_LINK_DECISION_FILE: 9,
  NOTE_LINK_LEGACY_AMENDMENT: 99,

  INTAKE_ADDRESS_STRING_COMPARE_MATCH_PERCENTAGE: 0.85,

  PAYMENT_FEE_TYPE_INTAKE: 1,
  PAYMENT_FEE_NAME_INTAKE: "Intake",
  PAYMENT_FEE_AMOUNT_INTAKE: 100,
  PAYMENT_FEE_DESCRIPTION_INTAKE: "Application payment due on submission",
  PAYMENT_FEE_DUE_DATE_DAY_OFFSET_INTAKE: 3,

  PAYMENT_FEE_TYPE_REVIEW: 2,
  PAYMENT_FEE_NAME_REVIEW: "Review Request",
  PAYMENT_FEE_AMOUNT_REVIEW: 50,
  PAYMENT_FEE_DESCRIPTION_REVIEW: "Fee for application for review consideration",
  PAYMENT_FEE_DUE_DATE_DAY_OFFSET_REVIEW: 3,

  PAYMENT_FEE_TYPE_OTHER: 3,
  PAYMENT_FEE_NAME_OTHER: "Other",

  PAYMENT_FEE_TYPE_INTAKE_UNIT_BASED: 4,
  PAYMENT_FEE_NAME_INTAKE_UNIT_BASED: 'Intake - Unit based',

  PAYMENT_METHOD_ONLINE: 1,
  PAYMENT_METHOD_OFFICE: 2,
  PAYMENT_METHOD_FEE_WAIVER: 3,

  PAYMENT_PROVIDER_BEANSTREAM: 1,

  PAYMENT_STATUS_PENDING: 1,
  PAYMENT_STATUS_APPROVED: 2,
  PAYMENT_STATUS_REJECTED: 3,
  PAYMENT_STATUS_CANCELLED: 4,
  PAYMENT_STATUS_CANCELLED_PAID: 5,

  EMAIL_MESSAGE_TYPE_NOTIFICATION: 0,
  EMAIL_MESSAGE_TYPE_SYSTEM: 1,
  EMAIL_MESSAGE_TYPE_CUSTOM: 2,
  EMAIL_MESSAGE_TYPE_RECEIPT: 3,
  EMAIL_MESSAGE_TYPE_PICKUP_CONFIRMATION: 4,
  EMAIL_MESSAGE_TYPE_PICKUP: 100,
  EMAIL_MESSAGE_TYPE_PICKUP_WITH_EMAIL: 101,
  EMAIL_MESSAGE_TYPE_NOT_SET: 99,

  EMAIL_BODY_TYPE_TEXT: 1,
  EMAIL_BODY_TYPE_HTML: 2,
  EMAIL_BODY_TYPE_MIXED: 3,

  EMAIL_ATTACHMENT_TYPE_FILE: 1,
  EMAIL_ATTACHMENT_TYPE_COMMONFILE: 2,

  EMAIL_TEMPLATE_GROUP_CUSTOM: 1,
  EMAIL_TEMPLATE_GROUP_NODRP: 2,
  EMAIL_TEMPLATE_GROUP_UPDATE: 3,
  EMAIL_TEMPLATE_GROUP_DELIVERY: 4,
  EMAIL_TEMPLATE_GROUP_OTHER: 5,
  EMAIL_TEMPLATE_GROUP_NOTIFICATION: 6,

  EMAIL_TEMPLATE_RECIPIENTS_PRIMARY: 1,
  EMAIL_TEMPLATE_RECIPIENTS_APPLICANTS: 2,
  EMAIL_TEMPLATE_RECIPIENTS_RESPONDENTS: 3,
  EMAIL_TEMPLATE_RECIPIENTS_ALL: 4,
  EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT: 5,
  EMAIL_TEMPLATE_RECIPIENTS_CUSTOM: 6,

  EMAIL_TEMPLATE_STATUS_DRAFT: 1,
  EMAIL_TEMPLATE_STATUS_ACTIVE: 2,

  EMAIL_MESSAGE_SUB_TYPE_INTAKE_UNPAID: 61,
  EMAIL_MESSAGE_SUB_TYPE_INTAKE_PAID: 62,
  EMAIL_MESSAGE_SUB_TYPE_DA_CORRECTION: 70,
  EMAIL_MESSAGE_SUB_TYPE_DA_CLARIFICATION: 71,
  EMAIL_MESSAGE_SUB_TYPE_DA_REVIEW: 72,
  EMAIL_MESSAGE_SUB_TYPE_DA_CONTACT_UPDATE: 73,
  EMAIL_MESSAGE_SUB_TYPE_DA_EVIDENCE: 74,
  EMAIL_MESSAGE_SUB_TYPE_DA_RESPONDENT_SERVICE: 75,
  EMAIL_MESSAGE_SUB_TYPE_DA_PAYMENT: 76,
  EMAIL_MESSAGE_SUB_TYPE_DA_SUB_SERVICE: 77,
  EMAIL_MESSAGE_SUB_TYPE_DA_AMENDMENT: 78,
  EMAIL_MESSAGE_SUB_TYPE_OS_CORRECTION: 80,
  EMAIL_MESSAGE_SUB_TYPE_OS_CLARIFICATION: 81,
  EMAIL_MESSAGE_SUB_TYPE_OS_REVIEW: 82,
  EMAIL_MESSAGE_SUB_TYPE_OS_AMENDMENT: 83,
  EMAIL_MESSAGE_SUB_TYPE_OS_SUB_SERVICE: 84,
  EMAIL_MESSAGE_SUB_TYPE_OS_FEE_WAIVER: 85,
  EMAIL_MESSAGE_SUB_TYPE_OS_PAYMENT: 86,
  EMAIL_MESSAGE_SUB_TYPE_OS_NEW_APPLICATION: 87,

  EMAIL_SEND_STATUS_UNSENT: 0,
  EMAIL_SEND_STATUS_SENT: 1,
  EMAIL_SEND_STATUS_PENDING: 2,
  EMAIL_SEND_STATUS_ERROR: 3,
  EMAIL_SEND_STATUS_READY_FOR_PICKUP: 100,
  EMAIL_SEND_STATUS_PICKED_UP: 101,
  EMAIL_SEND_STATUS_PICKUP_ABANDONED: 102,
  EMAIL_SEND_STATUS_PICKUP_CANCELLED: 103,

  EMAIL_SEND_METHOD_PARTICIPATION_ID: 1,
  EMAIL_SEND_METHOD_EMAIL_ADDRESS: 2,

  CONTACT_VERIFICATION_TYPE_EMAIL: 1,

  RECEIPT_TYPE_INTAKE_SUBMISSION: 1,
  RECEIPT_TYPE_OFFICE_SUBMISSION: 2,
  RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION: 3,

  RECEIPT_SUBTYPE_ONLINE_INTAKE: 1,
  RECEIPT_SUBTYPE_ARIC_PFR_INTAKE: 2,
  RECEIPT_SUBTYPE_OFFICE_NEW_DISPUTE_PARTIAL: 40,
  RECEIPT_SUBTYPE_OFFICE_NEW_DISPUTE: 41,
  RECEIPT_SUBTYPE_OFFICE_PAYMENT: 42,
  RECEIPT_SUBTYPE_OFFICE_FEE_WAIVER: 43,
  RECEIPT_SUBTYPE_OFFICE_AMENDMENT: 44,
  RECEIPT_SUBTYPE_OFFICE_SUB_SERVICE: 45,
  RECEIPT_SUBTYPE_OFFICE_CORRECTION: 46,
  RECEIPT_SUBTYPE_OFFICE_CLARIFICATION: 47,
  RECEIPT_SUBTYPE_OFFICE_REVIEW: 48,
  RECEIPT_SUBTYPE_DA_EVIDENCE: 60,
  RECEIPT_SUBTYPE_DA_CONTACT: 61,
  RECEIPT_SUBTYPE_DA_PAYMENT_OR_WAIVER: 62,
  RECEIPT_SUBTYPE_DA_SERVICE_PROOF: 63,
  RECEIPT_SUBTYPE_DA_CORRECTION: 64,
  RECEIPT_SUBTYPE_DA_CLARIFICATION: 65,
  RECEIPT_SUBTYPE_DA_REVIEW: 66,
  RECEIPT_SUBTYPE_DA_AMENDMENT: 67,

  TASK_TYPE_STANDARD: 1,
  TASK_TYPE_COMMUNICATION: 2,
  TASK_TYPE_SYSTEM: 3,

  TASK_SUB_TYPE_IO: 1,
  TASK_SUB_TYPE_ARB: 2,
  TASK_SUB_TYPE_ADMIN: 4,

  TASK_STATUS_INCOMPLETE: 0,
  TASK_STATUS_COMPLETE: 1,

  TASK_PRIORITY_UNSET: 0,
  TASK_PRIORITY_LOW: 1,
  TASK_PRIORITY_NORMAL: 2,
  TASK_PRIORITY_HIGH: 3,

  TASK_REQUEST_SOURCE_OFFICE: 1,
  TASK_REQUEST_SOURCE_DA: 2,

  TASK_LINK_EMAIL: 1,
  TASK_LINK_DOC_REQUEST: 2,
  TASK_LINK_SUB_SERVE: 3,
  
  PAYMENT_TRANSACTION_SITE_SOURCE_INTAKE: 1,
  PAYMENT_TRANSACTION_SITE_SOURCE_DISPUTEACCESS: 2,
  PAYMENT_TRANSACTION_SITE_SOURCE_OFFICE: 3,
  PAYMENT_TRANSACTION_SITE_SOURCE_ADMIN: 4,

  INVALID_AUDIT_LOG_ENDPOINTS: {
    "/amendment/": true,
    "/dispute/status/": true,
    "/emailtemplate": true,
    "/internaluserprofile/": true,
    "/internaluserrole/": true,
    "/accesscodelogin/": true,
    "/settings": true,
    "/userlogin/create": true,
    "/userlogin/update": true,
    "/userlogin/reset": true,
    "/users/authenticate": true,
    "/users/internaluserstatus": true,
    "/users/extendsession": true,
    "/users/logout": true,
  },

  HEARING_AUDIT_CHANGE_TYPE_DELETE_HEARING: 4,

  DISPUTE_CROSS_APP_PARENT: 1,
  DISPUTE_CROSS_APP_CHILD: 2,

  NOTICE_HEARING_TYPE_PARTICIPATORY: 1,
  NOTICE_HEARING_TYPE_NON_PARTICIPATORY: 2,

  NOTICE_ASSOCIATED_TO_APPLICANT: 1,
  NOTICE_ASSOCIATED_TO_RESPONDENT: 2,

  NOTICE_TYPE_GENERATED: 1,
  NOTICE_TYPE_UPLOADED: 2,
  NOTICE_TYPE_GENERATED_AMENDMENT: 3,
  NOTICE_TYPE_UPLOADED_AMENDMENT: 4,
  NOTICE_TYPE_UPLOADED_OTHER: 5,

  NOTICE_DELIVERY_TYPE_EMAIL: 1,
  NOTICE_DELIVERY_TYPE_PICKUP: 2,
  NOTICE_DELIVERY_TYPE_MAIL: 3,
  NOTICE_DELIVERY_TYPE_FAX: 4,
  NOTICE_DELIVERY_TYPE_USER: 5,
  NOTICE_DELIVERY_TYPE_EMAIL_AND_MAIL: 6,
  NOTICE_DELIVERY_TYPE_OTHER: 7,

  SERVICE_VALIDATION_EXTERNAL_CONFIRMED: 1,
  SERVICE_VALIDATION_INTERNAL_CONFIRMED: 2,
  SERVICE_VALIDATION_EXTERNAL_REFUTED: 3,
  SERVICE_VALIDATION_INTERNAL_REFUTED: 4,

  SERVICE_AUDIT_TYPE_NOTICE: 1,
  SERVICE_AUDIT_TYPE_FILE_PACKAGE: 2,

  SERVICE_AUDIT_HISTORY_TYPE_NOT_SERVED: 4,

  DASHBOARD_DISPUTE_SORT_CREATED_DATE: "1",
  DASHBOARD_DISPUTE_SORT_PAY_DATE: "2",
  DASHBOARD_DISPUTE_SORT_SUBMITTED_DATE: "3",
  DASHBOARD_DISPUTE_SORT_NOTICE_DATE: "4",
  DASHBOARD_DISPUTE_SORT_STATUS_DATE: "5",

  OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION: 1,
  OUTCOME_DOC_FILE_TYPE_OTHER: 99,
  OUTCOME_DOC_FILE_TYPE_EXTERNAL: 255,

  OUTCOME_DOC_FILE_SUB_TYPE_NEW: 1,
  OUTCOME_DOC_FILE_SUB_TYPE_CORR: 2,
  OUTCOME_DOC_FILE_SUB_TYPE_REVIEW: 3,

  OUTCOME_DOC_GROUP_TYPE_CUSTOM: 1,

  OUTCOME_DOC_GROUP_STATUS_ACTIVE: 1,
  OUTCOME_DOC_GROUP_STATUS_COMPLETED: 2,  

  OUTCOME_DOC_FILE_STATUS_ACTIVE: 1,
  OUTCOME_DOC_FILE_STATUS_PD_ERROR: 3,

  OUTCOME_DOC_FILE_SOURCE_COMPOSER: 1,
  OUTCOME_DOC_FILE_SOURCE_EXTERNAL: 2,
  OUTCOME_DOC_FILE_SOURCE_GENERATED: 3,

  OUTCOME_DOC_FILE_SUB_STATUS_NOT_SET: 0,
  OUTCOME_DOC_FILE_SUB_STATUS_NOT_STARTED: 1,
  OUTCOME_DOC_FILE_SUB_STATUS_IN_PROGRESS: 2,
  OUTCOME_DOC_FILE_SUB_STATUS_REVIEW: 3,
  OUTCOME_DOC_FILE_SUB_STATUS_COMPLETED: 4,

  OUTCOME_DOC_DELIVERY_PRIORITY_NOT_SET: 0,
  OUTCOME_DOC_DELIVERY_PRIORITY_LOW: 1,
  OUTCOME_DOC_DELIVERY_PRIORITY_NORMAL: 2,
  OUTCOME_DOC_DELIVERY_PRIORITY_HIGH: 3,

  OUTCOME_DOC_CONTENT_STATUS_WORKING: 1,
  OUTCOME_DOC_CONTENT_STATUS_DRAFT: 2,
  OUTCOME_DOC_CONTENT_STATUS_REVIEW: 3,
  OUTCOME_DOC_CONTENT_STATUS_FINAL: 4,

  OUTCOME_DOC_CONTENT_TYPE_DECISION_INFO: 1,
  OUTCOME_DOC_CONTENT_TYPE_HEARING_ATTENDANCE: 2,
  OUTCOME_DOC_CONTENT_TYPE_SERVICE_OF_NOTICE: 3,
  OUTCOME_DOC_CONTENT_TYPE_SERVICE_OF_EVIDENCE: 4,
  OUTCOME_DOC_CONTENT_TYPE_ISSUES: 6,
  OUTCOME_DOC_CONTENT_TYPE_BACKGROUND: 7,
  OUTCOME_DOC_CONTENT_TYPE_ANALYSIS: 8,
  OUTCOME_DOC_CONTENT_TYPE_CONCLUSION: 9,

  OUTCOME_DOC_REQUEST_TYPE_CORRECTION: 1,
  OUTCOME_DOC_REQUEST_TYPE_CLARIFICATION: 2,
  OUTCOME_DOC_REQUEST_TYPE_REVIEW: 3,

  OUTCOME_DOC_REQUEST_SUB_TYPE_INSIDE: 1,
  OUTCOME_DOC_REQUEST_SUB_TYPE_OUTSIDE: 2,

  OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC: 1,
  OUTCOME_DOC_REQUEST_AFFECTED_DOC_MO: 2,
  OUTCOME_DOC_REQUEST_AFFECTED_DOC_OOP: 3,
  OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC_MO: 4,
  OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC_OP: 5,
  OUTCOME_DOC_REQUEST_AFFECTED_DOC_MO_OP: 6,
  OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC_MO_OP: 7,

  OUTCOME_DOC_REQUEST_STATUS_WITHDRAWN: 1,
  OUTCOME_DOC_REQUEST_STATUS_COMPLETE: 2,
  OUTCOME_DOC_REQUEST_STATUS_OTHER: 3,
  OUTCOME_DOC_REQUEST_STATUS_ABANDONED: 4,
  OUTCOME_DOC_REQUEST_STATUS_CANCELLED_OR_DEFICIENT: 5,

  OUTCOME_DOC_REQUEST_SUB_STATUS_PAST_PROCESS: 2,

  OUTCOME_DOC_REQUEST_ITEM_TYPE_TYPING: 1,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_MATH: 2,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_OBVIOUS: 3,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_OMISSION: 4,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_CLARIFICATION: 5,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_LATE_FILING: 6,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_UNABLE_ATTEND: 7,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_NEW_EVIDENCE: 8,
  OUTCOME_DOC_REQUEST_ITEM_TYPE_DECISION_FRAUD: 9,

  OUTCOME_DOC_REQUEST_ITEM_STATUS_DISMISSED: 1,
  OUTCOME_DOC_REQUEST_ITEM_STATUS_GRANTED: 2,

  SCHEDULING_SEARCH_TYPE_HEARING: 1,

  OFFICE_DISPUTE_DETAILS_SEARCH_METHOD_FILENUMBER: 1,
  OFFICE_DISPUTE_DETAILS_SEARCH_METHOD_ACCESSCODE: 2,

  OFFICE_PAYMENT_METHOD_CODE_CASH: 1,
  OFFICE_PAYMENT_METHOD_CODE_DEBIT: 2,
  OFFICE_PAYMENT_METHOD_CODE_CREDIT: 3,
  OFFICE_PAYMENT_METHOD_CODE_VISA_DEBIT: 4,
  OFFICE_PAYMENT_METHOD_CODE_MASTERCARD_DEBIT: 5,
  OFFICE_PAYMENT_METHOD_CODE_CERTIFIED_CHEQUE: 6,
  OFFICE_PAYMENT_METHOD_CODE_MONEY_ORDER: 7,

  SUB_SERVICE_REQUEST_STATUS_RECEIVED: 1,
  SUB_SERVICE_REQUEST_STATUS_PENDING: 2,
  SUB_SERVICE_REQUEST_STATUS_APPROVED: 3,
  SUB_SERVICE_REQUEST_STATUS_DENIED: 4,
  SUB_SERVICE_REQUEST_STATUS_WITHDRAWN: 5,

  SERVICE_DOC_TYPE_OTHER: 6,

  SERVICE_DATE_USED_SERVED: 1,
  SERVICE_DATE_USED_DEEMED_SERVED: 2,
  SERVICE_DATE_USED_ACKNOWLEDGED_SERVED: 3,

  REPORT_TYPE_OPERATIONAL: 1,
  REPORT_TYPE_EXCEPTION: 2,
  REPORT_TYPE_OTHER: 3,
  REPORT_TYPE_WELCOME_REPORTS: 4,

  OP_REPORT_USER_ALL: 1,
  OP_REPORT_USER_IO_OR_ADMIN: 2,
  OP_REPORT_USER_ARB: 3,
  OP_REPORT_USER_MANAGER: 4,
  OP_REPORT_USER_ADMIN: 5,

  CUSTOM_DATA_OBJ_TYPE_ARI_C: 1,
  CUSTOM_DATA_OBJ_TYPE_PFR: 2,
  
  EXTERNAL_CUSTOM_DATA_OBJ_TYPE_CEU: 1,

  TRIAL_STATUS_ACTIVE: 1,

  TRIAL_DISPUTE_ROLE_TREATMENT: 1,
  TRIAL_DISPUTE_ROLE_CONTROL: 2,
  TRIAL_DISPUTE_ROLE_NOT_PARTICIPATING: 3,
  TRIAL_DISPUTE_SELECTION_METHOD_OPT_IN_RANDOM: 2,
  TRIAL_DISPUTE_SELECTION_METHOD_NOT_REQUIRED: 4,
  TRIAL_DISPUTE_STATUS_STANDARD: 1,
  TRIAL_DISPUTE_STATUS_NO_OUTCOMES: 2,

  TRIAL_INTERVENTION_STATUS_COMPLETE: 2,

  TRIAL_PARTICIPANT_TYPE_DISPUTE_PARTICIPANT: 1,
  TRIAL_PARTICIPANT_TYPE_STAFF: 2,

  TRIAL_OUTCOME_STATUS_COMPLETED: 2,
};
