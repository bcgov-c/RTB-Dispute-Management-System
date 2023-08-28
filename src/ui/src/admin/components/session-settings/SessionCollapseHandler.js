/**
 * @fileoverview - Helper functionality for managing state on collapsed views.  Used to support the show/hide view feature in Admin
 */
import Backbone from "backbone";

class CollapseHandler {
  constructor(disputeModel, settingName) {
    this.disputeModel = disputeModel;
    this.settingName = settingName;
    _.extend(this, Backbone.Events);
  }
  
  update(value) {
    const sessionSettingsCopy = { ...this.disputeModel.get('sessionSettings') };
    sessionSettingsCopy.collapseSettings = { ...sessionSettingsCopy?.collapseSettings, ...{ [this.settingName]: value } };
    this.disputeModel.set({ sessionSettings: sessionSettingsCopy, });
    this.trigger('change:isCollapsed', this.disputeModel, value);
  }

  get() {
    return this.disputeModel.get('sessionSettings')?.collapseSettings?.[this.settingName]
  }
};

const SessionCollapse = {

  getSettingName(pageName='', fieldName='', dynamicFieldId=null) {
    return `${pageName}.${fieldName}${dynamicFieldId ? `.${dynamicFieldId}` : ''}`;
  },

  createHandler(disputeModel=null, pageName='', fieldName='', dynamicFieldId=null) {
    if (!disputeModel || !pageName || !fieldName) return;
    const settingName = this.getSettingName(pageName, fieldName, dynamicFieldId);
    const handler = new CollapseHandler(disputeModel, settingName);
    return handler;
  }
};

export default SessionCollapse;
