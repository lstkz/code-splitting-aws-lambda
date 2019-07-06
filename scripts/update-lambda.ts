import path from 'path';
import AdmZip from 'adm-zip';
import fs from 'fs';
import Lambda from 'aws-sdk/clients/lambda';
import { AWS_REGION, BUCKET_NAME } from '../config';

const lambda = new Lambda({
  region: AWS_REGION,
});

const envName = 'dev';
const stackName = 'lambda-code-splitting';

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

lambda
  .updateFunctionCode({
    FunctionName: stackName + '-' + envName,
    ZipFile: zip.toBuffer(),
  })
  .promise();
