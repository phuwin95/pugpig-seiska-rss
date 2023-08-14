import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export default class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const myFunction = new NodejsFunction(this, 'my-function', {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
      handler: 'main',
      entry: join(__dirname, `/../src/index.ts`),
    });

    // create an api gateway for the lambda
    const api = new apigateway.RestApi(this, "widgets-api", {
      restApiName: "Pugpig Seiska RSS API",
      description: "This service serves Pugpig app for seiska rss."
    });

    const getWidgetsIntegration = new apigateway.LambdaIntegration(myFunction, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", getWidgetsIntegration); // GET /

    // output the endpoint url
    new CfnOutput(this, "Pugpig Rss", {
      value: api.url ?? "Something went wrong with the deploy"
    });
  }
}