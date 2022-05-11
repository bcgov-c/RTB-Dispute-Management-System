
// Config items for Intake Respondents page question items
export default {

  respondentCount: {
    type: 'question',
    question_name: 'S3_RespondentCount',
    page_item_options(questionModel) {
      const question_answer = questionModel.getData();
      return {
        stepText: 'How many respondents are there in this dispute?',
        stepComplete: question_answer !== null && !_.isNaN(parseInt(question_answer)),
      };
    },
    question_options: {
      optionData: [{ name: 'respondent-count-1', value: "1", cssClass: 'option-button yes-no', text: '1'},
          { name: 'respondent-count-2', value: "2", cssClass: 'option-button yes-no', text: '2'},
          { name: 'respondent-count-3', value: "3", cssClass: 'option-button yes-no', text: '3'},
          { name: 'respondent-count-more', value: "more", cssClass: 'option-link', text: 'more than 3'}]

    }
  }
};
