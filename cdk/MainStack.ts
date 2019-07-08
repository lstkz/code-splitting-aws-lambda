import apigateway = require('@aws-cdk/aws-apigateway');
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');

export class MainStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const apiLambda = new lambda.Function(this, `api-lambda`, {
      code: new lambda.AssetCode('dist'),
      handler: 'app-lambda.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        NODE_ENV: 'production',
      },
      timeout: cdk.Duration.seconds(7),
      memorySize: 1536,
    });

    const api = new apigateway.RestApi(this, 'api', {
      restApiName: `api`,
    });

    const resource = api.root.addResource('{proxy+}');

    const apiLambdaIntegration = new apigateway.LambdaIntegration(apiLambda);
    resource.addMethod('POST', apiLambdaIntegration);
  }
}

const app = new cdk.App();
new MainStack(app, 'code-splitting');
app.synth();
