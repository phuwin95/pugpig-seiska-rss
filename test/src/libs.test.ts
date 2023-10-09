import * as libs from '../../src/libs';

describe('getImageElement', () => {
  it('should return image element', () => {
    const imageUrl = 'https://www.seiska.fi/image/image_gallery?uuid=MTk3NzI4MzE&groupId=10221822&t=1609247778000';
    const caption = 'caption';
    const imageElement = libs.getImageElement(imageUrl, caption);
    expect(imageElement).toEqual(`<figure class="pp-media">
    <img class="pp-media__image" alt="${caption}" src="${imageUrl}">
    <figcaption class="pp-media__caption">${caption}</figcaption>
  </figure>`);
  });
});