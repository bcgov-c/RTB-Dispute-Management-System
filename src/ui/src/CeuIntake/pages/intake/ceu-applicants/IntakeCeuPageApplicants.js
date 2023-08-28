import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageItemView from '../../../../core/components/page/PageItem';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import Question_model from '../../../../core/components/question/Question_model';
import Question from '../../../../core/components/question/Question';
import CeuApplicants from './CeuApplicants';
import CeuPage from '../../../components/page/CeuPage';

const NUM_APPLICANTS = 20;

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

const IntakeCeuPageApplicants = CeuPage.extend({

  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);

    this.isRespondentLandlord = IntakeCeuDataParser.isRespondentLandlord();
    this.applicants = IntakeCeuDataParser.getApplicantCollection();
    this.submitters = IntakeCeuDataParser.getSubmitterCollection();
    this.savedJsonData = IntakeCeuDataParser.toJSON();

    this.CEU_PARTICIPANT_CONTACT_NONE = String(configChannel.request('get', 'CEU_PARTICIPANT_CONTACT_NONE') || '');
    this.createPageItems();
    this.setLandlordOrTenantState();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 2);
  },

  getPageApiUpdates() {
    const submittersData = !this.hasAgentModel.getData({ parse: true }) ? [] : this.getChildView('submitterRegion')?.subView?.saveInternalDataToModel({ returnOnly: true });
    const applicantsData = this.hasAgentModel.getData({ parse: true }) && !this.contactModel.getData({ parse: true }) ? [] : this.getChildView('applicantsRegion')?.subView?.saveInternalDataToModel({ returnOnly: true });
    
    const hasUpdatesFn = (keyMatchObj={}, objToMatch={}) => {
      let _hasUpdates = false;
      Object.keys(keyMatchObj).forEach(key => {
        if (_hasUpdates) return;
        if (String(keyMatchObj[key]) !== String(objToMatch[key])) _hasUpdates = true;
      });
      return _hasUpdates;
    };

    const hasUnsavedChanges = (this.applicants.length !== applicantsData.length)
      || (this.submitters.length !== submittersData.length)
      || _.any(applicantsData, (a, index) => hasUpdatesFn(a, this.applicants.at(index).toJSON()))
      || _.any(submittersData, (a, index) => hasUpdatesFn(a, this.submitters.at(index).toJSON()));
    
    return hasUnsavedChanges ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/2';
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
    // Applicants page shows opposite type
    const conversionFn = _.bind(this.isRespondentLandlord ? this.switchApplicantTextToTenant : this.switchApplicantTextToLandlord, this);

    const hasAgent = this.getPageItem('hasAgentRegion');
    hasAgent.stepText = conversionFn(hasAgent.stepText);

    const contactRegion = this.getPageItem('contactRegion');
    contactRegion.stepText = conversionFn(contactRegion.stepText);

    const applicantCountDropdown = this.getPageItem('applicantCountDropdownRegion');
    applicantCountDropdown.getModel().set('labelText', conversionFn(applicantCountDropdown.getModel().get('labelText')));

    const assistantCountDropdown = this.getPageItem('applicantCountDropdownRegion');
    assistantCountDropdown.getModel().set('labelText', conversionFn(assistantCountDropdown.getModel().get('labelText')));

    const applicantCount = this.getPageItem('applicantCountRegion');
    applicantCount.stepText = conversionFn(applicantCount.stepText);

    const applicants = this.getPageItem('applicantsRegion');
    applicants.subView.baseName = `Impacted ${this.isRespondentLandlord ? 'Tenant' : 'Landlord'}`;

    const submitter = this.getPageItem('submitterRegion');
    submitter.subView.baseName = 'Complaint Submitter';
    
    
  },

  createPageItems() {
    this.hasAgentModel = new Question_model({
      optionData: [{ name: 'has-agent-no', cssClass: 'option-button yes-no', value: 0, text: 'NO' },
        { name: 'has-agent-yes', cssClass: 'option-button yes-no', value: 1, text: 'YES' }],
        question_answer: this.submitters.length ? 1 : (this.applicants.length ? 0 : null),
    });
    this.addPageItem('hasAgentRegion', new PageItemView({
      stepText: 'Are you an agent, advocate, legal counsel, or assistant for the impacted parties or a representative of a bylaw department, fire prevention or other government agency?',
      helpHtml: 'An agent, advocate, legal counsel, or assistant is someone other than the landlord or tenant who is submitting this complaint on behalf of a landlord or tenant.',
      subView: new Question({ model: this.hasAgentModel }),
      stepComplete: this.hasAgentModel.isValid()
    }));

    this.contactModel = new Question_model({
      optionData: [{ name: 'has-contact-no', cssClass: 'option-button yes-no', value: 0, text: 'NO' },
        { name: 'has-contact-yes', cssClass: 'option-button yes-no', value: 1, text: 'YES' }],
      question_answer: this.applicants.length ? 1 : (this.submitters.length ? 0 : null),
    });
    this.addPageItem('contactRegion', new PageItemView({
      stepText: 'Can you provide the name(s) and contact information for the impacted applicant(s)?',
      helpHtml: 'The Compliance and Enforcement Unit does not accept anonymous complaints.',
      subView: new Question({ model: this.contactModel }),
      stepComplete: this.contactModel.isValid()
    }));

    this.applicantCountModel = new Question_model({
      optionData: [{ name: 'applicant-count-1', value: "1", cssClass: 'option-button yes-no', text: '1'},
          { name: 'applicant-count-2', value: "2", cssClass: 'option-button yes-no', text: '2'},
          { name: 'applicant-count-3', value: "3", cssClass: 'option-button yes-no', text: '3'},
          { name: 'applicant-count-more', value: "more", cssClass: 'option-link', text: 'more than 3'}],
      question_answer: this.applicants.length ? String(this.applicants.length) : null,
    });
    this.addPageItem('applicantCountRegion', new PageItemView({
      stepText: 'Select the number of impacted applicants.',
      subView: new Question({ model: this.applicantCountModel }),
      stepComplete: this.applicantCountModel.getData({ parse: true }) > 0,
      helpHtml: `A residential landlord is defined as: The owner of the rental unit, the owner's agent, or another person who, on behalf of the landlord permits occupation of the rental unit under a tenancy agreement, or exercises powers and performs duties under this Act, the tenancy agreement, or a service agreement.</br>A manufactured home park landlord is defined as: the owner of the manufactured home site, the owner's agent, or another person who, on behalf of the landlord, permits occupation of the manufactured home site under a tenancy agreement.`
    }));

    this.applicantCountDropdownModel = new DropdownModel({
      labelText: 'Enter the number of applicants',
      optionData: Array.from(Array(NUM_APPLICANTS).keys()).map(index => (
        { text: `${index+1}`, value: `${index+1}` }
      )),
      required: true,
      defaultBlank: true,
      value: this.applicantCountModel.getData() ? String(this.applicantCountModel.getData()) : null
    });
    this.addPageItem('applicantCountDropdownRegion', new PageItemView({
      stepText: null,
      subView: new DropdownView({ model: this.applicantCountDropdownModel }),
      stepComplete: this.applicantCountDropdownModel.isValid()
    }));

    this.addPageItem('applicantsRegion', new PageItemView({
      stepText: null,
      subView: new CeuApplicants({
        collection: this.applicants,
        participantTypes: this.isRespondentLandlord ? configChannel.request('get', 'CEU_PARTICIPANT_TYPES_TT') : configChannel.request('get', 'CEU_PARTICIPANT_TYPES_LL'),
        baseName: `Impacted ${this.isRespondentLandlord ? 'Tenant' : 'Landlord'}`,
        contactInfoName: `this ${this.isRespondentLandlord ? 'tenant' : 'landlord'}`,
        enableDelete: true,
        enableCountrySelection: !this.isRespondentLandlord,
        showNameWarning: true,
      }),
    }));
    this.addPageItem('submitterRegion', new PageItemView({
      stepText: null,
      subView: new CeuApplicants({
        collection: this.submitters,
        participantTypes: configChannel.request('get', 'CEU_PARTICIPANT_TYPES_SUBMITTER'),
        baseName: `Your Contact Information`,
        contactInfoName: `this submitter`,
        showNameWarning: true,
      }),
      stepComplete: this.submitters.isValid({silent: true}),
    }));

    this.first_view_id = 'hasAgentRegion';
  },

  setPersonAndBusinessApplicantsTo(value) {
    return this._setIntakeApplicantsTo(value);
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

  showConfirmDelete(participant, onDeleteFn) {
    const displayName = `Applicant ${Number(this.applicants.indexOf(participant))+1}${participant.hasDisplayNameInfoEntered() ? ` - ${participant.getDisplayName()}` : ''}`;
    modalChannel.request('show:standard', {
      title: `Remove Applicant?`,
      bodyHtml: `<p>Warning - this will remove any data you have entered for <b>${displayName}</b>.</p>`
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

  _setIntakeApplicantsTo(value, options={}) {
    const int_value = parseInt(value);
    if (_.isNaN(int_value)) {
      return;
    }

    const difference = this.applicants.length - int_value;
    setTimeout(() => {
      if (difference > 0) {
        // We are removing some amount of persons/businesses
        _.times(difference, () => this.applicants.pop());
      } else if (difference !== 0) {
        // We are adding some amount of persons/businesses
        _.times(difference * -1, () => {
          this.applicants.push({  });
        });
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

  setupListenersBetweenItems() {
    const applicantsPageItem = this.getPageItem('applicantsRegion');
    const applicantCountPageItem = this.getPageItem('applicantCountRegion');
    const applicantCountView = applicantCountPageItem.subView;
    const applicantCountDropdownPageItem = this.getPageItem('applicantCountDropdownRegion');
    
    this.listenTo(this.applicantCountModel, 'change:question_answer', (model, value) => {
      this.createOnCountChange(model, value, this.setPersonAndBusinessApplicantsTo, 'applicantCountRegion', 'applicantCountDropdownRegion');
    }, this);

    this.listenTo(this.applicantCountDropdownModel, 'change:value', (model, value) => {
      this.hideNoContactError();
      const int_value = parseInt(value);
      if (int_value && !_.isNaN(int_value)) {
        this.applicantCountModel.set('question_answer', String(value));
      }
      if (int_value < 4) {
        applicantCountPageItem.render();
        this.hidePageItem('applicantCountDropdownRegion', {duration: applicantCountView.showHideDuration});
        animationChannel.request('queue', applicantCountView.$el, 'slideDown', {duration: applicantCountView.showHideDuration});
      }
    }, this);

    this.listenTo(this.contactModel, 'change:question_answer', (model, value) => {
      // Reset any selected applicants
      if (!value) {
        this.applicantCountModel.set('question_answer', null);
        this.applicantCountDropdownModel.set('value', null);
        this.applicants.reset([]);
      }
    });

    this.listenTo(this.applicants, 'contact:changed', () => this.hideNoContactError());
    this.listenTo(this.submitters, 'contact:changed', () => this.hideNoContactError());

    // Setup deletes / removal listeners
    applicantsPageItem.addSubViewListener({
      event: 'click:delete',
      func: (view) => {
        const onDeleteFn = () => {
          this.applicants.remove(view.model);

          const oldCount = parseInt(this.applicantCountModel.get('question_answer')),
            newCount = _.isNaN(oldCount) ? null : String(oldCount - 1);

          if (oldCount === 4) {
            this.applicantCountModel.set('question_answer', newCount, {silent: true});
            this.hidePageItem('applicantCountDropdownRegion', {duration: applicantCountView.showHideDuration});
            animationChannel.request('queue', applicantCountView.$el, 'slideDown', {duration: applicantCountView.showHideDuration});
          } else if (oldCount === 1) {
            this.applicantCountModel.set('question_answer', null);
            this.applicantCountDropdownModel.set('value', null);
          } else if (!_.isNaN(oldCount)) {
            this.applicantCountModel.set('question_answer', newCount);
            this.applicantCountDropdownModel.set('value', newCount);
          }
          
          applicantCountDropdownPageItem.render();
          applicantCountPageItem.render();
        };

        this.showConfirmDelete(view.model, onDeleteFn);
      }
    });

  },

  setupFlows() {
    const hasAgentRegion = this.getPageItem('hasAgentRegion');
    const contactRegion = this.getPageItem('contactRegion');
    const applicantCountRegion = this.getPageItem('applicantCountRegion');

    this.listenTo(hasAgentRegion, 'itemComplete', function(options) {
      this.hideNoContactError();
      this.contactModel.trigger('render');
      const answer = this.hasAgentModel.getData({ parse: true });
      if (answer) {
        if (!this.submitters.length) {
          this.submitters.push({  });
        }
        if (!this.contactModel.getData({ parse: true })) {
          if (this.applicants.length) {
            this.contactModel.set('question_answer', 1, { silent: true }).trigger('render');
          } else {
            this.hidePageItem('applicantCountRegion', options);
            this.hidePageItem('applicantCountDropdownRegion', options);
            this.hidePageItem('applicantsRegion', options);
          }
        }
        this.showPageItem('contactRegion', options);
      } else {
        if (this.submitters.length) {
          this.submitters.pop();
        }
        this.hideAndCleanPageItem('contactRegion', Object.assign({}, options, { silent: true }));
        this.hideAndCleanPageItem('submitterRegion', options);
        this.showPageItem('applicantCountRegion', options);
      }
    }, this);

    
    this.listenTo(contactRegion, 'itemComplete', function(options) {
      this.hideNoContactError();
      this.hasAgentModel.trigger('render');
      const answer = this.contactModel.getData();
      if (answer) {
        const applicantCount = this.applicantCountModel.get('question_answer');
        if (applicantCount === '0' || applicantCount === null) {
          this.showPageItem('applicantCountRegion', options);
          animationChannel.request('queue', applicantCountRegion.subView.$el, 'slideDown', {duration: applicantCountRegion.showHideDuration});
        } else {
          if (Number(applicantCount) && Number(applicantCount) < 4) {
            this.showPageItem('applicantCountRegion', options);
          } else {
            this.showPageItem('applicantCountDropdownRegion', options);
          }
          // Run the handler for assistant count model changed only if a count exists
          this.applicantCountModel.trigger('change:question_answer', this.applicantCountModel, applicantCount);
        }
      } else {
        this.applicantCountDropdownModel.set('question_answer', null);
        this.applicantCountModel.set('question_answer', null);

        this.hideAndCleanPageItem('applicantCountRegion', options);
        this.hideAndCleanPageItem('applicantCountDropdownRegion', options);
        this.hideAndCleanPageItem('applicantsRegion', options);
        this.showPageItem('submitterRegion', options);
        this.showNextButton(Object.assign({}, options, { no_animate: true }));
      }
    }, this);

    
    this.listenTo(applicantCountRegion, 'itemComplete', function(options) {
      this.hideNoContactError();
      const applicantCountValue = this.applicantCountModel.getData();
      if (applicantCountValue === 'more' || Number(applicantCountValue) > 3) {
        applicantCountRegion.subView.$el.hide();
        this.showPageItem('applicantCountDropdownRegion', options);
        if (applicantCountRegion.stepComplete) {
          this.showPageItem('applicantsRegion', options);
          this.showPageItem('submitterRegion', options);
          this.showNextButton(Object.assign({}, options, { no_animate: true }));
        }
      } else {
        if (applicantCountRegion.stepComplete) {
          this.showPageItem('applicantsRegion', options);
          this.showPageItem('submitterRegion', options);
          this.showNextButton(Object.assign({}, options, { no_animate: true }));
        }
      }
    });

  },

  validatePage() {
    this.hideNoContactError();
    
    let isValid = CeuPage.prototype.validatePage.call(this);
    if (this.hasAgentModel.getData({ parse: true }) === 0 && this.contactModel.getData({ parse: true }) === 0) {
      ['hasAgentRegion', 'contactRegion'].forEach(regionName => {
        const view = this.getChildView(regionName);
        if (view && view.isRendered()) view?.subView?.showErrorMessage('At least one impacted applicant or one submitter must be selected');
      });
      isValid = false;
    }

    let anyApplicantHasContact = false;
    const childViewsToValidate = [].concat(
      (this.getPageItem('applicantsRegion')?.subView?.children || []).map(a=>a),
      (this.getPageItem('submitterRegion')?.subView?.children || []).map(a=>a)
    );
    childViewsToValidate.forEach(childView => {
      const savedData = childView?.saveInternalDataToModel({ returnOnly: true }) || {};
      if (savedData?.p_contact_info_selection && String(savedData?.p_contact_info_selection) !== this.CEU_PARTICIPANT_CONTACT_NONE) {
        anyApplicantHasContact = true;
      }
    });
    
    if (!anyApplicantHasContact) {
      this.showNoContactError();
      isValid = false;
    }

    return isValid;
  },

  showNoContactError() {
    this.getUI('error').show();
  },

  hideNoContactError() {
    this.getUI('error').hide();
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, { no_animate: true });
  },

  previousPage() {
    Backbone.history.navigate('#page/1', {trigger: true});
  },

  nextPage() {
    if (!this.validatePage()) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {force_scroll: true, is_page_item: true, scrollOffset: 60});
      }
      return;
    }

    loaderChannel.trigger('page:load');

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    // Clear submitter/applicants if there was none selected
    if (!this.hasAgentModel.getData({ parse: true })) {
      this.submitters.reset([], { silent: true });
    } else if (!this.contactModel.getData({ parse: true })) {
      this.applicants.reset([], { silent: true });
    }

    // Save UI data to applicant model
    const applicantsView = this.getChildView('applicantsRegion');
    if (applicantsView && applicantsView.subView) {
      applicantsView.subView.saveInternalDataToModel();
      IntakeCeuDataParser.setApplicantCollection(this.applicants);
    }
    
    const submitterView = this.getChildView('submitterRegion');
    if (submitterView && submitterView.subView) {
      submitterView.subView.saveInternalDataToModel();
      IntakeCeuDataParser.setSubmitterCollection(this.submitters);
    }

    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      applicationChannel.trigger('progress:step:complete', 2);
      Backbone.history.navigate('#page/3', {trigger: true});
    }).fail(this.createPageApiErrorHandler(this));
  },


  className: `${CeuPage.prototype.className} intake-ceu-p2`,

  ui() {
    return Object.assign({}, CeuPage.prototype.ui, {
      error: '.intake-ceu-p2__no-contact-error',
    });
  },

  regions: {
    hasAgentRegion: '.intake-ceu-p2__agent',
    contactRegion: '.intake-ceu-p2__contact',
    applicantCountRegion: '.intake-ceu-p2__applicant-count',
    applicantCountDropdownRegion: '.intake-ceu-p2__applicants-dropdown',
    submitterRegion: '.intake-ceu-p2__submitter',
    applicantsRegion: '.intake-ceu-p2__applicants'
  },

  template() {
    return <>
      <div className="intake-ceu-p2__agent"></div>
      <div className="intake-ceu-p2__contact"></div>
      <div className="intake-ceu-p2__applicant-count"></div>
      <div className="intake-ceu-p2__applicants-dropdown"></div>
      <div className="intake-ceu-p2__submitter"></div>
      <div className="intake-ceu-p2__applicants"></div>

      <div className="intake-ceu-p2__no-contact-error error-block hidden-item">
        You must provide contact information (i.e. email, phone number, and or address) for at least one complainant above to continue.
      </div>

      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="submit">BACK</button>
          <button className="navigation option-button step-next hidden-item" type="submit">NEXT</button>
      </div>
    </>

  }
});

_.extend(IntakeCeuPageApplicants.prototype, ViewJSXMixin);
export default IntakeCeuPageApplicants;