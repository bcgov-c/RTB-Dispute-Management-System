
import Radio from 'backbone.radio';
import ModalBaseView from '../modals/ModalBase';
import TextareaView from '../textarea/Textarea';
import TextareaModel from '../textarea/Textarea_model';
import DropdownModel from '../dropdown/Dropdown_model';
import DropdownView from '../dropdown/Dropdown';
import InputView from '../input/Input';
import InputModel from '../input/Input_model';
import EmailModel from '../email/Email_model';
import template from './ModalSendProblem_template.tpl';
import emailProblemTemplate from './EmailProblem_template.tpl';

const DROPDOWN_CODE_SOMETHING_BROKEN = '1';
const DROPDOWN_CODE_SOMETHING_WRONG = '2';
const DROPDOWN_CODE_SUGGEST_IMPROVEMENT = '3';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'sendProblem-modal',

  regions : {
    reportDropDownRegion: '.report-dropdown',
    problemDescriptionRegion: '.problem-description',
    contactQuestionRegion: '.contact-questions-dropdown',
    emailAddressRegion: '.email-address'   
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      'submit': '.btn-submit'
    });
  },

  events() {
    return Object.assign({}, ModalBaseView.prototype.events, {
      'click @ui.submit': 'clickSubmit',
    });
  },

  clickSubmit() {
    const dispute = disputeChannel.request('get');
    let is_valid = true;

    _.each(this.viewsToValidate, regionName => {
      is_valid = this.getChildView(regionName).validateAndShowErrors() && is_valid;
    })

    if (!is_valid) {
      return;
    }

    const emailHtml = emailProblemTemplate({
      COMMON_IMAGE_ROOT: configChannel.request('get', 'COMMON_IMAGE_ROOT'),
      Formatter,
      site_name: this.siteName,
      support_type: this.reportTypeModel.getSelectedText(),
      email_address: this.emailAddressModel.getData(),
      contact_user: this.contactModel.getData() === 0 ? 'Yes' : 'No',
      problem_description: this.detailedDescriptionModel.getData(),
      file_number: dispute ? dispute.get('file_number') : null
    });

    this._sendEmail(emailHtml);
  },

  _sendEmail(html_body) {
    const newEmail = new EmailModel();

    newEmail.set({
      subject: `Support Request: ${this.reportTypeModel.getSelectedText()}`,
      email_to: configChannel.request('get', 'EMAIL_SUPPORT_TO'),
      email_from: configChannel.request('get', 'EMAIL_FROM_DEFAULT'),
      html_body: html_body, 
      is_active: 1
    });

    newEmail.save()
      .done(() => this.close() )
      .fail(() => {
        console.log("[Error] - Failed trying to send email.");
        alert("Could not send email.");
      });
  },

  initialize(options) {
    this.mergeOptions(options, ['siteName']);

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.reportTypeModel = new DropdownModel({
      labelText: 'What would you like to report?',
      optionData:[
        { value: DROPDOWN_CODE_SOMETHING_BROKEN, text: 'Something is broken' },
        { value: DROPDOWN_CODE_SOMETHING_WRONG, text: 'Something is wrong' },
        { value: DROPDOWN_CODE_SUGGEST_IMPROVEMENT, text: 'Suggest an improvement' }
      ],
      errorMessage: `Please enter the type of report`,
      defaultBlank: true,
      required: true,
    });

    this.detailedDescriptionModel = new TextareaModel({
      labelText: 'Provide a detailed description',
      errorMessage: 'Please enter a detailed description',
      required: true,
      value: null,
    });

    this.contactModel = new DropdownModel({
      labelText: 'Can we contact you if we have questions?',
      optionData: [{value: 0, text: 'Yes'}, {value: 1, text: 'No'}],
      errorMessage: `Please verify whether we can contact you`,
      defaultBlank: true,
      required: true,
    });     

    this.emailAddressModel = new InputModel({
      labelText: 'If Yes, please provide your email address',
      inputType: 'email',
      errorMessage: 'Please enter an email',
      required: false,
      value: null,
    });   

    this.viewsToValidate = ['reportDropDownRegion', 'problemDescriptionRegion', 'contactQuestionRegion', 'emailAddressRegion'];
  },

  setupListeners() {
    this.listenTo(this.contactModel, 'change:value', (model, value) => {
      this.emailAddressModel.set('required',  Number(value) === 0);
      this.showChildView('emailAddressRegion', new InputView({ model: this.emailAddressModel }));
    });
  },
  
  onRender() {
    this.showChildView('reportDropDownRegion', new DropdownView({model: this.reportTypeModel}));
    this.showChildView('problemDescriptionRegion', new TextareaView({model: this.detailedDescriptionModel}));
    this.showChildView('contactQuestionRegion', new DropdownView({model: this.contactModel}));
    this.showChildView('emailAddressRegion', new InputView({model: this.emailAddressModel}));
  }

});
