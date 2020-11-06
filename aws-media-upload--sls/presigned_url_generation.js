var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  signatureVersion: 'v4',
});


exports.handler = (event, context, callback) => {
    
  console.log('event:'+ JSON.stringify(event));
  const bucketName = process.env.S3_BUCKET_NAME;  
  const fileName = event.queryStringParameters.fileName;
  var key = 'videos' + '/' + fileName;
  const signedUrlExpireSeconds = 604800;
    
  const put_url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });

  const get_url = s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });

  console.log('presigned put url: ', put_url);  
  console.log('presigned get url: ', get_url);  

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({ filename: fileName,  presigned_put_url: put_url,presigned_get_url: get_url}),
  };

  callback(null, response);
};