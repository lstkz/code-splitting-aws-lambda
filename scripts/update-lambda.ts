import Lambda from 'aws-sdk/clients/lambda';
import { AWS_REGION } from '../config';
import { getLambdaZipFile, stackName } from './_common';

const lambda = new Lambda({
  region: AWS_REGION,
});

lambda
  .updateFunctionCode({
    FunctionName: stackName,
    ZipFile: getLambdaZipFile(),
  })
  .promise();
