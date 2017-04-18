import { Tweak } from '@squarespace/core';

function BodyClassController() {
  const body = document.body;

  const tagline = body.querySelector('[data-nc-element="tagline"]');
  const secondaryNav = body.querySelector('[data-nc-element="secondary-nav"]');
  const primaryNav = body.querySelector('[data-nc-element="primary-nav"]');
  const headerTweaks = [
    'tagline-position',
    'primary-nav-position',
    'secondary-nav-position'
  ];

  const initNavClasses = () => {
    if (tagline && tagline.hasChildNodes()) {
      body.classList.add('has-tagline');
    } else {
      body.classList.remove('has-tagline');
    }

    if (secondaryNav && secondaryNav.hasChildNodes()) {
      body.classList.add('has-secondary-nav');
    } else {
      body.classList.remove('has-secondary-nav');
    }

    if (primaryNav && primaryNav.hasChildNodes()) {
      body.classList.add('has-primary-nav');
    } else {
      body.classList.remove('has-primary-nav');
    }
  };

  Tweak.watch(headerTweaks, initNavClasses);

  initNavClasses();

  return {
    sync: () => {
      initNavClasses();
    },

    destroy: () => {

    }
  };
}

export default BodyClassController;
