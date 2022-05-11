import Backbone from 'backbone';
import React from 'react';
import Radio from 'backbone.radio';
import Question from '../../../../core/components/question/Question';
import QuestionModel from '../../../../core/components/question/Question_model';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import AccessCodeParticipant from './AccessCodeParticipants';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import './ModalAccessCodeLookup.scss';

const LANDLORD_CODE = 0;
const TENANT_CODE = 1;

const participantsChannel = Radio.channel('participants');

const ModalAccessCodeLookup = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.participants = participantsChannel.request('get:all:participants', { include_removed: false });
    this.landlordParticipants = new Backbone.Collection (new Backbone.Collection(this.participants).filter(participant => participant.isLandlord()));
    this.tenantParticipants = new Backbone.Collection (new Backbone.Collection(this.participants).filter(participant => participant.isTenant()));
    this.participantTypeModel = new QuestionModel({
      optionData: [
        { name: 'decision-one-no', value: TENANT_CODE, cssClass: 'access-code-lookup__question-button option-button', text: 'Tenant'},
        { name: 'decision-one-yes', value: LANDLORD_CODE, cssClass: 'access-code-lookup__question-button option-button', text: 'Landlord'}
      ],
      question_answer: null,
    });

    this.listenTo(this.participantTypeModel, 'change:question_answer', () => this.render());
    this.listenTo(this.landlordParticipants, 'login:participant', (model) => this.closeModalAndLogin(model, this.participantTypeModel.getData()));
    this.listenTo(this.tenantParticipants, 'login:participant', (model) => this.closeModalAndLogin(model, this.participantTypeModel.getData()));
  },

  regions: {
    participantTypeRegion: '.access-code-lookup__type',
    accessCodeParticipantsRegion: '.access-code-lookup__participants'
  },

  closeModalAndLogin(model, participantType) {
    this.close();
    this.trigger('login:participant', model, participantType);
  },

  onRender() {
    this.showChildView('participantTypeRegion', new Question({ model: this.participantTypeModel }));
    if (this.participantTypeModel.getData() !== null) this.showChildView('accessCodeParticipantsRegion', new AccessCodeParticipant({ collection: this.participantTypeModel.getData() === LANDLORD_CODE ? this.landlordParticipants : this.tenantParticipants }));
  },

  template() {
    const isPageHidden = this.participantTypeModel.getData() === null;
    const participantInfo = () => {
      if (isPageHidden) return;
      return (
        <>
          <p className="access-code-lookup__description">
            <p>For privacy protection, the participant information is partially hidden. Verify the participant's name, email and/or phone number. If none of this information matches, <b>do not</b> click to login and contact RTB Support.</p>
            <p>Alternatively, to recover their Access Code, select the 'I want to recover my Access Code by email' option on the main page.</p>
          </p>
          <div className="access-code-lookup__participants"></div>
        </>
      );
    };
    const buttonText = isPageHidden ? `Exit` : `No Matches - Exit`;
    return (
      <div className="access-code-lookup">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Access Code Lookup</h4>
              <div className="modal-close-icon-lg close-x"></div>
            </div>
            <div className="modal-body">
              <span>What type of participant is this or who are they associated to?</span>
              <div className="access-code-lookup__type"></div>
              { participantInfo() }
              <div className="modal-button-container">
                <button className="btn btn-lg btn-default btn-cancel cancel-button" onClick={() => this.close()}>{buttonText}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

_.extend(ModalAccessCodeLookup.prototype, ViewJSXMixin);
export default ModalAccessCodeLookup

