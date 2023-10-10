import * as libs from "../../src/libs";
import { article } from "./testArticle";

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

describe("formatDate", () => {
  it("should return correct date", () => {
    const date = libs.formatDate(1696859027*1000);
    const expected = "Mon, 09 Oct 2023 13:43:47 +0000";
    expect(date).toEqual(expected);
  })
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
  })
});

describe("getDates", () => {
  it("should return dates with start and end", () => {
    jest
    .useFakeTimers()
    .setSystemTime(new Date(1633839600000)); // 2021-10-10
    const dates = libs.getDates();
    expect(dates).toEqual({
      start: "2021-10-10T00:00:00",
      end: "2021-10-10T23:59:59",
    });
    jest.useRealTimers();
  });
});
