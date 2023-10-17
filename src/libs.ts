import { parse } from "node-html-parser";
import { v5 as uuidv5 } from "uuid";
import { ItemOptions } from "rss";
import { SecretsManager } from "aws-sdk";

import { Article, FullArticle, Structure, StructureChild } from "./types/article";
import { KilkayaResponse } from "./types/kilkaya";

export const getAccessToken = async () => {
  const secretManager = new SecretsManager({
    region: "eu-west-1",
  });
  const secret = await secretManager.getSecretValue({ SecretId: "kilkaya-access-token" }).promise();
  const accessToken = secret.SecretString;
  return accessToken;
};

export const fetchKilkayaWithRetry = async (
  url,
  options,
  delay = 2000
): Promise<KilkayaResponse> => {
  console.log("---trying fetch");
  const response = await fetch(url, options);
  const data: KilkayaResponse = await response.json();
  if (data.message === "Query was delayed") {
    // sleep for 2s
    await new Promise((resolve) => setTimeout(resolve, delay));
    return await fetchKilkayaWithRetry(url, options, delay);
  }
  return data;
};

export const getDates = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 59);
  return {
    start: start.toISOString().slice(0, -5),
    end: end.toISOString().slice(0, -5),
  };
};

export const isNumber = (value: any) => !isNaN(Number(value));

export const getCropParams = (crop?: {
  cropw?: string | number;
  croph?: string | number;
  x?: string | number;
  y?: string | number;
}) => {
  let params = "";
  if (crop) {
    if (isNumber(crop.x)) params += `x=${crop.x}&`;
    if (isNumber(crop.y)) params += `y=${crop.y}&`;
    if (isNumber(crop.cropw)) params += `cropw=${crop.cropw}&`;
    if (isNumber(crop.croph)) params += `croph=${crop.croph}&`;
  }
  return params;
};

export const getAuthor = (article: Article) =>
  article?.children?.byline?.field?.firstname + " " + article?.children?.byline?.field?.lastname;

export const getTags = (article: Article) => {
  const tags = typeof article?.tag?.tag === "string" ? [article?.tag?.tag] : article?.tag?.tag;

  return tags.map((tag) => ({ tag }));
};

/**
 * filters and manipulates the articles into pugpig rss feed items then adds them to the feed
 * @param feed RSS
 * @param articles FullArticle[]
 */
export const createFeedItemsFromArticles = (articles: FullArticle[]) => {
  const uniqueItemsMap = {};

  return articles.reduce((acc, curr) => {
    const article = curr?.article;

    // console.log("article is: ", article);
    const guid = uuidv5(article?.attribute.id, uuidv5.URL);
    const title = article?.field?.title;
    const description = article?.field?.subtitle;

    // skip if guid, title or description already exists
    if (uniqueItemsMap[guid] || uniqueItemsMap[title] || uniqueItemsMap[description]) return acc;

    uniqueItemsMap[guid] = true;
    uniqueItemsMap[title] = true;
    uniqueItemsMap[description] = true;

    const content = getContent(article);
    const date = formatDate(+article?.field?.published * 1000);
    const categories = [article?.primarytag?.section];
    const image = getMainImage(article);
    const author = getAuthor(article);

    const feedItem: ItemOptions = {
      guid,
      title,
      description,
      url: "",
      date,
      categories,
      author,
      custom_elements: [{ "content:encoded": content }, { main_image: image }, ...getTags(article)],
    };

    acc.push(feedItem);

    return acc;
  }, [] as ItemOptions[]);
};

/**
 * formats date into rss feed pubDate in the format: Tue, 03 May 2022 20:45:46 +0300
 * @param date string | number ms since epoch
 * @returns formatted date into rss feed pubDate in the format: Tue, 03 May 2022 20:45:46 +0300
 */
export const formatDate = (date: string | number) => {
  // Tue, 03 May 2022 20:45:46 +0000
  const dateObj = new Date(date);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
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
  const timezoneOffset = dateObj.getTimezoneOffset();
  const timezone = (-1 * timezoneOffset) / 60;
  const tz = timezone < 10 ? `0${timezone}00` : `${timezone}00`;
  const timezoneSign = timezone < 0 ? "-" : "+";
  return `${weekday}, ${formattedDay} ${month} ${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${timezoneSign}${tz}`;
};

