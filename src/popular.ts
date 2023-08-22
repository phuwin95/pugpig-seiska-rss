import { APIGatewayProxyResultV2 } from 'aws-lambda';

export async function main(): Promise<APIGatewayProxyResultV2> {

  return {
    body: JSON.stringify({message: 'Successful lambda invocation popular'}),
    statusCode: 200,
  };
}