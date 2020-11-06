var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  signatureVersion: 'v4',
});


exports.handler = (event, context, callback) => {
    
  console.log('event:'+ JSON.stringify(event));
  const bucketName = process.env.S3_BUCKET_NAME;  
  const fileName = event.queryStringParameters.fileName;
  var key = 'videos' + '/' + fileName;
  const signedUrlExpireSeconds = 60 * 5;
    
  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });

  console.log('presigned url: ', url);  
  
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({ filename: fileName,  presigned_url: url}),
  };

  callback(null, response);
};