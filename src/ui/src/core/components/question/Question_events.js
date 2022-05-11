import QuestionDOM from './Question_dom.js';
/**
 * Event handlers for different Questions types and scenarios
 */
const QuestionEvents = {
  /**
   * @param currValue
   * @param nextValue
   * @returns {Promise<any>}
   */
  beforeYesNoChange(currValue, nextValue) {
    // No need to confirm if a value hasn't been selected
    if (typeof currValue === 'undefined' || currValue === null) {
      return Promise.resolve(true);
    }

    nextValue = parseInt(nextValue);
    currValue = parseInt(currValue);

    if (currValue !== nextValue) {
      if (nextValue === 1) {
        // Do nothing
      } else if (nextValue === 0 || nextValue === null) {
        const isConfirmed = QuestionDOM.showConfirmClear();
        return isConfirmed;
      }
    }

    return Promise.resolve(true);
  }
  
};

export default QuestionEvents;
