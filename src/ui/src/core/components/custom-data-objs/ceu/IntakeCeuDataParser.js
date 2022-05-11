import Radio from 'backbone.radio';
import UtilityMixin from '../../../utilities/UtilityMixin';

import CeuParticipant_collection from './CeuParticipant_collection';
import CustomDataParser from '../CustomDataParser';
import Contravention_collection from './ceu-contravention/Contravention_collection';
import CeuUnit_collection from './ceu-unit/CeuUnit_collection';

const applicantsAttrName = 'applicants';
const respondentsAttrName = 'respondents';
const submittersAttrName = 'submitters';
const unitsAttrName = 'units';
const contraventionsAttrName = 'contraventions';

const configChannel = Radio.channel('config');

const IntakeCeuDataParser = CustomDataParser.extend({
  
  /*
   -- Intake CEU data example (FULL) should go here
  {
    g_complaint_type: 
    g_complaint_sub_type: 
    g_complaint_is_emergency: 
    g_owns_home:
    
    g_accepted_tou: 
    g_complaint_rtb_matter: 
    g_complaint_meets_criteria: 
    g_complaint_urgency_rating: 
    
    g_pdf_application_snapshot_extfile_id:

    g_stage: 
    g_status: 
    g_process: 
    g_owner: 
  }
  */

  isRespondentLandlord() {
    const json = this.toJSON();
    return json.g_complaint_sub_type && String(json.g_complaint_sub_type) === String(configChannel.request('get', 'CEU_SUB_TYPE_LANDLORD'));
  },

  isMHPTA() {
    const json = this.toJSON();
    return json.g_complaint_type && String(json.g_complaint_type) === String(configChannel.request('get', 'CEU_TYPE_MHPTA'));
  },

  hasContraventionData() {
    const json = this.toJSON();
    return json[contraventionsAttrName] && Array.isArray(json[contraventionsAttrName]) && json[contraventionsAttrName].length;
  },
  
  setApplicantCollection(participantCollection, options={}) {
    this._setParticipantCollection(participantCollection, applicantsAttrName);
  },

  setRespondentCollection(participantCollection, options={}) {
    this._setParticipantCollection(participantCollection, respondentsAttrName);
  },

  setSubmitterCollection(participantCollection, options={}) {
    this._setParticipantCollection(participantCollection, submittersAttrName);
  },

  _setParticipantCollection(participantCollection, jsonAttrName) {
    const json = this.toJSON();
    const newParticipantsJson = participantCollection.map(p => this.convertParticipantModelToData(p));
    json[jsonAttrName] = newParticipantsJson;
  },

  setUnitCollection(unitCollection) {
    const json = this.toJSON();
    json[unitsAttrName] = unitCollection.map(unit => this.convertUnitModelToData(unit));
  },

  setContraventionCollection(contraventionCollection) {
    const json = this.toJSON();
    json[contraventionsAttrName] = contraventionCollection.map(unit => this.convertContraventionModelToData(unit));
  },

  convertParticipantModelToData(participantModel) {
    return {
      // Create a new ID for each party being added
      p_participant_id: participantModel.isNew() ? UtilityMixin.util_generateUUIDv4() : participantModel.id,
      p_participant_type: participantModel.get('p_participant_type') || null,
      p_participant_type_text: participantModel.get('p_participant_type_text') || null,
      p_is_primary_applicant: participantModel.get('p_is_primary_applicant') || null,
      p_primary_contact_method: participantModel.get('p_primary_contact_method') || null,
      p_contact_info_selection: participantModel.get('p_contact_info_selection') || null,
      p_birth_date: participantModel.get('p_birth_date') || null,
      p_business_name: participantModel.get('p_business_name'),
      p_business_contact_first_name: participantModel.get('p_business_contact_first_name'),
      p_business_contact_last_name: participantModel.get('p_business_contact_last_name'),
      p_first_name: participantModel.get('p_first_name'),
      p_last_name: participantModel.get('p_last_name'),
      p_primary_phone: participantModel.get('p_primary_phone'),
      p_secondary_phone: participantModel.get('p_secondary_phone'),
      p_email: participantModel.get('p_email'),
      p_address: participantModel.get('p_address'),
      p_city: participantModel.get('p_city'),
      p_province_state: participantModel.get('p_province_state'),
      p_country: participantModel.get('p_country'),
      p_postal_zip: participantModel.get('p_postal_zip'),
      p_mail_address: participantModel.get('p_mail_address'),
      p_mail_city: participantModel.get('p_mail_city'),
      p_mail_province_state: participantModel.get('p_mail_province_state'),
      p_mail_country: participantModel.get('p_mail_country'),
      p_mail_postal_zip: participantModel.get('p_mail_postal_zip'),
      p_accepted_tou: participantModel.get('p_accepted_tou'),
      p_accepted_tou_date: participantModel.get('p_accepted_tou_date'),
      p_email_verified: participantModel.get('p_email_verified') || null
    };
  },

  convertUnitModelToData(ceuUnitModel) {
    const hasTenancyAgreement = ceuUnitModel.get('hasTenancyAgreement').getData({ parse: true });
    const tenancyAgreementData = hasTenancyAgreement ? this.convertDisputeEvidenceToData(ceuUnitModel.get('tenancyAgreementEvidence')) : null;
    ceuUnitModel.set('r_tenancy_agreement_evidence', tenancyAgreementData);

    const data = Object.assign({}, ceuUnitModel.toJSON(), {
      // Create a new ID for each unit being added
      r_rental_unit_guid: ceuUnitModel.get('r_rental_unit_guid') || UtilityMixin.util_generateUUIDv4(),
    });

    // Strip fields that don't belong to CEU unit
    Object.keys(data).forEach(key => {
      if (!String(key).startsWith('r_')) delete data[key];
    });
    return data;
  },

  convertContraventionModelToData(contraventionModel) {
    const evidenceCollection = contraventionModel.getEvidenceCollection();
    const allEvidenceData = [];
    // Convert evidenceCollection to saved evidence data, and add to current session
    evidenceCollection.forEach(evidence => {
      const evidenceData = this.convertDisputeEvidenceToData(evidence);
      allEvidenceData.push(evidenceData);
    });
    contraventionModel.set('c_evidence', allEvidenceData);
    
    const data = Object.assign({}, contraventionModel.toJSON(), {
      // Create a new ID for each unit being added
      c_contravention_guid: contraventionModel.get('c_contravention_guid') || UtilityMixin.util_generateUUIDv4(),
    });

    // Strip fields that don't belong to CEU contravention
    Object.keys(data).forEach(key => {
      if (!String(key).startsWith('c_')) delete data[key];
    });

    return data;
  },

  convertDisputeEvidenceToData(disputeEvidenceModel) {
    return {
      e_evidence_guid: disputeEvidenceModel.get('e_evidence_guid') || UtilityMixin.util_generateUUIDv4(),
      e_is_other_evidence: !!disputeEvidenceModel.get('e_is_other_evidence') || !disputeEvidenceModel.get('claim_code'),
      e_evidence_type: disputeEvidenceModel.get('claim_code'),
      e_evidence_title: disputeEvidenceModel.getTitle(),
      e_provision_option: disputeEvidenceModel.getFileMethod(),
      e_evidence_extfile_ids: disputeEvidenceModel.get('e_evidence_extfile_ids')
    };
  },

  getApplicantCollection() {
    const json = this.toJSON();
    return new CeuParticipant_collection((json[applicantsAttrName]||[]).map(p => this.toParticipantModelData(p)));
  },

  getRespondentCollection() {
    const json = this.toJSON();
    return new CeuParticipant_collection((json[respondentsAttrName]||[]).map(p => this.toParticipantModelData(p)));
  },

  getSubmitterCollection() {
    const json = this.toJSON();
    return new CeuParticipant_collection((json[submittersAttrName]||[]).map(p => this.toParticipantModelData(p)));
  },

  toParticipantModelData(applicantData={}) {
    return Object.assign({}, applicantData, {
      participant_id: applicantData.p_participant_id,
      participant_type: applicantData.p_participant_type,
      bus_name: applicantData.p_business_name,
      bus_contact_first_name: applicantData.p_business_contact_first_name,
      bus_contact_last_name: applicantData.p_business_contact_last_name,

      first_name: applicantData.p_first_name,
      last_name: applicantData.p_last_name,
      primary_phone: applicantData.p_primary_phone,
      secondary_phone: applicantData.p_secondary_phone,
      email: applicantData.p_email,
      address: applicantData.p_address,
      city: applicantData.p_city,
      province_state: applicantData.p_province_state,
      country: applicantData.p_country,
      postal_zip: applicantData.p_postal_zip,
      mail_address: applicantData.p_mail_address,
      mail_city: applicantData.p_mail_city,
      mail_province_state: applicantData.p_mail_province_state,
      mail_country: applicantData.p_mail_country,
      mail_postal_zip: applicantData.p_mail_postal_zip,
    });
  },

  getUnitCollection() {
    const json = this.toJSON();
    return new CeuUnit_collection(json[unitsAttrName] || []);
  },

  getContraventionCollection() {
    const json = this.toJSON();
    return new Contravention_collection(json[contraventionsAttrName] || []);
  },

});


const dataParserInstance = new IntakeCeuDataParser();
export default dataParserInstance;
