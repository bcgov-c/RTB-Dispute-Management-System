import CMModel from '../../../../core/components/model/CM_model';

export default CMModel.extend({
  idAttribute: 'hearing_import_id',

  defaults: {
    hearing_import_id: null,
    import_file_id: null,
    import_status: null,
    import_start_datetime: null,
    import_end_datetime: null,
    import_note: null,
    import_process_log: null,
    import_office_id: 0,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_POST_ONLY_ATTRS: [
    'import_file_id',
    'import_note',
    'import_office_id'
  ],
  API_SAVE_ATTRS: [],

  sync() {
    // Only run the APIs through the ScheduleManager
  },
  
  _checkState(state) {
    return this.get('import_status') === state;
  },

  isProgressState() {
    return this._checkState(1);
  },

  isSuccessState() {
    return this._checkState(2);
  },

  isErrorState() {
    return this._checkState(3);
  }
});
