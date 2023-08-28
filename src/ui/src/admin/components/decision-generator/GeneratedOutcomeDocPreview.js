import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DecGenDataProvider from './DecGenDataProvider';
import DecGenData from './DecGenData';
import DecisionHeader from './decision-templates/decision-template-header/DecisionHeader';
import DecisionHearing from './decision-templates/decision-template-hearing/DecisionHearing';
import DecisionAnonSearch from './decision-templates/decision-template-anon-search/DecisionAnonSearch';
import DecisionDocTitle from './decision-templates/decision-template-title/DecisionDocTitle';
import DecisionIssues from './decision-templates/decision-template-issues/DecisionIssues';
import DecisionService from './decision-templates/decision-template-service/DecisionService';
import DecisionIssuesDecided from './decision-templates/decision-template-issues-decided/DecisionIssuesDecided';
import DecisionOrder from './decision-templates/decision-template-order/DecisionOrder';
import DecisionBackground from './decision-templates/decision-template-background/DecisionBackground';
import DecisionSubstitutedService from './decision-templates/DecisionSubstitutedService';
import DecisionCorrClar from './decision-templates/DecisionCorrClar';
import DecisionReview from './decision-templates/DecisionReview';
import DecisionPrelimMatters from './decision-templates/decision-template-prelim-matters/DecisionPrelimMatters';
import DecisionAnalysis from './decision-templates/decision-template-analysis/DecisionAnalysis';
import DecisionConclusion from './decision-templates/decision-template-conclusion/DecisionConclusion';
import LoaderIcon from '../../../core/static/loader_blue_lrg.gif';
import BaseDecision_template from './decision-templates/BaseDecision_template.tpl';
import { DecGenPageBreak, PAGE_BREAK_CLASS, PAGE_BREAK_STYLES } from './decision-templates/DecGenPageBreak';
import { renderToString } from 'react-dom/server';

