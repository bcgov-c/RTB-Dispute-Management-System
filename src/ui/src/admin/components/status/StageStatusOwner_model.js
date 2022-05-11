import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';

const sessionChannel = Radio.channel('session'),
  userChannel = Radio.channel('users'),
  statusChannel = Radio.channel('status');

export default Backbone.Model.extend({
  SUB_TYPE_TO_TYPE: {
    11: 1,
    12: 1,
    13: 1,
    21: 2,
    22: 2,
    23: 2,
    24: 2,
    41: 4
  },

  defaults: {
    stage: null,
    status: null,

    // The owner that is currently set through the API
    api_owner_id: null,

    // The owner id
    value: null,

    // UI attribute
    forceRequired: false
  },

  initialize() {
    this.createSubModels();

    // Sync the internal owner ID dropdown with the externally visible "value" attribute
    this.listenTo(this.get('ownerEditModel'), 'change:value', function(model) {
      this.set('value', model.getData({ parse: true }));
    }, this);

    // If stage/status were provided initially, set the correct owner values in the model right away
    if (this.get('stage') !== null && this.get('status') !== null) {
      this.setOwnerBasedOnStageStatus();
    }
  },

  createSubModels() {
    this.set('ownerTypeModel', new DropdownModel({
      labelText: 'Owner type filter',
      required: false,
      defaultBlank: true,
      value: null,
    }));

    this.set('ownerSubTypeModel', new DropdownModel({
      labelText: 'Sub-type filter',
      required: false,
      defaultBlank: true,
      value: null,
    }));

    this.set('ownerEditModel', new DropdownModel({
      labelText: 'Owner',
      errorMessage: 'Select a status owner',
      required: false,
      defaultBlank: true,
      value: this.get('api_owner_id') ? String(this.get('api_owner_id')) : null,
      apiMapping: 'owner',
      customLinkFn: _.bind(function() {
        this.trigger('assignToMe');
      }, this)
    }));
  },

  setCorrectAssignToMeLink() {
    this.get('ownerEditModel').set('customLink', this._isUserAssignable() ? 'Assign to me' : null);
  },

  _isUserAssignable() {
    const availableOwnerIds = this._getAllAvailableOwnerIds(),
      currentUser = sessionChannel.request('get:user'),
      currentUserId = currentUser ? currentUser.get('user_id') : null;
    return currentUser && _.contains(availableOwnerIds, currentUserId);
  },

  _getAllAvailableOwnerIds() {
    const ownerTypeOptions = _.pluck(this.get('ownerTypeModel').get('optionData'), 'value');
    return _.map(userChannel.request('get:users:by:role', ownerTypeOptions), function(user) {
      return user.get('user_id');
    });
  },

  setInputModelToRequired(model) {
    model.set({
      required: true,
      cssClass: $.trim(model.get('cssClass')).replace('optional-input' , ''),
      value: model.get('value') ? model.get('value') : null
    });
  },
  setInputModelToOptional(model) {
    if (this.get('forceRequired')) {
      return this.setInputModelToRequired(model);
    }
    model.set({
      required: false,
      cssClass: `${$.trim(model.get('cssClass')).replace('optional-input' , '')} optional-input`,
      value: model.get('value') ? model.get('value') : null
    });
  },


  getStageStatusRules() {
    const stage_status_rules = statusChannel.request('get:rules:stagestatus', this.get('stage'), this.get('status'));
    if (!stage_status_rules || _.isEmpty(stage_status_rules)) {
      console.log(`[Warning] Couldn't retrieve status stage rules for "${this.get('stage')}:${this.get('status')}"`);
    }
    return stage_status_rules;
  },

  setOwnerBasedOnStageStatus() {
    if (this.get('stage') === null || this.get('status') === null) {
      alert('[Error] No stage/status provided to StageStatusOwner component');
      return;
    }

    // Used when setting an initial state of the owner components
    const stage_status_rules = this.getStageStatusRules();
    const typeOptions = this._getOwnerTypeOptions(stage_status_rules.ownerTypes);
    const subTypeOptions = this._getOwnerSubTypeOptions(stage_status_rules.ownerSubTypes);
    const isOwnerRequired = !stage_status_rules.ownerOptional;

    // Set owner type, using api values if possible
    const api_owner_id = this.get('api_owner_id');
    const api_owner_model = api_owner_id ? userChannel.request('get:user', api_owner_id) : null;
    const api_owner_role = api_owner_model ? api_owner_model.getRoleId() : null;
    const isApiOwnerRoleInTypeOptions = api_owner_role && _.contains(_.pluck(typeOptions, 'value'), api_owner_role);

    this.get('ownerTypeModel').set({
      optionData: typeOptions,
      disabled: _.isEmpty(typeOptions) || typeOptions.length === 1,
      value: _.isEmpty(typeOptions) ? null : (isApiOwnerRoleInTypeOptions ? api_owner_role : (typeOptions.length === 1 ? typeOptions[0].value : null))
    }, { silent: true });


    // Set owner sub type, using api values if possible
    const typeValue = this.get('ownerTypeModel').getData({ parse: true }),
      api_owner_role_subtype = api_owner_model ? api_owner_model.getRoleSubtypeId() : null,
      filteredSubTypeOptions = _.filter(subTypeOptions, function(option) {
        return !typeValue || _.has(this.SUB_TYPE_TO_TYPE, option.value) && this.SUB_TYPE_TO_TYPE[option.value] === typeValue;
      }, this),
      isApiOwnerRoleSubtypeTypeInFilteredSubTypeOptions = api_owner_role_subtype && _.contains(_.pluck(filteredSubTypeOptions, 'value'), api_owner_role_subtype),
      isSubTypeDisabled = _.isEmpty(typeOptions) || _.isEmpty(filteredSubTypeOptions);

    this.get('ownerSubTypeModel').set({
      optionData: filteredSubTypeOptions,
      disabled: isSubTypeDisabled,
      value: isSubTypeDisabled ? null : (isApiOwnerRoleSubtypeTypeInFilteredSubTypeOptions ? api_owner_role_subtype : null)
    }, { silent: true });

    if (isOwnerRequired) {
      this.setInputModelToRequired(this.get('ownerTypeModel'));
      this.setInputModelToRequired(this.get('ownerSubTypeModel'));
    } else {
      this.setInputModelToOptional(this.get('ownerTypeModel'));
      this.setInputModelToOptional(this.get('ownerSubTypeModel'));
    }

    this.primeOwnerOptionsBasedOnSelectedTypes();
    if (isOwnerRequired) {
      this.setInputModelToRequired(this.get('ownerEditModel'));
    } else {
      this.setInputModelToOptional(this.get('ownerEditModel'));
    }
  },

  primeOwnerOptionsBasedOnSelectedTypes() {
    const api_owner_id = this.get('api_owner_id');
    const ownerOptions = this._getOwnerNameOptions();
    const isOwnerInOwnerOptions = api_owner_id && _.contains(_.pluck(ownerOptions, 'value'), String(api_owner_id));

    this.get('ownerEditModel').set({
      optionData: ownerOptions,
      disabled: _.isEmpty(ownerOptions),
      value: isOwnerInOwnerOptions ? String(api_owner_id) : null
    });
  },


  _getOwnerTypeOptions(allowed_owner_types) {
    if (!allowed_owner_types) {
      allowed_owner_types = [];
    }
    return _.map(allowed_owner_types, function(owner_type) {
      return { value: owner_type, text: userChannel.request('get:role:display', owner_type) };
    });
  },

  _getOwnerSubTypeOptions(allowed_owner_subtypes) {
    if (!allowed_owner_subtypes) {
      const ownerType = this.get('ownerTypeModel').getData({ parse: true });
      if (!ownerType) {
        return [];
      }
      allowed_owner_subtypes = userChannel.request('get:roletypes:by:role', ownerType);
    }
    return _.map(allowed_owner_subtypes, function(owner_subtype) {
      return { value: owner_subtype, text: userChannel.request('get:roletype:display', owner_subtype) };
    });
  },


  _getOwnerNameOptions() {
    // Logic for setting the owner name:
    // 1. Check for selection of type
    // - if a value, restrict to types of that value
    // - if type is null, allow all selections *from the options in the type list*
    // 2. Next, check for selection of sub type
    // - if a value, restrict to subtypes of that value
    // - if subtype is null, allow all selections *from the options in the subtype list*

    const ownerTypeOptions = _.pluck(this.get('ownerTypeModel').get('optionData'), 'value');
    const subTypeOptions = _.pluck(this.get('ownerSubTypeModel').get('optionData'), 'value');
    const ownerType = this.get('ownerTypeModel').getData({ parse: true });
    const ownerSubType = this.get('ownerSubTypeModel').getData({ parse: true });

    let available_users = userChannel.request('get:users:by:role', ownerType ? ownerType : ownerTypeOptions);
    available_users = _.filter(available_users, function(user) {
      return (ownerSubType && user.getRole().get('role_subtype_id') === ownerSubType) ||
          (!ownerSubType && _.contains(subTypeOptions, user.getRole().get('role_subtype_id')));
    });

    return _.sortBy(
      _.map(available_users, user => ({ value: String(user.get('user_id')), text: user.getDisplayName() })),
      ownerOption => $.trim(ownerOption.text).toLowerCase()
    );
  },

  getData(options) {
    return this.get('ownerEditModel').getData(options);
  },

  getPageApiDataAttrs() {
    return this.get('ownerEditModel').getPageApiDataAttrs();
  }
});