import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { Protocol } from 'aws-cdk-lib/aws-ec2';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Lambda } from 'aws-cdk-lib/aws-ses-actions';
import { Subscription, Topic, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { Construct, Node } from 'constructs';
import path from 'path';

export class EmptyCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const WebsiteBucket = new Bucket(this, 'staticWebsiteBucket', {
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      }
    });

    const topic = new Topic(this, 'errorTopic',);

    const subscription = new Subscription(this, 'errorSubscription', {
      topic: topic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'penko.aprilci@gmail.com'
    });

    const bucketDeployment = new BucketDeployment(this, 'indexDeployment', {
      sources: [Source.asset(path.join(__dirname, '../website-assets'))],
      destinationBucket: WebsiteBucket
    });
    
    const exampleFunction = new Function(this, 'exampleFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, '../src/\exampleFunction')),
      
    });


    new CfnOutput(this, 'url', {
      key: 'websiteUrl',
      value: WebsiteBucket.bucketWebsiteUrl + '/index.html',
    });
  }
}
