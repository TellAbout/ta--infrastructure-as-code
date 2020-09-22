#!/bin/bash

echo "executing rds deployment"
(cd aws-aurora ; sls deploy -v --dbuser tellabout --dbpassword tellabout1234 --stage kula01)

echo "executing cognito deployment"
(cd aws-cognito--sls ; sls deploy -v --stage kula01)

echo "executing media upload deployment"
(cd aws-media-upload--sls ; sls deploy -v --stage kula01)
