import S3 from 'aws-sdk/clients/s3';
import CloudFormation from 'aws-sdk/clients/cloudformation';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { AWS_REGION, BUCKET_NAME } from '../config';

export const envName = 'dev';
export const stackName = 'lambda-code-splitting';

export const s3 = new S3({
  region: AWS_REGION,
});

export const cf = new CloudFormation({
  region: AWS_REGION,
});

export async function getHash(buffer: Buffer) {
  return crypto
    .createHash('md5')
    .update(buffer)
    .digest('hex')
    .substr(0, 20);
}

export function getLambdaZipFile() {
  const baseDir = path.join(__dirname, '../dist');
  const zip = new AdmZip();
  zip.addFile(
    'app-lambda.js',
    fs.readFileSync(path.join(baseDir, 'app-lambda.js'))
  );

  const files = fs.readdirSync(baseDir);

  files.forEach(file => {
    zip.addFile(file, fs.readFileSync(path.join(baseDir, file)));
  });
  return zip.toBuffer();
}

export async function uploadAPI(latestOnly: boolean) {
  const zip = getLambdaZipFile();
  const version = await getHash(zip);
  await s3
    .upload({
      Bucket: BUCKET_NAME,
      Key: latestOnly ? `APIFunction/latest.zip` : `APIFunction/${version}.zip`,
      Body: zip,
    })
    .promise();
  return latestOnly ? 'latest' : version;
}

export async function waitForComplete(type: 'create' | 'update') {
  const statusProgress =
    type === 'create'
      ? ['CREATE_IN_PROGRESS']
      : ['UPDATE_IN_PROGRESS', 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS'];
  const statusDone = type === 'create' ? 'CREATE_COMPLETE' : 'UPDATE_COMPLETE';
  return new Promise<CloudFormation.Stack>((resolve, reject) => {
    const check = async () => {
      const result = await cf
        .describeStacks({
          StackName: stackName,
        })
        .promise();
      const status = result.Stacks[0].StackStatus;
      if (statusProgress.includes(status)) {
        setTimeout(check, 1000);
      } else if (status === statusDone) {
        resolve(result.Stacks[0]);
      } else {
        reject(new Error('Create stack failed with status: ' + status));
      }
    };
    check();
  });
}

export async function initStack(type: 'create' | 'update') {
  const version = await uploadAPI(false);
  const options = {
    StackName: stackName,
    TemplateBody: fs.readFileSync(
      path.join(__dirname, '../cloudformation.yaml'),
      'utf8'
    ),
    Capabilities: ['CAPABILITY_IAM'],
    Parameters: [
      { ParameterKey: 'NamePrefix', ParameterValue: stackName },
      { ParameterKey: 'EnvName', ParameterValue: envName },
      { ParameterKey: 'S3BucketName', ParameterValue: BUCKET_NAME },
      { ParameterKey: 'APIFunctionVersion', ParameterValue: version },
    ],
  };
  if (type === 'create') {
    await cf.createStack(options, undefined).promise();
  } else {
    await cf.updateStack(options, undefined).promise();
  }
  console.log('waiting for complete...');
  const stack = await waitForComplete('update');
  console.log('waiting for complete...DONE');
  console.log(stack.Outputs);
}
