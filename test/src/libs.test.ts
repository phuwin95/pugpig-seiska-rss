import * as libs from '../../src/libs';

describe('getImageElement', () => {
  it('should return image element', () => {
    const imageUrl = 'https://www.seiska.fi/image/image_gallery?uuid=MTk3NzI4MzE&groupId=10221822&t=1609247778000';
    const caption = 'caption';
    const imageElement = libs.getImageElement(imageUrl, caption);
    expect(imageElement).toEqual(`<figure class="pp-media"><img class="pp-media__image" alt="${caption}" src="${imageUrl}"><figcaption class="pp-media__caption">${caption}</figcaption></figure>`);
  });
});

describe('getCropParams', () => {
  it('should return crop params', () => {
    const cropParams = {
      cropw: 100,
      croph: 100,
      x: 10,
      y: 10,
    }
    const params = libs.getCropParams(cropParams);
    expect(params).toEqual('x=10&y=10&cropw=100&croph=100&');
  });
});