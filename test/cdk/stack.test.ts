import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../../lib/PipelineStack';
// create random test 
describe('Stack', () => {
  const app = new cdk.App();
  const stack = new Cdk.PipelineStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
});