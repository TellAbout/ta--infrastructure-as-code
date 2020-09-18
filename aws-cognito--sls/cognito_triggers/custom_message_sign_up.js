const verification_page_url = process.env.EMAIL_VERIFICATION_PAGE_URL;
const forgot_password_page_url = process.env.FORGOT_PASSWORD_PAGE_URL;

exports.handler = (event, context, callback) => {

    console.log('The event >> ' + JSON.stringify(event));    

    console.log('this is from custom message handler....');
    if(event.triggerSource === "CustomMessage_SignUp") {
        console.log('this is inside the trigger source....');
        const userName  = event.userName;
        const { codeParameter } = event.request;
        const hasura_id = event.request.clientMetadata.hasura_id;
        //const url = 'https://example.com/verification_page';
        const link = `<a href="${verification_page_url}?username=${userName}&code=${codeParameter}&hasura_id=${hasura_id}" target="_blank">here</a>`;
        event.response.emailSubject = "Welcome to the TellABout Service";
        event.response.emailMessage = `Thank you for signing up. Click ${link} to verify your email.`;
        console.log("link" + link);
    } else if (event.triggerSource === "CustomMessage_ForgotPassword"){
        console.log('this is inside the forgot password source....');
        const userName  = event.userName;
        const { codeParameter } = event.request;
        //const url = 'https://example.com/verification_page';
        const link = `<a href="${forgot_password_page_url}?username=${userName}&code=${codeParameter}" target="_blank">here</a>`;
        event.response.emailSubject = "Welcome to the TellABout Service";
        event.response.emailMessage = `Please click ${link} to reset your password.`;
        console.log("link" + link);
    }

    // Return to Amazon Cognito
    callback(null, event);
};