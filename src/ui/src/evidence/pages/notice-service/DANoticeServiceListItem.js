import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import ExternalNoticeServiceModel from '../../components/external-api/ExternalNoticeService_model';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import FileDescriptionCollection from '../../../core/components/files/file-description/FileDescription_collection';
import template from './DANoticeServiceListItem_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const sessionChannel = Radio.channel('session');
const modalChannel = Radio.channel('modals');
const participantChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'standard-list-item',

  ui: {
    editNoticeService: '.da-notice-service-modify-add'
  },

  events: {
    'click @ui.editNoticeService': 'clickEditNoticeService'
  },

  clickEditNoticeService() {
    const mainProofFileDescription = this.model.getServiceFileDescription();
    const otherProofFileDescription = this.model.getOtherServiceFileDescription();
    
    let deleteServiceModalView;
    if (this.existingFilesCount && ((!mainProofFileDescription?.get('is_deficient') && mainProofFileDescription) || (otherProofFileDescription && !otherProofFileDescription?.get('is_deficient')))) {
      deleteServiceModalView = new ModalMarkAsDeficientView({
        title: 'Delete previous service information?',
        topHtml: '<p>Warning: All previously added service information will be deleted and you will have to add it again.  A reason for this removal is required and will be stored with the removed file(s) for future reference.</p>',
        bottomHtml: `<p>Are you sure you would like to continue?</p>`,
        getRemovalReasonFn: (enteredReason) => `Notice Service record removed by external user ${sessionChannel.request('name')} (${this.appModel.get('accessCode')}) on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
        collection: new FileDescriptionCollection([mainProofFileDescription, otherProofFileDescription])
      });
      modalChannel.request('add', deleteServiceModalView);
    } else if (this.isServed) {
      deleteServiceModalView = modalChannel.request('show:standard', {
        title: 'Delete previous service information?',
        bodyHtml: `<p>Warning: All previously added service information will be deleted and you will have to add it again. Are you sure you would like to continue?</p>`,
        primaryButtonText: 'Delete All',
        onContinueFn(modalView) {
          modalView.trigger('save:complete');
        }
      });
    } else {
      this._routeToEditNoticeServicePage();
    }

    if (!deleteServiceModalView) {
      return;
    }

    this.listenTo(deleteServiceModalView, 'save:complete', () => {
      deleteServiceModalView.close();
      loaderChannel.trigger('page:load');
      const noticeServiceSaveModel = new ExternalNoticeServiceModel(this.model.toJSON());
      noticeServiceSaveModel.saveAsUnserved({ is_served: null })
        .done(() => {
          this.model.set(noticeServiceSaveModel.toJSON());
          this._routeToEditNoticeServicePage();
        })
        .fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('DA.NOTICESERVICE.SAVE');
          handler(err);
        });
    });
  },

  _routeToEditNoticeServicePage() {
    this.appModel.set('noticeServiceToEdit', this.model);
    Backbone.history.navigate(this.getOption('serviceRoute') || 'notice/service', { trigger: true });
  },

  initialize(options) {
    this.mergeOptions(options, ['appModel']); 
    const mainProofFiles = this.model.getProofFileModels()?.filter(file => file.isUploaded());
    const otherProofFiles = this.model.getOtherProofFileModels()?.filter(file => file.isUploaded());
    this.existingFilesCount = mainProofFiles?.length + otherProofFiles?.length;
    this.isServed = this.model.isServed();
  },

  templateContext() {
    return {
      Formatter,
      respondent: participantChannel.request('get:respondents').findWhere({participant_id: this.model.get('participant_id')}),
      service_method: Formatter.toNoticeMethodDisplay(this.model.get('service_method')),
      fileCount: this.existingFilesCount
    };
  }
});