exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('user >>> ' + event.userName);    

    const { Client } = require('pg');
    const connectionString = 'postgres://whqufwtvhloldo:9598ca16420fc9ed8b9378237aa68b88791e504d05b13b3202271617f88ca607@ec2-184-72-162-198.compute-1.amazonaws.com:5432/deosevlit2or0e';
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