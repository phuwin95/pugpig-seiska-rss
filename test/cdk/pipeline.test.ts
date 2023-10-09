import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Cdk from "../../lib/PipelineStack";

describe("Pipeline Stack", () => {
  const app = new cdk.App();
  const stack = new Cdk.PipelineStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  it("should have a pipeline with 4 stages", () => {
    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Stages: [
        {
          Name: "Source",
          Actions: [
            {
              ActionTypeId: {
                Category: "Source",
                Owner: "ThirdParty",
                Provider: "GitHub",
                Version: "1",
              },
              Configuration: {
                Owner: "allermedia",
                Repo: "fi-seiska-services",
                Branch: "main",
                PollForSourceChanges: false,
              },
            },
          ],
        },
        { Name: "Build" },
        { Name: "UpdatePipeline" },
        { Name: "Assets" },
        { Name: "AppStage" },
      ],
    });
  });
});
