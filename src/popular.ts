import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { SecretsManager } from 'aws-sdk';
export async function main(): Promise<APIGatewayProxyResultV2> {

  const url = new URL('https://eu4.dataapi.kilkaya.com/api/query');
  url.searchParams.append('datefrom', '2023-08-22T00:00:00');
  url.searchParams.append('dateto', '2023-08-22T23:59:59');
  url.searchParams.append('schemaname', 'pageview');
  url.searchParams.append('columns', 'domain,articleView,url');
  url.searchParams.append('filters', 'domain:seiska.fi');
  url.searchParams.append('sortby', 'articleView');
  url.searchParams.append('sortorder', 'desc');
  url.searchParams.append('limit', '20');

  const secretManager = new SecretsManager();
  const secret = await secretManager.getSecretValue({SecretId: 'kilkayta-access-token'}).promise();
  console.log(secret.SecretString);
  return {
    body: JSON.stringify({message: 'Successful lambda invocation popular'}),
    statusCode: 200,
  };
}