// Lambda which gets triggered on insert, and in turns performs a mutation

const fetch = require('node-fetch');

//const adminSecret = process.env.ADMIN_SECRET;
//const hgeEndpoint = process.env.HGE_ENDPOINT;
const hgeEndpoint = 'https://special-rabbit-51.hasura.app';


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

    const response = {
        statusCode: 200,
        body: "success"
    };
    const qv = {username: event.userName};

    fetch(hgeEndpoint + '/v1/graphql', {
        method: 'POST',
        body: JSON.stringify({query: query, variables: qv}),
        headers: {'Content-Type': 'application/json', 'X-Hasura-Role': 'user_creator'},
    })
        .then(res => res.json())
        .then(json => {
            console.log(json);
            callback(null, response);
        });
};