import { Tweak } from '@squarespace/core';
import util from '../util';

function BannerController() {
  const bannerWrapper = document.querySelector('.page-banner-wrapper');
  let pageType;

  const bannerImgTweaks = [
    'show-index-banner',
    'show-album-banner',
    'show-blog-banner',
    'show-events-banner',
    'show-gallery-banner',
    'show-homepage-banner',
    'show-page-banner',
    'show-products-banner',
    'show-project-banner',
    'banner-height',
    'banner-image-crop',
    'banner-image-alignment',
    'site-outer-padding',
    'siteCustomSpacing',
    'siteMaxWidth',
    'auto-color-banner-background',
    'full-bleed-project',
    'full-bleed-banner'
  ];

  const showBannerFontSizeTweaks = [
    'banner-page-description-font-font-size',
    'banner-page-description-title-font-size',
    'bannerPageTitleMin',
    'bannerPageDescriptionMin',
    'scale-banner-description-font-size',
    'scale-banner-title-font-size',
    'banner-title-spacing',
    'page-banner-text-width'
  ];

  const handleBannerImage = (page) => {
    const body = document.querySelector('body.collection-type-' + page);
    const headerImgWrapper = document.querySelector('.collection-thumbnail-image-container');
    const headerImg = document.querySelector('.js-page-banner-image');

    if (util.shouldShowBanner()) {
      headerImgWrapper.classList.remove('hide-collection-image');
    } else {
      headerImgWrapper.classList.add('hide-collection-image');
    }

    const isBannerLeft = body.classList.contains('banner-image-alignment-left');
    const isBannerRight = body.classList.contains('banner-image-alignment-right');
    const isBannerCenter = body.classList.contains('banner-image-alignment-center');

    if (isBannerLeft || isBannerRight || isBannerCenter) {
      if (body.classList.contains('banner-image-crop')) {
        headerImgWrapper.classList.add('content-fill');
        if (headerImg) {
          headerImg.classList.remove('page-banner-image');
        }
      } else {
        headerImgWrapper.classList.remove('content-fill');
        if (headerImg) {
          headerImg.removeAttribute('style');
          headerImg.classList.add('page-banner-image');
        }
      }
    } else {
      body.classList.remove('banner-image-crop');
      headerImgWrapper.classList.remove('content-fill');
      if (headerImg) {
        headerImg.removeAttribute('style');
        headerImg.classList.add('page-banner-image');
      }
    }

    const sel = '.page-banner-image-container:not(.hide-collection-image) .js-page-banner-image';

    util.reloadImages(document.querySelectorAll(sel), {
      load: true
    });

    util.reloadImages(document.querySelectorAll('img.custom-fallback-image'), { load: true });
  };

  // This function puts span tags in the paragraph tags outputted
  // by the JSONT {description}
  const wrapPageDescriptionText = () => {
    const pageDesc = document.querySelectorAll('.page-description p');
    for (let i = 0; i < pageDesc.length; i++) {
      const html = '<span>' + pageDesc[i].innerHTML + '</span>';
      pageDesc[i].innerHTML = html;
    }
  };

  // If no promoted image or thumbnail, move the page wrapper out of the banner image container
  const moveIntroTextWrapper = (page) => {
    const pageTextWrapper = document.querySelector('.page-text-wrapper');
    const mainPage = document.querySelector('#page');

    if (util.shouldShowBanner()) {
      document.querySelector('.page-banner-wrapper').appendChild(pageTextWrapper);
    } else {
      mainPage.insertBefore(pageTextWrapper, mainPage.firstChild);
    }

    pageTextWrapper.classList.remove('hide');
  };

  const autoColorBannerBackground = (page) => {
    const body = document.querySelector('body.collection-type-' + page);
    let color;
    const pageBannerWrapper = document.querySelector('.page-banner-wrapper');

    if (util.shouldShowBanner()) {
      if (body.classList.contains('auto-color-banner-background')) {
        color = pageBannerWrapper.dataset.suggestedBgColorThumbnail;
        pageBannerWrapper.style.backgroundColor = color;
      } else {
        pageBannerWrapper.removeAttribute('style');
      }
    } else {
      pageBannerWrapper.removeAttribute('style');
    }
  };

  // Set a minimum height so large banner text doesn't get cut off
  const setMinHeight = () => {
    if (!util.shouldShowBanner()) {
      bannerWrapper.style.minHeight = 0;
      return;
    }

    const pageTextWrapper = document.querySelector('.page-text-wrapper');
    bannerWrapper.style.minHeight = pageTextWrapper.offsetHeight + 'px';
  };

  const resizeBanner = () => {
    setMinHeight();
    util.reloadImages(document.querySelectorAll('.collection-thumbnail-image-container img'), { load: true });
  };

  const initialize = () => {
    pageType = util.determineCollectionType();

    util.reloadImages(document.querySelectorAll('.collection-thumbnail-image img'), { load: true });
    window.addEventListener('resize', resizeBanner);

    autoColorBannerBackground(pageType);
    wrapPageDescriptionText();
    moveIntroTextWrapper(pageType);
    setMinHeight();
    handleBannerImage(pageType);
  };

  Tweak.watch(bannerImgTweaks, (tweak) => {
    autoColorBannerBackground(pageType);
    moveIntroTextWrapper(pageType);
    setMinHeight();
    handleBannerImage(pageType);
  });

  Tweak.watch(showBannerFontSizeTweaks, (tweak) => {
    setMinHeight();
    handleBannerImage(pageType);
  });

  initialize();

  return {
    sync: () => {
      initialize();
    },
    destroy: () => {
      pageType = null;
      window.removeEventListener('resize', resizeBanner);
    }
  };

}

export default BannerController;
