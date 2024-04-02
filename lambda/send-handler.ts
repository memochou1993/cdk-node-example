import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const command = new ScanCommand({
    TableName: process.env.TABLE_NAME as string,
  });
  const response = await docClient.send(command);
  const connections = response.Items ?? [];

  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  const message = JSON.parse(event.body ?? '{}').message;

  await Promise.all(
    connections
      .filter(({ connectionId }) => connectionId !== event.requestContext.connectionId)
      .map(({ connectionId }) => (
        callbackAPI
          .postToConnection({
            ConnectionId: connectionId,
            Data: message,
          })
          .promise()
      ))
  );
  return {
    statusCode: 200,
  };
};
