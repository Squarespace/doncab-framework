import core from '@squarespace/core';
import constants from '../constants';
import util from '../util';

let scrollPos = 0;

function MobileOverlayToggle(element) {

  if (constants.DEBUG) { console.log('MobileOverlayToggle'); }
  // Tweak - add overlay active class if
  // you're below the mobile breakpoint
  const tweaks = [
    'tweak-mobile-overlay-slide-origin',
    'tweak-mobile-overlay-back-color',
    'tweak-mobile-overlay-close-show',
    'tweak-mobile-overlay-close-background-color',
    'tweak-mobile-overlay-close-icon-color',
    'tweak-mobile-overlay-menu-color',
    'tweak-mobile-overlay-menu-indicator-color',
    'tweak-mobile-overlay-menu-primary-font',
    'tweak-mobile-overlay-menu-primary-text-color',
    'tweak-mobile-overlay-menu-secondary-font',
    'tweak-mobile-overlay-menu-secondary-text-color'
  ];
  core.Tweak.watch((tweak) => {
    const isMobileActive = window.innerWidth < constants.MOBILE_BREAKPOINT &&
                           tweak.name &&
                           tweaks.indexOf(tweak.name) >= 0;

    document.body.classList.toggle('is-mobile-overlay-active', isMobileActive);
  });

  const handleClick = (e) => {
    e.preventDefault();

    // Check to see if overlay is already open

    if (document.body.classList.contains('is-mobile-overlay-active')) {

      // Reset position of body, remove active class, set scroll top
      document.body.classList.remove('is-mobile-overlay-active');
      document.body.style.top = null;
      window.scrollTo(0, scrollPos);

    } else {

      // Get position of body and store in var
      scrollPos = document.body.scrollTop;

      // Not active, add the class
      document.body.classList.add('is-mobile-overlay-active');
      document.body.style.top = -1 * scrollPos + 'px';

    }
  };

  const sync = () => {
    element.addEventListener('click', handleClick);
  };

  const destroy = () => {
    element.removeEventListener('click', handleClick);
  };

  // Resize handler - remove overlay active
  // class if you're above the mobile breakpoint
  util.resizeEnd(() => {
    if (window.innerWidth > constants.MOBILE_BREAKPOINT) {
      document.body.classList.remove('is-mobile-overlay-active');
    }
  });

  sync();

  return {
    sync,
    destroy
  };

}


module.exports = MobileOverlayToggle;
