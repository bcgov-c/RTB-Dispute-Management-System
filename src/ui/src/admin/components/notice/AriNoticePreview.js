/**
 * @fileoverview - ARI-C version of the generated Notice that includes language overrides for ARI-C. Also includes pre-hearing conference language.
 */
import Radio from 'backbone.radio';
import NoticePreview from './NoticePreview';
import IntakeAriDataParser from '../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';

const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

const ARI_C_NOTICE_TITLE = 'Notice of Dispute Resolution Proceeding - Application for Additional Rent Increase for Capital Expenditures';
const ARI_E_NOTICE_TITLE = 'Notice of Dispute Resolution Proceeding - Application for Additional Rent Increase for Operating Expenses';
const ARI_C_PRELIM_NOTICE_TITLE = `Notice of Prehearing Conference - Application for Additional Rent Increase for Capital Expenditures`;
const ARI_E_PRELIM_NOTICE_TITLE = `Notice of Prehearing Conference - Application for Additional Rent Increase for Operating Expenses`;

const ARI_RESPONDENT_THRESHOLD = 10;
const ARI_CALC_RENT_INCREASE_DIVISOR = 120;
const calculateCostRentIncreaseFn = (amount, numUnits) => {
  let calculatedAmount = 0;
  try {
    calculatedAmount = amount / ARI_CALC_RENT_INCREASE_DIVISOR / numUnits
  } catch (err) {
    //
  }
  // Round to two decimal places
  return Math.round((calculatedAmount + Number.EPSILON) * 100) / 100;
};

const ariDisputeClaimTemplate = `
<table class="issue_item" style="width:100%;">
<tr><td class="issuetitle_onecol">
  <%= disputeClaim.getClaimTitle() %>
</td></tr>
</tr><td style="padding-top:20px;padding-bottom:20px;">
  <p class="issue_listitem"><b>Total requested eligible rent increase amount associated to this unit:</b>&nbsp;<%= Formatter.toAmountDisplay(totalCalculatedRentIncreaseForUnit) %></p>
</td></tr>

<% disputeClaim.getAllRemedies().each(function(remedyModel, index) { %>
  <% var associatedCost = remedyDisplayData[remedyModel.id].associatedCost; %>
  <tr><td style="padding-bottom:20px;">
    <p class="issue_listitem"><u><b>Capital Expenditure <%= Formatter.toLeftPad(index+1) %></b></u></p>
    <p class=""><%= remedyModel.getFirstDescription() %></p>
    <p class="issue_listitem"><b>Associated to this rental unit:</b>&nbsp;<%= associatedCost && associatedCost.hasUnit(unitId) ? 'Yes' : 'No' %></p>
    <p class="issue_listitem"><b>Requested eligible amount of rent increase:</b>&nbsp;<%= Formatter.toAmountDisplay(remedyDisplayData[remedyModel.id].eligibleRI) %></p>
    <p class="issue_listitem"><b>Total cost of expenditure:</b>&nbsp;<%= Formatter.toAmountDisplay(remedyModel.getAmount()) %></p>
    <p class="issue_listitem"><b>Date expenditure was incurred:</b>&nbsp;<%= Formatter.toDateDisplay(remedyModel.getFirstAssociatedDate()) %></p>
    <p class="issue_listitem"><b>Specified Dwelling Units subject to rent increase:</b>&nbsp;<%= (remedyDisplayData[remedyModel.id].improvedUnits || []).length || 0 %></p>
    <p class="issue_listitem"><b>Specified Dwelling Unit addresses subject to rent increase:</b>&nbsp;<%= (remedyDisplayData[remedyModel.id].improvedUnits || []).join(', ') || 0 %></p>
  </td></tr>
<% }) %>
</table>

<div class="spacer_med">&nbsp;</div>
`;

