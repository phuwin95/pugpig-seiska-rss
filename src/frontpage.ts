import { APIGatewayProxyResultV2 } from 'aws-lambda';
import RSS from 'rss';
import { addItems } from './libs';

export async function main(): Promise<APIGatewayProxyResultV2> {
  const url = "https://labrador.seiska.fi/seiska-front-page?lab_viewport=json"
  const response = await fetch(url);
  const data = await response.json();
  const articleIds = data?.result?.map((article)=>article.url.split('/').pop());
  const query = articleIds.join(' OR ');
  const baseUrl = new URL('https://api.seiska.fi/api/v1/article');
  baseUrl.searchParams.append('query', `id:(${query}) AND visibility_status:P`);
  baseUrl.searchParams.append('content', 'full');
  const response2 = await fetch(baseUrl.href);
  const data2 = await response2.json();
  const sortedArticles =  articleIds.reduce((acc: any[], id: string) => {
    const article = data2.result.find((item) => +item.article?.attribute?.id === +id);
    if (article) {
      acc.push(article);
    }
    return acc;
  }, []);

  const feed = new RSS({
    title: 'Seiska',
    description: 'Seiska RSS frontpage',
    ttl: 15, // in minutes,
    feed_url: 'https://www.seiska.fi/rss',
    site_url: 'https://www.seiska.fi',
    custom_namespaces: {
      'content': 'http://purl.org/rss/1.0/modules/content/',
      'rss': 'http://purl.org/rss/1.0/',
    }
  });
  addItems(feed, sortedArticles);


  return {
    body: feed.xml({indent: true}),
    headers: {
      'Content-Type': 'application/rss+xml',
    },
    statusCode: 200,
  };
}