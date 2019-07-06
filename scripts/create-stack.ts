import S3 from 'aws-sdk/clients/s3';
import CloudFormation from 'aws-sdk/clients/cloudformation';
import AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { AWS_REGION, BUCKET_NAME } from '../config';

const envName = 'dev';
const stackName = 'lambda-code-splitting';

export const s3 = new S3({
  region: AWS_REGION,
});

const cf = new CloudFormation({
  region: AWS_REGION,
});

async function getHash(buffer: Buffer) {
  return crypto
    .createHash('md5')
    .update(buffer)
    .digest('hex')
    .substr(0, 20);
}

async function uploadAPI(latestOnly: boolean) {
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
  const version = await getHash(zip.toBuffer());
  await s3
    .upload({
      Bucket: BUCKET_NAME,
      Key: latestOnly ? `APIFunction/latest.zip` : `APIFunction/${version}.zip`,
      Body: zip.toBuffer(),
    })
    .promise();
  return latestOnly ? 'latest' : version;
}

async function waitForComplete() {
  return new Promise<CloudFormation.Stack>((resolve, reject) => {
    const check = async () => {
      const result = await cf
        .describeStacks({
          StackName: stackName,
        })
        .promise();
      const status = result.Stacks[0].StackStatus;
      if (status === 'CREATE_IN_PROGRESS') {
        setTimeout(check, 1000);
      } else if (status === 'CREATE_COMPLETE') {
        resolve(result.Stacks[0]);
      } else {
        reject(new Error('Create stack failed with status: ' + status));
      }
    };
    check();
  });
}

async function deploy() {
  await uploadAPI(true);

  await cf
    .createStack(
      {
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
          { ParameterKey: 'APIFunctionVersion', ParameterValue: 'latest' },
        ],
      },
      undefined
    )
    .promise();
  console.log('waiting for complete...');
  const stack = await waitForComplete();
  console.log('waiting for complete...DONE');
  console.log(stack.Outputs);
}

deploy();
