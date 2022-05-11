import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import UtilityMixin from '../../../../core/utilities/UtilityMixin';
import IntakeParticipantCollection from '../../../../core/components/participant/IntakeParticipant_collection';
import IntakeParticipantUnitCollectionView from './IntakeParticipantUnits';
import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import CustomDataObjModel from '../../../../core/components/custom-data-objs/dispute/CustomDataObj_model';
import template from './IntakePageUnitTenantsBase_template.tpl';

const disputeChannel = Radio.channel('dispute');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const applicationChannel = Radio.channel('application');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,

  regions: {
    unitTenants: '#ari-unit-tenants'
  },

  getCurrentStep() {
    return 8;
  },

  getRoutingFragment() {
    return `page/${this.getCurrentStep()}`;
  },

  getRoutingPreviousRoute() {
    return `page/${this.getCurrentStep()-1}`;
  },

  getRoutingNextRoute() {
    return `page/${this.getCurrentStep()+1}`;
  },

  getCustomObjectType() {
    return configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C');
  },

  // If we are moving on, remove front-end respondents we added
  cleanupPageInProgress() {
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    const customDataObj = customDataObjsChannel.request('get:type', this.getCustomObjectType());
    
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();

      console.log(`[Error] Couldn't load JSON data, showing error modal and redirecting to file list`);
      applicationChannel.request('show:ari:json:error:modal');
    }

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', this.getCurrentStep());
  },

  createPageItems() {
    this.units = IntakeAriDataParser.toUnitCollection();
    
    const intakeRespondents = new IntakeParticipantCollection();
    // Get all units
    this.units.each(function(unitModel) {
      const participantIds = unitModel.getParticipantIds();
      _.times((unitModel.get('selected_tenants') || 0), function(index) {
        const matchingParticipantId = participantIds && participantIds.length > index ? participantIds[index] : null;
        let participantModel;
        if (matchingParticipantId) {
          participantModel = participantsChannel.request('get:participant', matchingParticipantId);
          
          if (participantModel) {
            // Ensure that all the latest unit attributes are set
            participantModel.set(unitModel.getAddressData())
          } else {
            console.log(`[Error] Couldn't find matching saved API participant`);
          }
        } else {
          participantModel = unitModel.createTenantForUnit();
        }

        intakeRespondents.push({ participantTypeUI: 1, participantModel, _unitModel: unitModel, noPackageProvision: true, isRespondent: true, noPackageProvision: true });
      });
    });
    this.intakeRespondents = intakeRespondents;

    this.addPageItem('unitTenants', new PageItemView({
      stepText: null,
      subView: new IntakeParticipantUnitCollectionView({ collection: this.intakeRespondents }),
      stepComplete: this.intakeRespondents.isValid({ silent: true })
    }));

    
    console.log(this.units);
    
    this.first_view_id = 'unitTenants';
  },

  setupListenersBetweenItems() {
  },


  setupFlows() {
    
  },

  showTenantMatchesApplicantWarning(_onContinueFn, duplicates, addressIssues) {
    const duplicateHtml = () => {
      if (!duplicates.length) return '';
      
      return (`
        <p>The following items are entered for both the applicant and respondent:
          <ul>
          ${duplicates.map(dup => `<li>${dup.label}: ${dup.value}</li>`).join('')}
          </ul>
        </p>`
      )
    }

    const addressIssuesHtml = () => {
      if (!addressIssues.length) return '';

      return (`
      <p>Your application has the following address issue(s):
        <ul>
          ${addressIssues.map(issue => `<li>${issue.value}</li>`).join('')}
        </ul>
      </p>
        `)
    }

    modalChannel.request('show:standard', {
      title: 'Information Entry Issue(s)',
      bodyHtml: `<p>The name, email address or phone number for a respondent were also entered for the applicant. Please correct this information before submitting this application.</p>
      ${duplicateHtml()}
      ${addressIssuesHtml()}
      <p>Press Cancel to return to your application and change the information.</p>
      <p>Press Continue to keep the information you entered.</p>`,
      primaryButtonText: 'Continue',
      onContinueFn(modalView) {
        modalView.close();
        _onContinueFn();
      }
    });
  },


  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  previousPage() {
    Backbone.history.navigate(this.getRoutingPreviousRoute(), {trigger: true});
  },

  getPageApiUpdates() {
    const all_xhr = this.getAllPageXHR();
    const newRespondentsXhr = [];
    
    this.intakeRespondents.each(function(intakeRespondent) {
      const participantModel = intakeRespondent.get('participantModel');
      if (participantModel.isNew()) {
        participantModel.set(intakeRespondent.getUIDataAttrs(), { silent: true });
        newRespondentsXhr.push(_.bind(participantsChannel.request, participantsChannel, 'create:respondent', participantModel));
      }
    });

    if (newRespondentsXhr.length) {
      all_xhr.push( _.bind(UtilityMixin.util_clearQueue, UtilityMixin, newRespondentsXhr) );
    }

    // Remove any respondents not associated to a unit.
    participantsChannel.request('get:respondents').each(respondent => {
      if (!respondent.isNew() && this.units.all(unit => !unit.hasParticipantId(respondent.id))) {
        all_xhr.push( participantsChannel.request.bind(participantsChannel, 'delete:participant', respondent) );
      }
    });

    return all_xhr;
  },

  validatePage() {
    return PageView.prototype.validatePage.call(this);
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const nextPageFn = () => {
      loaderChannel.trigger('page:load');
      const allXHR = this.getPageApiUpdates();
      Promise.all(_.map(allXHR, xhr => xhr()))
        .then(() => participantsChannel.request('load', disputeChannel.request('get:id')))
        .then(() => {
          this.units.each(unitModel => unitModel.clearParticipantIds());

          this.intakeRespondents.each(intakeRespondent => {
            const unitModel = intakeRespondent.get('_unitModel');
            if (unitModel) {
              unitModel.addParticipantId(intakeRespondent.get('participantModel').id);
            }
          });

          IntakeAriDataParser.setUnitCollection(this.units);
          console.log(IntakeAriDataParser.get('_json'));

          const jsonDataObj = new CustomDataObjModel({
            custom_data_object_id: IntakeAriDataParser.getLoadedId(),
            object_type: this.getCustomObjectType(),
            jsonData: IntakeAriDataParser.toJSON()
          });

          return jsonDataObj.save();
        })
        .then(() => {
          loaderChannel.trigger('page:load:complete');
          applicationChannel.trigger('progress:step:complete', this.getCurrentStep());
          Backbone.history.navigate(this.getRoutingNextRoute(), { trigger: true});
        })
        .catch(this.createPageApiErrorHandler(this));
    };

    const duplicateList = participantsChannel.request('get:dups:with:applicants', this.intakeRespondents);
    const addressIssuesList = participantsChannel.request('get:address:similarity', this.intakeRespondents);
    if (duplicateList.length || addressIssuesList.length) {
      this.showTenantMatchesApplicantWarning(nextPageFn, duplicateList, addressIssuesList);
      return;
    } else {
      nextPageFn();
    }
  }
});
