import Service_model from "../../../core/components/service/Service_model";

export default Service_model.extend({
  idAttribute: 'service_audit_log_id',
  defaults() {
    return Object.assign({}, Service_model.prototype.defaults, {
      service_audit_log_id: null,
      service_change_type: null,
    });
  }
})