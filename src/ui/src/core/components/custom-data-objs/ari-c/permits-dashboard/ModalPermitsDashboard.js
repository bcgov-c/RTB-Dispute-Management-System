import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../modals/ModalBase';
import TextareaView from '../../../textarea/Textarea';
import TextareaModel from '../../../textarea/Textarea_model';
import PermitDashboardLine from './PermitDashboardLine';
import IntakeAriDataParser from '../../../custom-data-objs/ari-c/IntakeAriDataParser';
import PermitModel from '../../../custom-data-objs/ari-c/units/Permit_model';
import template from './ModalPermitsDashboard_template.tpl';
import SortIcon from '../../../../static/Icon_AdminPage_ListSortDownArrow.png';

const UNIT_SORT_CODE = 1;
const PERMIT_ID_SORT_CODE = 2;
const PERMIT_DATE_SORT_CODE = 3;

const loaderChannel = Radio.channel('loader');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'permitsDashboard-modal',

  regions: {
    ariDashboard: '.ari-dashboard-table-lines',
    noteRegion: '.ari-dashboard-note',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-continue',
      downloadCsvDecision: '.ari-dashboard-download-decision',

      unitHeader: '.ari-dashboard-table-unit > .general-link',
      permitIdHeader: '.permits-dashboard-permit-id > .general-link',
      permitDateHeader: '.permits-dashboard-permit-date > .general-link',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave',
      'click @ui.downloadCsvDecision': 'clickDownloadCsvDecision',

      'click @ui.unitHeader': function() {
        this.updateHeaderSort(UNIT_SORT_CODE);
      },
      'click @ui.permitIdHeader': function() {
        this.updateHeaderSort(PERMIT_ID_SORT_CODE);
      },
      'click @ui.permitDateHeader': function() {
        this.updateHeaderSort(PERMIT_DATE_SORT_CODE);
      },
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) return;

    loaderChannel.trigger('page:load');
    this.customDataObj.set({
      description: this.noteModel.getData()
    });
    
    this.customDataObj.save().done(() => {
      this.close();
      loaderChannel.trigger('page:load:complete');
    }).fail(err => {
      alert('[Error] There was an issue saving the custom data');
      loaderChannel.trigger('page:load:complete');
    });
  },

  clickDownloadCsvDecision() {
    const lines = this.convertCurrentViewDataToCsv();
    this._createAndDownloadCsvFile('Dispute_Permits_', lines);
  },

  _createAndDownloadCsvFile(filenameStart, csvFileLines) {
    const CSV_FILE_NAME = `${filenameStart}${this.model.get('file_number')}_${Moment().format('MM_DD_YYYY')}.csv`;
    const csvContent = csvFileLines.map(line => line.join(",")).join("\r\n");
    const csvFileContents = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  
    const link = document.createElement("a");
    link.setAttribute("href", csvFileContents);
    link.setAttribute("download", CSV_FILE_NAME);
    document.body.appendChild(link);
    
    link.click();
    link.remove();
  },

  updateHeaderSort(headerSortCode, options={}) {
    this.currentSortCode = headerSortCode;

    const buildPermitComparator = (permitField) => {
      return (modelA, modelB) => {
        const permitA = modelA.get('permitModel');
        const permitB = modelB.get('permitModel');
        const permitFieldA = permitA && permitA.get(permitField);
        const permitFieldB = permitB && permitB.get(permitField);
        if (!permitFieldA && !permitFieldB) return 0;
        // Sort all nulls to the end
        else if (!permitFieldA) return 1;
        else if (!permitFieldB) return -1;
        else return String(permitFieldA || '') < String(permitFieldB || '') ? -1 : 1
      };   
    };

    if (headerSortCode === UNIT_SORT_CODE) {
      this.lineCollection.comparator = (modelA, modelB) => modelA.get('unitModel').getUnitNumDisplayShort() < modelB.get('unitModel').getUnitNumDisplayShort() ? -1 : 1;
    } else if (headerSortCode === PERMIT_ID_SORT_CODE) {
      this.lineCollection.comparator = buildPermitComparator('local-permit_id');
    } else if (headerSortCode === PERMIT_DATE_SORT_CODE) {
      this.lineCollection.comparator = buildPermitComparator('local-issued_date');
    }

    if (!options.no_render) {
      this.lineCollection.sort();
      this.render(); 
    }
  },

  initialize() {
    this.customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'));    

    if (!this.customDataObj) {
      alert('No Intake PFR data could be found for this dispute.');
      this.close();
      return;
    }
    
    IntakeAriDataParser.parseFromCustomDataObj(this.customDataObj);

    this.units = IntakeAriDataParser.toUnitCollection();

    this.currentSortCode = null;
    this.lineCollection = new Backbone.Collection();
    this.updateHeaderSort(UNIT_SORT_CODE, { no_render: true });

    const uniquePermits = {};
    this.units.forEach(unit => {
      const permits = unit.getPermits();
      if (permits.length) {
        permits.forEach(permit => {
          uniquePermits[permit['local-permit_id']] = true;
          // Add one row for each permit
          this.lineCollection.add({ unitModel: unit, permitModel: new PermitModel(permit) });
        });
      } else {
        // Add empty row for unit only
        this.lineCollection.add({ unitModel: unit, permitModel: null });
      }
    });

    this.numUniquePermits = Object.keys(uniquePermits).length;
    this.numUnits = this.units.length;
    this.numTenants = this.units.reduce((memo, unit) => memo + (
        Number(unit.get('selected_tenants')) > 0 ? Number(unit.get('selected_tenants')) : 0), 0);

    this.createSubModels();
    this.setupListeners();
  },


  createSubModels() {
    this.noteModel = new TextareaModel({
      labelText: 'Internal Permits Note',
      inputType: 'text',
      cssClass: 'optional-input',
      required: false,
      displayRows: 2,
      value: this.customDataObj.get('description'),
      apiMapping: 'description'
    });
  },

  setupListeners() {
    this.listenTo(this.units, 'refresh:dashboard', () => {
      ['ariDashboard'].forEach(regionName => {
        const view = this.getChildView(regionName);
        if (view && view.isRendered()) {
          view.render();
        }
      });
    }, this);
  },

  convertCurrentViewDataToCsv() {
    const headerLine = ['Unit', 'Tenants', 'Permits Required', 'Permit ID', 'Permit Date', 'Issued By', 'Permit Description'];
    const allLines = [headerLine];
    this.lineCollection.each(lineModel => {
      const unitModel = lineModel.get('unitModel');
      const permitModel = lineModel.get('permitModel');
      const getPermitField = (field) => permitModel && permitModel.get(field);
      const momentDate = Moment(getPermitField('local-issued_date'));
      
      const line = [
        `${unitModel.getUnitNumDisplayShort()}: ${unitModel.getStreetDisplayWithDescriptor()}`,
        unitModel.get('selected_tenants') > 0 ? unitModel.get('selected_tenants') : 0,
        unitModel.noPermitsRequired() ? 'No' : 'Yes',
        getPermitField('local-permit_id') || '-',
        momentDate.isValid() ? Formatter.toDateDisplay(momentDate) : '-',
        getPermitField('local-issued_by') || '-',
        getPermitField('local-permit_description') || '-',
      ];
      allLines.push(line);
    });

    allLines.push([
      `Units: ${this.numUnits}`,
      `Tenants: ${this.numTenants}`,
      '', // Add an extra space for .csv formatting
      `Unique: ${this.numUniquePermits}`,
    ]);

    // Enclose all items before returning
    return allLines.map(line => line.map(item => `"${item}"`));
  },

  validateAndShowErrors() {
    let isValid = true;
    const view = this.getChildView('noteRegion');

    if (view && view.isRendered()) {
      isValid = view.validateAndShowErrors() && isValid;
    }

    return isValid;
  },
  
  onRender() {
    const PermitDashboardLines = Marionette.CollectionView.extend({
      template: _.noop,
      childView: PermitDashboardLine,
    });

    this.showChildView('ariDashboard', new PermitDashboardLines({ collection: this.lineCollection }));
    this.showChildView('noteRegion', new TextareaView({ model: this.noteModel }));
  },

  templateContext() {
    return {
      Formatter,
      numUnits: this.numUnits,
      numTenants: this.numTenants,
      numUniquePermits: this.numUniquePermits,
      currentSortCode: this.currentSortCode,
      UNIT_SORT_CODE,
      PERMIT_ID_SORT_CODE,
      PERMIT_DATE_SORT_CODE,
      SortIcon,
    };
  }
});
