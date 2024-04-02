import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../lambda/connect-handler';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

test('connect handler', async () => {
  const event = {
    requestContext: {
      connectionId: 'test',
    },
  };
  const result = await handler(event as any, {} as any, {} as any) as any;
  expect(result.statusCode as Number).toEqual(200);
  expect(ddbMock.calls()).toHaveLength(1);
  expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toEqual({
    TableName: process.env.TABLE_NAME,
    Item: {
      connectionId: 'test',
    },
  });
});
