import Lambda from 'aws-sdk/clients/lambda';
import { AWS_REGION } from '../config';
import { getLambdaZipFile, stackName, envName } from './_common';

const lambda = new Lambda({
  region: AWS_REGION,
});

lambda
  .updateFunctionCode({
    FunctionName: stackName + '-' + envName,
    ZipFile: getLambdaZipFile(),
  })
  .promise();
