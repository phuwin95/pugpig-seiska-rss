import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import AppStack from "../../lib/AppStack";

describe("App Stack", () => {
  const app = new cdk.App();
  const stack = new AppStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  it('should contain 3 lambda functions and 3 api gateway resources', () => {
    expect(template.resourceCountIs('AWS::Lambda::Function', 3));
    expect(template.resourceCountIs('AWS::ApiGateway::Resource', 3));
  });
});