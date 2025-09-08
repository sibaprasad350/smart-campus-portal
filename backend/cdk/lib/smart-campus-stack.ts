import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SmartCampusStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for RDS
    const vpc = new ec2.Vpc(this, 'SmartCampusVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // S3 Bucket for images
    const imagesBucket = new s3.Bucket(this, 'SmartCampusImages', {
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      objectLockEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // DynamoDB Tables
    const timetableTable = new dynamodb.Table(this, 'TimetableTable', {
      tableName: 'smart-campus-timetable',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cafeteriaTable = new dynamodb.Table(this, 'CafeteriaTable', {
      tableName: 'smart-campus-cafeteria',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const feedbackTable = new dynamodb.Table(this, 'FeedbackTableV2', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const eventsTable = new dynamodb.Table(this, 'EventsTable', {
      tableName: 'smart-campus-events',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lostFoundTable = new dynamodb.Table(this, 'LostFoundTable', {
      tableName: 'smart-campus-lostfound',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const queriesTable = new dynamodb.Table(this, 'QueriesTable', {
      tableName: 'smart-campus-queries',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // RDS MySQL for user data
    const database = new rds.DatabaseInstance(this, 'SmartCampusDB', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      databaseName: 'smartcampus',
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'SmartCampusUserPool', {
      userPoolName: 'smart-campus-users',
      selfSignUpEnabled: false,
      signInAliases: { username: true, email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
      customAttributes: {
        user_type: new cognito.StringAttribute({ minLen: 1, maxLen: 20, mutable: true }),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'SmartCampusUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
    });

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:*'],
              resources: [
                timetableTable.tableArn,
                cafeteriaTable.tableArn,
                feedbackTable.tableArn,
                ordersTable.tableArn,
                eventsTable.tableArn,
                lostFoundTable.tableArn,
                queriesTable.tableArn,
              ],
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
              resources: [`${imagesBucket.bucketArn}/*`],
            }),
          ],
        }),
        RDSAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['rds-db:connect'],
              resources: [database.instanceArn],
            }),
          ],
        }),
        CognitoAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'cognito-idp:AdminCreateUser',
                'cognito-idp:AdminSetUserPassword',
                'cognito-idp:AdminUpdateUserAttributes',
                'cognito-idp:AdminDeleteUser',
                'cognito-idp:AdminGetUser',
                'cognito-idp:AdminInitiateAuth',
                'cognito-idp:ListUsers'
              ],
              resources: [userPool.userPoolArn],
            }),
          ],
        }),
      },
    });

    // Lambda Functions
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/auth'),
      role: lambdaRole,
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: userPoolClient.userPoolClientId,
        DB_HOST: database.instanceEndpoint.hostname,
        DB_NAME: 'smartcampus',
      },
      vpc,
      timeout: cdk.Duration.seconds(30),
    });

    const timetableFunction = new lambda.Function(this, 'TimetableFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/timetable'),
      role: lambdaRole,
      environment: {
        TIMETABLE_TABLE: timetableTable.tableName,
      },
    });

    const cafeteriaFunction = new lambda.Function(this, 'CafeteriaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/cafeteria'),
      role: lambdaRole,
      environment: {
        CAFETERIA_TABLE: cafeteriaTable.tableName,
        FEEDBACK_TABLE: feedbackTable.tableName,
        ORDERS_TABLE: ordersTable.tableName,
        IMAGES_BUCKET: imagesBucket.bucketName,
      },
    });

    const eventsFunction = new lambda.Function(this, 'EventsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/events'),
      role: lambdaRole,
      environment: {
        EVENTS_TABLE: eventsTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    const lostFoundFunction = new lambda.Function(this, 'LostFoundFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/lostfound'),
      role: lambdaRole,
      environment: {
        LOSTFOUND_TABLE: lostFoundTable.tableName,
        IMAGES_BUCKET: imagesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    const academicQueryFunction = new lambda.Function(this, 'AcademicQueryFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/academic-query'),
      role: lambdaRole,
      environment: {
        QUERIES_TABLE: queriesTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    const userManagementFunction = new lambda.Function(this, 'UserManagementFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/user-management'),
      role: lambdaRole,
      environment: {
        DB_HOST: database.instanceEndpoint.hostname,
        DB_NAME: 'smartcampus',
        USER_POOL_ID: userPool.userPoolId,
      },
      vpc,
      timeout: cdk.Duration.seconds(30),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'SmartCampusAPI', {
      restApiName: 'Smart Campus API',
      description: 'API for Smart Campus Portal',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    // API Routes
    const authResource = api.root.addResource('auth');
    authResource.addMethod('POST', new apigateway.LambdaIntegration(authFunction));
    authResource.addMethod('GET', new apigateway.LambdaIntegration(authFunction));

    const timetableResource = api.root.addResource('timetable');
    timetableResource.addMethod('GET', new apigateway.LambdaIntegration(timetableFunction));
    timetableResource.addMethod('POST', new apigateway.LambdaIntegration(timetableFunction));
    timetableResource.addMethod('PUT', new apigateway.LambdaIntegration(timetableFunction));
    timetableResource.addMethod('DELETE', new apigateway.LambdaIntegration(timetableFunction));

    const cafeteriaResource = api.root.addResource('cafeteria');
    cafeteriaResource.addMethod('GET', new apigateway.LambdaIntegration(cafeteriaFunction));
    cafeteriaResource.addMethod('POST', new apigateway.LambdaIntegration(cafeteriaFunction));
    cafeteriaResource.addMethod('PUT', new apigateway.LambdaIntegration(cafeteriaFunction));
    cafeteriaResource.addMethod('DELETE', new apigateway.LambdaIntegration(cafeteriaFunction));

    const feedbackResource = cafeteriaResource.addResource('feedback');
    feedbackResource.addMethod('POST', new apigateway.LambdaIntegration(cafeteriaFunction));
    feedbackResource.addMethod('GET', new apigateway.LambdaIntegration(cafeteriaFunction));

    const ordersResource = cafeteriaResource.addResource('orders');
    ordersResource.addMethod('POST', new apigateway.LambdaIntegration(cafeteriaFunction));
    ordersResource.addMethod('GET', new apigateway.LambdaIntegration(cafeteriaFunction));

    const eventsResource = api.root.addResource('events');
    eventsResource.addMethod('GET', new apigateway.LambdaIntegration(eventsFunction));
    eventsResource.addMethod('POST', new apigateway.LambdaIntegration(eventsFunction));
    eventsResource.addMethod('PUT', new apigateway.LambdaIntegration(eventsFunction));
    eventsResource.addMethod('DELETE', new apigateway.LambdaIntegration(eventsFunction));

    const lostFoundResource = api.root.addResource('lostfound');
    lostFoundResource.addMethod('GET', new apigateway.LambdaIntegration(lostFoundFunction));
    lostFoundResource.addMethod('POST', new apigateway.LambdaIntegration(lostFoundFunction));
    lostFoundResource.addMethod('PUT', new apigateway.LambdaIntegration(lostFoundFunction));
    lostFoundResource.addMethod('DELETE', new apigateway.LambdaIntegration(lostFoundFunction));

    const academicQueryResource = api.root.addResource('academic-query');
    academicQueryResource.addMethod('GET', new apigateway.LambdaIntegration(academicQueryFunction));
    academicQueryResource.addMethod('POST', new apigateway.LambdaIntegration(academicQueryFunction));
    academicQueryResource.addMethod('PUT', new apigateway.LambdaIntegration(academicQueryFunction));
    academicQueryResource.addMethod('DELETE', new apigateway.LambdaIntegration(academicQueryFunction));

    const userManagementResource = api.root.addResource('users');
    userManagementResource.addMethod('GET', new apigateway.LambdaIntegration(userManagementFunction));
    userManagementResource.addMethod('POST', new apigateway.LambdaIntegration(userManagementFunction));
    userManagementResource.addMethod('PUT', new apigateway.LambdaIntegration(userManagementFunction));
    userManagementResource.addMethod('DELETE', new apigateway.LambdaIntegration(userManagementFunction));

    // Outputs
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: imagesBucket.bucketName,
      description: 'S3 Bucket for Images',
    });
  }
}