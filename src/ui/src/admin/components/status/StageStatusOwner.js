import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import DropdownView from '../../../core/components/dropdown/Dropdown';
import template from './StageStatusOwner_template.tpl';

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  className: 'stage-status-owner-container',

  regions: {
    ownerTypeRegion: '.stage-status-owner-type',
    ownerSubTypeRegion: '.stage-status-owner-sub-type',
    ownerEditRegion: '.stage-status-owner-name',
  },

  modelEvents: {
    assignToMe: 'onAssignToMe'
  },

  onAssignToMe() {
    if (!this.model._isUserAssignable()) {
      return false;
    }

    const currentUser = sessionChannel.request('get:user'),
      currentUserId = currentUser ? currentUser.get('user_id') : null;
  
    this.model.get('ownerSubTypeModel').set({ value: currentUser.getRoleSubtypeId() }, { silent: true });
    // Manually run the change handler on sub type to make sure type and user are in correct states before setting user
    this.onSubTypeChangeValue(this.model.get('ownerSubTypeModel'));
    this.model.get('ownerEditModel').set({ value: String(currentUserId) });

    if (this.model.get('status') === 20 && this.model.get('ownerTypeModel').getData() === configChannel.request('get', 'USER_ROLE_GROUP_IO')) {
      this.model.trigger('status:change', 21);
    }
    this.render();
  },

  initialize() {
    this.listenTo(this.model.get('ownerTypeModel'), 'change:value', this.onTypeChangeValue, this);
    this.listenTo(this.model.get('ownerSubTypeModel'), 'change:value', this.onSubTypeChangeValue, this);
  },

  onTypeChangeValue(model) {
    const typeValue = model.getData({ parse: true });
    model.set({ value: typeValue }, { silent: true });
    
    const stage_status_rules = this.model.getStageStatusRules();
    if (!stage_status_rules) {
      console.log(`[Error] Couldn't load stage status rules`);
      return;
    }

    const subTypeOptions = stage_status_rules ? this.model._getOwnerSubTypeOptions(stage_status_rules.ownerSubTypes) : [],
      filteredSubTypeOptions = _.filter(subTypeOptions, function(option) {
        return !typeValue || _.has(this.model.SUB_TYPE_TO_TYPE, option.value) && this.model.SUB_TYPE_TO_TYPE[option.value] === typeValue;
      }, this),
      subTypeValue = this.model.get('ownerSubTypeModel').getData({ parse: true }),
      isSubTypeValueInFilteredOptions = subTypeValue && _.contains(_.pluck(filteredSubTypeOptions, 'value'), subTypeValue);

    this.model.get('ownerSubTypeModel').set({
      optionData: filteredSubTypeOptions,
      value: isSubTypeValueInFilteredOptions ? subTypeValue : null
    }, { silent: true });

    this.model.primeOwnerOptionsBasedOnSelectedTypes();
    this.render();
  },

  onSubTypeChangeValue(model) {
    const value = model.getData({ parse: true });
    model.set({ value }, { silent: true });
    // Now filter the type list
    if (_.has(this.model.SUB_TYPE_TO_TYPE, value) && this.model.get('ownerTypeModel').get('value') !== this.model.SUB_TYPE_TO_TYPE[value]) {
      // If a new type is selected, the change will fire the handler on type
      this.model.get('ownerTypeModel').set('value', this.model.SUB_TYPE_TO_TYPE[value]);
    } else {
      this.model.primeOwnerOptionsBasedOnSelectedTypes();
      this.render();
    }
  },

  validateAndShowErrors() {
    const viewToValidate = this.getChildView('ownerEditRegion');
    return viewToValidate ? viewToValidate.validateAndShowErrors() : true;
  },

  showOwnerErrorMessage(errorMsg) {
    const ownerView = this.getChildView('ownerEditRegion');
    if (ownerView) {
      ownerView.showErrorMessage(errorMsg);
    }
  },

  onRender() {
    this.model.setCorrectAssignToMeLink();
    this.showChildView('ownerTypeRegion', new DropdownView({ model: this.model.get('ownerTypeModel') }));
    this.showChildView('ownerSubTypeRegion', new DropdownView({ model: this.model.get('ownerSubTypeModel') }));
    this.showChildView('ownerEditRegion', new DropdownView({ model: this.model.get('ownerEditModel') }));
  }
});