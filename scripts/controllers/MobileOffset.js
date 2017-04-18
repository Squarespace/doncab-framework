import core from '@squarespace/core';
import constants from '../constants';
import util from '../util';

function MobileOffset(element) {

  const sync = () => {

    if (window.innerWidth < constants.MOBILE_BREAKPOINT) {

      let offset = 0;
      const elementStyles = window.getComputedStyle(element);

      if (elementStyles.display !== 'none' && elementStyles.position === 'fixed') {
        offset = element.offsetHeight;
      }

      if (parseFloat(elementStyles.bottom) === 0) {
        // Bottom bar
        document.body.style.marginBottom = offset + 'px';

        const mobileInfoBar = document.querySelector('.sqs-mobile-info-bar');

        if (mobileInfoBar) {

          mobileInfoBar.style.bottom = offset + 'px';

        }

      } else {
        // Top bar
        document.body.style.marginTop = offset + 'px';
      }

    } else {
      document.body.style.marginTop = '';
      document.body.style.marginBottom = '';
    }

  };

  // Sync on tweak change
  const tweaks = [
    'tweak-mobile-bar-bottom-fixed',
    'tweak-mobile-bar-top-fixed'
  ];
  core.Tweak.watch(tweaks, sync);

  // Sync on resize
  util.resizeEnd(sync);


  // Sync on init
  sync();


  return {
    sync: sync
  };
}

module.exports = MobileOffset;
