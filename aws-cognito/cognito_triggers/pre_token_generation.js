exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('user >>> ' + event.userName);    

    const { Client } = require('pg');
    const connectionString = 'connection string';
    const client = new Client({
      connectionString: connectionString,
      ssl: {
          rejectUnauthorized: false
      }
    });
    client.connect();
    
    var role = '';

    client.query('select role from authors.writes where name = $1', ['kula'], (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
          console.log('res'+ JSON.stringify(res));
          console.log('End time..' + new Date().toLocaleString());
          const data = res.rows;
          data.forEach(row => {
            role = row['role'];
            console.log(role);
          });                           

          event.response = {
            "claimsOverrideDetails": {
                "claimsToAddOrOverride": {
                    "attribute_key2": "attribute_value2",
                    "userrole": role
                },
                "claimsToSuppress": ["email"]
            }
          };

          callback(null, event);
      }
    });    
};