/**
 * Get the main image of the article, if its not available, get the jwplayer preview image
 * @param article Article
 * @returns image url
 */
export const getMainImage = (article: Article) => {
  const baseUrl = "https://image.seiska.fi";
  const id = article?.children?.articleHeader?.children?.image?.attribute?.instanceof_id;
  if (!article?.children?.articleHeader?.children?.image?.field)
    return article?.children?.articleHeader?.children?.jwplayer?.field?.preview;
  if (id) {
    const cropParamsJson = article?.children?.articleHeader?.children?.image?.field?.viewports_json;
    const cropParams = cropParamsJson
      ? getCropParams(JSON.parse(cropParamsJson)?.desktop?.fields)
      : "";
    const baseImage = `${baseUrl}/${id}.jpg?width=710&height=400&${cropParams}`;
    return baseImage;
  }
  return;
};

/**
 * This function is used to get the correct index of the element in the bodytext. This is because the htmlMap indices of elements can be shifted
 * if an element is inserted before the current element.
 *
 * original  `[p1, p2, p3, p4, p5]`
 *
 * Insert 1 at index 1, 3 at index 3, the correct position is `[p1, 1, p2, p3, 3, p4, p5]` (according to Labrador)
 *
 * After inserting 1 into index 1, the htmlMap is `[p1, 1, p2, p3, p4, p5]` (correct)
 *
 * After inserting b into index 3, the htmlMap is `[p1, 1, p2, b, p3, p4, p5]` (incorrect)
 *
 * The correct index of b is 4, not 3. -> `[p1, 1, p2, b, p3, 3, p4, p5]` (correct)
 *
 * The function finds the element that is before the insterted element in the modified htmlMap accordingly to the index of the element in the original htmlMap,
 * then returns the index of that element in the modified htmlMap + 1, which is the correct index of the element in the modified htmlMap.
 * @param index index of the element in the bodytext
 * @param htmlMap modified htmlMap
 * @param originalHtmlMap copy of the original htmlMap
 * @returns the correct index of the element in the current body text
 */
const getCorrectIndex = (index: number, modifiedHtmlMap: string[], originalHtmlMap: string[]) => {
  const elementBefore = originalHtmlMap[index - 1];
  const indexOfElementBefore = modifiedHtmlMap.indexOf(elementBefore);
  const correctIndex = indexOfElementBefore + 1;
  return correctIndex;
};

/**
 * return a string of an html element formatted for pugpig image element
 * @param url url
 * @param caption caption
 * @returns string
 */
export const getImageElement = (url: string, caption?: string) =>
  `<figure class="pp-media"><img class="pp-media__image" alt="${caption}" src="${url}"><figcaption class="pp-media__caption">${caption}</figcaption></figure>`;

export const getJwplayerElement = (id: string) =>
  `<div style="position:relative;overflow:hidden;padding-bottom:56.25%"><iframe src="https://videot.seiska.fi/players/${id}-wRrEuXAq.html" width="100%" height="100%" frameborder="0" scrolling="auto" title="PMMP sai karaokebaarin sekaisin" style="position:absolute;" allowfullscreen></iframe></div>`;

export const getQuoteBoxElement = (quote: string) =>
  `<div class="quotebox"><div class="content"><div class="quoteboxContent"><div class="quote"><h3>${quote}</h3></div></div></div></div>`;

export const getFactboxElement = (title: string, content: string) =>
  `<div class="factbox"><div class="content"><h2>${title}</h2><div class="fact"><p>${content}</p></div></div></div>`;

type BodyTextStructure = {
  images: StructureChild[];
  markups: StructureChild[];
  jwplayer?: StructureChild;
  factbox?: StructureChild;
  quotebox?: StructureChild;
};

/**
 * formats and inserts elements into the bodytext
 * @param article Article
 * @returns string
 */
