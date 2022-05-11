import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import DisputeClaimHearingToolsView from './DisputeClaimHearingTools';
import ClaimOutcomeUserIcon from '../../static/Icon_ArbOutcomes_WHT.png';
import PrevClaimOutcomeUserIcon from '../../static/Icon_ArbOutcomes_PREV.png';
import template from './DisputeRemedy_template.tpl';

const CONTENT_NOT_ADDED_HTML = `<i>Not yet added</i>`;

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className() {
    return `${this.getOption('cssClass') || ''} dispute-claim-remedy clearfix`
  },

  ui: {
    outcomeDisplay: '.dispute-claim-outcome-display',
    hearingToolsRegion: '.dispute-remedy-hearing-tools-container'
  },

  regions: {
    hearingToolsRegion: '@ui.hearingToolsRegion',
    amountRegion: '.review-claim-amount',
    noticeDeliveryDate: '.review-remedy-date',
    descriptionRegion: '.review-claim-description',
  },

  resetModelValues() {
    //
  },

  initialize(options) {
    this.mergeOptions(options, ['cssClass', 'disputeClaimModel']);

    if (!this.disputeClaimModel) {
      console.log(`[Error] A disputeClaimModel must be provided.`);
      return;
    }

    this.disputeModel = disputeChannel.request('get');
    this.issueConfig = configChannel.request('get:issue', this.disputeClaimModel.claim.get('claim_code') ) || {};
    this.outcomeDisplay = null;
    
    this.reinitialize();
  },

  reinitialize() {
    this.createEditModels();
  },

  createEditModels() {
    const associated_date = this.model.getFirstAssociatedDate();
    const description = this.model.getFirstDescription();
    const amount = this.model.getAmount();

    this.amountEditModel = new InputModel({
      labelText: 'Capital expense amount',
      inputType: 'currency',
      errorMessage: 'Please enter the amount',
      value: amount ? amount : null,
      required: !!this.issueConfig.remedyUseAmount,
      apiMapping: 'amount'
    });

    this.noticeDeliveryDateEditModel = new InputModel({
      labelText: 'Date completed',
      inputType: 'date',
      showYearDate: true,
      errorMessage: `Please enter the notice delivery date`,
      value: associated_date,
      required: !!this.issueConfig.remedyUseAssociatedDate,
      apiMapping: 'associated_date'
    });

    this.descriptionEditModel = new TextareaModel({
      labelText: 'Description',
      errorMessage: `Please enter the description`,
      value: description,
      required: !!this.issueConfig.remedyUseTextDescription,
      apiMapping: 'description',
      max: configChannel.request('get', 'CLAIM_DESCRIPTION_MAX'),
      countdown: true
    });

    this.stopListening(this.disputeClaimModel, 'hearingTools:save');
    this.listenTo(this.disputeClaimModel, 'hearingTools:save', function() {
      this.disputeClaimModel.trigger('contextRender:refresh');
    }, this);

    this.stopListening(this.disputeClaimModel, 'contextRender:edit');
    this.listenTo(this.disputeClaimModel, 'contextRender:edit', () => {
      this.render();
      this.disputeClaimModel.trigger('render:edit');
    });
  },

  getDateWarningMsg() {
    const EXPENSE_WARNING_MONTHS_OFFSET = configChannel.request('get', 'EXPENSE_WARNING_MONTHS_OFFSET');
    const paidDate = this.disputeModel.get('initial_payment_date');
    const selectedCompletedDate = this.noticeDeliveryDateEditModel.getData();
    const warningDate = Moment(paidDate).subtract(EXPENSE_WARNING_MONTHS_OFFSET, 'months');
    const areDatesValid = paidDate && Moment(paidDate).isValid() && selectedCompletedDate && Moment(selectedCompletedDate).isValid() && warningDate && Moment(warningDate).isValid();
    if (areDatesValid && this.disputeClaimModel.isExpenseIssue() && Moment(selectedCompletedDate).isBefore(warningDate)) {
      return `Incurred date is ${EXPENSE_WARNING_MONTHS_OFFSET}+ months before paid date`;
    }
  },

  onRender() {
    const associated_date = this.model.getFirstAssociatedDate();
    const description = this.model.getFirstDescription();
    const amount = this.model.getAmount();

    this.showChildView('amountRegion', new EditableComponentView({
      state: 'view',
      label: 'Capital Expense Amount',
      view_value: Formatter.toAmountDisplay(amount),
      subView: new InputView({
        model: this.amountEditModel
      })
    }));

    this.showChildView('noticeDeliveryDate', new EditableComponentView({
      state: 'view',
      label: 'Date Completed',
      view_value: associated_date ? Formatter.toDateDisplay(associated_date) : CONTENT_NOT_ADDED_HTML,
      subView: new InputView({
        model: this.noticeDeliveryDateEditModel
      })
    }));

    this.showChildView('descriptionRegion', new EditableComponentView({
      state: 'view',
      label: 'Description',
      view_value: description ? description : CONTENT_NOT_ADDED_HTML,
      subView: new TextareaView({
        model: this.descriptionEditModel
      })
    }));

    if (this.disputeModel && this.disputeModel.get('sessionSettings')?.hearingToolsEnabled) {
      this.showHearingTools();
    }

    //ViewMixin.prototype.initializePopovers(this);
  },

  showHearingTools() {
    this.showChildView('hearingToolsRegion', new DisputeClaimHearingToolsView({
      mode: 'claim-view',
      disputeClaimModel: this.disputeClaimModel,
      remedyModel: this.model
    }));
    this.getUI('outcomeDisplay').hide();
  },

  hideHearingTools() {
    // When hiding hearing tools, just re-render this claim view to reset it
    this.render();
  },

  refreshList() {
    this.getOption('parent').render();
  },

  templateContext() {
    const lastModifiedOutcomeModel = this.disputeClaimModel.getOutcomeLastModifiedModel();
    return {
      ClaimOutcomeUserIcon,
      PrevClaimOutcomeUserIcon,
      isMigrated: this.disputeModel && this.disputeModel.isMigrated(),
      outcomeDisplay: this.model.getOutcomeDisplay(this.disputeClaimModel, { use_html: true }),
      outcomeModifiedDisplay: lastModifiedOutcomeModel && lastModifiedOutcomeModel.getModifiedDisplay(),
      prevOutcomeDisplay: this.model.getOutcomeDisplay(this.disputeClaimModel, { use_html: true, use_prev: true }),
      prevOutcomeModifiedDisplay: this.model.getModifiedDisplay({ use_prev: true }),
      isRemedyReviewed: this.model.isReviewed(),
      remedyUseAssociatedDate: this.issueConfig.remedyUseAssociatedDate,
      remedyUseAmount: this.issueConfig.remedyUseAmount,
      remedyUseTextDescription: this.issueConfig.remedyUseTextDescription,
      hadStaffActivity: this.model.hadStaffActivity(),
      dateWarningMsg: this.getDateWarningMsg()
    };
  }

});
