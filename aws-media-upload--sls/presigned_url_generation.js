var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  signatureVersion: 'v4',
});


exports.handler = (event, context, callback) => {
    
  console.log('event:'+ JSON.stringify(event));
  const bucketName = process.env.S3_BUCKET_NAME;  
  var key = 'videos' + '/' + 'SampleVideo_1280x720_1mb.mp4';
  const signedUrlExpireSeconds = 60 * 5;
    
  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });

  console.log('presigned url: ', url);    
  callback(null, url);
};