export const getContent = (article: Article) => {
  // get the images from the bodytext structure
  const structure: Structure[] = JSON.parse(article?.field?.structure_json);
  const bodyTextStructure = structure.find((item: Structure) => item.type === "bodytext");

  // get htmlMap to insert elements into the bodytext
  const html = parse(article.field.bodytext);
  const htmlMap = html.childNodes.map(
    (item) =>
      item
        .toString()
        .replace(/\n/g, "") // remove \
        .replace('href="https://labrador.seiska.fi/', 'href="https://www.seiska.fi/') // replace labrador links with seiska links
  );

  const htmlMapCopy = [...htmlMap];

  const { images, markups, jwplayer, factbox, quotebox } =
    bodyTextStructure?.children?.reduce<BodyTextStructure>(
      (acc, curr) => {
        if (curr.type === "image") {
          acc.images.push(curr);
        } else if (curr.type === "markup") {
          acc.markups.push(curr);
        } else if (curr.type === "jwplayer") {
          acc.jwplayer = curr;
        } else if (curr.type === "factbox") {
          acc.factbox = curr;
        } else if (curr.type === "quotebox") {
          acc.quotebox = curr;
        }
        return acc;
      },
      { images: [], markups: [] }
    ) ?? ({} as BodyTextStructure);

  // insert images into the bodytext
  images?.forEach((image) => {
    const index = image?.metadata?.bodyTextIndex?.desktop;
    if (typeof index !== "number") return;
    const baseUrl = "https://image.seiska.fi";
    const imageEl = article?.children?.image?.find(
      ({ attribute }) => +attribute?.id === image?.node_id
    );
    const id = imageEl?.attribute?.instanceof_id;
    const cropParams = imageEl?.field?.viewports_json
      ? getCropParams(JSON.parse(imageEl?.field?.viewports_json)?.desktop?.fields)
      : "";
    const baseImage = `${baseUrl}/${id}.jpg?width=710&${cropParams}`;
    const imageElement = getImageElement(baseImage, imageEl?.field.imageCaption);
    const correctIndex = getCorrectIndex(index, htmlMap, htmlMapCopy);

    htmlMap.splice(correctIndex, 0, imageElement);
  });

  // insert markups into the bodytext
  markups?.forEach((markup) => {
    const index = markup?.metadata?.bodyTextIndex?.desktop;
    if (typeof index !== "number") return;
    const markupObj = article?.children?.markup;
    const markUpEl = Array.isArray(markupObj)
      ? markupObj.find(({ attribute }) => +attribute?.id === markup?.node_id)
      : markupObj;
    if (!markUpEl?.field?.markup || typeof markUpEl?.field?.markup !== "string") return;
    const content = markUpEl?.field?.markup
      .replace(/\n/g, "")
      .replace('src="//www.instagram.com/embed.js"', 'src="https://www.instagram.com/embed.js"'); // added protocol to instagram embed
    const correctIndex = getCorrectIndex(index, htmlMap, htmlMapCopy);
    htmlMap.splice(correctIndex, 0, content);
  });

  if (jwplayer) {
    const index = jwplayer?.metadata?.bodyTextIndex?.desktop;
    const jwplayerObj = article?.children?.jwplayer;
    if (!jwplayerObj?.field?.vid || typeof index !== "number") return;
    const jwplayerElement = getJwplayerElement(jwplayerObj?.field?.vid);
    const correctIndex = getCorrectIndex(index, htmlMap, htmlMapCopy);
    htmlMap.splice(correctIndex, 0, jwplayerElement);
  }

  if (quotebox) {
    const index = quotebox?.metadata?.bodyTextIndex?.desktop;
    const quoteboxObj = article?.children?.quotebox;
    if (!quoteboxObj || typeof quoteboxObj?.field?.quote !== "string" || typeof index !== "number")
      return;
    const quoteboxElement = getQuoteBoxElement(quoteboxObj?.field?.quote);
    const correctIndex = getCorrectIndex(index, htmlMap, htmlMapCopy);
    htmlMap.splice(correctIndex, 0, quoteboxElement);
  }

  if (factbox) {
    const index = factbox?.metadata?.bodyTextIndex?.desktop;
    const factboxObj = article?.children?.factbox;
    if (
      !factboxObj ||
      typeof index !== "number" ||
      !factboxObj?.field?.title ||
      !factboxObj?.field?.bodytext
    )
      return;
    const factboxElement = getFactboxElement(factboxObj?.field?.title, factboxObj?.field?.bodytext);
    const correctIndex = getCorrectIndex(index, htmlMap, htmlMapCopy);
    htmlMap.splice(correctIndex, 0, factboxElement);
  }
  return htmlMap.join("");
};
