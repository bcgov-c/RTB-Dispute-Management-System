import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import CMSArchiveParticipantsSectionTemplate from './CMSArchiveParticipantsSection_template.tpl';
import FileModel from '../../../core/components/files/File_model';
import ModalUpdateDMSFileNumber from './ModalUpdateDMSFileNumber';
import { routeParse } from '../../routers/mainview_router';
import template from './CMSArchiveRecords_template.tpl';

const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const decision_details =  {
  0:"Landlord", 
  1:"Tenant", 
  2:"Split Decision", 
  3:"Dismissed", 
  4:"Dismissed with Leave to Re-apply", 
  5:"Cancelled/Withdrawn", 
  6:"Jurisdiction Refused", 
  7:"Settled", 
  8:"Other"
}

const file_origin_vals =  {
  5: "Burnaby Walk-in", 
  10: "Kelowna Walk-in",
  15: "Victoria Walk-in", 
  20: "GA",
  30: "Online",
  40: "Mail/Fax"
}

const hearing_type_lookup = {
  0: 'Face to Face',
  1: 'Conference Call',
  2: 'Review Consideration'
};

const method_of_service_lookup = {
  0: 'Registered Mail',
  1: 'Personal Service',
  2: 'Posted on Door'
};

export default Marionette.View.extend({
  template,
  className:`cms-archive-dispute-info-page`,

  regions: {
    applicantsRegion: '.cms-archive-applicant-information-container',
    agentsRegion: '.cms-archive-agent-information-container',
    respondentsRegion: '.cms-archive-respondent-information-container'
  },

  ui: {
    fileNumberUrl: '.cms-archive-file-link',
    fileDownload: '.cms-archive-file-download',
    fileNumberEdit: '.cms-archive-dispute-edit-link'
  },

  events: {
    'click @ui.fileNumberUrl': 'clickFileNumber',
    'click @ui.fileDownload': 'clickFileDownload',
    'click @ui.fileNumberEdit': 'clickEditFileNumber'
  },

  clickEditFileNumber() {
    modalChannel.request('add', new ModalUpdateDMSFileNumber({ model: this.archiveModel }));
  },

  clickFileNumber(e) {
    let file_number = $(e.currentTarget).attr("id");
    if (!isNaN(file_number)) {
      file_number = Number(file_number);
    }

    Backbone.history.navigate(routeParse('cms_item', null, file_number), {trigger: true});
  },

  clickFileDownload(e) {
    e.preventDefault();
    const file_model = new FileModel({
      file_url: $(e.currentTarget).attr('url'),
      file_id: Number($(e.currentTarget).attr("file_id"))
    });
    file_model.download();
  },

  initialize(options) {
    this.mergeOptions(options, ['archiveModel', 'CMS_STATUS_DISPLAYS']);
  },

  onRender() {
    this.showChildView('applicantsRegion', new Marionette.View({
      template: CMSArchiveParticipantsSectionTemplate,
      templateContext: {
        participants: this.model.get('applicants'),
        participantType: this.model.get('applicant_type') === 0 ? 'Landlord' : 'Tenant'
      }
    }));

    this.showChildView('agentsRegion', new Marionette.View({
      template: CMSArchiveParticipantsSectionTemplate,
      templateContext: {
        participants: this.model.get('agents'),
        participantType: 'Agent'
      }
    }));

    this.showChildView('respondentsRegion', new Marionette.View({
      template: CMSArchiveParticipantsSectionTemplate,
      templateContext: {
        participants: this.model.get('respondents'),
        participantType: this.model.get('applicant_type') === 0 ? 'Tenant' : 'Landlord'
      }
    }));
  },

  _parseNotesField(noteContent) {
    const lineBreakFilter = (note) => note.replace(/(?:\r\n|\r|\n)/g, '<br/>');
    const timestampFilter = (note) => note.replace(/\b[1,5]\d{9}\b/g, match => Formatter.toDateAndTimeDisplay(Moment.unix(match)));

    return timestampFilter(lineBreakFilter(noteContent));
  },

  templateContext() {
    return {
      Formatter,
      archiveModel: this.archiveModel,
      status: this.CMS_STATUS_DISPLAYS[this.model.get('dispute_status')],
      decision_details_vals: decision_details,
      file_origin: file_origin_vals[this.model.get('file_origin')],
      abandoned_date: this.model.get('abandoned date'),
      notes_history: this.model.get('notes_history') ? this._parseNotesField(this.model.get('notes_history')) : null,
      notes: this.model.get('notes') ? this._parseNotesField(this.model.get('notes')) : null,
      hearingTypeDisplay: hearing_type_lookup[this.model.get('hearing_type')],
      methodOfServiceDisplay: method_of_service_lookup[this.model.get('method_of_service')]
    };
  }

});
