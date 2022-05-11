import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import IntakeParticipantCollectionView from '../../../../core/components/participant/IntakeParticipants';
import IntakeParticipantCollection from '../../../../core/components/participant/IntakeParticipant_collection';
import PageItemCreator from '../../../components/page-item-creator/PageItemCreator';
import PageItemsConfig from './intake_applicants_page_config';
import UtilityMixin from '../../../../core/utilities/UtilityMixin';
import template from './IntakePageApplicants_template.tpl';

const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,

  regions: {
    applicantCount: '#p2-ApplicantCount',
    applicantCountDropdown: '#p2-ApplicantCountDropdown',
    hasAgent: '#p2-HasAgent',
    assistantCount: '#p2-AssistantCount',
    assistantCountDropdown: '#p2-AssistantCountDropdown',
    applicants: '#p2-Applicants'
  },

  // Keep track of applicants being removed on the page, to clean them up on Next button presses
  applicants_to_remove: null,

  getRoutingFragment() {
    return 'page/2';
  },

  // If we are moving on, remove front-end applicants we added
  cleanupPageInProgress() {
    // Clean up API ones that were added
    const applicants = participantsChannel.request('get:applicants');
    applicants.remove(applicants.filter(function(applicant) { return applicant.isNew(); }));

    // This cleanup routine will also sync intakeParticipants back with API values
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.intake_applicants_to_remove = [];

    this.createPageItems();
    this.setLandlordOrTenantState();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 2);
  },

  _switchApplicantTextTo(text, newText) {
    // Set to default ('applicant') first then perform the switch
    return text.replace('applicant', newText).replace('Applicant', newText.charAt(0).toUpperCase() + newText.slice(1));
  },

  switchApplicantTextToLandlord(text) {
    return this._switchApplicantTextTo(text, 'landlord');
  },

  switchApplicantTextToTenant(text) {
    return this._switchApplicantTextTo(text, 'tenant');
  },

  setLandlordOrTenantState() {
    const dispute = disputeChannel.request('get'),
      is_landlord = dispute.isLandlord(),
      conversion_fn = _.bind(is_landlord ? this.switchApplicantTextToLandlord : this.switchApplicantTextToTenant, this);

    const applicantCountDropdown = this.getPageItem('applicantCountDropdown');
    applicantCountDropdown.getModel().set('labelText', conversion_fn(applicantCountDropdown.getModel().get('labelText')));

    const assistantCountDropdown = this.getPageItem('applicantCountDropdown');
    assistantCountDropdown.getModel().set('labelText', conversion_fn(assistantCountDropdown.getModel().get('labelText')));

    const applicantCount = this.getPageItem('applicantCount');
    applicantCount.stepText = conversion_fn(applicantCount.stepText);

    const hasAgent = this.getPageItem('hasAgent');
    hasAgent.stepText = conversion_fn(hasAgent.stepText);

    const assistantCount = this.getPageItem('assistantCount');
    assistantCount.stepText = conversion_fn(assistantCount.stepText);

    const applicants = this.getPageItem('applicants');
    applicants.subView.baseName = is_landlord ? 'Landlord' : 'Tenant';
  },

  createPageItems() {
    // Add event handlers
    const eventHandlers = [
      { pageItem: 'applicantCount', event: 'beforeClick', handler: this.beforeApplicantCountChange.bind(this) },
      { pageItem: 'hasAgent', event: 'beforeClick', handler: this.beforeHasAgentChange.bind(this) },
      { pageItem: 'assistantCount', event: 'beforeClick', handler: this.beforeAssistantCountChange.bind(this) }
    ];

    PageItemCreator.definePageItemEventHandlers(this, PageItemsConfig, eventHandlers);
    PageItemCreator.buildPageItemsFromConfig(this, PageItemsConfig);

    const applicants = participantsChannel.request('get:applicants');
    this.intakeApplicants = new IntakeParticipantCollection(applicants.map(applicant => (
      { participantModel: applicant, noPackageProvision: true })), { participantCollection: applicants });

    const applicantCountModel = this.getPageItem('applicantCount').getModel();
    // Select the larger of the API-loaded applicants, or the current value of the user-answered question
    const applicantCountValue = Math.max(applicantCountModel.getData(), applicants.filter(app => app.isPersonOrBusiness()).length); 
    const assistantCountModel = this.getPageItem('assistantCount').getModel();
    const assistantCountValue = Math.max(assistantCountModel.getData(), applicants.filter(app => app.isAssistant()).length);

    applicantCountModel.set('question_answer', String(applicantCountValue), { silent: true });
    assistantCountModel.set('question_answer', String(assistantCountValue), { silent: true });

    const dropdownOptions = {
      optionData: [{text: '1', value: 1},
          {text: '2', value: 2},
          {text: '3', value: 3},
          {text: '4', value: 4},
          {text: '5', value: 5},
          {text: '6', value: 6},
          {text: '7', value: 7},
          {text: '8', value: 8},
          {text: '9', value: 9},
          {text: '10', value: 10}],
      required: true,
      defaultBlank: true,
    };
    
    const applicantDropdown = new DropdownModel(
      Object.assign({
        labelText: 'Enter the number of applicants',
        beforeClick: (model, value) => {
          return this.beforeApplicantCountChange(model, value);
        },
        value: applicantCountValue
      }, dropdownOptions)
    );

    this.addPageItem('applicantCountDropdown', new PageItemView({
      stepText: null,
      subView: new DropdownView({ model: applicantDropdown }),
      stepComplete: applicantDropdown.isValid()
    }));


    const assistantDropdown = new DropdownModel(
      Object.assign({
        labelText: 'Enter the number of assistants',
        beforeClick: (model, value) => {
          return this.beforeAssistantCountChange(model, value);
        },
        value: assistantCountValue ? Number(assistantCountValue) : null
      }, dropdownOptions)
    );

    this.addPageItem('assistantCountDropdown', new PageItemView({
      stepText: null,
      subView: new DropdownView({ model: assistantDropdown }),
      stepComplete: assistantDropdown.isValid()
    }));


    this.addPageItem('applicants', new PageItemView({
      stepText: null,
      subView: new IntakeParticipantCollectionView({
        collection: this.intakeApplicants,
        enableUnitType: true,
      }),
      stepComplete: this.intakeApplicants.isValid({silent: true})
    }));

    this.first_view_id = 'applicantCount';
  },

  setPersonAndBusinessApplicantsTo(value) {
    return this._setIntakeApplicantsTo(value);
  },

  setAssistantsTo(value) {
    return this._setIntakeApplicantsTo(value, { use_assistants: true });
  },

  showConfirmApplicantCountChange(onConfirmFn, onCancelFn) {
    const modalPromise = modalChannel.request('show:standard:promise', {
      title: `Removal Help`,
      bodyHtml: `<p>To ensure you remove the correct applicant please use the garbage can icon available in the specific applicant title. This will ensure you remove the specific record that you want deleted.  To leave the applicants as is, press cancel.  To scroll to the section of the document where you can remove the applicants click scroll to applicants.</p>`,
      primaryButtonText: 'Scroll to Applicants',
      // Set to false to set changeSelection in QuestionOptions.onChildviewQuestionOptionClick heforeClickPromise 'then' block
      resolveAsIfTrue: false,
      resolveAsIfFalse: false,
      onContinueFn: (modalView) => {
        modalView.close();

        if (typeof onConfirmFn === 'function') {
          onConfirmFn();
        }
      },
      onCancelFn: (modalView) => {
        modalView.close();

        if (typeof onCancelFn === 'function') {
          onCancelFn();
        }
      }
    });

    return modalPromise;
  },

  showConfirmClearAssistants(onConfirmFn, onCancelFn) {
    const modalPromise = modalChannel.request('show:standard:promise', {
      title: `Are You Sure?`,
      bodyHtml: `<p>This action will clear all agents, advocates and assistants. Please confirm your action.</p>`,
      primaryButtonText: 'Confirm',
      onContinueFn: (modalView) => {
        modalView.close();

        if (typeof onConfirmFn === 'function') {
          onConfirmFn();
        }
      },
      onCancelFn: (modalView) => {
        modalView.close();

        if (typeof onCancelFn === 'function') {
          onCancelFn();
        }
      }
    });

    return modalPromise;
  },

  showConfirmDelete(intakeParticipant, onDeleteFn) {
    if (intakeParticipant.getDisplayName().indexOf('null') !== -1) {
      onDeleteFn();
      return;
    }

    modalChannel.request('show:standard', {
      title: `Remove Applicant?`,
      bodyHtml: `<p>Warning - this will remove any data you have entered for <b>${intakeParticipant.getDisplayName()}</b></p>`
        + `<p>Are you sure you want to continue?`,
      primaryButtonText: 'Remove',
      onContinueFn: (modalView) => {
        modalView.close();

        if (typeof onDeleteFn === 'function') {
          onDeleteFn();
        }
      },
    });
  },

  stashedIntakeCollection: {},
  _stashRemovedIntakeParticipant(intakeParticipant, index) {
    const participant_model = intakeParticipant.get('participantModel');
    if (!participant_model.isNew()) {
      this.stashedIntakeCollection[index] = intakeParticipant;
    }
  },

  _setIntakeApplicantsTo(value, options) {
    options = options || {};

    const applicantsPageView = this.getPageItem('applicants'),
      applicantCollection = applicantsPageView.getCollection();

    const int_value = parseInt(value);
    if (_.isNaN(int_value)) {
      console.log(`[Warning] Invalid value for setIntakeApplicantsTo count`);
      return;
    }

    const difference = (options.use_assistants ?
          applicantCollection.getNumberOfAssistants() :
          applicantCollection.getNumberOfPersonsAndBusinesses()
      ) - int_value;

    // Attempt to do a load when adding / removing a lot of elements
    if (difference !== 0 && (difference > 3 || difference*-1 > 3)) {
      // Adds are slow, so do a page load
      loaderChannel.trigger('page:load');

      this.listenToOnce(applicantsPageView, 'dom:refresh', function() {
        loaderChannel.trigger('page:load:complete');
      });
    }

    setTimeout(function() {
      if (difference > 0) {
        // We are removing some amount of persons/businesses
        if (options.use_assistants) {
          applicantCollection.removeFromAssistants(difference);
          applicantsPageView.render();
        } else {
          applicantCollection.removeFromPersonsAndBusinesses(difference);
          applicantsPageView.render();
        }
      } else if (difference !== 0) {
        // We are adding some amount of persons/businesses
        if (options.use_assistants) {
          applicantCollection.addToAssistants(difference * -1);
        } else {
          applicantCollection.addToPersonsAndBusinesses(difference * -1);
        }
        applicantsPageView.render();
      }
    }, 5);
  },

  createOnCountChange(model, value, addFn, pageItemCountName, pageItemDropdownName) {
    const pageItemCount = this.getPageItem(pageItemCountName),
      pageItemDropdown = this.getPageItem(pageItemDropdownName),
      questionView = pageItemCount.subView;

    const prev_answer = model.previous('question_answer'),
      int_value = parseInt(value);

    if ((prev_answer === null || prev_answer < 4) && value === 'more') {
      // Went from 1-3 to More
      animationChannel.request('queue', questionView.$el, 'slideUp', {duration: questionView.showHideDuration});
      pageItemDropdown.subView.clearInputSelectionAndRender();
      this.showPageItem(pageItemDropdownName);
    } else if ((prev_answer === null || prev_answer === 'more' || prev_answer > 3) && int_value < 4) {
      // Went from more/4+ to 1-3
      this.hidePageItem(pageItemDropdownName);
    } else if (prev_answer === value && value === "more") {
      model.set('question_answer', null, {silent: true});
    }
    addFn = addFn.bind(this);
    addFn(int_value);
  },

  /**
   * @param currValue
   * @param nextValue
   * @returns {Promise<any>}
   */
  beforeApplicantCountChange(currValue, nextValue) {
    // No need to confirm if a value hasn't been selected
    if (typeof currValue === 'undefined' || currValue === null) {
      return Promise.resolve(true);
    }

    nextValue = parseInt(nextValue);
    currValue = parseInt(currValue);

    if (nextValue < currValue) {
      const applicantCollection = [];
      this.intakeApplicants.participantCollection.each((intakeApplicant) => {
        const applicant = intakeApplicant;
        if (!applicant.isAssistant()) {
          applicantCollection.push(applicant);
        }
      });

      const existingRecords = [];
      applicantCollection.forEach((intakeApplicant, idx) => {
        const applicant = intakeApplicant;

        if (!(applicant.isNew())) {
          existingRecords.push(idx);
        }
      });

      if (PageItemsConfig.applicantCount.question_options.optionData instanceof Array) {
        if (nextValue < existingRecords.length) {
          // This returns a promise
          return this.showConfirmApplicantCountChange(() => {
            document.querySelector('#intake-content').scrollTo({
              top: $('.intake-participants-component .intake-participant').eq(nextValue - 1).offset().top - 100,
              behavior: 'smooth'
            });
          });
        }
      }
    }

    return Promise.resolve(true);
  },

  /**
   * @param currValue
   * @param nextValue
   * @returns {Promise<any>}
   */
  beforeHasAgentChange(currValue, nextValue) {
    // No need to confirm if a value hasn't been selected
    if (typeof currValue === 'undefined' || currValue === null) {
      return Promise.resolve(true);
    }

    nextValue = parseInt(nextValue);
    currValue = parseInt(currValue);

    if (currValue !== nextValue) {
      if (nextValue === 1) {
        // Do nothing
      } else if (nextValue === 0 || nextValue === null) {
        const assistantCollection = [];
        this.intakeApplicants.participantCollection.each((intakeApplicant) => {
          const applicant = intakeApplicant;
          if (applicant.isAssistant()) {
            assistantCollection.push(applicant);
          }
        });

        const existingRecords = [];
        assistantCollection.forEach((intakeApplicant, idx) => {
          const assistant = intakeApplicant;

          if (!(assistant.isNew())) {
            existingRecords.push(idx);
          }
        });

        if (PageItemsConfig.assistantCount.question_options.optionData instanceof Array) {
          if (existingRecords.length > 0 && currValue) {
            return this.showConfirmClearAssistants();
          }
        }
      }
    }

    return Promise.resolve(true);
  },

  beforeAssistantCountChange(currValue, nextValue) {
    // No need to confirm if a value hasn't been selected
    if (typeof currValue === 'undefined' || currValue === null) {
      return Promise.resolve(true);
    }

    nextValue = parseInt(nextValue);
    currValue = parseInt(currValue);

    if (nextValue < currValue) {
      const assistantCollection = [];
      this.intakeApplicants.participantCollection.each((intakeApplicant) => {
        const applicant = intakeApplicant;
        if (applicant.isAssistant()) {
          assistantCollection.push(applicant);
        }
      });

      const existingRecords = [];
      assistantCollection.forEach((intakeApplicant, idx) => {
        const assistant = intakeApplicant;

        if (!(assistant.isNew())) {
          existingRecords.push(idx);
        }
      });

      if (PageItemsConfig.assistantCount.question_options.optionData instanceof Array) {
        if (nextValue < existingRecords.length) {
          return this.showConfirmApplicantCountChange(() => {
            document.querySelector('#intake-content').scrollTo({
              top: $('.intake-participants-component .intake-participant')
                .eq((this.intakeApplicants.length - assistantCollection.length) + nextValue - 1).offset().top - 100,
              behavior: 'smooth'
            });
          });
        }
      }
    }

    return Promise.resolve(true);
  },

  disableApplicantCountOptions() {
    const applicantCollection = this.intakeApplicants.filter((applicant) => !applicant.isAssistant());

    const existingRecords = [];
    applicantCollection.forEach((intakeApplicant, idx) => {
      const applicant = intakeApplicant.get('participantModel');

      if (!(applicant.isNew())) {
        existingRecords.push(idx);
      }
    });

    if (PageItemsConfig.applicantCount.question_options.optionData instanceof Array) {
      const applicantCountPageItem = this.getPageItem('applicantCount');
      const applicantCountQuestion = applicantCountPageItem.subView;

      const elements = applicantCountQuestion.$el.find('.option-container');
      const selectableElements = applicantCountQuestion.$el.find('.option-container')
        .filter((idx) => {
          const recordIsNew = existingRecords.indexOf(idx) === -1;
          const recordIsSelection = (idx === existingRecords[existingRecords.length - 1]);

          return (recordIsNew || recordIsSelection);
        });

      elements.addClass('confirm-action-required');
      selectableElements.removeClass('confirm-action-required');
    }
  },

  disableAssistantCountOptions() {
    const assistantCollection = this.intakeApplicants.filter((applicant) => applicant.isAssistant());

    const existingRecords = [];
    assistantCollection.forEach((intakeApplicant, idx) => {
      const assistant = intakeApplicant.get('participantModel');

      if (!(assistant.isNew())) {
        existingRecords.push(idx);
      }
    });

    if (PageItemsConfig.assistantCount.question_options.optionData instanceof Array) {
      const assistantCountPageItem = this.getPageItem('assistantCount');
      const assistantCountQuestion = assistantCountPageItem.subView;

      const elements = assistantCountQuestion.$el.find('.option-container');
      const selectableElements = assistantCountQuestion.$el.find('.option-container')
        .filter((idx) => {
          const recordIsNew = existingRecords.indexOf(idx) === -1;
          const recordIsSelection = (idx === existingRecords[existingRecords.length - 1]);

          return (recordIsNew || recordIsSelection);
        });

      elements.addClass('confirm-action-required');
      selectableElements.removeClass('confirm-action-required');
    }
  },

  setupListenersBetweenItems() {
    const applicantCountPageItem = this.getPageItem('applicantCount'),
      applicantCountQuestion = applicantCountPageItem.subView,
      applicantCountModel = applicantCountQuestion.model,
      applicantsPageView = this.getPageItem('applicants'),
      applicantCollection = applicantsPageView.subView.collection,
      applicantCountDropdown = this.getPageItem('applicantCountDropdown'),
      applicantCountDropdownModel = applicantCountDropdown.getModel(),
      hasAgentPageItem = this.getPageItem('hasAgent'),
      hasAgentModel = hasAgentPageItem.getModel(),
      assistantCountPageItem = this.getPageItem('assistantCount'),
      assistantCountQuestion = assistantCountPageItem.subView,
      assistantCountModel = assistantCountQuestion.model,
      assistantCountDropdown = this.getPageItem('assistantCountDropdown'),
      assistantCountDropdownModel = assistantCountDropdown.getModel(),

      hasAgent = this.getPageItem('hasAgent');


    this.listenTo(hasAgent, 'itemComplete', (options) => {
      const answer = hasAgent.getModel().get('question_answer');
      if (answer === '1') {
        const assistantCount = assistantCountModel.get('question_answer');
        if (assistantCount === '0' || assistantCount === null) {
          this.showPageItem('assistantCount', options);
          animationChannel.request('queue', assistantCountQuestion.$el, 'slideDown', {duration: assistantCountQuestion.showHideDuration});
        } else {
          if (assistantCount < 4) {
            this.showPageItem('assistantCount', options);
          } else {
            this.showPageItem('assistantCountDropdown', options);
          }

          // Run the handler for assistant count model changed only if a count exists
          assistantCountModel.trigger('change:question_answer', assistantCountModel, assistantCount);
        }
      } else if (answer === '0' || answer === null) {
        applicantCollection.removeAssistants();
        assistantCountModel.set('question_answer', null);
        this.hideAndCleanPageItem('assistantCount', options);

        assistantCountDropdownModel.set('question_answer', null);
        this.hideAndCleanPageItem('assistantCountDropdown', options);
      }
    });

    this.listenTo(applicantCountModel, 'change:question_answer', (model, value) => {
       this.createOnCountChange(model, value, this.setPersonAndBusinessApplicantsTo, 'applicantCount', 'applicantCountDropdown');
       this.disableApplicantCountOptions();
    }, this);

    this.listenTo(applicantCountDropdownModel, 'change:value', (model, value) => {
      const int_value = parseInt(value);
      if (int_value && !_.isNaN(int_value)) {
        applicantCountModel.set('question_answer', String(value));
      }
      if (int_value < 4) {
        applicantCountPageItem.render();
        this.hidePageItem('applicantCountDropdown', {duration: applicantCountQuestion.showHideDuration});
        animationChannel.request('queue', applicantCountQuestion.$el, 'slideDown', {duration: applicantCountQuestion.showHideDuration});
      }

      this.disableApplicantCountOptions();
    }, this);

    this.listenTo(assistantCountModel, 'change:question_answer', (model, value) => {
       this.createOnCountChange(model, value, this.setAssistantsTo, 'assistantCount', 'assistantCountDropdown');
       this.disableAssistantCountOptions();
    }, this);

    this.listenTo(assistantCountDropdownModel, 'change:value', (model, value) => {
      const int_value = parseInt(value);
      if (int_value && !_.isNaN(int_value)) {
        assistantCountModel.set('question_answer', String(value));
      }
      if (int_value < 4) {
        assistantCountPageItem.render();
        this.hidePageItem('assistantCountDropdown', {duration: assistantCountQuestion.showHideDuration});
        animationChannel.request('queue', assistantCountQuestion.$el, 'slideDown', {duration: assistantCountQuestion.showHideDuration});
      }

      this.disableAssistantCountOptions();
    }, this);

    // Track applicants that are removed
    this.listenTo(applicantCollection, 'remove', function(removed_intake_applicant) {
      this.intake_applicants_to_remove.push(removed_intake_applicant);
    }, this);

    // Setup deletes / removal listeners
    applicantsPageView.addSubViewListener({
      event: 'click:delete',
      func: _.bind(function(view) {
        const onDeleteFn = _.bind(function() {
          const scrollTarget = view.$el.prev('.persist-area').find('> .participant-section:not(.floatingHeader)');
          if (scrollTarget && scrollTarget.length) {
            animationChannel.request('queue', scrollTarget, 'scrollPageTo', {is_page_item: true});
          } else {
            const is_assistant = view.model.isAssistant();
            applicantCollection.remove(view.model);

            const countModel = is_assistant ? assistantCountModel : applicantCountModel,
              dropdownModel = is_assistant ? assistantCountDropdownModel : applicantCountDropdownModel,
              countQuestion = is_assistant ? assistantCountQuestion : applicantCountQuestion,
              countDropdownName = is_assistant ? 'assistantCountDropdown' : 'applicantCountDropdown',
              oldCount = parseInt(countModel.get('question_answer')),
              newCount = _.isNaN(oldCount) || oldCount === 1 ? null : String(oldCount - 1);

            if (oldCount === 4) {
              countModel.set('question_answer', newCount, {silent: true});
              this.hidePageItem(countDropdownName, { duration: countQuestion.showHideDuration });
              animationChannel.request('queue', countQuestion.$el, 'slideDown', {duration: countQuestion.showHideDuration});
            } else if (!_.isNaN(oldCount)) {
              countModel.set('question_answer', newCount);
              dropdownModel.set('value', parseInt(newCount));
            }

            // Set hasAgent question to no and hide the assistantCount control if the number of agents hasn't been selected
            if (newCount === null) {
              hasAgentModel.set('question_answer', null);
              hasAgentPageItem.render();
            }

            if (is_assistant) {
              assistantCountPageItem.render();
              assistantCountDropdown.render();
            } else {
              applicantCountPageItem.render();
              applicantCountDropdown.render();
            }

            applicantsPageView.render();

            this.disableApplicantCountOptions();
          }
        }, this);
        this.showConfirmDelete(view.model, onDeleteFn);
      }, this)
    });
  },

  setupFlows() {
    const applicantCount = this.getPageItem('applicantCount');
    const applicantCountDropdown = this.getPageItem('applicantCountDropdown');
    const assistantCount = this.getPageItem('assistantCount');
    const hasAgent = this.getPageItem('hasAgent');

    this.listenTo(applicantCount, 'itemComplete', (options) => {
      const applicantCountValue = applicantCount.getModel().getData();
      if (applicantCountValue === 'more' || Number(applicantCountValue) > 3) {
        applicantCount.subView.$el.hide();
        this.showPageItem('applicantCountDropdown', options);
        if (this.getPageItem('applicantCountDropdown').stepComplete) {
          this.showPageItem('hasAgent', options);
        }
      } else {
        if (applicantCount.stepComplete) {
          this.showPageItem('hasAgent', options);
        }
      }
    });

    this.listenTo(applicantCountDropdown, 'itemComplete', (options) => {
      if (applicantCountDropdown.stepComplete && !hasAgent.isActive()) {
        this.showPageItem('hasAgent', options);
      }
    });
    
    this.listenTo(hasAgent, 'itemComplete', (options) => {
      const answer = hasAgent.getModel().get('question_answer');
      if (answer === '1') {
        this.showPageItem('assistantCount', options);
      } else if (answer === '0' || answer === null) {
        this.hidePageItem('assistantCount', options);
        this.showPageItem('applicants', options);
        this.showNextButton(_.extend({}, options, {no_animate: true}));
      }
    });

    this.listenTo(assistantCount, 'itemComplete', (options) => {
      const assistantCountValue = assistantCount.getModel().getData();
      if (assistantCount.getModel().getData() === 'more' || Number(assistantCountValue) > 3) {
        assistantCount.subView.$el.hide();
        this.showPageItem('assistantCountDropdown', options);
        if (this.getPageItem('assistantCountDropdown').stepComplete) {
          this.showPageItem('applicants', options);
          this.showNextButton(_.extend({}, options, {no_animate: true}));
        }
      } else {
        if (assistantCount.stepComplete) {
          this.showPageItem('applicants', options);
          this.showNextButton(_.extend({}, options, {no_animate: true}));
        }
      }
    });
  },


  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, { no_animate: true });

    this.disableApplicantCountOptions();
  },

  previousPage() {
    Backbone.history.navigate('page/1', {trigger: true});
  },


  getPageApiUpdates() {
    // Get generic PageView changes
    const all_xhr = this.getAllPageXHR();

    // Now get actual values for applicant / assistant counts
    const applicantCount = this.getPageItem('applicantCount');
    const applicantCountDropdownValue = this.getPageItem('applicantCountDropdown').getModel().getData();
    if (!applicantCount.isActive() && Number(applicantCountDropdownValue) > 3) {
      const applicantCountModel = applicantCount.getModel();
      if (String(applicantCountModel.getApiSavedAttr('question_answer')) !== String(applicantCountDropdownValue)) {
        all_xhr.push( _.bind(applicantCountModel.save, applicantCountModel, { question_answer: applicantCountDropdownValue }) );
      }
    }
    const assistantCount = this.getPageItem('assistantCount');
    const assistantCountDropdownValue = this.getPageItem('assistantCountDropdown').getModel().getData();
    if (this.getPageItem('hasAgent').getModel().getData() === "1" && !assistantCount.isActive() && Number(assistantCountDropdownValue) > 3) {
      const assistantCountModel = assistantCount.getModel();
      if (String(assistantCountModel.getApiSavedAttr('question_answer')) !== String(assistantCountDropdownValue)) {
        all_xhr.push( _.bind(assistantCountModel.save, assistantCountModel, { question_answer: assistantCountDropdownValue }) );
      }
    }
    
    const newApplicantsXhr = [];
    // Now check for new participants
    this.intakeApplicants.each(function(intakeApplicant) {
      console.log(`Examining for 'add': `, intakeApplicant);
      const applicant = intakeApplicant.get('participantModel');
      if (applicant.isNew()) {
        // Try applying UI changes into the applicant model
        applicant.set(intakeApplicant.getUIDataAttrs(), {silent: true});
        newApplicantsXhr.push(_.bind(participantsChannel.request, participantsChannel, 'create:applicant', applicant));
      }
    });

    // Now check for deleted participants
    _.each(this.intake_applicants_to_remove, function(intake_applicant_to_remove) {
      console.log(`Examining for 'remove': `, intake_applicant_to_remove);
      const applicant = intake_applicant_to_remove.get('participantModel');
      if (applicant.isNew()) {
        console.log(`[Warning] Trying to remove an applicant that has not been saved, skip removal`, applicant);
      } else {
        all_xhr.push(_.bind(participantsChannel.request, participantsChannel, 'delete:participant', applicant));
      }
    });
    
    if (newApplicantsXhr.length) {
      all_xhr.push( _.bind(UtilityMixin.util_clearQueue, UtilityMixin, newApplicantsXhr) );
    }

    return all_xhr;
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true, scrollOffset: 60});
      }
      return;
    }

    const all_xhr = this.getPageApiUpdates();

    const onNextSuccessFn = function() {
      applicationChannel.trigger('progress:step:complete', 2);
      Backbone.history.navigate('page/3', {trigger: true});
    };
    if (all_xhr.length === 0) {
      console.log("[Info] No changes to the Participants or IntakeQuestions API.  Moving to next page");
      onNextSuccessFn();
      return;
    }

    loaderChannel.trigger('page:load');
    Promise.all(all_xhr.map(xhr => xhr())).then(() => {
      // Loads complete, reset page data
      this.intake_applicants_to_remove = [];
      loaderChannel.trigger('page:load:complete');
      onNextSuccessFn();
    }, this.createPageApiErrorHandler(this, 'INTAKE.PAGE.NEXT.APPLICANTS'));
  }
});
