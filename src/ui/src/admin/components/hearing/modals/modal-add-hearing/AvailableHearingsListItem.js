import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './AvailableHearingsListItem_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const hearingChannel = Radio.channel('hearings');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'addHearing-search-result standard-list-item',

  ui: {
    select: '.addHearing-search-result-select > div'
  },

  events: {
    'click @ui.select': 'clickSelectWithStateCheck'
  },

  clickSelectWithStateCheck() {
    loaderChannel.trigger('page:load');

    const performRefreshOnClose = false;
    
    const showInvalidHearingStateModal = () => {
      this.model.trigger('hide:hearing:modal');
      hearingChannel.request('show:invalid:modal').finally(() => {
        if (performRefreshOnClose) {
          this.model.trigger('hearings:refresh');
          this.model.trigger('close:hearing:modal');
        } else {
          this.model.trigger('show:hearing:modal');
          const collection = this.model.collection;
          if (collection) collection.remove(this.model);
        }
      });
    };
    const onStateCheckError = () => this.model.trigger('hearings:refresh');

    return this.model.withStateCheck(
      this.clickSelect.bind(this, ...arguments),
      showInvalidHearingStateModal.bind(this),
      onStateCheckError.bind(this)
    );
  },

  clickSelect() {
    const self = this;
    hearingChannel.request('create:dispute:hearing', this.model.get('hearing_id'), {
      dispute_guid: disputeChannel.request('get:id')
    }).done(function() {
      self.model.checkAndUpdateLinkType().always(function() {
        self.hearingModel.trigger('hearings:refresh');
        loaderChannel.trigger('page:load:complete');
      });
    }).fail(function(err) {
      loaderChannel.trigger('page:load:complete');

      err = err || {};
      if (hearingChannel.request('check:scheduling:error', err)) {
        modalChannel.request('show:standard', {
          title: "Error Assigning Hearing",
          bodyHtml: "File is already associated to a hearing.  Unassign that hearing, or try another.",
          hideContinueButton: true,
          cancelButtonText: 'Close'
        });
        return;
      }
      
      generalErrorFactory.createHandler('ADMIN.DISPUTEHEARING.SAVE', () => {
        self.hearingModel.trigger('hearings:refresh');
      })(err);
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['hearingModel']);
  },

  templateContext() {
    const userModel = userChannel.request('get:user', this.model.get('hearing_owner'));
    const start_date = this.model.get('local_start_datetime');
    const end_date = this.model.get('local_end_datetime');
    return {
      Formatter,
      dayDisplay: `${Moment(start_date).format('dddd')}&nbsp;-&nbsp;${Formatter.toDateDisplay(start_date)}:&nbsp;<span>${Moment(start_date).fromNow()}</span>`,
      timeDisplay: `${Formatter.toTimeDisplay(start_date)}&nbsp;-&nbsp;${Formatter.toTimeDisplay(end_date)}`,
      ownerDisplay: toUserLevelAndNameDisplay(userModel, { displaySchedulerType: true, displayUserLevelIcon: true })
    };
  }
});