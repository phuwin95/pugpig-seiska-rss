import { parse } from 'node-html-parser';
import { Article, Structure } from "./types/article";

export const getCropParams = (crop: { cropw: string; croph: string; x: string; y: string }) => {
  let params = '';
  if (crop) {
    if (crop.x) params += `x=${crop.x}&`;
    if (crop.y) params += `y=${crop.y}&`;
    if (crop.cropw) params += `cropw=${crop.cropw}&`;
    if (crop.croph) params += `croph=${crop.croph}&`;
  }
  return params;
};

export const formatDate = (date: string | number) => {
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

export const getMainImage = (article: Article) => {
  const baseUrl = "https://image.seiska.fi";
  const id = article?.children?.articleHeader?.children?.image?.attribute?.instanceof_id;
  const cropParams = getCropParams(article?.children?.articleHeader?.children?.image?.field);
  const baseImage = `${baseUrl}/${id}.png?width=710&height=400&${cropParams}`;
  return baseImage;
};

export const getImageElement = (url: string, caption?: string) => `<figure class="pp-media">
  <img class="pp-media__image" alt="${caption}" src="${url}">
  <figcaption class="pp-media__caption">${caption}</figcaption>
</figure>`;


export const getContent = (article: Article) => {

  // get the images from the bodytext structure
  const structure : Structure[] = JSON.parse(article?.field?.structure_json);
  const bodyText = structure.find((item: Structure) => item.type === 'bodytext');
  const images = bodyText?.children?.filter((item) => item.type === 'image');

  // get htmlMap to insert images into the bodytext
  const html = parse(article.field.bodytext);
  const htmlMap = html.childNodes.map((item) => item.toString());

  images?.forEach(image => {
    if (!image?.metadata?.bodyTextIndex?.desktop) return;
    const baseUrl = "https://image.seiska.fi";
    const imageEl = article?.children?.image?.find(({attribute}) => +attribute?.id === image?.node_id);
    const id = imageEl?.attribute?.instanceof_id;
    const baseImage = `${baseUrl}/${id}.png?width=710&height=400`;
    const imageElement = getImageElement(baseImage, imageEl?.field.imageCaption);
    htmlMap.splice(image?.metadata?.bodyTextIndex?.desktop, 0, imageElement);
  });

  return htmlMap.join('');
}