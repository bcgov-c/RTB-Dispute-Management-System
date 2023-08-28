import DecGen_MergeFields from './DecGen_MergeFields';

const CUSTOM_MERGE_FIELDS = 'CustomMergeFields';

const DecGenFormatter = {
    // Global merge fields
  MergeFields: DecGen_MergeFields,
  
  // Custom merge fields can be defined in this object
  CustomMergeFields: null,

  // Creates a formatted merge field string - {merge_field_name|optional_fallback}, or {merge_field_name}
  formatMergeField(mergeField, fallback='') {
    if (!this.validateMergeField(mergeField)) {
      console.log(`Unsupported merge field '${mergeField}'. Adding error text`);
      return `**MergeFieldError__${mergeField}${fallback?`__${fallback}`:''}`;
    }
    return `{${mergeField}${fallback?`|${fallback}`:''}}`
  },

  validateMergeField(mergeField, contextData={}) {
    const mergeFields = Object.assign({}, contextData?.[CUSTOM_MERGE_FIELDS], this.MergeFields);
    return !!mergeFields?.[mergeField];
  },

  convertMergeField(mergeField, contextData={}) {
    if (!this.validateMergeField(mergeField, contextData)) {
      console.log(`Unsupported merge field '${mergeField}'. Not converting.`);
      return '';
    }
    
    const mergeFields = Object.assign({}, contextData?.[CUSTOM_MERGE_FIELDS], this.MergeFields);
    return mergeFields[mergeField](contextData) || '';
  },

  applyMergeFieldConversions(htmlString='', contextData={}) {
    return htmlString.replaceAll(/{([^|]*?)\s*(\|\s*(.*?))?}/g, (match, mergeField, group2, fallback='') => {
      const converted = this.convertMergeField(mergeField, contextData);
      return converted || fallback;
    });
  },

};


export { DecGenFormatter, CUSTOM_MERGE_FIELDS };
