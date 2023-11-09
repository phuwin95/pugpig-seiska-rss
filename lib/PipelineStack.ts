import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import AppStage from './AppStage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'PugpigRssPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('allermedia/fi-seiska-services', 'sandbox/main', {
          authentication: cdk.SecretValue.secretsManager('github-access-token'),
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
      dockerEnabledForSynth: true,
    });
    
    const stage = new AppStage(this, 'AppStage');

    pipeline.addStage(stage);
  }
}
