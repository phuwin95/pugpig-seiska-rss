import { APIGatewayProxyResultV2 } from 'aws-lambda';
import RSS from 'rss';

import {  createFeedItemsFromArticles } from './libs';

export async function main(): Promise<APIGatewayProxyResultV2> {
  const url =
    'https://api.seiska.fi/api/v1/article?query=*%3A*+AND+visibility_status%3AP+AND+-cross_brand%3A1&orderBy=published&content=full&limit=100';
  const response = await fetch(url);
  const data = await response.json();

  const feedItems = createFeedItemsFromArticles(data.result);

  const feed = new RSS(
    {
      title: "Seiska",
      description: "Seiska RSS all",
      ttl: 60, // in minutes,
      feed_url: "https://www.seiska.fi/rss",
      site_url: "https://www.seiska.fi",
      custom_namespaces: {
        content: "http://purl.org/rss/1.0/modules/content/",
      },
    },
    feedItems
  );

  return {
    body: feed.xml({indent: true}),
    headers: {
      'Content-Type': 'application/rss+xml',
    },
    statusCode: 200,
  };
}