export default NoticePreview.extend({

  initialize(options) {
    NoticePreview.prototype.initialize.call(this, options);
    this.mergeOptions(options, ['matchingUnit', 'isPrelim']);


    if (!this.dispute || !this.dispute.isCreatedRentIncrease()) {
      console.log(`[Error] An ARI notice template should only be used with ARI-C/ARI-E disputes.`);
    }

    this.isDisputeCreatedAriC = this.dispute.isCreatedAriC();
    this.isDisputeCreatedAriE = this.dispute.isCreatedAriE();
    this.isMHPTA = this.dispute.isMHPTA();

    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'));
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();
    }
    this.costCollection = IntakeAriDataParser.toCostCollection();
    this.units = IntakeAriDataParser.toUnitCollection();

    const ARI_E_ISSUE_CODE = configChannel.request('get', 'ARI_E_ISSUE_CODE');
    this.disputeClaim = (this.disputeClaims || []).length && (
      this.isDisputeCreatedAriC ?
        this.disputeClaims.find(disputeClaim => disputeClaim.isExpenseIssue()) :
        this.disputeClaims.find(disputeClaim => disputeClaim.getClaimCode() === ARI_E_ISSUE_CODE && ARI_E_ISSUE_CODE)
    );

    // Hard-code ARI-specific overrides to configurable notice template
    this.templateData = _.extend({}, this.templateData, {
        isParticipatoryHearing: true,
        noticeTitleDisplay: this.isDisputeCreatedAriC ?
          (this.isPrelim ? ARI_C_PRELIM_NOTICE_TITLE : ARI_C_NOTICE_TITLE) :
          (this.isPrelim ? ARI_E_PRELIM_NOTICE_TITLE : ARI_E_NOTICE_TITLE)
      },
      this.matchingUnit ? {
        tenancyUnitDisplay: this.matchingUnit.getUnitDescriptorDisplay(),
        tenancyAddressDisplay: this.matchingUnit.get('address'),
        tenancyPostalDisplay: this.matchingUnit.get('postal_zip'),
        tenancyCityDisplay: this.matchingUnit.get('city'),
      } : {}
    );
  },

  getExpenseIssueHtml() {
    let totalCalculatedRentIncreaseForUnit = 0;
    const unitId = this.matchingUnit && this.matchingUnit.get('unit_id');
    const remedyDisplayData = {};
    const riUnits = this.units.filter(unit => unit.hasSavedRentIncreaseData());
    const unitAddressLookup = _.object(riUnits.map(unit => unit.get('unit_id')), riUnits.map(unit => unit.getStreetDisplayWithDescriptor()))
    this.disputeClaim.getAllRemedies().forEach(remedyModel => {
      const associatedCost = this.costCollection.find(cost => cost.getRemedyId() === remedyModel.id);
      const eligibleRI = associatedCost && associatedCost.hasUnit(unitId) ? associatedCost && calculateCostRentIncreaseFn(remedyModel.getAmount(), associatedCost.getUnitIds().length) : 0;
      totalCalculatedRentIncreaseForUnit += eligibleRI || 0;
      
      remedyDisplayData[remedyModel.id] = {
        associatedCost,
        eligibleRI,
        improvedUnits: associatedCost && _.map(associatedCost.getUnitIds(), unitId => unitAddressLookup[unitId] || null).filter(u => u)
      };
    });

    return _.template(ariDisputeClaimTemplate)({
      Formatter,
      disputeClaim: this.disputeClaim,
      costCollection: this.costCollection,
      unitId,
      totalCalculatedRentIncreaseForUnit,
      remedyDisplayData
    });
  },

  onRender() {
    if (_.isFunction(NoticePreview.prototype.onRender)) NoticePreview.prototype.onRender.call(this);

    const ARI_C_INFO_TEXT = `The Residential Tenancy Branch has received an application for an additional rent increase to recover costs associated to eligible capital expenditures for the residential property and a ${this.isPrelim ? 'prehearing conference' : 'hearing'} has been scheduled.`;
    const ARI_E_INFO_TEXT = `The Residential Tenancy Branch has received an application for an additional rent increase to compensate for a financial loss resulting from an extraordinary increase in operating costs, or because the landlord, acting reasonably, has incurred financial loss for the financing costs of purchasing the ${this.isMHPTA ?'manufactured home park':'residential property'} and a ${this.isPrelim ? 'prehearing conference' : 'hearing'} has been scheduled.`;
    const ARI_C_RI_INFO_TEXT = `The following information has been provided to the Residential Tenancy Branch and describes the capital expenditures associated to eligible capital expenditures that are being stated as grounds for the additional rent increase.`;
    const ARI_E_RI_INFO_TEXT = `The following information has been provided to the Residential Tenancy Branch and describes the financial loss resulting from an extraordinary increase in operating costs, or because the landlord, acting reasonably, has incurred financial loss for the financing costs of purchasing the ${this.isMHPTA ?'manufactured home park':'residential property'} that are being stated as grounds for the additional rent increase.`;
    
    // Set up more custom overrides to the default template data, to fields that are not customizable in the standard preview
    this.$('#important-information tr:nth-child(2) .text_content').text(this.isDisputeCreatedAriC ? ARI_C_INFO_TEXT : ARI_E_INFO_TEXT);
    this.$('#filed-by .sectiontitle_onecol > span:first-child').text('An Application for an Additional Rent Increase Has Been Filed By');
    this.$('#application-header .main_header').text('Application for Additional Rent Increase');
    this.$('#dispute-information .sectiontitle_onecol').text('Rent Increase Information');
    this.$('#dispute-information tr:nth-child(2) .listitem').text(this.isDisputeCreatedAriC ? ARI_C_RI_INFO_TEXT : ARI_E_RI_INFO_TEXT);

    // Prelim hearing overrides
    if (this.isPrelim) {
      this.$('#important-information tr:first-child').hide();
      this.$('#hearing-information tr:first-child .sectiontitle_onecol').text(`Prehearing Conference Information`);

      this.$('#Participatoryservice-instructions tr:first-child .sectiontitle_onecol').text(`Important Information`);
      this.$('#Participatoryservice-instructions tr:nth-child(2) td').html(`
        <p class="text_content">A prehearing conference has been scheduled. The purpose of the prehearing conference is to address <b>procedural matters</b> and not the merits of the landlord's application for rent increase which is attached below. Tenants may submit documentary evidence using their Dispute Access Code below, although it is not a requirement at this time.
        </p>
        <p class="text_content">Before the prehearing conference, tenants should:</p>
        <div class="list_wrapper">
        <ul class="bullet_list">
          <li>coordinate with one another and determine whether a representative will be appointed. A representative may be an advocate, legal representative or an appointed tenant(s) that may speak and act on behalf of others. The prehearing conference will continue even if a party or their representative does not attend</li>
          <li>submit any documentary evidence, to both the landlord and the Residential Tenancy Branch, (suggested, but not required, as parties will have an opportunity to provide additional evidence after the prehearing conference).</li>
        </ul>
        </div>
        <p class="text_content">Procedural matters at the prehearing conference may include whether:</p>
        <div class="list_wrapper">
        <ul class="bullet_list">
          <li>the tenants are represented by a lawyer or advocate, or a tenant representative,</li>
          <li>all parties are correctly named</li>
          <li>either party requires additional documents to be produced or a specific witness to attend (Rule of Procedure 5.3)</li>
        </ul>
        </div>
        <p class="text_content">An Arbitrator will issue an interim decision or settlement agreement after the prehearing conference.</p>`
      );

      this.$('#applicant-information tr:nth-child(2)').hide();
      this.$('#respondent-information tr:nth-child(2)').hide();
    } else if (this.isDisputeCreatedAriE) {
      // If not prelim, and ARI-E
      this.$('#Participatoryservice-instructions .bullet_list li:last-child').text(`In most cases, an applicant can withdraw this dispute any time before the scheduled proceeding by notifying the other party and by contacting the Residential Tenancy Branch by phone at 1-800-665-8779. If you withdraw this dispute, you must notify the other party in writing and no proceeding will take place. Your filing fee will not be refunded.`);
    } else if (this.isDisputeCreatedAriC) {
      
      // If not prelim, and ARI-C
      this.$('#Participatoryservice-instructions .bullet_list li:nth-child(2)').after(`<li>
        There are specific Rules of Procedure for Additional Rent Increase for Capital Expenditures. See Information Sheet RTB-151 for more information:&nbsp;<a href="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb151.pdf">https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/information-sheets/rtb151.pdf</a>.
      </li>`);

      this.$('#respondent-information .sectiontitle_onecol').html(`Important Information for Respondents`);
      this.$('#respondent-information tr:nth-child(2) td').prepend(`<div>
        <p class="text_content">Applications for an additional rent increase for capital expenditures can be very complex and may involve many tenants. Due to the limited amount of time during the hearing, tenants should consider:</p>
        <div class="list_wrapper">
          <ul class="bullet_list">
            <li>coordinating with one another and determining whether a representative will be appointed. A representative may be an advocate, legal representative or an appointed tenant(s) that may speak and act on behalf of others. If tenants want to do this, each group of tenants must provide the RTB with written proof of the individual's authority to act on the group's behalf.</li>
            <li>providing written submissions, no longer than 10 pages, instead of oral testimony at the hearing. If a tenant provides written submissions, they will not be allowed to give oral testimony at the hearing. The arbitrator will consider written submissions regardless of whether the tenant attends the hearing (Rule 7.4).</li>
          </ul>
          <br/>
        </div>
        <p class="text_content">For clarity, if tenants appoint a representative to speak on their behalf, the tenants can still provide written submissions. In addition, if a representative provides written submissions, they will still be allowed to give oral testimony at the hearing.</p>
      </div>`);
    }

    // Some overrides only apply to ARI-C
    if (this.isDisputeCreatedAriC) {
      this.$('#filed-against .sectiontitle_onecol > span:first-child').text('The Tenants in the Unit are Listed as');
      this.$('#dispute-address .sectiontitle_onecol').text('Rental Address');
      this.$('#other-supporting-information').hide();
    }

    if (this.isDisputeCreatedAriC && this.disputeClaim) {
      this.$('.disputeclaims').html(this.getExpenseIssueHtml());
    }
  },

});