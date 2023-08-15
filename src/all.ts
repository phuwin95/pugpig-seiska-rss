import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import RSS from 'rss';
import { v5 as uuidv5 } from 'uuid';
import { Article } from './types/article';


const formatDate = (date: string | number) => {
  // Tue, 03 May 2022 20:45:46 +0000
  const dateObj = new Date(date);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = dateObj.getFullYear();
  const month = months[dateObj.getMonth()];
  const weekday = weekdays[dateObj.getDay()];
  const day = dateObj.getDate();
  const formattedDay = day < 10 ? `0${day}` : day;
  const hours = dateObj.getHours();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const minutes = dateObj.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const seconds = dateObj.getSeconds();
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  const timezone = "+0300";
  return `${weekday}, ${formattedDay} ${month} ${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${timezone}`;
}

const getImage = (article: Article) => {
  const baseUrl = "https://image.seiska.fi";
  const id = article?.children?.articleHeader?.children?.image?.attribute?.instanceof_id;
  const baseImage = `${baseUrl}/${id}.jpeg?width=710&height=400`;
  return baseImage;
};

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
  });

  data.result.forEach((item: any) => {
    const article : Article = item?.article;
    const guid = uuidv5(article?.attribute.id, uuidv5.URL);
    const title = article?.field?.title;
    const description = article?.field?.subtitle;
    const content = article?.field?.bodytext;
    const pubDate = formatDate(+article?.field?.published * 1000);
    const category = article?.primarytag?.section;
    const image = getImage(article);
    const feedItem = {
      title, description, url: '', date: '',
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
    statusCode: 200,
  };
}