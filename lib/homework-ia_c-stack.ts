import * as cdk from 'aws-cdk-lib';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { SnsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Protocol } from 'aws-cdk-lib/aws-ec2';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Lambda } from 'aws-cdk-lib/aws-ses-actions';
import { Subscription, Topic, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { Construct, Node } from 'constructs';
import path from 'path';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { table } from 'console';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod } from 'aws-cdk-lib/aws-events';

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

    const bucketDeployment = new BucketDeployment(this, 'indexDeployment', {
      sources: [Source.asset(path.join(__dirname, '../website-assets'))],
      destinationBucket: WebsiteBucket
    });

    const fileUploadTopic = new Topic(this, 'FileUploadTopic');

    new Subscription(this, 'FileUploadSubscription', {
      topic: fileUploadTopic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'penko.aprilci@gmail.com'
    });

    const storageBucket = new Bucket(this, 'storageBucket', {
      lifecycleRules: [
        {
          id: 'deleteAfterOneDay',
          expiration: Duration.days(1),
        }
        
      ]
    });

    // const notificationTopic = new Topic(this, 's3EventHandler');
    storageBucket.addEventNotification(EventType.OBJECT_CREATED, new SnsDestination(fileUploadTopic));

    // const newExampleOne = new BaseFunction(this, 'one', {});

    // const newExampleTwo = new BaseFunction(this, 'two', {});

    // Table

    const table = new Table(this, 'Audit', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
    });
    
    table.addGlobalSecondaryIndex({
      partitionKey: {
        name: 'randomNumber',
        type: AttributeType.NUMBER
      },
      indexName: 'randomNumber-index',
    });
    
    // Lambda functions

    const fillTableFunction = new NodejsFunction(this, 'FillTable', {
      runtime: Runtime.NODEJS_20_X,
      entry: __dirname + '/../src/fill-table.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
        TOPIC_ARN: fileUploadTopic.topicArn,
      }
    });

    table.grantWriteData(fillTableFunction);
    fileUploadTopic.grantPublish(fillTableFunction);

    const getOrderFunction = new NodejsFunction(this, 'GetOrder', {
      runtime: Runtime.NODEJS_20_X,
      entry: __dirname + '/../src/get-order.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    
    table.grantWriteData(getOrderFunction);

    // Rest API

    const orderAPI = new RestApi(this, 'Orders', {
      restApiName: 'Orders',
    });

    const orderResourse = orderAPI.root.addResource('order');

    orderResourse.addMethod(HttpMethod.GET, new LambdaIntegration(getOrderFunction, {
      proxy: true,
    }));

    orderResourse.addMethod(HttpMethod.POST, new LambdaIntegration(fillTableFunction, {
      proxy: true,

    }));


    new CfnOutput(this, 'url', {
      key: 'websiteUrl',
      value: WebsiteBucket.bucketWebsiteUrl + '/index.html',
    });
  }
}
