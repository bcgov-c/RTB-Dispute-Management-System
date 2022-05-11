import CustomDataParser from '../CustomDataParser';
import Radio from 'backbone.radio';
import UnitCollection from './units/Unit_collection';
import CostCollection from './costs/Cost_collection';
import AwardedCostCollection from './costs/AwardedCost_collection';

const unitsAttrName = 'local-units';
const unitAttrName = 'local-unit_id';
const capitalCostAttrName = 'local-application_capital_costs';
const awardedCostAttrName = 'local-awarded_capital_costs';

const UNIT_RENAMES = {
  'unit_id': 'local-unit_id',
  'address': 'local-address',
  'unit_type': 'local-unit_type',
  'unit_text': 'local-unit_text',
  'city': 'local-city',
  'issue_id': 'claim-issue_id',
  'postal_zip': 'local-postal_zip',
  'participant_ids': 'participant_ids',
  'rent_amount': 'local-rent_amount',
  'selected_tenants': 'local-selected_tenants',
  'rent_start_month': 'local-rent_start_month',
  'awarded_amount': 'local-awarded_amount',
  'permits': 'local-permits',
};

const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');

const IntakeAriDataParser = CustomDataParser.extend({
  /*
  Intake ARI-C data format example
  {
	"dispute-dispute_guid": "89d5504a-1e4d-4a64-8ecb-b7b54b1d800f",
	"local-units": [
		{
		"local-unit_id": 1,
		"participant-address": "#222, 101 fort street",
		"participant-city": "Victoria",
		"participant-postal_zip": "V8V 8V8",
		"participant-participant_ids": [101121,102332],
		"local-rent_amount": "845.00",
		"local-rent_start_month": 1,
		"local-awarded_amount": "44.67"
		},
		{
		"local-unit_id": 2,
		"participant-address": "#223, 101 fort street",
		"participant-city": "Victoria",
		"participant-postal_zip": "V8V 8V8",
		"participant-participant_ids": [101128],
		"local-rent_amount": "845.00",
		"local-rent_start_month": 1,
		"local-awarded_amount": "32.99"
		},
		{
		"local-unit_id": 3,
		"participant-address": "#224, 101 fort street",
		"participant-city": "Victoria",
		"participant-postal_zip": "V8V 8V8",
		"participant-participant_ids": [101223],
		"local-rent_amount": "845.00",
		"local-rent_start_month": 1,
		"local-awarded_amount": "32.99"
		}
	],
	"local-application_capital_costs": [
		{
			"local-capital_cost_id": 1,
			"remedy-remedy_id": 32478,
			"local-units": [1,2,3]
		}
	],
	"local-awarded_capital_costs": [
		{
			"local-awarded_cost_id": 1,
			"remedy-remedy_id": 32478,
			"units": [1,2]
		}
	]
}

Intake PFR Data example:
{
  "dispute-dispute_guid": "c06ddfb3-deeb-4687-9b91-d9ea8c8ab682",
  "local-units": [
    {
      "local-unit_id": 1,
      "local-address": "U1 Street",
      "local-unit_type": null,
      "local-unit_text": null,
      "local-city": "Victoria",
      "claim-issue_id": 792,
      "local-postal_zip": "V8V 8V8",
      "participant_ids": [
        803
      ],
      "local-rent_amount": null,
      "local-selected_tenants": "1",
      "local-rent_start_month": null,
      "local-awarded_amount": null,
      "local-permits": [{
        "local-permit_id": "CRX-12345",
        "local-permit_description": null,
        "local-issued_date": "2021-01-01T10:03:03.428Z",
        "local-issued_by": "John Smith"
      }, {
        "local-permit_id": "Permit Title",
        "local-permit_description": "Here is a description",
        "local-issued_date": null,
        "local-issued_by": null
      }]
    },
    {
      "local-unit_id": 2,
      "local-address": "U2 Street",
      "local-unit_type": null,
      "local-unit_text": null,
      "local-city": "Victoria",
      "claim-issue_id": 790,
      "local-postal_zip": "V8V 8V8",
      "participant_ids": [
        804
      ],
      "local-rent_amount": null,
      "local-selected_tenants": "1",
      "local-rent_start_month": null,
      "local-awarded_amount": null,
      "local-permits": []
    },
    {
      "local-unit_id": 3,
      "local-address": "U3 Street",
      "local-unit_type": null,
      "local-unit_text": null,
      "local-city": "Victoria",
      "claim-issue_id": 791,
      "local-postal_zip": "V8V 8V8",
      "participant_ids": [
        805
      ],
      "local-rent_amount": null,
      "local-selected_tenants": "1",
      "local-rent_start_month": null,
      "local-awarded_amount": null,
      "local-permits": [{
        "local-permit_id": "CRX-12345",
        "local-permit_description": null,
        "local-issued_date": "2021-01-01T10:03:03.428Z",
        "local-issued_by": "John Smith"
      }]
    }
  ],
  "local-application_capital_costs": [],
  "local-awarded_capital_costs": [],
}
*/

  setJSON(json) {
    CustomDataParser.prototype.setJSON.call(this, json);
    this.parseUnitModelsFromData();
  },

  createDefaultJson() {
    this.set('_json', {
      'dispute-dispute_guid': disputeChannel.request('get:id'),
      'local-units': [],
      'local-application_capital_costs': [],
      'local-awarded_capital_costs': []
    });
  },

  getAwardedCostsData() {
    return this.getAttribute(awardedCostAttrName);
  },

  getCapitalCostsData() {
    return this.getAttribute(capitalCostAttrName);
  },

  _setCostCollection(costFieldAttr, costCollection) {
    const json = this.get('_json');
    costCollection.sortBy(costModel => costModel.getCostId());
    const newCostsJson = costCollection.map(costModel => costModel.toJSON());
    json[costFieldAttr] = newCostsJson;
  },

  _setCostData(costAttrName, costData) {
    const json = this.get('_json');
    console.log(costData);
    json[costAttrName] = _.sortBy(costData, cost => cost['local-capital_cost_id'] || cost['local-awarded_cost_id']);
  },

  setAwardedCapitalCostsData(capitalCostsData) {
    this._setCostData(awardedCostAttrName, capitalCostsData);
  },

  setCapitalCostsData(capitalCostsData) {
    this._setCostData(capitalCostAttrName, capitalCostsData);
  },

  setAwardedCostCollection(costCollection) {
    this._setCostCollection(awardedCostAttrName, costCollection);
  },

  setCostCollection(costCollection) {
    this._setCostCollection(capitalCostAttrName, costCollection);
  },

  toAwardedCostCollection() {
    return new AwardedCostCollection(this.getAwardedCostsData() || []);
  },

  toCostCollection() {
    return new CostCollection(this.getCapitalCostsData() || []);
  },

  getUnitsData() {
    return this.getAttribute(unitsAttrName);
  },

  getUnitData(unitId) {
    const matchingUnit = this.getUnitsData().filter(unit => unit[unitAttrName] === unitId);
    return matchingUnit.length ? matchingUnit[0] : null;
  },

  toUnitCollection() {
    return new UnitCollection(this.parseUnitModelsFromData());
  },

  removeUnitsFromJson(unitModelsToRemove) {
    // Reverse sort the units to remove so we are always removing the items on the end first.
    // Doing this means the units to remove won't have to be renamed, as unit removals change the numbering of later units.
    const sortedUnitModelsToRemove = (unitModelsToRemove || []).sort(unitModel => -unitModel.get('unit_id'));
    sortedUnitModelsToRemove.forEach(unitModel => this.removeUnitFromJson(unitModel));
  },

  removeUnitFromJson(unitModelToRemove) {
    const unitIdToRemove = unitModelToRemove.get('unit_id');
    const unitCollection = this.toUnitCollection();
    const costsData = this.getCapitalCostsData();
    const awardedCostsData = this.getAwardedCostsData();

    const unitIdRenames = {};
    unitCollection.each(unitModel => {
      if (unitModel.get('unit_id') > unitIdToRemove) {
        unitIdRenames[unitModel.get('unit_id')] = unitModel.get('unit_id') - 1;
      }
    });

    const costRenameFn = (_costData) => {
      _costData['local-units'] = _.map(
        // First filter the removed item
        _.filter(_costData['local-units'] || [], unitId => unitId !== unitIdToRemove),
        // Then rename all other units
        unitId => _.has(unitIdRenames, unitId) ? unitIdRenames[unitId] : unitId
      );        
    };

    // Perform renames and filters
    _.each(costsData, costRenameFn);
    _.each(awardedCostsData, costRenameFn);
    this.setCapitalCostsData(costsData);
    this.setAwardedCapitalCostsData(awardedCostsData);


    unitCollection.has(unitModelToRemove);
    

    unitCollection.each(unitModel => {
      const unitId = unitModel.get('unit_id');
      if (_.has(unitIdRenames, unitId)) {
        unitModel.set('unit_id', unitIdRenames[unitId]);
      }
    });

    // Compare using the unit instead of the model?
    const matchingUnit = unitCollection.findWhere({ unit_id: unitIdToRemove });
    unitCollection.remove(matchingUnit);
    this.setUnitCollection(unitCollection);
  },

  setUnitCollection(unitCollection) {
    const json = this.get('_json');

    const newUnitsJson = unitCollection.map(unitModel => this.convertUnitModelToData(unitModel));

    console.log(newUnitsJson);
    json[unitsAttrName] = newUnitsJson;
  },

  parseUnitModelsFromData() {
    const invertedUnitRenames = _.invert(UNIT_RENAMES);
    return _.map(this.getUnitsData(), unitData => {
      const unitModelData = {};
      Object.keys(invertedUnitRenames).forEach(key => {
        const renamedKey = invertedUnitRenames[key];
        unitModelData[renamedKey] = unitData[key];
      });

      // Only keep participants that exist on the dispute when parsing unit data
      unitModelData.participant_ids = _.filter(unitModelData.participant_ids, participantId => participantsChannel.request('get:participant', participantId));

      return unitModelData;
    });
  },

  convertUnitModelToData(unitModel) {
    const unitModelJson = unitModel.toJSON();
    const unitModelData = {};
    Object.keys(UNIT_RENAMES).forEach(key => {
      const renamedKey = UNIT_RENAMES[key];
      unitModelData[renamedKey] = unitModelJson[key];
    });

    // Only keep participants that exist on the dispute when converting unit data
    unitModelData.participant_ids = _.filter(unitModelData.participant_ids, participantId => participantsChannel.request('get:participant', participantId));

    return unitModelData;
  },

});

const dataParserInstance = new IntakeAriDataParser();
export default dataParserInstance;
