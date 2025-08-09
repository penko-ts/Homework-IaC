import * as cdk from "aws-cdk-lib";
import * as EmptyCdkProject from "../lib/homework-ia_c-stack";

test('SQS Queue Created', () => {
    const app = new cdk.App();

    const stack = new EmptyCdkProject.EmptyCdkProjectStack(app, 'TestStack');
    
    expect(stack).toMatchSnapshot();
    
    
});
