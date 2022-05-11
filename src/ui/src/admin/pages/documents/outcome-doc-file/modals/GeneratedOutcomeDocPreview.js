import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import GeneratedOutcomeDocSection from './GeneratedOutcomeDocSection';
import DecisionHeader_template from '../../decision-templates/DecisionHeader_template.tpl';
import DecisionHearing_template from '../../decision-templates/DecisionHearing_template.tpl';
import DecisionIssues_template from '../../decision-templates/DecisionIssues_template.tpl';
import DecisionService_template from '../../decision-templates/DecisionService_template.tpl';
import DecisionBackground_template from '../../decision-templates/DecisionBackground_template.tpl';
import DecisionAnalysis_template from '../../decision-templates/DecisionAnalysis_template.tpl';
import DecisionConclusion_template from '../../decision-templates/DecisionConclusion_template.tpl';
import DecisionOrder_template from '../../decision-templates/DecisionOrder_template.tpl';
import BaseDecision_template from '../../decision-templates/BaseDecision_template.tpl';
import BaseDecisionWord_template from '../../decision-templates/BaseDecisionWord_template.tpl';
import UtilityMixin from '../../../../../core/utilities/UtilityMixin';

const participantChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const noticeChannel = Radio.channel('notice');
const claimsChannel = Radio.channel('claims');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const statusChannel = Radio.channel('status');
const disputeChannel = Radio.channel('dispute');
const documentsChannel = Radio.channel('documents');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({

  template(data) {
    const templateToUse = data._ownTemplateToUse
    delete data._ownTemplateToUse;
    return templateToUse(data);
  },

  ui: {
    header: '#generated-header',
    hearing: '#generated-hearing',
    issues: '#generated-issues',
    service: '#generated-service',
    background: '#generated-background',
    analysis: '#generated-analysis',
    conclusion: '#generated-conclusion',
    order: '#generated-order',
  },

  initialize(options) {
    this.mergeOptions(options, ['enableWordMode', 'signature']);

    this.docConfig = documentsChannel.request('config:file', this.model.get('file_type')) || {};
    this.decision_template_ids = configChannel.request('get', 'decision_template_ids') || {};
    this.dispute = disputeChannel.request('get');
    this.hearing = hearingChannel.request('get:latest');
    this.hearings = hearingChannel.request('get');
    this.defaultTemplateData = this.getDefaultTemplateData();
    this.generatedSectionTemplateConfig = {
      // Header template
      [this.decision_template_ids.Head]: {
        uiName: 'header',
        templateToUse: DecisionHeader_template,
        templateData() {
          return _.extend({}, this.defaultTemplateData, {
            // TODO: Move to Config?
            isIssueMNorOP: _.contains([10, 11, 15, 16], this.docConfig.id),
            amendedParticipants: participantsChannel.request('get:removed').filter(p => p.isAmendRemoved()),
            disputeAddressDisplay: this.dispute.getAddressStringWithUnit()
          });
        }
      },

      // Hearing template
      [this.decision_template_ids.Hearing]: {
        uiName: 'hearing',
        templateToUse: DecisionHearing_template,
        templateData: _.extend({}, this.defaultTemplateData, {
          allHearings: this.hearings,
          allHearingsParticipationComplete: this.hearings.all(hearing => !hearing.getParticipations().any(p => p.isAttendStatusUnknown()))
        })
      },

      // Issues template
      [this.decision_template_ids.Issue]: {
        uiName: 'issues',
        templateToUse: DecisionIssues_template,
        templateData() {
          const dispute_claims = claimsChannel.request('get');
          const outcomeRemovedClaims = [];
          const remainingDisputeClaims = [];
          dispute_claims.each(disputeClaim => {
            if (disputeClaim.allOutcomesRemoved()) {
              outcomeRemovedClaims.push(disputeClaim);
            } else {
              remainingDisputeClaims.push(disputeClaim);
            }
          });
          const amendRemovedClaims = claimsChannel.request('get:removed').filter(disputeClaim => disputeClaim.isAmendRemoved());

          return _.extend({}, this.defaultTemplateData, {
            dispute_claims,
            removedDisputeClaims: _.union(outcomeRemovedClaims, amendRemovedClaims),
            remainingDisputeClaims
          });
        }
      },

      // Notice and Evidence Service template
      [this.decision_template_ids.Service]: {
        uiName: 'service',
        templateToUse: DecisionService_template,
        templateData() {
          const noticeServiceMethodDisplays = {
            1: 'by posting on the door',
            2: 'in mail slot or box',
            3: 'by registered mail',
            4: 'by regular mail',
            5: 'in person',
            6: 'by fax',
            7: 'by another method'
          };
          const getNoticeServiceMethodDisplay = (serviceModel) => noticeServiceMethodDisplays[serviceModel.get('service_method')];
          const isDisputeLandlord = this.defaultTemplateData.isDisputeLandlord;
          const allNotices = noticeChannel.request('get:all');
          const files = filesChannel.request('get:files');
          const packageHasUploadedFilesFn = (packageModel) => files.any(file => {
            return file.get('file_package_id') === packageModel.id
              && file.isUploaded()
              // Also ensure that the file is not associated to a removed claim
              && !filesChannel.request('is:file:linked:to:removed', file);
          });
          const filePackagesWithFiles = filesChannel.request('get:filepackages').filter(packageHasUploadedFilesFn);

          const allEvidenceServiceInfoProvided = _.all(filePackagesWithFiles, packageModel => {
            return packageModel.getServices().length && !packageModel.getServices().isAnyServiceUnknown();
          });
          
          return _.extend({}, this.defaultTemplateData, {
            notices: allNotices.filter(notice => !notice.isAmendmentNotice()),
            allNoticesProvidedWithServiceInfo: allNotices.all(notice => notice.isProvided() && notice.getServices().length && !notice.getServices().isAnyServiceUnknown()),
            getAmendmentNoticesFor: (notice) => (notice && notice.id ? noticeChannel.request('get:amendmentNotices:of', notice.id) : []),
            allEvidenceServiceInfoProvided,
            getHtmlForServiceOutcomes: (services, isServiceFromApplicant) => {
              const landlordTenantDisplay = isServiceFromApplicant ?
                (isDisputeLandlord ? 'landlord' : 'tenant') :
                (isDisputeLandlord ? 'tenant' : 'landlord');

              var html = '';
              if (!services || !services.length) {
                return html;
              }
              let wasGlobalTextDisplayed = false;
              if (services.length > 1) {
                if (services.areAllAcknowledgedServed()) {
                  wasGlobalTextDisplayed = true;
                  html += `\n<li>All parties acknowledged service of these document(s). I find that <b>all parties were served.</b></li>`;
                } else if (services.areAllNotServed()) {
                  wasGlobalTextDisplayed = true;
                  html += `\n<li>The ${landlordTenantDisplay} failed to provide sufficient evidence and I find that <b>all parties were not served.</b></li>`;
                }
              }
        
              if (!wasGlobalTextDisplayed) {
                services.each(service => {
                  const participantModel = participantChannel.request('get:participant', service.get('participant_id'));
                  const participantDisplay = `${landlordTenantDisplay === 'landlord' ? ' Tenant' : 'Landlord'}${participantModel ? ` (${participantModel.getInitialsDisplay()})` : ''}`;
                
                  if (service.isAcknowledgedServed()) {
                    html += `\n<li>The ${landlordTenantDisplay} and ${participantDisplay} acklowledged <b>these document(s) were served.</b></li>`;
                  } else if (!service.isServed()) {
                    html += `\n<li>The ${landlordTenantDisplay} failed to provide sufficient evidence and I find that ${participantDisplay} <b>was not served.</b></li>`;
                  } else if (service.isServiceMethodOther()) {
                    html += `\n<li>Although not served in strict accordance with the Act, I find that the ${landlordTenantDisplay} provided sufficient evidence that ${participantDisplay} <b>was${service.isDeemedServed() ? ' deemed ' : '' } served</b> on <b>${Formatter.toDateDisplay(service.get('service_date'))}</b> under the allowance for the Arbitrator to find a document sufficiently served for the purposes of the Act.</li>`;
                  } else if (service.isDeemedServed()) {
                    html += `\n<li>The ${landlordTenantDisplay} provided evidence and I find that ${participantDisplay} <b>was deemed served ${getNoticeServiceMethodDisplay(service)}</b> on <b>${Formatter.toDateDisplay(service.get('service_date'))}</b>.</li>`;
                  } else if (service.isServed()) {
                    html += `\n<li>The ${landlordTenantDisplay} provided evidence and I find that ${participantDisplay} <b>was served ${getNoticeServiceMethodDisplay(service)}</b> on <b>${Formatter.toDateDisplay(service.get('service_date'))}</b>.</li>`;
                  }
                });
              }
              
              return html;
            },
            filePackagesWithFiles,
            filePackagesLengthEnglishDisplay: Formatter.capitalize(UtilityMixin.util_numToWords(filePackagesWithFiles.length))
          });
        }
      },

      // Background and Evidence template
      [this.decision_template_ids.Background]: {
        uiName: 'background',
        templateToUse: DecisionBackground_template,
        templateData() {
          const referencedApplicantFileModels = [];
          const referencedRespondentFileModels = [];
          filesChannel.request('get:files').filter(file => {
            if (file.isUploaded() && file.isReferenced() && file.get('added_by')) {
              if (this.defaultTemplateData.applicants.get(file.get('added_by'))) {
                referencedApplicantFileModels.push(file);
              } else if (this.defaultTemplateData.respondents.get(file.get('added_by'))) {
                referencedRespondentFileModels.push(file);
              }
            }
          });
          return _.extend({ referencedApplicantFileModels, referencedRespondentFileModels }, this.defaultTemplateData);
        }
      },

      // Analysis template
      [this.decision_template_ids.Analysis]: {
        uiName: 'analysis',
        templateToUse: DecisionAnalysis_template,
        templateData: this.defaultTemplateData
      },

      // Conclusion template
      [this.decision_template_ids.Conclusion]: {
        uiName: 'conclusion',
        templateToUse: DecisionConclusion_template,
        templateData: this.defaultTemplateData
      },

      // Order template
      [this.decision_template_ids.Order]: {
        uiName: 'order',
        templateToUse: DecisionOrder_template,
        templateData() {
          return _.extend({}, this.defaultTemplateData, {
            // TODO: Move to Config?
            isIssueMN: _.contains([10, 11], this.docConfig.id),
            isIssueOP: _.contains([15, 16], this.docConfig.id),
          });
        }
      },
    };
  },

  getDefaultTemplateData() {
    const primaryDisputeHearing = this.hearing && this.hearing.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = this.hearing && this.hearing.getSecondaryDisputeHearings();
    const primaryDisputeHearingDisplay = primaryDisputeHearing && primaryDisputeHearing.getFileNumber();
    const secondaryDisputeHearingsDisplay = secondaryDisputeHearings ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
      return dispute_hearing_model.getFileNumber();
    }).join(',&nbsp;') : '-';

    return {
      Formatter,
      enableWordMode: this.enableWordMode,
      dispute: this.dispute,
      hearing: this.hearing,
      titleDisplay: this.docConfig.group_title,
      primaryDisputeHearingDisplay,
      secondaryDisputeHearingsDisplay,
      isDisputeLandlord: this.dispute.isLandlord(),
      isMHPTA: this.dispute.isMHPTA(),  
      // TODO: Use the config value for process
      //isNonParticipatory: this.dispute.isNonParticipatory(),
      isNonParticipatory: this.docConfig.is_direct_request,

      applicants: participantsChannel.request('get:applicants'),
      respondents: participantsChannel.request('get:respondents'),

      colourClass: statusChannel.request('get:colourclass', this.dispute.getStage(), this.dispute.getStatus()) || '',
      // TODO: Remove magic numbers of link type
      isLinkTypeMulti: _.any([2,3,4], _.contains(this.docConfig.link_types || [])),
      signature: this.signature,
    };
  },

  onRender() {

    _.each(this.docConfig.templates_for_decision, templateId => {
      this.renderTemplateSection(templateId);
    });

    // Now clean up any stray UI tags for the preview elements.
    _.each(this.ui, function(ele) {
      if (ele.length && !ele.children().length) {
        ele.remove();
      }
    }, this);
  },

  renderTemplateSection(templateId) {
    const matchingTemplateConfig = this.generatedSectionTemplateConfig[templateId]
    if (!matchingTemplateConfig || _.isEmpty(matchingTemplateConfig)) {
      console.log(`[Warning] Could not find a template to update for id "${templateId}".  Validate the outcome document configs`);
      return;
    }

    this.getUI(matchingTemplateConfig.uiName).replaceWith(
      new GeneratedOutcomeDocSection({
        model: this.model,
        templateToUse: matchingTemplateConfig.templateToUse,
        templateData: _.isFunction(matchingTemplateConfig.templateData) ? matchingTemplateConfig.templateData.bind(this)() : matchingTemplateConfig.templateData
      }).render().$el.html()
    );
  },

  templateContext() {
    return {
      _ownTemplateToUse: this.enableWordMode ? BaseDecisionWord_template : BaseDecision_template
    };
  }
});