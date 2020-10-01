#!/bin/bash

inputConfigFile="sls.conf"

while IFS= read -r line
do

    if [[ $line == "Stage="* ]]; 
    then
        Stage=$(echo $line| cut -d'=' -f 2)
    fi

    if [[ $line == "AccessKey="* ]]; 
    then
        AccessKey=$(echo $line| cut -d'=' -f 2)
    fi

    if [[ $line == "SecretKey="* ]]; 
    then
        SecretKey=$(echo $line| cut -d'=' -f 2)
    fi  
    
    if [[ $line == "HasuraUrl="* ]]; 
    then
        HasuraUrl=$(echo $line| cut -d'=' -f 2)       
    fi

    if [[ $line == "DbUsername="* ]]; 
    then
        DbUsername=$(echo $line| cut -d'=' -f 2)
    fi

    if [[ $line == "DbPassword="* ]]; 
    then
        DbPassword=$(echo $line| cut -d'=' -f 2)
    fi
    
    if [[ $line == "VpcId="* ]]; 
    then
        VpcId=$(echo $line| cut -d'=' -f 2)
    fi

done < "$inputConfigFile"

if test -z "$Stage" 
then
    echo 'Stage not found in '$inputConfigFile' file!'
    exit
fi

if test -z "$AccessKey" 
then
    echo 'AccessKey not found in '$inputConfigFile' file!'
    exit
fi

if test -z "$SecretKey" 
then
    echo 'SecretKey not found in '$inputConfigFile' file!'
    exit
fi

if test -z "$DbUsername" 
then
    echo 'DbUsername not found in '$inputConfigFile' file!'
    exit
fi

if test -z "$DbPassword" 
then
    echo 'DbPassword not found in '$inputConfigFile' file!'
    exit
fi

if test -z "$VpcId" 
then
    echo 'VpcId not found in '$inputConfigFile' file!'
    exit
fi

export AWS_ACCESS_KEY_ID=$AccessKey
export AWS_SECRET_ACCESS_KEY=$SecretKey

echo "executing rds deployment...."
(cd aws-aurora--sls ; npm install ; npx serverless deploy -v --dbuser $DbUsername --dbpassword $DbPassword --stage $Stage --vpcId $VpcId)


echo "executing cognito deployment...."
if [ -z "$HasuraUrl" ]
then
    (cd aws-cognito--sls ; npm install ; npx serverless deploy -v --stage $Stage)
else
    (cd aws-cognito--sls ; npm install ; npx serverless deploy -v --stage $Stage --hasura_url $HasuraUrl)
fi

echo "executing media upload deployment...."
(cd aws-media-upload--sls ; npm install ; npx serverless deploy -v --stage $Stage)
