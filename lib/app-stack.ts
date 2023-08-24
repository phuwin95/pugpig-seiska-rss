import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export default class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const all = new NodejsFunction(this, 'pugpig-rss-all', {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
      handler: 'main',
      entry: join(__dirname, `/../src/all.ts`),
    });

    const frontpage = new NodejsFunction(this, 'pugpig-rss-frontpage', {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
      handler: 'main',
      entry: join(__dirname, `/../src/frontpage.ts`),
    });

    const popular = new NodejsFunction(this, 'pugpig-rss-popular', {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
      handler: 'main',
      entry: join(__dirname, `/../src/popular.ts`),
    });

    // create an api gateway for the lambda
    const api = new apigateway.RestApi(this, "widgets-api", {
      restApiName: "Pugpig Seiska RSS API",
      description: "This service serves Pugpig app for seiska rss."
    });

    const getAllIntegration = new apigateway.LambdaIntegration(all, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const getFrontpageIntegration = new apigateway.LambdaIntegration(frontpage, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });


    const getPopularIntegration = new apigateway.LambdaIntegration(popular, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });



    api.root.addResource("all").addMethod("GET", getAllIntegration); // GET /all
    api.root.addResource("frontpage").addMethod("GET", getFrontpageIntegration); // GET /frontpage
    api.root.addResource("popular").addMethod("GET", getPopularIntegration); // GET /popular


    // output the endpoint url
    new CfnOutput(this, "Pugpig Rss", {
      value: api.url ?? "Something went wrong with the deploy"
    });

  }
}