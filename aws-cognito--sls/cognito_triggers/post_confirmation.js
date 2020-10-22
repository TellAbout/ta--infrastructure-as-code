// Lambda which gets triggered on insert, and in turns performs a mutation
var aws = require('aws-sdk');
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });

exports.handler = async (event, context, callback) => {
  console.log('The event >> ' + JSON.stringify(event));

  //pg connection
  const { Client } = require('pg');
  let connectionString = process.env.POSTGRES_CONNECTION_URL;  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
  });

  const cognito_params = {
    UserPoolId: event.userPoolId,
    Username: event.userName
  };

  client.connect()
  .then(result => console.log('connection successful..'))
  .catch(e => {
    console.error('connection failed..' + e.stack);
    callback(null, event);
  });


  if (!event.request.clientMetadata.hasura_id || event.request.clientMetadata.hasura_id.length === 0) {
    //insert user record
    console.log("inserting registered user...");
    client
    .query('insert into public.user (auth_system_id,role) values($1,$2)', [event.userName,event.request.clientMetadata.user_role])
    .then(result => console.log('query executed successfully...' + JSON.stringify(result)))
    .catch(e => {
      console.error('something went wrong..' + e.stack);
      cognitoidentityserviceprovider.adminDeleteUser(cognito_params, function (err, data) {
        console.log('Deleting user..');
        if (err) console.log('Error while deleting user', err.stack);
        else {
          console.log('Cognito User Deleted');  
        }      
      });
    })
    .then(() => client.end());
    callback(null, event);

  } else {
    console.log("updating anonymous user...");
    //update user record
    client
    .query('update public.user set auth_system_id = $1, role = $2 where id = $3', 
    [event.userName,event.request.clientMetadata.user_role,event.request.clientMetadata.hasura_id])
    .then(result => console.log('query executed successfully...' + JSON.stringify(result)))
    .catch(e => {
      console.error('something went wrong..' + e.stack);
      cognitoidentityserviceprovider.adminDeleteUser(cognito_params, function (err, data) {
        console.log('Deleting user..');
        if (err) console.log('Error while deleting user', err.stack);
        else {
          console.log('Cognito User Deleted');  
        }      
      });
    })
    .then(() => client.end());
    callback(null, event);
  }
};