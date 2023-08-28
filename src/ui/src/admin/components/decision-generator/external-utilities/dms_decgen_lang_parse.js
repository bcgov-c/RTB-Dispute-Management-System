// Manual process to update configs:
// 1. Scrape data from 2 wiki pages:
// 1a) DecGen Issue Titles
// 1b) DecGen Analysis & Conclusions text
// 2. Merge the configs into one object
// 3. Examine and manually clean up object for double spaces, MSWord smart quotes, invalid merge fields, typos, etc
// 3.b) If issues found, update requirements to fix uncovered issues
// SKIP-4. Run routine to fill any holes in data (requirements are missing some valid permutations of title and process)
// 5. Save merged config to DecGenIssueConfig.js


//// 1a. Scrape data from 2 wiki pages: DecGen Issue Titles ////
let requirementsTableSelector = $('.pm-table-wrapper tr');
let configObject = {};
let parsedArray = Array.from(requirementsTableSelector.map((_,row) => ([Array.from(row.getElementsByTagName('td')).map(cell => cell.textContent.trim())])));
parsedArray.forEach(issueRow => {

  // Old-style parsing: ET -113/MHPTA (49)/1
  // New-style parsing: [113:RTA:56:1]

  // Since capture groups are in same order, can just toggle old/new regex and use same match group parsing
  const isNewStyleTitle = issueRow?.[0]?.match(/\[.+\]/)?.length;
  const regex = isNewStyleTitle ? /\[(\d+?)\:(\w+?)\:(\d+?)\:(\d+?)\]/ : /(\d+?)\/(\w+?)\s(.*)\/(\d+?)/;
  const matches = issueRow?.[0]?.match(regex);
  const issueCode = matches?.[1];
  const sectionNumber = matches?.[3];
  const isRTA = matches?.[2] === 'RTA';
  const isMHPTA = matches?.[2] === 'MHPTA';
  const act = isRTA ? 'RTA': isMHPTA ? 'MHPTA' : '_';  
  const process = matches?.[4] || '_';

  // ***DIFFERENT PARSING FIELDS***
  const configRowData = {
    actTitle: issueRow[1],
    decidedTitle: issueRow[2],
    conversationalAct: null,
    strictAct: null,
    conversationalGranted: null,
    sectionNumber: null, // SectionNumber is cleaner from Analysis page
  };
  
  if (!configObject[issueCode]) configObject[issueCode] = {};
  if (!configObject[issueCode][act]) configObject[issueCode][act] = {};
  if (!configObject[issueCode][act][process]) configObject[issueCode][act][process] = {};
  Object.assign(configObject[issueCode][act][process], configRowData);
});

// Fill blank RTA/MHPTA spots?
Object.keys(configObject).forEach(key => {
  const conf = configObject[key];
  if (!conf.RTA) conf.RTA = conf.MHPTA || conf._;
  if (!conf.MHPTA) conf.MHPTA = conf.RTA || conf._;
  delete conf._;
});

configObject;
// Now right click and copy the object into JS. Clean up the file manually as needed


//// 1b. Scrape data from 2 wiki pages: DecGen Analysis & Conclusions text ////
let requirementsTableSelector = $('.pm-table-wrapper tr');
let configObject = {};
let parsedArray = Array.from(requirementsTableSelector.map((_,row) => ([Array.from(row.getElementsByTagName('td')).map(cell => cell.textContent.trim())])));
parsedArray.forEach(issueRow => {

  // Old-style parsing: ET -113/MHPTA (49)/1
  // New-style parsing: [113:RTA:56:1]

  // Since capture groups are in same order, can just toggle old/new regex and use same match group parsing
  const isNewStyleTitle = issueRow?.[0]?.match(/\[.+\]/)?.length;
  const regex = isNewStyleTitle ? /\[(\d+?)\:(\w+?)\:(\d+?)\:(\d+?)\]/ : /(\d+?)\/(\w+?)\s(.*)\/(\d+?)/;
  const matches = issueRow?.[0]?.match(regex);
  const issueCode = matches?.[1];
  const sectionNumber = matches?.[3];
  const isRTA = matches?.[2] === 'RTA';
  const isMHPTA = matches?.[2] === 'MHPTA';
  const act = isRTA ? 'RTA': isMHPTA ? 'MHPTA' : '_';  
  const process = matches?.[4] || '_';

  // ***DIFFERENT PARSING FIELDS***  
  const configRowData = {
    actTitle: null,
    decidedTitle: null,
    conversationalAct: issueRow[1],
    strictAct: issueRow[2],
    conversationalGranted: issueRow[3],
    sectionNumber,
  };
  
  if (!configObject[issueCode]) configObject[issueCode] = {};
  if (!configObject[issueCode][act]) configObject[issueCode][act] = {};
  if (!configObject[issueCode][act][process]) configObject[issueCode][act][process] = {};
  Object.assign(configObject[issueCode][act][process], configRowData);
});

// Fill blank RTA/MHPTA spots?
Object.keys(configObject).forEach(key => {
  const conf = configObject[key];
  if (!conf.RTA) conf.RTA = conf.MHPTA || conf._;
  if (!conf.MHPTA) conf.MHPTA = conf.RTA || conf._;
  delete conf._;
});

configObject;
// Now right click and copy the object into JS. Clean up the file manually as needed



//// 2. Merge the configs into one object ////
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeepKeepTruthy(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeepKeepTruthy(target[key], source[key]);
      } else {
        // When merging, use the truthy value - if both values are truthy, override with the "source" obj
        Object.assign(output, { [key]: output[key] || source[key] });
      }
    });
  }
  return output;
}
var c = mergeDeepKeepTruthy(a, b);

/*
TODO: Step removed for now - to revisit
//// 4. Run routine to fill any holes in data (requirements are missing some valid permutations of title and process) ////
// Cleanup routine, cover for missing requirements data
// Then fill issue titles where they are missing for process 1 or 2
function fillProcess(data={}) {
  const process1Conf = data['1']
  const process2Conf = data['2']
  if (!isObject(process1Conf)) {
    data['1'] = Object.assign({}, process2Conf);
  } else if (!isObject(process2Conf)) {
    data['2'] = Object.assign({}, process1Conf);
  }
};

Object.values(c).forEach(issue => {
  const rtaConf = issue?.RTA || {};
  const mhptaConf = issue?.MHPTA || {};
  // TODO: How to tell if some are missing RTA/MHPTA?
  // Is this step needed?  It fills requirements
  // fillProcess(rtaConf)
  // fillProcess(mhptaConf)
  issue.RTA = rtaConf;
  issue.MHPTA = mhptaConf
});
*/
