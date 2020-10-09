var aws = require('aws-sdk');
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });

const userpool_id = process.env.COGNITO_USERPOOL_ID;

exports.handler = (event, context, callback) => {
  console.log('The stringy event >> ' + JSON.stringify(event));
  var params = { 
    UserPoolId: userpool_id, /* required */
    Username: 'kulasangar91+sandbox@gmail.com', /* required */
    MessageAction: "SUPPRESS",
    UserAttributes: [
      {
        Name: "email",
        Value: "kulasangar91+sandbox@gmail.com"
      },
      {
        Name: "email_verified",
        Value: "true"
      }
      /* more items */
    ]
  };
  cognitoidentityserviceprovider.adminCreateUser(params, function(err, data) {
   var response;

    if (err) {
      console.log("an error occured...")
      console.log(err, err.stack); 
      response = {
        body: JSON.stringify({ Error: err.stack})
      }
      callback(null, response);
    } else {
      console.log('successful creation...' + data)
      response = {
        statusCode: 200,
        headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({ Username: data.User['Username']})
      }; 
      callback(null, response);
    }     
  });

};