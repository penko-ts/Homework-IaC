import * as cdk from 'aws-cdk-lib';
import { EmptyCdkProjectStack } from '../lib/homework-ia_c-stack';

const app = new cdk.App();
new EmptyCdkProjectStack(app, 'EmptyCdkProjectStack', {
    env: {
        region: 'eu-central-1'
   }
  
});