
const DocTitles = {
  2: "Decision",
  3: "Decision",
  70: "Decision",
  71: "Decision",
  5: "Decision",
  6: "Decision",
  7: "Decision",
  8: "Decision",
  81: "Decision",
  82: "Decision",
  10: "Order",
  11: "Order",
  12: "Order",
  15: "Order",
  16: "Order",
  17: "Order",
  18: "Order",
  20: "Decision",
  21: "Decision",
  22: "Decision",
  25: "Review Consideration Decision",
  30: "Interim Decision",
  31: "Interim Decision",
  36: "Interim Decision",
  37: "Interim Decision",
  33: "Interim Decision",
  34: "Interim Decision",
  35: "Interim Decision",
  40: "Decision on Request for Correction",
  41: "Decision: Request for Correction",
  42: "Decision: Request for Correction",
  45: "Decision on Request for Clarification",
  46: "Decision: Request for Clarification",
  47: "Decision: Request for Clarification",
  50: "Substituted Service Decision",
  55: "Format of Hearing Decision",
  60: "Preliminary Hearing Interim Decision",
  65: "Other: Single Participatory",
  66: "Other: Cross App",
  67: "Other: Direct Request",
  68: "Other: Joiner",
};


const IssueCodes = {
  // Orders of Possession
  LL_DR_OP_10Day: [123, 124],
  LL_DR_OP: [123, 124, 143, 144, 145, 146],
  Emergency: [113],
  LL_OP: [102, 122, 123, 124, 143, 144, 145, 146, 104, 101, 103, 130, 105, 131, 132],
  LL_OP_STOP: [227, 226, 106],
  // Tenant OPs
  CN: [208, 230, 205, 231, 204, 232, 207, 233, 203, 234, 224, 235, 206, 236],
  LL_OP_TT: [242],
  TT_OP: [218],
  
  // Monetary
  LL_DR_MN: [125, 126],
  TT_DR_MN: [237, 238, 239],
  MN_LL: [107, 108, 110],
  MN_LL_Monthly: [108, 125, 126, 128],
  MN_LL_Deposit: [129, 128, 127],
  MN_TT: [238, 209, 211, 237, 239, 210, 202, 222, 243, 246, 245],
  MN_Misc: [244, 142, 136],
  FF: [111, 223],
  LL_FF: [111],
  TT_FF: [223],
  
  // Other/misc
  LL_Other: [133, 114],
  TT_Misc: [213, 214, 219, 215, 218, 217, 220, 216, 221, 212, 240, 241, 225],
  All: [101, 102, 103, 104, 105, 106, 107, 108, 110, 111, 114, 122, 127, 128, 129, 130, 131, 132, 133, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 243, 245, 246],
};

export { DocTitles, IssueCodes };
