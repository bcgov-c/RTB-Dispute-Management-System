import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import IntakeParticipantCollectionView from '../../../../core/components/participant/IntakeParticipants';
import IntakeParticipantCollection from '../../../../core/components/participant/IntakeParticipant_collection';
import PageItemCreator from '../../../components/page-item-creator/PageItemCreator';
import PageItemsConfig from './intake_respondents_page_config';
import UtilityMixin from '../../../../core/utilities/UtilityMixin';
import template from './IntakePageRespondents_template.tpl';

const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,

  regions: {
    respondentCount: '#p3-RespondentCount',
    respondentCountDropdown: '#p3-RespondentCountDropdown',
    respondents: '#p3-Respondents'
  },

  // Keep track of respondents being removed on the page, to clean them up on Next button presses
  respondents_to_remove: null,

  getRoutingFragment() {
    return 'page/4';
  },

  // If we are moving on, remove front-end respondents we added
  cleanupPageInProgress() {
    // Clean up ones that were added
    const respondents = participantsChannel.request('get:respondents');
    if (respondents) {
      respondents.remove(respondents.filter(function(respondent) { return respondent.isNew(); }));
    }

    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.intake_respondents_to_remove = [];

    this.createPageItems();
    this.setLandlordOrTenantState();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 4);
  },

  _switchRespondentTextTo(text, newText) {
    // Set to default ('respondent') first then perform the switch
    return text.replace('respondent', newText).replace('Respondent', newText.charAt(0).toUpperCase() + newText.slice(1));
  },

  switchRespondentTextToLandlord(text) {
    return this._switchRespondentTextTo(text, 'landlord');
  },

  switchRespondentTextToTenant(text) {
    return this._switchRespondentTextTo(text, 'tenant');
  },

  setLandlordOrTenantState() {
    const dispute = disputeChannel.request('get'),
      is_landlord = dispute.isLandlord(),
      conversion_fn = _.bind(is_landlord ? this.switchRespondentTextToTenant : this.switchRespondentTextToLandlord, this);

    const respondentCountDropdown = this.getPageItem('respondentCountDropdown');
    respondentCountDropdown.subView.model.set('labelText', conversion_fn(respondentCountDropdown.subView.model.get('labelText')));

    const respondentCount = this.getPageItem('respondentCount');
    respondentCount.stepText = conversion_fn(respondentCount.stepText);

    const respondents = this.getPageItem('respondents');
    respondents.subView.baseName = is_landlord ? 'Tenant' : 'Landlord';
  },

  createPageItems() {
    // Add event handlers
    const eventHandlers = [
      { pageItem: 'respondentCount', event: 'beforeClick', handler: this.beforeRespondentCountChange.bind(this) },
    ];

    PageItemCreator.definePageItemEventHandlers(this, PageItemsConfig, eventHandlers);
    PageItemCreator.buildPageItemsFromConfig(this, PageItemsConfig);

    const dispute = disputeChannel.request('get');
    const respondents = participantsChannel.request('get:respondents');
    this.intakeRespondents = new IntakeParticipantCollection(respondents.map(function(respondent) {
      return { participantModel: respondent, noPackageProvision: true };
    }), { participantCollection: respondents, isRespondent: true });

    const respondentCountModel = this.getPageItem('respondentCount').getModel();
    // Select the larger of the API-loaded respondents, or the current value of the user-answered question
    const respondentCountValue = Math.max(respondentCountModel.getData(), respondents.length);

    respondentCountModel.set('question_answer', String(respondentCountValue), { silent: true });

    const dropdownModel = new DropdownModel({
        labelText: 'Enter the number of respondents',
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
        beforeClick: (model, value) => {
          return this.beforeRespondentCountChange(model, value);
        },
        value: respondentCountValue ? Number(respondentCountValue) : null
      });

    // Create rental address component
    this.addPageItem('respondentCountDropdown', new PageItemView({
      stepText: null,
      subView: new DropdownView({ model: dropdownModel }),
      stepComplete: dropdownModel.isValid()
    }));

    this.addPageItem('respondents', new PageItemView({
      stepText: null,
      subView: new IntakeParticipantCollectionView({
        collection: this.intakeRespondents,
        enableUnitType: true,
        enableKnownContact: !dispute.isLandlord() ? true : dispute.isPastTenancy()
      }),
      stepComplete: this.intakeRespondents.isValid({silent: true})
    }));

    this.first_view_id = 'respondentCount';
  },

  showConfirmRespondentCountChange(onConfirmFn, onCancelFn) {
    return modalChannel.request('show:standard:promise', {
      title: `Removal Help`,
      bodyHtml: `<p>To ensure you remove the correct respondent please use the garbage can icon available in the specific respondent title. This will ensure you remove the specific record that you want deleted.  To leave the respondents as is, press cancel.  To scroll to the section of the document where you can remove the respondents click scroll to respondents.</p>`,
      primaryButtonText: 'Go to Respondents',
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
  },

  showConfirmDelete(intakeParticipant, onDeleteFn) {
    if (intakeParticipant.getDisplayName().indexOf('null') !== -1) {
      onDeleteFn();
      return;
    }

    modalChannel.request('show:standard', {
      title: `Remove Respondent?`,
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

  setPersonAndBusinessRespondentsTo(value) {
    const respondentsPageView = this.getPageItem('respondents'),
      respondentCollection = respondentsPageView.subView.collection;

    const int_value = parseInt(value);
    if (_.isNaN(int_value)) {
      console.log(`[Warning] Invalid value from respondent count`);
      return;
    }
    const difference = respondentCollection.getNumberOfPersonsAndBusinesses() - int_value;

    if (difference !== 0 && (difference > 2 || difference*-1 > 2)) {
      // Adds are slow, so try a page load
      loaderChannel.trigger('page:load');

      this.listenToOnce(respondentsPageView, 'dom:refresh', function() {
        loaderChannel.trigger('page:load:complete');
      });
    }

    if (difference > 0) {
      // We are removing some amount of persons/businesses
      respondentCollection.removeFromPersonsAndBusinesses(difference);
      respondentsPageView.render();
    } else if (difference !== 0) {
      // We are adding some amount of persons/businesses
      respondentCollection.addToPersonsAndBusinesses(difference * -1);
      respondentsPageView.render();
    }
  },

  beforeRespondentCountChange(currValue, nextValue) {
    nextValue = parseInt(nextValue);
    currValue = parseInt(currValue);

    if (nextValue < currValue) {
      const respondentCollection = [];
        this.intakeRespondents.participantCollection.each((intakeRespondent) => {
          const applicant = intakeRespondent;
          respondentCollection.push(applicant);
        });

      const existingRecords = [];
      respondentCollection.forEach((intakeRespondent, idx) => {
        const respondent = intakeRespondent;

        if (!(respondent.isNew())) {
          existingRecords.push(idx);
        }
      });

      if (PageItemsConfig.respondentCount.question_options.optionData instanceof Array) {
        if (nextValue < existingRecords.length) {
          return this.showConfirmRespondentCountChange(() => {
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

  onRespondentCountChange(model, value) {
    const respondentCountPageItem = this.getPageItem('respondentCount'),
      respondentCountQuestion = respondentCountPageItem.subView,
      respondentCountDropdown = this.getPageItem('respondentCountDropdown');

    const prev_answer = model.previous('question_answer'),
      int_value = parseInt(value);
    if ((prev_answer === null || prev_answer < 4) && value === 'more') {
      // Went from 1-3 to More
      animationChannel.request('queue', respondentCountQuestion.$el, 'slideUp', {duration: respondentCountQuestion.showHideDuration});
      respondentCountDropdown.subView.clearInputSelectionAndRender();
      this.showPageItem('respondentCountDropdown');
    } else if ((prev_answer === null || prev_answer === 'more' || prev_answer > 3) && int_value < 4) {
      // Went from more/4+ to 1-3
      this.hidePageItem('respondentCountDropdown');
    } else if (prev_answer === value && value === "more") {
      model.set('question_answer', null, {silent: true});
    }
    this.setPersonAndBusinessRespondentsTo(int_value);
  },

  disableRespondentCountOptions() {
    const respondentCollection = this.intakeRespondents;

    const existingRecords = [];
    respondentCollection.each((intakeRespondent, idx) => {
      const respondent = intakeRespondent.get('participantModel');

      if (!(respondent.isNew())) {
        existingRecords.push(idx);
      }
    });

    if (PageItemsConfig.respondentCount.question_options.optionData instanceof Array) {
      const respondentCountPageItem = this.getPageItem('respondentCount');
      const respondentCountQuestion = respondentCountPageItem.subView;

      const elements = respondentCountQuestion.$el.find('.option-container');
      const selectableElements = respondentCountQuestion.$el.find('.option-container')
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
    const respondentCountPageItem = this.getPageItem('respondentCount'),
      respondentCountQuestion = respondentCountPageItem.subView,
      respondentCountModel = respondentCountQuestion.model,
      respondentsPageView = this.getPageItem('respondents'),
      respondentCollection = respondentsPageView.subView.collection,
      respondentCountDropdown = this.getPageItem('respondentCountDropdown'),
      respondentCountDropdownModel = respondentCountDropdown.subView.model,
      self = this;

    this.listenTo(respondentCountQuestion, 'click', this.beforeRespondentCountChange, this);
    this.listenTo(respondentCountModel, 'change:question_answer', function(model, value) {
      this.onRespondentCountChange(model, value);
      this.disableRespondentCountOptions();
    }, this);
    this.listenTo(respondentCountDropdownModel, 'change:value', function(model, value) {
      const int_value = parseInt(value);
      if (int_value && !_.isNaN(int_value)) {
        respondentCountModel.set('question_answer', String(value));
      }
      if (int_value < 4) {
        respondentCountPageItem.render();
        self.hidePageItem('respondentCountDropdown', {duration: respondentCountQuestion.showHideDuration});
        animationChannel.request('queue', respondentCountQuestion.$el, 'slideDown', {duration: respondentCountQuestion.showHideDuration});
      }

      this.disableRespondentCountOptions();
    });

    // Do an initial run to get correct respondentCount
    this.onRespondentCountChange(respondentCountModel, respondentCountModel.get('question_answer'));

    // Track respondents that are removed
    this.listenTo(respondentCollection, 'remove', function(removed_intake_respondent) {
      self.intake_respondents_to_remove.push(removed_intake_respondent);
      self.intake_respondents_to_remove.push(removed_intake_respondent);
    });

    // Setup deletes / removal listeners
    respondentsPageView.addSubViewListener({
      event: 'click:delete',
      func: _.bind(function(view){
        const onDeleteFn = _.bind(function() {
          const scrollTarget = view.$el.prev('.persist-area').find('> .participant-section:not(.floatingHeader)');
          if (scrollTarget && scrollTarget.length) {
            animationChannel.request('queue', scrollTarget, 'scrollPageTo', {is_page_item: true});
          }
          respondentCollection.remove(view.model);
          const oldCount = parseInt(respondentCountModel.get('question_answer')),
            newCount = _.isNaN(oldCount) ? null : String(oldCount - 1);

          if (oldCount === 4) {
            respondentCountModel.set('question_answer', newCount, {silent: true});
            self.hidePageItem('respondentCountDropdown', {duration: respondentCountQuestion.showHideDuration});
            animationChannel.request('queue', respondentCountQuestion.$el, 'slideDown', {duration: respondentCountQuestion.showHideDuration});
          } else if (!_.isNaN(oldCount)) {
            respondentCountModel.set('question_answer', newCount);
            respondentCountDropdownModel.set('value', parseInt(newCount));
          }

          respondentCountPageItem.render();
          respondentCountDropdown.render();
          respondentsPageView.render();

          this.disableRespondentCountOptions();
        }, this);

        this.showConfirmDelete(view.model, onDeleteFn);
      }, this)
    });
  },


  setupFlows() {
    const respondentCount = this.getPageItem('respondentCount');
    this.listenTo(respondentCount, 'itemComplete', (options) => {
      const respondentCountValue = respondentCount.getModel().getData();
      if (respondentCountValue === 'more' || Number(respondentCountValue) > 3) {
        respondentCount.subView.$el.hide();
        this.showPageItem('respondentCountDropdown', options);
        if (respondentCount.stepComplete) {
          this.showPageItem('respondents', options);
          this.showNextButton(_.extend({}, options, {no_animate: true}));
        }
      } else {
        if (respondentCount.stepComplete) {
          this.showPageItem('respondents', options);
          this.showNextButton(_.extend({}, options, {no_animate: true}));
        }
      }
    });

    this.disableRespondentCountOptions();
  },

  showRespondentMatchesApplicantWarning(_onContinueFn, duplicates, addressIssues) {
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

    this.disableRespondentCountOptions();
  },

  previousPage() {
    Backbone.history.navigate('page/3', {trigger: true});
  },

  getPageApiUpdates() {
    // PATCH updates happen in Page.js
    const all_xhr = this.getAllPageXHR();

    // Now get actual values for applicant / assistant counts
    const respondentCount = this.getPageItem('respondentCount');
    const respondentCountDropdownValue = this.getPageItem('respondentCountDropdown').getModel().getData();
    if (!respondentCount.isActive() && Number(respondentCountDropdownValue) > 3) {
      const respondentCountModel = respondentCount.getModel();
      if (String(respondentCountModel.getApiSavedAttr('question_answer')) !== String(respondentCountDropdownValue)) {
        all_xhr.push( _.bind(respondentCountModel.save, respondentCountModel, { question_answer: respondentCountDropdownValue }) );
      }
    }

    const newRespondentsXhr = [];
    // Check for new participants and create them
    this.intakeRespondents.each(function(intakeRespondent) {
      const respondent = intakeRespondent.get('participantModel');
      if (respondent.isNew()) {
        respondent.set(intakeRespondent.getUIDataAttrs(), {silent: true});
        newRespondentsXhr.push(_.bind(participantsChannel.request, participantsChannel, 'create:respondent', respondent));
      }
    });

    _.each(this.intake_respondents_to_remove, function(intake_respondent_to_remove) {
      const respondent = intake_respondent_to_remove.get('participantModel');
      if (respondent.isNew()) {
        console.log(`[Warning] Trying to remove an respondent that has not been saved, skip removal`, respondent);
      } else {
        all_xhr.push(_.bind(participantsChannel.request, participantsChannel, 'delete:participant', respondent));
      }
    });

    if (newRespondentsXhr.length) {
      all_xhr.push( _.bind(UtilityMixin.util_clearQueue, UtilityMixin, newRespondentsXhr) );
    }
    return all_xhr;
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true, scrollOffset: 50});
      }
      return;
    }

    const nextPageFn = () => {
      const all_xhr = this.getPageApiUpdates();

      const onNextSuccessFn = function() {
        applicationChannel.trigger('progress:step:complete', 4);
        Backbone.history.navigate('page/5', {trigger: true});
      };
  
      if (all_xhr.length === 0) {
        console.log("[Info] No changes to the Participants (respondents) or IntakeQuestions API.  Moving to next page");
        onNextSuccessFn();
        return;
      }
  
      loaderChannel.trigger('page:load');
      Promise.all(all_xhr.map(xhr => xhr())).then(() => {
        // Loads complete, reset page data
        this.intake_respondents_to_remove = [];
        loaderChannel.trigger('page:load:complete');
        onNextSuccessFn();
      }, this.createPageApiErrorHandler(this));
    };
    const duplicateList = participantsChannel.request('get:dups:with:applicants', this.intakeRespondents);
    const addressIssuesList = participantsChannel.request('get:address:similarity', this.intakeRespondents);
    if (duplicateList.length || addressIssuesList.length) {
      this.showRespondentMatchesApplicantWarning(nextPageFn, duplicateList, addressIssuesList);
      return;
    } else {
      nextPageFn();
    }
  }
});
