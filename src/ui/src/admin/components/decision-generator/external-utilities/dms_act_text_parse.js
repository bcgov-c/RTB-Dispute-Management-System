
// Parses all sections of RTA / MHPTA act into a variable (?)
// RTA link https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01
// MHPTA link https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02077_01

/*
 [section id]: {
    // TODO: Denote config format
    node: <Node>
    html: <Node>.innerHtml
 }
}
*/

// NOTE: 142 sections in RTA act
// NOTE: 122 sections in MHPTA act

let DMS_ACT_CLASS = "DMS-ACT-SECTION";
let errorLog = [];
let actSectionsConfig = {};
let classesUsed = new Set();
let replaceEle = (searchNode, selector, replacementElement) => {
  searchNode.querySelectorAll(selector).forEach(node => {
    const isNodeEmpty = !node.textContent;
    if (isNodeEmpty) {
      node.remove();
    } else {
      const replacementNode = document.createElement(replacementElement);
      replacementNode.innerHTML = node.textContent;
      node.replaceWith(replacementNode);
    }
  });
};
let getClassesFromNode = (node) => {
  if (!node?.className) return [];
  const classes = [];
  const classList = Array.from(node.classList.values()).filter(a => a);
  classes.push(...classList);
  node.childNodes.forEach(n => {
    classes.push(...getClassesFromNode(n));
  });
  return classes;
};
let sections = document.querySelectorAll('.section');

sections.forEach(section => {
  // Get section title
  const bookmarkLink = section.querySelector('a');
  const sectionNumber = bookmarkLink ? `${bookmarkLink?.getAttribute('name')}`.match(/section(.+?)$/)?.[1] : null;
  if (!sectionNumber) {
    errorLog.push(`Error finding section number for::${section.innerHTML}`);
    return;
  }
  if (actSectionsConfig[sectionNumber]) {
    errorLog.push('Duplicate section detected::${section.innerHTML}');
    return;
  }
  // Strip elements from section that we know are invalid
  const cleanedSection = section.cloneNode(true);
  replaceEle(cleanedSection, 'a', 'span');
  replaceEle(cleanedSection, 'h4', 'b');
  cleanedSection.querySelectorAll('.secnumholder').forEach(span => {
    if (!span.innerHTML) return;
    const spanHtml = span.innerHTML;
    const spanSplit = spanHtml?.split('(');
    if (spanSplit.length === 2) {
      const addExtraSpace = span.innerText?.split('(')?.[0]?.trim().length === 1;
      const spacesToAdd = `&nbsp;&nbsp;${addExtraSpace ? '&nbsp;&nbsp;' : ''}`;
      span.innerHTML = `${spanSplit[0].replace(/\&nbsp;/g, '').replace(/\s+$/, '')}${spacesToAdd}(${spanSplit[1]}`;
    }
  });

  actSectionsConfig[sectionNumber] = {
    node: cleanedSection,
    html: cleanedSection.innerHTML
  };
});

Object.values(actSectionsConfig).forEach(conf => {
  conf.node.childNodes.forEach(n => {
    getClassesFromNode(n).forEach(c => classesUsed.add(c));
  });
});

let finalCleanedConfig = {};
Object.keys(actSectionsConfig).forEach(key => {
  const conf = actSectionsConfig[key];
  finalCleanedConfig[key] = `<div class="${DMS_ACT_CLASS}">${conf.html}</div>`;
});


console.log(`Created ${Object.keys(finalCleanedConfig).length} sections in config`);
if (errorLog.length) console.log(`** ${errorLog.length} issue(s) detected. See error log`);
console.log(`The following classes are being used:\n${Array.from(classesUsed).map(c => `- ${c}\n`).join('')}`);

errorLog, classesUsed, finalCleanedConfig;
// Right click and copy the object into JS. Clean up the file manually as needed