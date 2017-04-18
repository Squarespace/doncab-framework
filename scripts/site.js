import controller from '@squarespace/controller';
import { Tweak } from '@squarespace/core';
import constants from './constants';
import AjaxLoader from './ajaxLoader';
import util from './util';

import AncillaryLayout from './controllers/AncillaryLayout';
import BannerController from './controllers/BannerController';
import BodyClassController from './controllers/BodyClassController';
import IndexController from './controllers/IndexController';
import IndexNavigationController from './controllers/IndexNavigationController';
import MobileNavController from './controllers/MobileNavController';
import MobileOffset from './controllers/MobileOffset';
import MobileOverlayFolders from './controllers/MobileOverlayFolders';
import MobileOverlayToggle from './controllers/MobileOverlayToggle';
import ProjectController from './controllers/ProjectController';
import VideoBackground from '@squarespace/video-background';

controller.register('AncillaryLayout', AncillaryLayout);
controller.register('BannerController', BannerController);
controller.register('BodyClassController', BodyClassController);
controller.register('IndexController', IndexController);
controller.register('IndexNavigationController', IndexNavigationController);
controller.register('MobileNavController', MobileNavController);
controller.register('MobileOffset', MobileOffset);
controller.register('MobileOverlayFolders', MobileOverlayFolders);
controller.register('MobileOverlayFolders', MobileOverlayFolders);
controller.register('MobileOverlayToggle', MobileOverlayToggle);
controller.register('ProjectController', ProjectController);

const videoBannerTweaks = [
  'show-index-banner',
  'show-album-banner',
  'show-blog-banner',
  'show-events-banner',
  'show-gallery-banner',
  'show-homepage-banner',
  'show-page-banner',
  'show-products-banner',
  'show-project-banner',
  'index-item-width',
  'banner-height',
  'banner-image-crop',
  'banner-image-alignment',
  'site-outer-padding',
  'siteCustomSpacing',
  'siteMaxWidth',
  'full-bleed-project',
  'full-bleed-banner'
];


controller.register('VideoBackground', (element) => {
  if (element.classList.contains('page-banner-image-container')) {
    if (util.shouldShowBanner() || constants.AUTHENTICATED) {
      return VideoBackground(element, videoBannerTweaks);
    }
  } else {
    return VideoBackground(element, videoBannerTweaks);
  }
});


window.addEventListener('DOMContentLoaded', () => {
  util.reloadImages(document.querySelectorAll('img.custom-fallback-image'), { load: true });
  const isAjaxLoaderEnabled = Tweak.getValue('tweak-site-ajax-loading-enable') === 'true' ? true : false;

  if (isAjaxLoaderEnabled && !constants.AUTHENTICATED && !constants.COVER_PAGE) {
    const ajaxLoaderInstance = new AjaxLoader({
      sqsController: true,
      timeout: 6000,
      siteContainer: '.content-container',
      pageTransition: {
        animLink: 'index-page-transition-link',
        animClass: 'tweak-page-transition-animation',
        fadeInDuration: 0.78,
        fadeOutDuration: 0.2,
      },
      beforeRequestAnim: () => {
        const container = document.querySelector('.content-container');
        container.classList.add('slide-up');
      },
      afterRequestAnim: () => {
        const container = document.querySelector('.content-container');
        container.classList.remove('slide-up');
        container.classList.add('slide-into-view');
        window.setTimeout(() => {
          container.classList.remove('slide-into-view');
        }, 500);
      }
    });
  }
});
