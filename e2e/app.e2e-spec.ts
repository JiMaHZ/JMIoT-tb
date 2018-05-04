import { LightIotPage } from './app.po';

describe('light-iot App', () => {
  let page: LightIotPage;

  beforeEach(() => {
    page = new LightIotPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
