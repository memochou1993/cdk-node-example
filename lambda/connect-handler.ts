import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const command = new PutCommand({
    TableName: process.env.TABLE_NAME as string,
    Item: {
      connectionId: event.requestContext.connectionId,
    },
  });
  await docClient.send(command);
  return {
    statusCode: 200,
  };
};
