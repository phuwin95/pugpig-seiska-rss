import { APIGatewayProxyResultV2 } from "aws-lambda";
import RSS from "rss";
import {
  addItems,
  fetchKilkayaWithRetry,
  getAccessToken,
  getDates,
} from "./libs";
export async function main(): Promise<APIGatewayProxyResultV2> {
  const accessToken = await getAccessToken();

  const url = new URL("https://eu4.dataapi.kilkaya.com/api/query");
  const { start, end } = getDates();
  url.searchParams.append("datefrom", start);
  url.searchParams.append("dateto", end);
  url.searchParams.append("schemaname", "pageview");
  url.searchParams.append("columns", "articleView,url");
  url.searchParams.append("filters", "domain:seiska.fi");
  url.searchParams.append("sortby", "articleView");
  url.searchParams.append("sortorder", "desc");
  url.searchParams.append("limit", "20");

  const { data } = await fetchKilkayaWithRetry(url.href, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const articleIds = data
    ?.map((article) => Number(article?.attributes?.url?.split("/").pop()))
    .filter(Boolean)
    .filter((id) => !isNaN(id));

  // we fetch the content full of the articles separately
  const query = articleIds.join(" OR ");
  const baseUrl = new URL("https://api.seiska.fi/api/v1/article");
  baseUrl.searchParams.append("query", `id:(${query}) AND visibility_status:P`);
  baseUrl.searchParams.append("content", "full");
  const fullContentResponse = await fetch(baseUrl.href);
  const fullContentData = await fullContentResponse.json();
  const sortedArticles = articleIds.reduce((acc: any[], id: number) => {
    const article = fullContentData.result.find(
      (item) => +item.article?.attribute?.id === +id
    );
    if (article) {
      acc.push(article);
    }
    return acc;
  }, []);

  const feed = new RSS({
    title: "Seiska",
    description: "Seiska RSS popular",
    ttl: 60, // in minutes,
    feed_url: "https://www.seiska.fi/rss",
    site_url: "https://www.seiska.fi",
    custom_namespaces: {
      content: "http://purl.org/rss/1.0/modules/content/",
      rss: "http://purl.org/rss/1.0/",
    },
  });

  addItems(feed, sortedArticles);

  return {
    body: feed.xml({ indent: true }),
    headers: {
      "Content-Type": "application/rss+xml",
    },
    statusCode: 200,
  };

  return {
    body: JSON.stringify({ message: "Successful lambda invocation popular" }),
    statusCode: 200,
  };
}
