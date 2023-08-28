
export default JSON.stringify({
    "formSteps": [
    {
        "name": "formQ1",
        "type": "nestedForm",
        "stepText": "Please describe this question",
        "help": "test help",
        "value": [
            {
                "name": "formQ1-first",
                "type": "text",
                "required": true,
                "labelText": "First name"
            },
            {
                "name": "formQ1-last",
                "type": "text",
                "required": true,
                "labelText": "Last name"
            }
        ]
    },
    {
        "name": "formQ2",
        "type": "textarea",
        "stepText": "Please describe this question",
        "value": "pre-filled text area",
        "required": "true"
    },
    {
        "name": "formQ3",
        "type": "date",
        "stepText": "Please enter a date",
        "value": null,
        "required": true
    },
    {
        "name": "formQ4",
        "type": "currency",
        "stepText": "Please enter amount",
        "required": true
    }
  ]
}, null, 4);