const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const disputeChannel = Radio.channel('dispute');
const documentsChannel = Radio.channel('documents');
const filesChannel = Radio.channel('files');
const noticeChannel = Radio.channel('notice');
const claimsChannel = Radio.channel('claims');
const participantsChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({

  initialize(options) {
    this.mergeOptions(options, ['templateData', 'generationOptions']);

    this.isLoaded = false;
    this.decision_template_ids = configChannel.request('get', 'decision_template_ids') || {};

    this.generatedSectionTemplateConfig = {
      // Header template
      [this.decision_template_ids.Header]: {
        uiName: 'header',
        viewClass: DecisionHeader,
      },

      // Hearing template
      [this.decision_template_ids.Hearing]: {
        uiName: 'hearing',
        viewClass: DecisionHearing,
      },

      // Anon search - will be populated dynamically based on whether the dispute is searchable
      [this.decision_template_ids.AnonSearch]: {
        uiName: 'anonSearch',
        viewClass: DecisionAnonSearch,
      },
      [this.decision_template_ids.AnonSearchFooter]: {
        uiName: 'anonSearchFooter',
        viewClass: DecisionAnonSearch,
      },

      // Doc title template
      [this.decision_template_ids.DocTitle]: {
        uiName: 'docTitle',
        viewClass: DecisionDocTitle,
      },

      // Issues template
      [this.decision_template_ids.Issues]: {
        uiName: 'issues',
        viewClass: DecisionIssues,
      },

      // Notice and Evidence Service template
      [this.decision_template_ids.Service]: {
        uiName: 'service',
        viewClass: DecisionService,
      },

      // Issues to be Decided template
      [this.decision_template_ids.IssuesToBeDecided]: {
        uiName: 'issuesDecided',
        viewClass: DecisionIssuesDecided,
      },

      // Preliminary Matters
      [this.decision_template_ids.PrelimMatters]: {
        uiName: 'prelimMatters',
        viewClass: DecisionPrelimMatters,
      },

      // Background and Evidence template
      [this.decision_template_ids.Background]: {
        uiName: 'background',
        viewClass: DecisionBackground,
      },

      // Analysis template
      [this.decision_template_ids.Analysis]: {
        uiName: 'analysis',
        viewClass: DecisionAnalysis,
      },

      // Conclusion template
      [this.decision_template_ids.Conclusion]: {
        uiName: 'conclusion',
        viewClass: DecisionConclusion,
      },

      // Order template
      [this.decision_template_ids.Order]: {
        uiName: 'order',
        viewClass: DecisionOrder,
      },

      // Sub Service template
      [this.decision_template_ids.SubService]: {
        uiName: 'subServ',
        viewClass: DecisionSubstitutedService,
      },

      // Correction template
      [this.decision_template_ids.Correction]: {
        uiName: 'correction',
        viewClass: DecisionCorrClar
      },

      [this.decision_template_ids.Clarification]: {
        uiName: 'clarification',
        viewClass: DecisionCorrClar
      },

      [this.decision_template_ids.Review]: {
        uiName: 'review',
        viewClass: DecisionReview
      },
    };

    this.loadDecisionGenData()
      .then(() => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      })
      .catch(err => {
        console.log(err);
        this.model.trigger('close:modal');
        // If load is rejected with loadErrors, then an error modal has already been displayed to the user
        if (!err?.loadErrors?.length) {
          this.model.trigger('close:modal');
          modalChannel.request('show:standard', {
            title: 'Error Preparing Decision',
            bodyHtml: `<p>There was an unexpected error encountered while loading required data, or preparing generated content for this decision. Please close and try again.  If the problem persists, please contact RTB.`,
            hideCancelButton: true,
            primaryButtonText: 'Close',
            onContinue(modalView) { modalView.close(); }
          });
        }
      });
  },

  async loadDecisionGenData() {
    const dataProvider = new DecGenDataProvider({
      disputeGuid: disputeChannel.request('get:id'),
      // Always provide certain default values for the generation - especially ones that are already loaded for this dispute
      loadedData: {
        [DecGenData.currentDoc]: this.model,
        [DecGenData.currentDocSet]: documentsChannel.request('get:group', this.model.get('outcome_doc_group_id')),
        [DecGenData.currentCcrItem]: documentsChannel.request('get:requests:by:id', this.model.get('selectedCCRSubServId')),
        [DecGenData.currentSubServItem]: noticeChannel.request('get:subservice:by:id', this.model.get('selectedCCRSubServId')),
        [DecGenData.dispute]: disputeChannel.request('get'),
        [DecGenData.hearings]: hearingChannel.request('get'),
        [DecGenData.notices]: noticeChannel.request('get:all'),
        [DecGenData.allParticipants]: participantsChannel.request('get:all:participants'),
        [DecGenData.allIssues]: claimsChannel.request('get:full'),
        [DecGenData.files]: filesChannel.request('get:files'),
        [DecGenData.filePackages]: filesChannel.request('get:filepackages'),
      }
    });
    this.isLoaded = false;

    _.each(this.model.config.templates_for_decision, templateId => {
      const matchingTemplateConfig = this.generatedSectionTemplateConfig[templateId]
      if (!matchingTemplateConfig || !matchingTemplateConfig?.viewClass?.getDataToLoad) {
        console.log(`[Warning] Could not find a template to update for id "${templateId}".  Validate the outcome document configs`);
        return;
      }
      dataProvider.addDataToLoad(matchingTemplateConfig.viewClass.getDataToLoad());
    });

    // TODO: Enable/Disable cross data loading based on template ID
    // This should be placed somewhere better, need to understand how Decision/MN/OP cross content differs
    if (!this.model.isCrossed()) {
      dataProvider.clearDataToLoad(DecGenData.linkedDisputes);
    }
    
    this.loadedDecGenData = await dataProvider.load();
    this.isLoaded = true;
  },

  ui: {
    header: '#generated-header',
    hearing: '#generated-hearing',
    anonSearch: '#generated-search-instructions',
    anonSearchFooter: '#generated-search-instructions-footer',
    docTitle: '#generated-doc-title',
    issues: '#generated-issues',
    service: '#generated-service',
    prelimMatters: '#generated-prelim-matters',
    background: '#generated-background',
    issuesDecided: '#generated-issues-decided',
    analysis: '#generated-analysis',
    conclusion: '#generated-conclusion',
    order: '#generated-order',
    subServ: '#generated-sub-service',
    correction: '#generated-correction',
    clarification: '#generated-clarification',
    review: '#generated-review'
  },

  onRender() {
    if (!this.isLoaded) return;
    _.each(this.model.config.templates_for_decision, templateId => {
      this.renderTemplateSection(templateId);
    });

    // Now clean up any stray UI tags for the preview elements.
    _.each(this.ui, function(ele) {
      if (ele.length && !ele.children().length) {
        ele.remove();
      }
    }, this);

    // Handle page break compatibility issue, where some required styles were being auto-stripped by Marionette/Backbone render
    // If any page breaks were not inserted correctly, insert a new one and delete the old one
    this.$(`.${PAGE_BREAK_CLASS}`).each(function() {
      if (Object.keys(PAGE_BREAK_STYLES).some(key => !$(this).css(key))) {
        $(this).after(renderToString(DecGenPageBreak));
        $(this).remove();
      }
    });
  },

  renderTemplateSection(templateId) {
    const matchingTemplateConfig = this.generatedSectionTemplateConfig[templateId];
    if (!matchingTemplateConfig || _.isEmpty(matchingTemplateConfig) || !matchingTemplateConfig.viewClass) {
      console.log(`[Warning] Could not find a template to update for id "${templateId}".  Validate the outcome document configs`);
      return;
    }
    
    const sectionView = new matchingTemplateConfig.viewClass({
      model: this.model,
      data: this.loadedDecGenData,
      templateData: this.templateData,
      generationOptions: this.generationOptions,
    });

    this.getUI(matchingTemplateConfig.uiName).replaceWith(
      sectionView.render().$el.html()
    );
  },

  getTemplate() {
    if (this.isLoaded){
      return BaseDecision_template;
    } else {
      return _.template(`<div class="generate-outcome-doc__preview-loading">
        <div><img src=${LoaderIcon} /></div>
        <div>Loading dispute data for document generation... Please wait</div>
      </div>`);
    }
  },

  templateContext() {
    return {
      // TODO: Replace with outcome doc title?
      title: "TEST",
    };
  }
});