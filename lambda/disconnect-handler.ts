import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const command = new DeleteCommand({
    TableName: process.env.TABLE_NAME as string,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  });
  await docClient.send(command);
  return {
    statusCode: 200,
  };
};
