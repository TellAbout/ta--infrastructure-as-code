// Lambda which gets triggered on insert, and in turns performs a mutation
var aws = require('aws-sdk');
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });

const fetch = require('node-fetch');
const hgeEndpoint = process.env.HASURA_ENDPOINT_URL;

exports.handler = (event, context, callback) => {
  console.log('The event >> ' + JSON.stringify(event));

  const response_error = {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Hasura Error'
    }),
  };

  if (!event.request.clientMetadata.hasura_id || event.request.clientMetadata.hasura_id.length === 0) {

    const insert_query = `
      mutation createUser ($username: String!,$userrole: String!) {
        insert_user (objects: [
          {
            role: $userrole,  
            username: $username
          }
        ]) {
          affected_rows
        }
      }
      `;
    const insert_params = { username: event.userName, userrole: event.request.clientMetadata.user_role };
    console.log('hasura endpoint - ' + hgeEndpoint);

    fetch(hgeEndpoint + '/v1/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: insert_query, variables: insert_params }),
      headers: { 'Content-Type': 'application/json', 'X-Hasura-Role': 'user_creator' },
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
        callback(null, event);
      })
      .catch((err) => {
        // handle error for example
        console.log(err);
        var cognito_params = {
          UserPoolId: event.userPoolId,
          Username: event.userName
        };

        cognitoidentityserviceprovider.adminDeleteUser(cognito_params, function (err, data) {
          console.log('Deleting user..');
          if (err) console.log(err, err.stack);
          else console.log(data);
        });

        callback(null, response_error);
      });
  } else {
    console.log("updating anonymous user...");

    const update_query = `
      mutation updateUser($userName: String!,$hasuraId: uuid!,$userRole: user_role_enum!){
        update_user(
          where: {id: {_eq: $hasuraId}},
          _set: {
            role: $userRole, 
            username:$userName
          }
        ) {
          affected_rows
        }
      }`;

    const update_params = { userName: event.userName, hasuraId: event.request.clientMetadata.hasura_id, userRole: event.request.clientMetadata.user_role };

    fetch(hgeEndpoint + '/v1/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: update_query, variables: update_params }),
      headers: { 'Content-Type': 'application/json', 'X-Hasura-Role': 'user_creator' },
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
        callback(null, event);
      })
      .catch((err) => {
        // handle error for example
        console.log(err);
        callback(null, response_error);
      });
  }
};

