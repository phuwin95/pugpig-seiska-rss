import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import RSS from 'rss';
import { v5 as uuidv5 } from 'uuid';
import { Article } from './types/article';
import { formatDate, getContent, getMainImage } from './libs';



export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {

  const url = "https://api.seiska.fi/api/v1/article?query=*%3A*+AND+visibility_status%3AP+AND+-cross_brand%3A1&orderBy=published&content=full&limit=100"
  const response = await fetch(url);
  const data = await response.json();
  const feed = new RSS({
    title: 'Seiska',
    description: 'Seiska RSS all',
    ttl: 60, // in minutes,
    feed_url: 'https://www.seiska.fi/rss',
    site_url: 'https://www.seiska.fi',
    custom_namespaces: {
      'content': 'http://purl.org/rss/1.0/modules/content/',
      'rss': 'http://purl.org/rss/1.0/',
    }
  });

  type Flag = {
    [key: string]: boolean
  };

  const guids : Flag= {};
  const titles:  Flag= {};
  const descriptions: Flag = {};
  data.result.forEach((item: any) => {

    const article : Article = item?.article;
    const guid = uuidv5(article?.attribute.id, uuidv5.URL);
    const title = article?.field?.title;
    const description = article?.field?.subtitle;

    // skip if guid, title or description already exists
    if (guids[guid] || titles[title] || descriptions[description]) return;
    guids[guid] = true;
    titles[title] = true;
    descriptions[description] = true;


    const content = getContent(article);
    const pubDate = formatDate(+article?.field?.published * 1000);
    const category = article?.primarytag?.section;
    const image = getMainImage(article);
    const feedItem = {
      guid, title, description, url: '', date: '',
      custom_elements: [
        {'rss:guid': guid},
        {'rss:title': title},
        {'rss:description': description},
        {'content:encoded': content},
        {'rss:pubDate': pubDate},
        {'rss:category': category},
        {'main_image': image},
      ],
    }
    feed.item(feedItem);
  })


  return {
    body: feed.xml({indent: true}),
    headers: {
      'Content-Type': 'application/rss+xml',
    },
    statusCode: 200,
  };
}