exports.handler = (event, context, callback) => {

    console.log('The event >> ' + JSON.stringify(event));    

    console.log('this is from custom message handler....');
    if(event.triggerSource === "CustomMessage_SignUp") {
        console.log('this is inside the trigger source....');
        const userName  = event.userName;
        const { codeParameter } = event.request;
        const url = 'https://example.com/verification_page';
        const link = `<a href="${url}?username=${userName}&code=${codeParameter}" target="_blank">here</a>`;
        event.response.emailSubject = "Welcome to the TellABout Service";
        event.response.emailMessage = `Thank you for signing up. Click ${link} to verify your email.`;
        console.log("link" + link);
    }

    // Return to Amazon Cognito
    callback(null, event);
};