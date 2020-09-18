exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('user >>> ' + event.userName);    

    const { Client } = require('pg');
    const connectionString = 'postgrest connection url';
    const client = new Client({
      connectionString: connectionString,
      ssl: {
          rejectUnauthorized: false
      }
    });
    client.connect();
    
    var role = '';

    // change the cols in select and also the schema and the table. leave $1 as it is since it's paramterized to take the username from cognito
    client.query('select role,id from public.user where username = $1', [event.userName], (err, res) => {
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
                    "userrole": role,
                    "hasura_id":hasura_id
                },
                "claimsToSuppress": ["email"]
            }
          };

          callback(null, event);
      }
    });    
};