import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeServiceView from '../../components/service/DisputeService';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import template from './HearingToolsService_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'hearing-tools-container',

  ui: {
    services: '.notice-services-container',
    edit: '.hearing-tools-edit',
    cancel: '.hearing-tools-save-controls-cancel',
    save: '.hearing-tools-save-controls-save',

    notServed: '.hearing-tools-mark-not-served',
    served: '.hearing-tools-mark-served'
  },

  regions: {
    servicesRegion: '@ui.services'
  },

  events: {
    'click @ui.services': 'clickBody',
    'click @ui.edit': 'clickEdit',
    'click @ui.cancel': 'clickCancel',
    'click @ui.save': 'clickSave',

    'click @ui.served': 'clickMarkAllServed',
    'click @ui.notServed': 'clickMarkAllNotServed',
  },

  clickBody() {
    if (this.mode === 'service-view') {
      this.clickEdit();
    }
  },

  clickEdit() {
    if (!this.disputeModel) {
      this.renderInEditMode();
      return;
    }

    this.disputeModel.checkEditInProgressPromise().then(
      () => {
        this.disputeModel.startEditInProgress(this.model);
        this.renderInEditMode();
      },
      () => {
        this.disputeModel.showEditInProgressModalPromise()
      });
  },

  clickCancel() {
    const services = this.model.getServices();
    const to_remove = [];
    services.each(function(model) {
      if (model.isNew()) {
        to_remove.push(model);
      } else {
        model.resetModel();
      }
    });
    services.remove(to_remove, { silent: true });


    if (typeof this.resetServicesFn === 'function') {
      this.resetServicesFn(this);
    }

    this.renderInViewMode();
  },

  clickMarkAllServed() {
    // Always un-set edit mode before API save
    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }
    
    const services = this.model.getServices();
    const saveAsAcknowledgedServedFn = () => {
      services.each(serviceModel => serviceModel.setToAcknowledgedServed());
      loaderChannel.trigger('page:load');
      Promise.all(services.map(serviceModel => serviceModel.save(serviceModel.getApiChangesOnly())))
        .then(() => {
          this.renderInViewMode();
          loaderChannel.trigger('page:load:complete');
        }, err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.SAVE.SERVICE', () => {
            this.renderInViewMode();
          });
          handler(err);
        });
    };

    if ( services.any(serviceModel => serviceModel.hasSavedApiData(['service_method', 'service_date', 'received_date'])) ) {
      const hideReason = services.all(serviceModel => !serviceModel.getServiceFileModels().length);
      const modalView = new ModalMarkAsDeficientView({
        title: 'Mark All Acknowledge Served',
        topHtml: `
          <p><b>Warning:</b> This action will cause existing information to be cleared.<p>
          <p>This will delete service information associated to respondent(s) including any service methods or service dates.</p>
          <p>This will move proof of service file(s) associated to the respondent(s) to deficient documents.
          ${hideReason ? '' : 'A reason for this removal is required and will be stored with the removed proof file(s).'}</p>
        `,
        bottomHtml: `
          <p>Are you sure you want to change the service information for the affected respondent(s)?</p>
        `,
        hideReason,
        getRemovalReasonFn: (enteredReason) => `Service record removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
        clickMarkDeficientFn: (reason) => {
          const allXhr = services.filter(m => m.getServiceFileModels().length).map(serviceModel => {
            const serviceFileDescription = serviceModel.getServiceFileDescription();
            serviceFileDescription.markAsDeficient(reason);
            return _.bind(serviceFileDescription.save, serviceFileDescription, serviceFileDescription.getApiChangesOnly());
          });
          Promise.all(allXhr.map(xhr => xhr()))
            .then(() => saveAsAcknowledgedServedFn(),
              generalErrorFactory.createHandler('ADMIN.FILEDESCRIPTION.SAVE')
            )
            .finally(() => modalView.close());
        }
      });
      modalChannel.request('add', modalView);
    } else {
      saveAsAcknowledgedServedFn();
    }  
  },

  clickMarkAllNotServed() {
    this._markAllNotServed().done(() => {
      if (typeof this.onSaveAllNotServedFn !== 'function') {
        return;
      }
      this.onSaveAllNotServedFn(this);
    });
  },

  _markAllNotServed() {
    const dfd = $.Deferred();
    const services = this.model.getServices();
    const saveAsUnservedFn = () => {
      services.each(serviceModel => serviceModel.setToUnserved());
      loaderChannel.trigger('page:load');
      Promise.all(services.map(serviceModel => serviceModel.save(serviceModel.getApiChangesOnly())))
        .then(response => {
          loaderChannel.trigger('page:load:complete');
          this.renderInViewMode();
          dfd.resolve(response);
        }, err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.SAVE.SERVICE', () => {
            this.renderInViewMode();
            dfd.reject();
          });
          handler(err);
        });
    };

    if ( services.any(serviceModel => serviceModel.hasSavedApiData(['service_method', 'service_date', 'received_date'])) ) {
      const hideReason = services.all(serviceModel => !serviceModel.getServiceFileModels().length);
      const modalView = new ModalMarkAsDeficientView({
        title: 'Mark All Not Served',
        topHtml: `
          <p><b>Warning:</b> This action will cause existing information to be cleared.<p>
          <p>This will delete service information associated to respondent(s) including any service methods or service dates.</p>
          <p>This will move proof of service file(s) associated to the respondent(s) to deficient documents.
          ${hideReason ? '' : 'A reason for this removal is required and will be stored with the removed proof file(s).'}</p>
        `,
        bottomHtml: this.saveAllNotServedModalBottomText ? this.saveAllNotServedModalBottomText :
          `<p>Are you sure you want to change the service information for the affected respondent(s)?</p>`,
        hideReason,
        getRemovalReasonFn: (enteredReason) => `Service record removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
        clickMarkDeficientFn: (reason) => {
          const allXhr = services.filter(m => m.getServiceFileModels().length).map(serviceModel => {
            const serviceFileDescription = serviceModel.getServiceFileDescription();
            serviceFileDescription.markAsDeficient(reason);
            return _.bind(serviceFileDescription.save, serviceFileDescription, serviceFileDescription.getApiChangesOnly());
          });
          Promise.all(allXhr.map(xhr => xhr()))
            .then(() => saveAsUnservedFn(),
              generalErrorFactory.createHandler('ADMIN.FILEDESCRIPTION.SAVE', () => {
                dfd.reject();
              })
            )
            .finally(() => modalView.close() );
        }
      });
      modalChannel.request('add', modalView);
    } else {
      saveAsUnservedFn();
    }

    return dfd.promise();
  },

  clickSave() {
    const noticeServices = this.getChildView('servicesRegion');

    let all_valid = true;
    if (noticeServices && noticeServices.children) {
      noticeServices.children.each(function(noticeServiceView) {
        all_valid = noticeServiceView.validateAndShowErrors() && all_valid;
      });
    }

    if (!all_valid) {
      return;
    }
    
    if (noticeServices && noticeServices.children) {
      noticeServices.children.each(function(noticeServiceView) {
        noticeServiceView.saveViewDataToModel();
      });
    }

    const servicesToClear = [];
    this.model.getServices().each(function(noticeServiceModel) {
      if (!noticeServiceModel.isServed()) {
        noticeServiceModel.setToUnserved({ is_served: noticeServiceModel.get('is_served') });
        servicesToClear.push(noticeServiceModel);
      }
    }, this);

    loaderChannel.trigger('page:load');

    if (!_.isEmpty(servicesToClear)) {
      console.log(`[Warning] Found services that should be cleared, but shouldn't be any at this point of HearingTools save!`);
    }

    this.model.saveService()
      .done(() => {
        loaderChannel.trigger('page:load:complete');
        this.renderInViewMode();
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.SAVE.SERVICE', () => {
          this.renderInViewMode();
        });
        handler(err);
      });
  },

  /**
   * 
   * @param {Class} [childView] - Optional override display class to use for showing the services
   * @param {String} [containerTitle] - Optional override html for the container title
   * @param {Function} [resetServicesFn] - Optional function to reset services from API when cancel is clicked
   
   * @param {String} [saveAllNotServedModalBottomText] - Optional override text to display as bottomHtml of the Mark Deficient modal when "save all as not served" is clicked
   * @param {String} [saveAllNotServedButtonText] - Optional override text to use on the "Not Served" button
   * @param {Function} [onSaveAllNotServedFn] - Optional function to be run after default handling of "save all as not served" is complete
   */
  initialize(options) {
    this.mergeOptions(options, ['childView', 'containerTitle', 'unitCollection', 'resetServicesFn', 'saveAllNotServedModalBottomText',
        'saveAllNotServedButtonText', 'onSaveAllNotServedFn',]);
    this.mode = 'service-view';
    this.disputeModel = disputeChannel.request('get');
  },

  renderInViewMode() {
    this.mode = 'service-view';
    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }
    this.render();
  },

  renderInEditMode() {
    this.mode = 'service-edit';
    if (this.disputeModel) {
      this.disputeModel.startEditInProgress(this.model);
    }
    this.render();
  },

  onRender() {
    this.showChildView('servicesRegion', new Marionette.CollectionView({
      childViewOptions: (child) => {
        const matchingUnit = this.unitCollection && this.unitCollection.find(unit => unit.hasParticipantId(child.get('participant_id')));
        return {
          mode: this.mode,
          matchingUnit
        };
      },
      childView: this.childView || DisputeServiceView,
      collection: this.model.getServices()
    }));
  },

  templateContext() {
    return {
      mode: this.mode,
      containerTitle: this.containerTitle || 'Respondent Service',
      saveAllNotServedButtonText: this.saveAllNotServedButtonText || 'Mark All Not Served',
    };
  }

});