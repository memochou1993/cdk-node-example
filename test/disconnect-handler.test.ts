import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../lambda/disconnect-handler';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

test('disconnect handler', async () => {
  const event = {
    requestContext: {
      connectionId: 'test',
    },
  };
  const result = await handler(event as any, {} as any, {} as any) as any;
  expect(result.statusCode as Number).toEqual(200);
  expect(ddbMock.calls()).toHaveLength(1);
  expect(ddbMock.commandCalls(DeleteCommand)[0].args[0].input).toEqual({
    TableName: process.env.TABLE_NAME,
    Key: {
      connectionId: 'test',
    },
  });
});
