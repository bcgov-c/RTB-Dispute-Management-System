import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ContextContainer from '../../../components/context-container/ContextContainer';
import DisputeSubServiceView from './DisputeSubService';
import ManageSubServiceTable from './ManageSubServiceTable';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import SubstitutedServiceCollection from '../../../../core/components/substituted-service/SubstitutedService_collection';

const disputeChannel = Radio.channel('dispute');
const noticeChannel = Radio.channel('notice');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const ModalManageSubService = ModalBaseView.extend({
  id: 'manageSubService-modal',

  initialize() {
    this.template = this.template.bind(this);
    this.partyCollection = this.model.collection;

    this.filterSubServ = false;
    this.subServices = noticeChannel.request('get:subservices');
    this.activeSubServModel = this.subServices.find(subService => subService.get('service_to_participant_id') === this.model.id);
    this.serviceQuadrant = this.activeSubServModel ? noticeChannel.request('get:subservices:quadrant:config', this.activeSubServModel.get('service_to_participant_id')) : null;
    this.SERVICE_DOC_TYPE_DISPLAY = configChannel.request('get', 'SERVICE_DOC_TYPE_DISPLAY');

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.hideInactiveModel = new CheckboxModel({
      html: 'Hide applications not relevant to current documents requiring service',
    })
  },

  reRenderView(region) {
    const view = this.getChildView(region);
    if (view) {
      view.render();
    }
  },

  setupListeners() {
    this.listenTo(this.hideInactiveModel, 'change:checked', (model, value) => {
      this.filterSubServ = value && this.subServices.length;
      this.render();
    });
  },

  getActiveSubServices() {
    if (!this.serviceQuadrant) return new SubstitutedServiceCollection();
    
    const filteredSubServices = this.subServices.filter((model) => {
      if (model.get('request_doc_type') <= configChannel.request('get', 'SERVICE_DOC_TYPE_OTHER')) {
        return this.serviceQuadrant.acceptedDocTypes.includes(model.get('request_doc_type')); 
      }

      return this.serviceQuadrant.quadrantDocumentIds.includes(model.get('request_doc_type'));
    });
    
    if (!filteredSubServices.find((model) => this.activeSubServModel.id === model.id)) {
      this.activeSubServModel = filteredSubServices[0];
    }

    return new SubstitutedServiceCollection(filteredSubServices);
  },

  onBeforeRender() {
    this.activeSubServices = this.filterSubServ ? this.getActiveSubServices() : this.subServices;
    if (!this.activeSubServModel) this.activeSubServModel = this.activeSubServices.models[0];

    // Because we are using a new collection each time, have to apply listeners each time
    this.stopListening(this.activeSubServices, 'change:selected:service');
    this.listenTo(this.activeSubServices, 'change:selected:service', (subServiceModel) => {
      this.activeSubServModel = subServiceModel;
      this.renderSubServiceEditView(subServiceModel.id);
      this.getChildView('subServiceTable').setActiveRowSubServId(subServiceModel.id);
      this.getChildView('subServiceTable').render();
    });
    this.stopListening(this.activeSubServices, 'save:complete');
    this.listenToOnce(this.activeSubServices, 'save:complete', () => {
      noticeChannel.request('update:subservice:participants', disputeChannel.request('get:id')).always(() => {
        this.partyCollection.trigger('update', this.partyCollection, { changes: {} });
        this.render();
        loaderChannel.trigger('page:load:complete');
      });
    });
  },

  onRender() {
    this.showChildView('hideInactiveCheckbox', new CheckboxView({ model: this.hideInactiveModel }));
    if (this.activeSubServModel) this.showChildView('subServiceTable', new ManageSubServiceTable({ collection: this.activeSubServices, initSubServiceId: this.activeSubServModel.id }));

    if (!this.activeSubServices.length) return;
    this.renderSubServiceEditView(this.activeSubServModel.get('sub_service_id'));
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave'
    });
  },

  regions: {
    hideInactiveCheckbox: '.sub-serv-inactive-checkbox',
    subServiceTable: '.sub-serv-table',
    subServiceEditRegion: '.manage-sub-service-edit-container'
  },

  template() {
    const renderNoSubServicesMsg = () => { 
      if (this.activeSubServices.length) return;
      return <div className="standard-list-empty">No substituted service requests available.</div>
    };

    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Substituted Service Requests</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <div className="manage-sub-service-top-row-container">
              <div className="sub-serv-inactive-checkbox"></div>
              { renderNoSubServicesMsg() }
              <div className="sub-serv-table"></div>
            </div>

            <div className="manage-sub-service-edit-container"></div>

          </div>
        </div>
      </div>
    )
  },

  renderSubServiceEditView(subServiceId) {
    const selectedSubServiceModel = this.subServices.findWhere({ sub_service_id: subServiceId });
    
    if (!selectedSubServiceModel) {
      console.log(`[Warning] Cannot find matching sub service model`);
      return;
    }

    const serviceToParticipant = participantsChannel.request('get:participant', selectedSubServiceModel.get('service_to_participant_id'));

    const requestStatusImgClass = selectedSubServiceModel.getRequestStatusImgClass();
    this.showChildView('subServiceEditRegion', ContextContainer.withContextMenu({
      wrappedView: new DisputeSubServiceView({ model: selectedSubServiceModel }),
      titleDisplay: serviceToParticipant ? `<div><span class="${requestStatusImgClass}"></span>&nbsp;<span>${serviceToParticipant.isLandlord() ? 'Landlord' : 'Tenant'} - ${serviceToParticipant.getDisplayName()}: ${selectedSubServiceModel.getDocTypeDisplay()}</span></div>` : '',
      menu_title: `Substituted Service ID ${selectedSubServiceModel.id}`,
      menu_states: {
        default: [
          { name: 'Edit Outcome', event: 'edit:outcome'},
          ...selectedSubServiceModel.get('request_source') === configChannel.request('get', 'SUB_SERVICE_REQUEST_SOURCE_OS') ? [{ name: 'Edit Application', event: 'edit:application'}] : [],
          ...selectedSubServiceModel.get('request_source') === configChannel.request('get', 'SUB_SERVICE_REQUEST_SOURCE_OS') ? [{ name: 'Remove and Mark Deficient', event: 'delete'}] : [],
        ],
        edit_application: [{ name: 'Save', event: 'save:application' }, { name: 'Cancel', event: 'cancel'}],
        edit_outcome: [{ name: 'Save', event: 'save:outcome' }, { name: 'Cancel', event: 'cancel'}],
      },
      menu_events: {
        'edit:application': {
          view_mode: 'edit',
          next: 'edit_application'
        },
        'edit:outcome': {
          view_mode: 'edit',
          next: 'edit_outcome'
        },
        cancel: {
          next: 'default',
          reset: true
        }
      },
      contextRender: () => {
        // Refresh sub service data and re-render
        this.createSubModels();
        this.setupListeners();
        this.render();
      }
    }));
  },
});

_.extend(ModalManageSubService.prototype, ViewJSXMixin);
export default ModalManageSubService;
