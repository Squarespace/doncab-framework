import { Tweak } from '@squarespace/core';
import util from '../util';

function IndexController() {
  const body = document.body;
  let revealIndexTitlesTimeout;

  /* Tweaks array for Tweak Watcher */
  const tweaks = [
    'index-item-image-crop',
    'index-item-image-alignment',
    'index-item-alternate-widths',
    'index-item-spacing',
    'indexItemSpacing',
    'index-item-width',
    'full-bleed-index',
    'indexItemsPerRow',
    'tabletItemsPerRow',
    'mobileItemsPerRow',
    'thumbnailRatio',
    'indexItemWidth'
  ];

  const titleTweaks = [
    'index-item-title-display',
    'index-item-title-alignment',
    'index-item-height',
    'index-item-alternate-widths'
  ];

  const indexItemTextWrappers = [].slice.call(document.querySelectorAll('.index-item-text-wrapper'));

  const initIndexImages = (tweak) => {
    const imgWrapper = document.querySelectorAll('.js-index-item-image-wrapper');
    const img = document.querySelectorAll('.js-index-item-image');

    const isIndexItemImageLeft = body.classList.contains('index-item-image-alignment-left');
    const isIndexItemImageRight = body.classList.contains('index-item-image-alignment-right');
    const isIndexItemImageCenter = body.classList.contains('index-item-image-alignment-center');

    if (isIndexItemImageLeft || isIndexItemImageRight || isIndexItemImageCenter) {
      if (body.classList.contains('index-item-image-crop')) {
        for (let i = 0; i < imgWrapper.length; i++) {
          imgWrapper[i].classList.add('content-fill');
          if (img[i]) {
            img[i].classList.remove('index-item-image');
          }
        }
      } else {
        for (let i = 0; i < imgWrapper.length; i++) {
          imgWrapper[i].classList.remove('content-fill');
          if (img[i]) {
            img[i].removeAttribute('style');
            img[i].classList.add('index-item-image');
          }
        }
      }
    } else {
      body.classList.remove('index-item-image-crop');
      for (let i = 0; i < imgWrapper.length; i++) {
        imgWrapper[i].classList.remove('content-fill');
        if (img[i]) {
          img[i].removeAttribute('style');
          img[i].classList.add('index-item-image');
        }
      }
    }

    util.reloadImages(document.querySelectorAll('.js-index-item-image'), {
      load: true
    });

    util.reloadImages(document.querySelectorAll('img.custom-fallback-image'), {
      load: true
    });
  };

  const resizeIndexImages = () => {
    util.reloadImages(document.querySelectorAll('.js-index-item-image'), { load: true });
    util.reloadImages(document.querySelectorAll('img.custom-fallback-image'), { load: true });
  };

  const isElementInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top <= window.innerHeight / 2 || rect.bottom <= window.innerHeight;
  };

  const slideIntoView = () => {
    let inView;
    indexItemTextWrappers.forEach((text, index, arr) => {
      inView = isElementInViewport(text);
      if (inView) {
        text.classList.add('reveal-index-title');
        return;
      }
    });
  };

  const revealIndexTitles = () => {
    if (body.classList.contains('index-item-title-display-on-scroll')) {
      slideIntoView();
    } else {
      indexItemTextWrappers.forEach((text) => {
        text.classList.remove('reveal-index-title');
      });
    }
  };

  // Reveals index titles on touchscreen devices when set to reveal on hover
  const revealIndexTitlesOnTouch = () => {
    if (body.classList.contains('index-item-title-display-on-hover')) {
      slideIntoView();
    }
  }

  /* Tweak Watcher */
  Tweak.watch(tweaks, initIndexImages);
  Tweak.watch(titleTweaks, revealIndexTitles);

  Tweak.watch('index-item-height', (tweak) => {
    util.reloadImages(document.querySelectorAll('.js-index-item-image'), {
      load: true
    });
  });

  /* Sync and Destroy */
  const sync = () => {
    window.addEventListener('resize', resizeIndexImages);
    window.addEventListener('scroll', revealIndexTitles);
    window.addEventListener('touchstart', revealIndexTitlesOnTouch);
    window.addEventListener('touchend', revealIndexTitlesOnTouch);
    initIndexImages();
    revealIndexTitlesTimeout = window.setTimeout(() => {
      revealIndexTitles();
    }, 1000);
  };

  const destroy = () => {
    window.removeEventListener('resize', resizeIndexImages);
    window.removeEventListener('scroll', revealIndexTitles);
    window.removeEventListener('touchstart', revealIndexTitlesOnTouch);
    window.removeEventListener('touchend', revealIndexTitlesOnTouch);
    window.clearTimeout(revealIndexTitlesTimeout);
  };

  sync();

  return {
    sync,
    destroy
  };
}

export default IndexController;
