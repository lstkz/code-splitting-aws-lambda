import Lambda from 'aws-sdk/clients/lambda';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { AWS_REGION } from '../config';
function getLambdaZipFile() {
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

const lambda = new Lambda({
  region: AWS_REGION,
});

lambda
  .updateFunctionCode({
    FunctionName: '',
    ZipFile: getLambdaZipFile(),
  })
  .promise();
