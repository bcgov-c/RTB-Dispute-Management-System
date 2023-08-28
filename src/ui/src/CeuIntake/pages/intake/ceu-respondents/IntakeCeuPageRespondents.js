import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageItemView from '../../../../core/components/page/PageItem';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import Question from '../../../../core/components/question/Question';
import Question_model from '../../../../core/components/question/Question_model';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import CeuApplicants from '../ceu-applicants/CeuApplicants';
import CeuPage from '../../../components/page/CeuPage';

const NUM_RESPONDENTS = 10;

const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

const IntakeCeuPageRespondents = CeuPage.extend({

  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    this.isRespondentLandlord = IntakeCeuDataParser.isRespondentLandlord();
    this.respondents = IntakeCeuDataParser.getRespondentCollection();
    
    this.createPageItems();
    this.setLandlordOrTenantState();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 4);
  },

  getPageApiUpdates() {
    const respondentsData = this.getChildView('respondentsRegion')?.subView?.saveInternalDataToModel({ returnOnly: true });
    const hasUpdatesFn = (keyMatchObj={}, objToMatch={}) => {
      let _hasUpdates = false;
      Object.keys(keyMatchObj).forEach(key => {
        if (_hasUpdates) return;
        if (String(keyMatchObj[key]) !== String(objToMatch[key])) _hasUpdates = true;
      });
      return _hasUpdates;
    };

    const hasUnsavedChanges = (this.respondents.length !== respondentsData.length)
      || _.any(respondentsData, (a, index) => hasUpdatesFn(a, this.respondents.at(index).toJSON()));
    return hasUnsavedChanges ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/4';
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
    const conversion_fn = _.bind(this.isRespondentLandlord ? this.switchRespondentTextToLandlord : this.switchRespondentTextToTenant, this);

    const respondentCountDropdown = this.getPageItem('respondentCountDropdown');
    respondentCountDropdown.subView.model.set('labelText', conversion_fn(respondentCountDropdown.subView.model.get('labelText')));

    const respondentCount = this.getPageItem('respondentCount');
    respondentCount.stepText = conversion_fn(respondentCount.stepText);

    const respondents = this.getPageItem('respondentsRegion');
    respondents.subView.baseName = `Respondent ${this.isRespondentLandlord ? 'Landlord' : 'Tenant'}`;
  },

  createPageItems() {
    this.respondentCountModel = new Question_model({
      optionData: [{ name: 'respondent-count-1', value: "1", cssClass: 'option-button yes-no', text: '1'},
            { name: 'respondent-count-2', value: "2", cssClass: 'option-button yes-no', text: '2'},
            { name: 'respondent-count-3', value: "3", cssClass: 'option-button yes-no', text: '3'},
            { name: 'respondent-count-more', value: "more", cssClass: 'option-link', text: 'more than 3'}],
      question_answer: this.respondents.length ? String(this.respondents.length) : null,
    });
    this.addPageItem('respondentCount', new PageItemView({
      stepText: 'How many respondents are being named in this complaint?',
      subView: new Question({ model: this.respondentCountModel }),
      stepComplete: this.respondentCountModel.getData({ parse: true }) > 0
    }));

    const respondentCountModel = this.getPageItem('respondentCount').getModel();
    // Select the larger of the API-loaded respondents, or the current value of the user-answered question
    const respondentCountValue = Math.max(respondentCountModel.getData(), this.respondents.length);

    respondentCountModel.set('question_answer', String(respondentCountValue), { silent: true });

    const dropdownModel = new DropdownModel({
        labelText: 'Enter the number of respondents',
        optionData: Array.from(Array(NUM_RESPONDENTS).keys()).map(index => (
          { text: `${index+1}`, value: `${index+1}` }
        )),
        required: true,
        defaultBlank: true,
        value: respondentCountValue ? String(respondentCountValue) : null
      });

    // Create rental address component
    this.addPageItem('respondentCountDropdown', new PageItemView({
      stepText: null,
      subView: new DropdownView({ model: dropdownModel }),
      stepComplete: dropdownModel.isValid()
    }));

    const respondentParticipantTypes = !this.isRespondentLandlord ? configChannel.request('get', 'CEU_PARTICIPANT_TYPES_TT') : [
      ...(configChannel.request('get', 'CEU_PARTICIPANT_TYPES_LL')||[]),
      ...(configChannel.request('get', 'CEU_PARTICIPANT_TYPE_PROPERTY_MANAGER') ? [configChannel.request('get', 'CEU_PARTICIPANT_TYPE_PROPERTY_MANAGER')] : [])
    ];
    this.addPageItem('respondentsRegion', new PageItemView({
      stepText: null,
      subView: new CeuApplicants({
        collection: this.respondents,
        participantTypes: respondentParticipantTypes,
        enableBirthday: true,
        enableDelete: true,
        enableCountrySelection: this.isRespondentLandlord,
        contactInfoName: `this ${this.isRespondentLandlord ? 'landlord' : 'tenant'}`,
      }),
      stepComplete: this.respondents.isValid({silent: true})
    }));

    this.first_view_id = 'respondentCount';
  },

  showConfirmDelete(participant, onDeleteFn) {
    // Always show delete warning
    const displayName = `Respondent ${Number(this.respondents.indexOf(participant))+1}${participant.hasDisplayNameInfoEntered() ? ` - ${participant.getDisplayName()}` : ''}`;
    modalChannel.request('show:standard', {
      title: `Remove Respondent?`,
      bodyHtml: `<p>Warning - this will remove any data you have entered for <b>${displayName}</b></p>`
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
    const int_value = parseInt(value);
    if (_.isNaN(int_value)) {
      return;
    }
    const difference = this.respondents.length - int_value;
    if (difference > 0) {
      // We are removing some amount of persons/businesses
      _.times(difference, () => this.respondents.pop());
    } else if (difference !== 0) {
      // We are adding some amount of persons/businesses      
      _.times(difference * -1, () => {
        this.respondents.push({  });
      });
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

  setupListenersBetweenItems() {
    const respondentCountPageItem = this.getPageItem('respondentCount'),
      respondentCountQuestion = respondentCountPageItem.subView,
      respondentCountModel = respondentCountQuestion.model,
      respondentsPageView = this.getPageItem('respondentsRegion'),
      respondentCountDropdown = this.getPageItem('respondentCountDropdown'),
      respondentCountDropdownModel = respondentCountDropdown.subView.model,
      self = this;

    this.listenTo(respondentCountQuestion, 'click', this.beforeRespondentCountChange, this);
    this.listenTo(respondentCountModel, 'change:question_answer', function(model, value) {
      this.onRespondentCountChange(model, value);
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
    });

    // Do an initial run to get correct respondentCount
    this.onRespondentCountChange(respondentCountModel, respondentCountModel.get('question_answer'));

    // Setup deletes / removal listeners
    respondentsPageView.addSubViewListener({
      event: 'click:delete',
      func: _.bind(function(view){
        const onDeleteFn = _.bind(function() {
          this.respondents.remove(view.model);

          const oldCount = parseInt(respondentCountModel.get('question_answer')),
            newCount = _.isNaN(oldCount) ? null : String(oldCount - 1);

          if (oldCount === 4) {
            respondentCountModel.set('question_answer', newCount, {silent: true});
            self.hidePageItem('respondentCountDropdown', {duration: respondentCountQuestion.showHideDuration});
            animationChannel.request('queue', respondentCountQuestion.$el, 'slideDown', {duration: respondentCountQuestion.showHideDuration});
          } else if (oldCount === 1) {
            respondentCountModel.set('question_answer', null);
            respondentCountDropdownModel.set('value', null);
          } else if (!_.isNaN(oldCount)) {
            respondentCountModel.set('question_answer', newCount);
            respondentCountDropdownModel.set('value', newCount);
          }

          respondentCountPageItem.render();
          respondentCountDropdown.render();
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
          this.showPageItem('respondentsRegion', options);
          this.showNextButton(_.extend({}, options, {no_animate: true}));
        }
      } else {
        if (respondentCount.stepComplete) {
          this.showPageItem('respondentsRegion', options);
          this.showNextButton(_.extend({}, options, {no_animate: true}));
        }
      }
    });

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

  previousPage() {
    Backbone.history.navigate('#page/3', {trigger: true});
  },

  nextPage() {
    if (!this.validatePage()) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {force_scroll: true, is_page_item: true, scrollOffset: 50});
      }
      return;
    }

    loaderChannel.trigger('page:load');
    
    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    
    // Save UI data to applicant model
    const respondentsView = this.getChildView('respondentsRegion');
    if (respondentsView && respondentsView.subView) respondentsView.subView.saveInternalDataToModel();
    IntakeCeuDataParser.setRespondentCollection(this.respondents);

    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      applicationChannel.trigger('progress:step:complete', 4);
      Backbone.history.navigate('#page/5', {trigger: true});
    }).fail(this.createPageApiErrorHandler(this));
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  regions: {
    respondentCount: '#p3-RespondentCount',
    respondentCountDropdown: '#p3-RespondentCountDropdown',
    respondentsRegion: '#p3-Respondents'
  },

  template() {
    return <>
      <div id="p3-RespondentCount"></div>
      <div id="p3-RespondentCountDropdown"></div>
      <div id="p3-Respondents"></div>

      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="submit">BACK</button>
        <button className="navigation option-button step-next hidden-item" type="submit">NEXT</button>
      </div>
    </>
  },

});

_.extend(IntakeCeuPageRespondents.prototype, ViewJSXMixin);
export default IntakeCeuPageRespondents;
