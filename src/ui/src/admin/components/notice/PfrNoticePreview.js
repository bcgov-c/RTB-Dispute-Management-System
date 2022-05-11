import Radio from 'backbone.radio';
import NoticePreview from './NoticePreview';
import IntakeAriDataParser from '../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';

const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');

const NOTICE_TITLE = 'Notice of Dispute Resolution Proceeding - Application for Vacant Possession for Renovation or Repair';

export default NoticePreview.extend({

  initialize(options) {
    NoticePreview.prototype.initialize.call(this, options);
    this.mergeOptions(options, ['matchingUnit']);

    if (!this.dispute || !this.dispute.isCreatedPfr()) {
      console.log(`[Error] An ARI notice template should only be used with PFR disputes.`);
    }

    this.disputeAddress = this.dispute.getAddressString();

    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'));
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();
    }

    this.units = IntakeAriDataParser.toUnitCollection();
    
    // Hard-code unit-based PFR-specific overrides to configurable notice template
    this.templateData = _.extend({}, this.templateData, {
        isParticipatoryHearing: true,
        noticeTitleDisplay: NOTICE_TITLE
      },
      this.matchingUnit ? {
        tenancyUnitDisplay: this.matchingUnit.getUnitDescriptorDisplay(),
        tenancyAddressDisplay: this.matchingUnit.get('address'),
        tenancyPostalDisplay: this.matchingUnit.get('postal_zip'),
        tenancyCityDisplay: this.matchingUnit.get('city'),
      } : {}
    );
  },

  onRender() {
    if (_.isFunction(NoticePreview.prototype.onRender)) {
      NoticePreview.prototype.onRender.call(this);
    }

    // Set up more custom overrides to the default template data, to fields that are not customizable in the standard preview
    this.$('#important-information tr:nth-child(2) .text_content').text('The Residential Tenancy Branch has received an Application for Vacant Possession for Renovation or Repair for the following rental unit and a hearing has been scheduled.');
    this.$('#filed-by .sectiontitle_onecol > span:first-child').text('An Application for Vacant Possession for Renovation or Repair Has Been Filed By');
    this.$('#filed-against .sectiontitle_onecol > span:first-child').text('The Tenants in the Unit are Listed as');
    this.$('#dispute-address .sectiontitle_onecol').text('Rental Address');
    this.$('#application-header .main_header').text('Application for Vacant Possession for Renovation or Repair');
    this.$('#dispute-information .sectiontitle_onecol').text('Application for Vacant Possession for Renovation or Repair Information');
    this.$('#dispute-information tr:nth-child(2) .listitem').text('The following information has been provided to the Residential Tenancy Branch and describes the request for vacant possession for renovation or repair.');

    // Remove all numbering for issues
    this.$('.issuetitle_num').remove();

    // Reset the claims html 
    this.$('.disputeclaims').html(`<table>${
      this.units.map(unit => this.getUnitInfoHtml(unit)).join('')
    }</table>`);
  },

  getUnitInfoHtml(unitModel) {
    const matchingIssue = unitModel.get('issue_id');
    const matchingUnitClaim = unitModel && this.disputeClaims && this.disputeClaims.find(disputeClaim => disputeClaim.claim.id === matchingIssue);
    const matchingDescription = matchingUnitClaim && matchingUnitClaim.getDescription();
    
    const unitInfoHtml = `
      <tr class="evidence-item">
        <td>
          <p class="listitem"><b>${unitModel.getStreetDisplayWithDescriptor()}, ${unitModel.get('postal_zip')}</b></p>
          <p class="evidence_text_content"><b>Description</b>:&nbsp;${matchingDescription || 'No description provided at time of application'}</p>
          <div class="spacer_sml">&nbsp;</div>
        </td>
      </tr>`;
    return unitInfoHtml;
  },

});
