import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import CheckboxCollection from '../../../../core/components/checkbox/Checkbox_collection';
import CheckboxCollectionView from '../../../../core/components/checkbox/Checkboxes';

const modalSelectEmailTemplateHtml = `<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Select Message Recipients</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="modalEmailRecipients-cols">
        <div class="modalEmailRecipients-applicants">
          <div class="modalEmailRecipients-header">
            <div class="modalEmailRecipients-title">Applicants (<%= applicantTypeDisplay %>)</div>
            <div class="modalEmailRecipients-select-all general-link">select all</div>
          </div>
          <div class="modalEmailRecipients-checkboxes"></div>
        </div>    
        <div class="modalEmailRecipients-respondents">
          <div class="modalEmailRecipients-header">
            <div class="modalEmailRecipients-title">Respondents (<%= respondentTypeDisplay %>)</div>
            <div class="modalEmailRecipients-select-all general-link">select all</div>
          </div>
          <div class="modalEmailRecipients-checkboxes"></div>
        </div>
      </div>
      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel">Cancel</button>
        <button type="button" class="btn btn-lg btn-primary btn-continue">Use Selected</button>
      </div>
    </div>
  </div>
</div>`;

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');

export default ModalBaseView.extend({
  id: 'modalSelectEmailRecipients',
  template: _.template(modalSelectEmailTemplateHtml),  
  regions: {
    applicantCheckboxesRegion: '.modalEmailRecipients-applicants .modalEmailRecipients-checkboxes',
    respondentCheckboxesRegion: '.modalEmailRecipients-respondents .modalEmailRecipients-checkboxes'
  },
  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      selectAllApplicants: '.modalEmailRecipients-applicants .modalEmailRecipients-select-all',
      selectAllRespondents: '.modalEmailRecipients-respondents .modalEmailRecipients-select-all',
      btnSave: '.btn-continue'
    });
  },
  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.selectAllApplicants': function() { this.clickSelectAll(this.applicantCheckboxes); },
      'click @ui.selectAllRespondents': function() { this.clickSelectAll(this.respondentCheckboxes); },
      'click @ui.btnSave': 'clickSave'
    });
  },
  
  clickSelectAll(checkboxCollection) {
    checkboxCollection.where({ checked: false }).forEach(model => model.set('checked', true, { silent: true }));
    this.render();
  },

  clickSave() {
    this.trigger('save:complete', [
      ...this.applicantCheckboxes.getData().map(c => c.get('_participantModel')),
      ...this.respondentCheckboxes.getData().map(c => c.get('_participantModel'))
    ]);
  },

  initialize(options) {
    this.mergeOptions(options, ['customRecipientList', 'templateModel']);

    const deliveryRule = this.templateModel?.config?.deliveryRule;
    const forceEmail = deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_EMAIL_ONLY');
    const allowPickups = this.templateModel?.config?.allowPickups;
    const displayOptions = forceEmail || !allowPickups ? { no_pickup: true } : {}

    const participantCheckboxParseFn = (p) => ({
      html: p.getMessageRecipientDisplayHtml(displayOptions),
      checked: !!(this.customRecipientList && _.find(this.customRecipientList, _p => _p.id === p.id && _p.id)),
      _participantModel: p,
      disabled: ((forceEmail || !allowPickups) && !p.get('email')) || (!forceEmail && !allowPickups && !p.hasDeliveryByEmail())
    });

    this.applicantCheckboxes = new CheckboxCollection(participantsChannel.request('get:applicants').map(participantCheckboxParseFn));
    this.respondentCheckboxes = new CheckboxCollection(participantsChannel.request('get:respondents').map(participantCheckboxParseFn));
  },
  onRender() {
    this.showChildView('applicantCheckboxesRegion', new CheckboxCollectionView({ collection: this.applicantCheckboxes }));
    this.showChildView('respondentCheckboxesRegion', new CheckboxCollectionView({ collection: this.respondentCheckboxes }));
  },

  templateContext() {
    const dispute = disputeChannel.request('get');
    const isLandlord = dispute.isLandlord();
    return {
      applicantTypeDisplay: isLandlord ? 'Landlords' : 'Tenants',
      respondentTypeDisplay: isLandlord ? 'Tenants' : 'Landlords'
    };
  }
});