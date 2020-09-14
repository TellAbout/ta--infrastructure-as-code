// Lambda which gets triggered on insert, and in turns performs a mutation
var aws = require('aws-sdk');
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({apiVersion: '2016-04-18', region: 'us-west-2'});

const fetch = require('node-fetch');
const hgeEndpoint = process.env.HASURA_ENDPOINT_URL;
const query = `
mutation createUser ($username: String!) {
  insert_user (objects: [
    {
      role: user_creator,
      username: $username
    }
  ]) {
    affected_rows
  }
}
`;

exports.handler = (event, context, callback) => {
    console.log('The event >> ' + JSON.stringify(event));

    const response_error = {
      statusCode: 400,
      body: JSON.stringify({
          message: 'Hasura Error'
      }),
    };

    const qv = {username: event.userName};
    console.log('hasura endpoint - ' + hgeEndpoint);

    fetch(hgeEndpoint + '/v1/graphql', {
        method: 'POST',
        body: JSON.stringify({query: query, variables: qv}),
        headers: {'Content-Type': 'application/json', 'X-Hasura-Role': 'user_creator'},
    })
        .then(res => res.json())
        .then(json => {
            console.log(json);
            callback(null, event);
        })
        .catch((err) => {
          // handle error for example
          console.log(err);
          var params = {
            UserPoolId: event.userPoolId, 
            Username: event.userName
          };

          cognitoidentityserviceprovider.adminDeleteUser(params, function(err, data) {
            console.log('Deleting user..');
            if (err) console.log(err, err.stack); 
            else     console.log(data);
          });

          callback(null,response_error);
        });
};

