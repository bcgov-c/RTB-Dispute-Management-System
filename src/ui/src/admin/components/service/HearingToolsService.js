/**
 * @fileoverview - View wrapper for DisputeService that displays clickable actions related to service. Becomes enabled when hearing tools is selected
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeServiceView from '../../components/service/DisputeService';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import template from './HearingToolsService_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
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
    editModeBtns: '.hearing-tools-edit-mode-buttons',

    showArchived: '.show-archived-checkbox',
    notServed: '.hearing-tools-mark-not-served',
    served: '.hearing-tools-mark-served'

  },

  regions: {
    servicesRegion: '@ui.services',
    archivedRegion: '@ui.showArchived'
  },

  events: {
    'click @ui.services': 'clickBody',
    'click @ui.edit': 'clickEdit',
    'click @ui.cancel': 'clickCancel',
    'click @ui.save': 'clickSave',

    'click @ui.served': 'clickMarkAllServed',
    'click @ui.notServed': 'clickMarkAllNotServed',
    'click @ui.archived': 'clickShowArchived'
  },

  clickBody(ev) {
    const subServiceClasses=['sub-service-icon-denied','sub-service-icon-not-set', 'sub-service-icon-approved'];
    if (this.mode === 'service-view' && ev.target.className !== 'filename-download' && !subServiceClasses.includes(ev.target.className)) {
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
    this.getUI('editModeBtns').addClass('hidden');
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
      const hideReason = services.all(serviceModel => !serviceModel.getProofFileModels().length);
      const modalView = new ModalMarkAsDeficientView({
        title: 'Mark All Editable Acknowledge Served',
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
          const allXhr = services.filter(m => m.getProofFileModels().length).map(serviceModel => {
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
    this.markAllNotServed().done(() => {
      if (typeof this.onSaveAllNotServedFn !== 'function') {
        return;
      }
      this.onSaveAllNotServedFn(this);
    });
  },

  isArbEditable() {
    const currentUser = sessionChannel.request('get:user');
    return currentUser.isArbitrator();
  },

  markAllNotServed() {
    const dfd = $.Deferred();
    const services = this.model.getServices();
    const saveAsUnservedFn = () => {
      services.each(serviceModel => serviceModel.setToUnserved({validation_status: configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_CONFIRMED')}));
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
      const hideReason = services.all(serviceModel => !serviceModel.getProofFileModels().length);
      const modalView = new ModalMarkAsDeficientView({
        title: 'Mark All Editable Not Served',
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
          const allXhr = services.filter(m => m.getProofFileModels().length).map(serviceModel => {
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
      noticeServices.children.each(function(disputeServiceView) {
        all_valid = disputeServiceView.validateAndShowErrors() && all_valid;
      });
    }

    if (!all_valid) {
      return;
    }
    
    if (noticeServices && noticeServices.children) {
      noticeServices.children.each(function(disputeServiceView) {
        disputeServiceView.saveViewDataToModel();
      });
    }

    loaderChannel.trigger('page:load');

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
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.archivedCheckboxModel = new CheckboxModel({
      html: 'Show replaced last participant record',
      required: false,
      checked: true,
    });
  },

  setupListeners() {
    this.listenTo(this.archivedCheckboxModel, 'change:checked', () => this.render());
    this.listenTo(this.model.getServices(), 'render:viewMode', () => this.renderInViewMode())
    this.listenTo(this.model.getServices(), 'save:service', () => this.clickSave());
  },

  isEditMode() {
    return this.mode === 'service-edit';
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
          matchingUnit,
          showArchived: this.archivedCheckboxModel.getData(),
          isNoticeService: true,
          collection: this.model.getServices()
        };
      },
      childView: this.childView || DisputeServiceView,
      collection: this.model.getServices()
    }));

    if (this.isEditMode()) this.showChildView('archivedRegion', new CheckboxView({ model: this.archivedCheckboxModel }));
  },

  templateContext() {
    return {
      mode: this.mode,
      isEditMode: this.isEditMode(),
      containerTitle: this.containerTitle || 'Respondent Service',
      saveAllNotServedButtonText: this.saveAllNotServedButtonText || 'Mark All Editable Not Served',
      saveAllAcknowledgedServedButtonText: this.saveAllAcknowledgedServedButtonText || 'Mark All Editable Acknowledged Served',
      isArbEditable: this.isArbEditable()
    };
  }

});