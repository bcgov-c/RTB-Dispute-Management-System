// Create an enum for the available outcome doc data

const enumValue = (name) => Object.freeze({toString: () => `DecGenData:${name}`});
const DecGenData = Object.freeze({
  currentCcrItem: enumValue('currentCcrItem'),
  currentSubServItem: enumValue('currentSubServItem'),
  currentDoc: enumValue('currentDoc'),
  currentDocSet: enumValue('currentDocSet'),
  signature: enumValue('signature'),
  
  dispute: enumValue("dispute"),
  allParticipants: enumValue("allParticipants"),
  hearings: enumValue("hearings"),
  files: enumValue("files"),
  linkFiles: enumValue("linkFiles"),
  fileDescriptions: enumValue("fileDescriptions"),
  filePackages: enumValue("filePackages"),
  allIssues: enumValue("allIssues"),
  notes: enumValue("notes"),
  notices: enumValue("notices"),
  linkedDisputes: enumValue('linkedDisputes'),

  [`DecisionHeader:hideLinkedFileNumbers`]: enumValue('DecisionHeader:hideLinkedFileNumbers'),
  [`DecisionHeader:hidePartyInitials`]: enumValue('DecisionHeader:hidePartyInitials'),
  [`all:showSectionFileNumber`]: enumValue('all:showSectionFileNumber'),
});

export default DecGenData;
