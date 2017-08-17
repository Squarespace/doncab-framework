import core from '@squarespace/core';

function MobileNavController() {

  // TRANSITION_DELAY should match @mobileOpacityFadeOut in responsive-nav.less
  const TRANSITION_DELAY = 100;
  const body = document.body;
  const mobileNavToggle = document.querySelector('#mobileNavToggle');
  const mobileLinks = Array.prototype.map.call(document.querySelectorAll('#overlayNav a, #overlayNav button'), (link) => {
    return link;
  });

  const mobileLogoLink = document.querySelector('.mobile-branding-wrapper a');

  let scrollY;
  let scrollX;
  let mobileScrollTimeouts = [];

  /* Functions */

  const toggleMobileNav = (e) => {
    const site = document.querySelector('.site-container');
    const mobileBarWrapper = document.querySelector('.mobile-bar-wrapper');
    const overlayNav = document.querySelector('.overlay-nav-container');
    if (!body.classList.contains('mobile-menu-open')) {
      scrollY = window.scrollY;
      scrollX = window.scrollX;
    }
    document.documentElement.classList.toggle('mobile-menu-open', mobileNavToggle.checked);
    body.classList.toggle('mobile-menu-open', mobileNavToggle.checked);
    if (body.classList.contains('mobile-menu-open')) {
      overlayNav.style.paddingTop = mobileBarWrapper.offsetHeight + 'px';
      overlayNav.style.paddingBottom = mobileBarWrapper.offsetHeight + 'px';
    }

    if (!body.classList.contains('mobile-menu-open')) {
      mobileScrollTimeouts.push(
        window.setTimeout(() => {
          window.scrollTo(scrollX, scrollY);
        }, TRANSITION_DELAY)
      );
    } else {

      if (body.classList.contains('tweak-mobile-bar-position-top-fixed')) {
        mobileScrollTimeouts.push(
          window.setTimeout(() => {
            window.scrollTo(0, 0);
          }, TRANSITION_DELAY)
        );
      }

      if (body.classList.contains('tweak-mobile-bar-position-bottom-fixed')) {
        mobileScrollTimeouts.push(
          window.setTimeout(() => {
            window.scrollTo(0, mobileBarWrapper.getBoundingClientRect().bottom);
          }, TRANSITION_DELAY)
        );
      }

    }
    if (body.classList.contains('tweak-mobile-bar-position-standard')) {
      if (body.classList.contains('mobile-menu-open')) {
        mobileScrollTimeouts.push(
          window.setTimeout(() => {
            site.style.marginTop = mobileBarWrapper.offsetHeight + 'px';
          }, TRANSITION_DELAY)
        );
      } else {
        site.style.marginTop = '0px';
      }
    }
  };

  const mobileLinkClick = () => {
    mobileNavToggle.checked = false;
    toggleMobileNav();
  };

  // If the mobile nav is fixed on top or bottom, add margin values equal to the height of the nav
  const addMarginToBody = () => {
    const mobileBarWrapper = document.querySelector('.mobile-bar-wrapper');
    const site = document.querySelector('.site-container');
    if (window.innerWidth <= 768) {
      if (body.classList.contains('tweak-mobile-bar-position-standard')) {
        site.style.paddingTop = '0px';
        return;
      }
      if (body.classList.contains('tweak-mobile-bar-position-top-fixed')) {
        site.style.paddingTop = mobileBarWrapper.offsetHeight + 'px';
        return;
      }
      if (body.classList.contains('tweak-mobile-bar-position-bottom-fixed')) {
        site.style.paddingBottom = mobileBarWrapper.offsetHeight + 'px';
        return;
      }
    } else {
      site.style.paddingTop = '0px';
      site.style.paddingBottom = '0px';
      return;
    }
  };

  const handleAnnouncementBar = () => {
    const announcementBar = document.querySelector('.sqs-announcement-bar');
    const mobileBarWrapper = document.querySelector('.mobile-bar-wrapper');
    if (announcementBar) {
      if (body.classList.contains('tweak-mobile-bar-position-top-fixed')) {
        announcementBar.style.top = mobileBarWrapper.offsetHeight + 'px';
      } else {
        announcementBar.style.top = 0;
      }
    }
  };

  const handleMobileInfoBar = () => {
    const mobileInfoBar = document.querySelector('.sqs-mobile-info-bar');
    const mobileBarWrapper = document.querySelector('.mobile-bar-wrapper');
    if (mobileInfoBar) {
      if (body.classList.contains('tweak-mobile-bar-position-bottom-fixed')) {
        mobileInfoBar.style.bottom = mobileBarWrapper.offsetHeight + 'px';
      } else {
        mobileInfoBar.style.bottom = 0;
      }
    }
  };

  /* Sync and Destroy */
  const sync = () => {

    addMarginToBody();
    handleAnnouncementBar();
    handleMobileInfoBar();

    window.addEventListener('resize', addMarginToBody);
    window.addEventListener('resize', handleAnnouncementBar);
    mobileNavToggle.addEventListener('change', toggleMobileNav);

    mobileLogoLink.addEventListener('click', mobileLinkClick);

    for (let i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', mobileLinkClick);
    }
  };

  const destroy = () => {
    window.removeEventListener('resize', addMarginToBody);
    window.removeEventListener('resize', handleAnnouncementBar);
    mobileNavToggle.removeEventListener('change', toggleMobileNav);
    mobileLogoLink.removeEventListener('click', mobileLinkClick);
    for (let i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].removeEventListener('click', mobileLinkClick);
    }
    mobileScrollTimeouts.forEach((timeout) => {
      window.clearTimeout(timeout);
    });
  };

  core.Tweak.watch('tweak-mobile-bar-position', (tweak) => {
    addMarginToBody();
    handleAnnouncementBar();
    handleMobileInfoBar();
  });

  sync();

  return {
    sync,
    destroy
  };

}

module.exports = MobileNavController;
