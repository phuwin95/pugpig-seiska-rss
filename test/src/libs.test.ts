import * as libs from "../../src/libs";
import { article, content as contentString } from "./testArticle";

describe("getImageElement", () => {
  it("should return image element", () => {
    const imageUrl =
      "https://www.seiska.fi/image/image_gallery?uuid=MTk3NzI4MzE&groupId=10221822&t=1609247778000";
    const caption = "caption";
    const imageElement = libs.getImageElement(imageUrl, caption);
    expect(imageElement).toEqual(
      `<figure class="pp-media"><img class="pp-media__image" alt="${caption}" src="${imageUrl}"><figcaption class="pp-media__caption">${caption}</figcaption></figure>`
    );
  });
});

describe("getCropParams", () => {
  it("should return crop params", () => {
    const cropParams = {
      cropw: 100,
      croph: 100,
      x: 10,
      y: 10,
    };
    const params = libs.getCropParams(cropParams);
    expect(params).toEqual("x=10&y=10&cropw=100&croph=100&");
  });
});

describe("getMainImage", () => {
  it("should return main image", () => {
    const id =
      article?.children?.articleHeader?.children?.image?.attribute
        ?.instanceof_id;
    const mainImageElement = libs.getMainImage(article);
    expect(mainImageElement).toContain(
      `https://image.seiska.fi/${id}.jpg?width=710&height=400&`
    );
  });
});

describe("getAuthor", () => {
  it("should return author's first and last names", () => {
    const firstAndLastNames =
      article?.children?.byline?.field?.firstname +
      " " +
      article?.children?.byline?.field?.lastname;
    const author = libs.getAuthor(article);
    expect(author).toEqual(firstAndLastNames);
  });
});

describe("getQuoteBoxElement", () => {
  it("should return quotebox element", () => {
    const quoteboxObj = article?.children?.quotebox;
    const quote = quoteboxObj?.field?.quote;
    const quoteboxElement = libs.getQuoteBoxElement(quote);
    expect(quoteboxElement).toEqual(
      `<div class="quotebox"><div class="content"><div class="quoteboxContent"><div class="quote"><h3>${quote}</h3></div></div></div></div>`
    );
  });
});

describe("getFactboxElement", () => {
  it("should return factbox element", () => {
    const factboxObj = article?.children?.factbox;
    const title = factboxObj?.field?.title;
    const content = factboxObj?.field?.bodytext;
    const factboxElement = libs.getFactboxElement(title, content);
    expect(factboxElement).toEqual(
      `<div class="factbox"><div class="content"><h2>${title}</h2><div class="fact"><p>${content}</p></div></div></div>`
    );
  });
});

describe("getJwplayerElement", () => {
  it("should return JW player element", () => {
    // const index = jwplayer?.metadata?.bodyTextIndex?.desktop;
    const jwplayerObj = article?.children?.jwplayer;
    // if (!jwplayerObj?.field?.vid || typeof index !== "number") return;
    const id = jwplayerObj?.field?.vid;
    const jwplayerElement = libs.getJwplayerElement(id);
    expect(jwplayerElement).toEqual(
      `<div style="position:relative;overflow:hidden;padding-bottom:56.25%"><iframe src="https://videot.seiska.fi/players/${id}-wRrEuXAq.html" width="100%" height="100%" frameborder="0" scrolling="auto" title="PMMP sai karaokebaarin sekaisin" style="position:absolute;" allowfullscreen></iframe></div>`
    );
  });
});

describe("formatDate", () => {
  it("should return correct date", () => {
    const date = libs.formatDate(1696859027 * 1000);
    const expected = "Mon, 09 Oct 2023 13:43:47 +0000";
    expect(date).toEqual(expected);
  });
});

describe("isNumber", () => {
  it("should return true if value is number", () => {
    expect(libs.isNumber(1)).toBeTruthy();
    expect(libs.isNumber(1.1)).toBeTruthy();
    expect(libs.isNumber("1")).toBeTruthy();
  });
  it("should return false if value is not a number", () => {
    expect(libs.isNumber("a")).toBeFalsy();
    expect(libs.isNumber("1a")).toBeFalsy();
    expect(libs.isNumber("a1")).toBeFalsy();
    expect(libs.isNumber(undefined)).toBeFalsy();
    expect(libs.isNumber({})).toBeFalsy();
  });
});

describe("getDates", () => {
  it("should return dates with start and end", () => {
    jest.useFakeTimers().setSystemTime(new Date(1633839600000)); // 2021-10-10
    const dates = libs.getDates();
    expect(dates).toEqual({
      start: "2021-10-10T00:00:00",
      end: "2021-10-10T23:59:59",
    });
    jest.useRealTimers();
  });
});

describe("getTags", () => {
  it("should return tags", () => {
    const tags = libs.getTags(article);
    expect(tags).toMatchObject(article.tag.tag.map((tag) => ({ tag })));
    expect(tags.length).toBe(article.tag.tag.length);
  });      
});

describe("createFeedItemsFromArticles", () => {
  it("should return list of feed items", () => {
    const feedItems = libs.createFeedItemsFromArticles([{ article }]);
    expect(feedItems).toBeInstanceOf(Array);
  });

  it("should return correct no. of feed items when articles are duplicated", () => {
    const feedItems = libs.createFeedItemsFromArticles([
      { article },
      { article },
      { article },
    ]);
    expect(feedItems.length).toEqual(1);
  });

  it("should return correct object (feed item) structure", () => {
    const feedItems = libs.createFeedItemsFromArticles([{ article }]);
    expect(feedItems[0]).toMatchObject({
      guid: expect.any(String),
      title: article.field.title,
      description: article.field.subtitle,
      date: libs.formatDate(+article.field.published * 1000),
      categories: [article.primarytag.section],
      author: libs.getAuthor(article),
      custom_elements: [
        {
          "content:encoded": libs.getContent(article),
        },
        {
          main_image: libs.getMainImage(article),
        },
        ...libs.getTags(article),
      ],
    });
  });
});

describe("getContent", () => {
  const content = libs.getContent(article);
  
  it("should return content", () => {
    expect(content).toBe(contentString);
  });

  it("should return correct data type", () => {
    expect(typeof content).toBe("string");
  })
});
