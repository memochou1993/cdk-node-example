import * as cdk from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class CdkNodeExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new cdk.aws_dynamodb.Table(this, 'ConnectionTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'connectionId',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
    });

    const connectHandler = this.connectHandlerBuilder(table);
    const disconnectHandler = this.disconnectHandlerBuilder(table);
    const sendMessageHandler = this.sendMessageHandlerBuilder(table);
    const defaultHandler = this.defaultHandlerBuilder();

    const webSocketApi = new WebSocketApi(this, 'CdkNodeExampleWebSocketApi', {
      routeSelectionExpression: '$request.body.action',
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectIntegration', connectHandler),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration('DefaultIntegration', defaultHandler),
      },
    });

    webSocketApi.addRoute('send-message', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessageHandler),
    });
    webSocketApi.grantManageConnections(sendMessageHandler);
    webSocketApi.grantManageConnections(defaultHandler);

    new WebSocketStage(this, 'CdkNodeExampleProductionStage', {
      webSocketApi,
      stageName: 'production',
      autoDeploy: true,
    });
  }

  connectHandlerBuilder(table: Table) {
    const handler = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'ConnectHandler', {
      environment: {
        TABLE_NAME: table.tableName,
      },
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      entry: 'lambda/connect-handler.ts',
    });

    table.grantWriteData(handler);

    return handler;
  }

  disconnectHandlerBuilder(table: Table) {
    const handler = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'DisconnectHandler', {
      environment: {
        TABLE_NAME: table.tableName,
      },
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      entry: 'lambda/disconnect-handler.ts',
    });

    table.grantWriteData(handler);

    return handler;
  }

  sendMessageHandlerBuilder(table: Table) {
    const handler = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'SendMessageHandler', {
      environment: {
        TABLE_NAME: table.tableName,
      },
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      entry: 'lambda/send-handler.ts',
    });

    table.grantReadWriteData(handler);

    return handler;
  }

  defaultHandlerBuilder() {
    return new cdk.aws_lambda_nodejs.NodejsFunction(this, 'DefaultHandler', {
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      entry: 'lambda/default-handler.ts',
    });
  }
}
