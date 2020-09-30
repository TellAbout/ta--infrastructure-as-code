exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('The event >> ' + JSON.stringify(event));

    const { Client } = require('pg');
    let connectionString = process.env.POSTGRES_CONNECTION_URL;
    const client = new Client({
      connectionString: connectionString,
      ssl: {
          rejectUnauthorized: false
      }
    });
    client.connect();
    
    var role = '';

    // change the cols in select and also the schema and the table. leave $1 as it is since it's paramterized to take the username from cognito
    client.query('select role,id from public.user where authSystemId = $1', [event.userName], (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
          console.log('res'+ JSON.stringify(res));
          
          const data = res.rows;
          data.forEach(row => {
            role = row['role'];
            hasura_id = row['id']
          });   

          event.response = {
            "claimsOverrideDetails": {
                "claimsToAddOrOverride": {
                    "hasura-id": hasura_id,
                    "https://hasura.io/jwt/claims": JSON.stringify({
                    "x-hasura-user-id": event.request.userAttributes.sub,
                    "x-hasura-default-role": role,
                    "x-hasura-allowed-roles": [role, "agent","enduser","admin"]  //add the other user roles
                })
                }
            }
          };

          callback(null, event);
      }
    });    
};