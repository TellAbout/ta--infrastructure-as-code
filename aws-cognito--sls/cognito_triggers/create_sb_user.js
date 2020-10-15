var aws = require('aws-sdk');
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
var s3 = new aws.S3();

const userpool_id = process.env.COGNITO_USERPOOL_ID;

exports.handler = (event, context, callback) => {
  var body = JSON.parse(event.body.replace(/\\/g, ""));
  s3.config.update({accessKeyId: body.ClientMetadata.Accesskey, secretAccessKey: body.ClientMetadata.Secretkey, region: 'us-west-2'});
  s3.listBuckets(function(err, data) {
    if (err) { 
      console.log('wrong creds..')
      console.log(err, err.stack);
    } 
    else {    
      console.log('The stringy event >> ' + event.body.replace(/\\/g, ""));
      if(body !== null && body !== ''){    
        console.log('printing the username from curl' + body.Username);
        console.log('printing the sandbox from curl' + body.ClientMetadata.SandboxPwd);
        var params = { 
          UserPoolId: userpool_id, /* required */
          Username: body.Username, /* required */
          MessageAction: "SUPPRESS",
          UserAttributes: [
            {
              Name: "email",
              Value: body.Username
            },
            {
              Name: "email_verified",
              Value: "true"
            }
            /* more items */
          ]
        };
      
        console.log('creating cognito user...');
      
        var response;
        cognitoidentityserviceprovider.adminCreateUser(params, function(err, data) {
      
          if (err) {
            console.log("an error occured...")
            console.log(err, err.stack); 
            response = {
              body: JSON.stringify({ Error: err.stack})
            };
            callback(null, response);
          } else {
            var user_credential_params = {
              Password: body.ClientMetadata.SandboxPwd,
              Permanent: true,
              Username: data.User['Username'],
              UserPoolId: userpool_id
            };
      
            console.log('setting password for user...');
            cognitoidentityserviceprovider.adminSetUserPassword(user_credential_params, function(err, data) {
                if (!err) {
                    console.log('password has been set...');
                    console.log(JSON.stringify(data));
                } else {
                    console.log('Failed to set credentials..');
                    console.log(err, err.stack);
                    console.log(JSON.stringify({ Error: err.stack}));
                }
            });
      
            console.log('successful creation...' + JSON.stringify(data))
      
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
      } else {
        console.log("body is either empty or null...");
        response = {
          body: JSON.stringify({ Error: "request body is either empty or null"})
        };
        callback(null, response);
      }
    }           
  });
  //callback(null, response);
};