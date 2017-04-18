import core from '@squarespace/core';
import util from '../util';

function ProjectController() {
  // For smooth scroll
  let staggerables = [];

  /* All images */
  const imageNodeList = document.querySelectorAll('.project-slide-image-wrapper img[data-src]');
  const images = Array.prototype.map.call(imageNodeList, (img, index) => {
    return img;
  });

  const firstImage = images[0];
  const allSlides = Array.prototype.map.call(document.querySelectorAll('.project-slide'), (slide) => {
    return slide;
  });

  let slidesToAnimate;

  /* Tweaks Array for Tweak Watcher */
  const captionTweaks = [
    'project-image-portrait-caption-style',
    'project-image-landscape-caption-style'
  ];

  /* Functions */

  const getImageRatio = (img) => {
    const dimensions = img.getAttribute('data-image-dimensions').split('x');
    return (parseInt(dimensions[0], 10) / parseInt(dimensions[1], 10)) * 100;
  };

  const addAspectRatioClass = (img) => {
    const ratio = getImageRatio(img);
    // Just a magic number based on image ratio.
    if (ratio > 200) {
      return 'project-slide-pano project-slide-landscape';
    } else if (ratio > 115) {
      return 'project-slide-landscape';
    } else if (ratio < 85) {
      return 'project-slide-portrait project-slide-staggerable';
    }
    return 'project-slide-square project-slide-staggerable';
  };

  // Set margin-bottom to 0 on Landscapes when Collapse Landscape Spacing is checked
  const collapseLandscapeSpacing = () => {
    const body = document.body;
    let landscapes;

    // If Collapse Landscape Spacing is checked
    if (body.classList.contains('collapse-landscape-spacing')) {
      landscapes = document.querySelectorAll('.project-slide-landscape');
      Array.prototype.forEach.call(landscapes, (landscape) => {
        landscape.removeAttribute('style');
      });

      // If Show Project Captions is checked
      if (body.classList.contains('show-project-captions')) {
        landscapes = document.querySelectorAll('.project-slide-landscape.project-slide-has-no-description');
        Array.prototype.forEach.call(landscapes, (landscape) => {
          landscape.removeAttribute('style');
          // if the next slide is a captionless Landscape slide, set margin-bottom to 0
          const sibling = landscape.nextElementSibling;
          if (sibling && sibling.classList.contains('project-slide-landscape')) {
            // -1 to account for weird 1px margin when someone uses % value in style editor
            landscape.style.marginBottom = '-1px';
          }
          // if there's a caption, remove the margin bottom
          if (landscape.classList.contains('project-slide-has-description')) {
            landscape.removeAttribute('style');
          }
        });
        // Else, if Show Project Captions is unchecked, set margin-bottom to 0 on all Landscapes
      } else {
        landscapes = document.querySelectorAll('.project-slide-landscape');
        Array.prototype.forEach.call(landscapes, (landscape) => {
          const sibling = landscape.nextElementSibling;
          if (sibling && sibling.classList.contains('project-slide-landscape')) {
            // -1 to account for weird 1px margin when someone uses % value in style editor
            landscape.style.marginBottom = '-1px';
          }
        });
      }
      // Else, if Collapse Landscape Spacing is unchecked, removing margin bottom values
    } else {
      landscapes = document.querySelectorAll('.project-slide-landscape');
      Array.prototype.forEach.call(landscapes, (landscape) => {
        landscape.removeAttribute('style');
      });
    }
  };

  // This determines what slides to add the slide-in animation class if captions are offset
  const getSlidesToAnimate = () => {
    let slides;
    const body = document.body;

    if (body.classList.contains('tweak-project-slide-transition')){
      const isPortraitOffset = document.body.classList.contains('project-image-portrait-caption-style-offset');
      const isLandscapeOffset = document.body.classList.contains('project-image-landscape-caption-style-offset');
      if (isPortraitOffset && isLandscapeOffset) {
        const sel = '.project-slide-image-container, .project-slide-description-wrapper, .project-slide-video-wrapper';
        slides = Array.prototype.map.call(document.querySelectorAll(sel), (slide) => {
          return slide;
        });
        // if just the portrait captions are offset
      } else if (document.body.classList.contains('project-image-portrait-caption-style-offset')) {
        const sel = [
          '.project-slide-portrait .project-slide-image-container',
          '.project-slide-portrait .project-slide-description-wrapper',
          '.project-slide-square .project-slide-image-container',
          '.project-slide-square .project-slide-description-wrapper',
          '.project-slide-landscape',
          '.project-slide-video'
        ].join(',');
        slides = Array.prototype.map.call(document.querySelectorAll(sel), (slide) => {
          return slide;
        });
        // if just the landscape captions are offset
      } else if (document.body.classList.contains('project-image-landscape-caption-style-offset')) {
        const sel = [
          '.project-slide-landscape .project-slide-image-container',
          '.project-slide-landscape .project-slide-description-wrapper',
          '.project-slide-portrait',
          '.project-slide-square',
          '.project-slide-video .project-slide-video-wrapper',
          '.project-slide-video .project-slide-description-wrapper'
        ].join(',');
        slides = Array.prototype.map.call(document.querySelectorAll(sel), (slide) => {
          return slide;
        });
        // all slides
      } else {
        slides = Array.prototype.map.call(document.querySelectorAll('.project-slide'), (slide) => {
          return slide;
        });
      }
    } else {
      slides = Array.prototype.map.call(document.querySelectorAll('.project-slide'), (slide) => {
        return slide;
      });
    }

    return slides;
  };

  const isElementInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    const viewportVisibleArea = Math.round(window.innerHeight / 1.1);

    return (
      (rect.top >= 0 && rect.top <= viewportVisibleArea) ||
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  const slideIntoView = () => {
    let inView;

    slidesToAnimate.forEach((slide, index, arr) => {
      inView = isElementInViewport(slide);
      if (inView && !slide.classList.contains('already-animated')) {
        slide.classList.add('slide-in');
        slide.classList.add('already-animated');
        slidesToAnimate.splice(index, 1);
        return;
      }
    });
  };

  const loadAllImages = () => {
    images.forEach((img) => {
      core.ImageLoader.load(img, {
        load: true
      });
    });

    // Call this function only after the first image has loaded
    slideIntoView();
  };

  // Pass it a child of the image wrapper - the fn will get the closest wrapper
  const setMaxWidthOnImgWrapper = (img) => {
    // Doing this requires putting !important on max-width on image-wrapper
    const imgContainer = util.getClosest(img, '.project-slide-image-container');
    const dimensions = imgContainer.getAttribute('data-image-dimensions').split('x');
    const imgWrapper = util.getClosest(img, '.project-slide-image-wrapper');
    if (window.getComputedStyle(imgWrapper).maxWidth === 'none') {
      imgWrapper.style.maxWidth = Math.min(dimensions[0], 2500) + 'px';
    }
    if (window.getComputedStyle(imgWrapper).maxHeight === 'none') {
      imgWrapper.style.maxHeight = dimensions[1] + 'px';
    }
  };

  // Loads first image on page before downloading all images
  const loadFirstImage = (e) => {
    const firstSlide = allSlides[0];
    firstSlide.className += (' ' + addAspectRatioClass(firstImage));
    // Sets an even/odd class on Portraits if Stagger Portraits is checked
    if (firstSlide.classList.contains('project-slide-staggerable')) {
      staggerables.push(firstSlide);
      firstSlide.classList.add('portrait-caption-alternate-odd');
    }

    setMaxWidthOnImgWrapper(firstImage);

    core.ImageLoader.load(firstImage, {
      load: true
    });
  };

  // When image is loaded, remove the .not-ready animation class
  const removeImgLoadingClass = (e) => {
    e.target.parentNode.classList.remove('not-ready');
  };

  // Reload video thumbnails on window resize
  function resizeVideoThumbs() {
    util.reloadImages(document.querySelectorAll('.project-slide-video-wrapper img[data-src]'), {
      load: true,
      mode: 'fill'
    });
  }

  const resizeProjectImages = () => {
    util.reloadImages(document.querySelectorAll('.project-slide-image'), {
      load: true
    });
    util.reloadImages(document.querySelectorAll('img.custom-fallback-image'), { load: true });
  };

  const setSlideClasses = (img) => {
    const parentSlide = util.getClosest(img, '.project-slide');
    parentSlide.className += (' ' + addAspectRatioClass(img));
    // Sets an even/odd class on Portraits if Stagger Portraits is checked
    if (parentSlide.classList.contains('project-slide-staggerable')) {
      staggerables.push(parentSlide);
      if (staggerables.length % 2 === 0 ) {
        parentSlide.classList.add('portrait-caption-alternate-even');
      } else {
        parentSlide.classList.add('portrait-caption-alternate-odd');
      }
    }
  };

  // For Project Videos - this grabs the embedded iframe's height and width and then
  // sets a max-width on the video wrapper.
  const setVideoWidth = () => {
    const videoWrapperSel = '.project-slide-video-wrapper .sqs-video-wrapper';
    const videos = Array.prototype.map.call(document.querySelectorAll(videoWrapperSel), (vid) => {
      return vid;
    });

    const videoThumbnailSel = '.project-slide-video-wrapper img[data-src]';
    const videoThumbnails = Array.prototype.map.call(document.querySelectorAll(videoThumbnailSel), (thumb) => {
      return thumb;
    });

    videos.forEach((video, index) => {
      const string = video.getAttribute('data-html');
      const dum = document.createElement('div');
      dum.innerHTML = string;
      const iframe = dum.firstChild;
      const width = iframe.getAttribute('width');
      video.parentNode.style.maxWidth = width + 'px';
    });

    videoThumbnails.forEach((thumb, index) => {
      const parentSlide = util.getClosest(thumb, '.project-slide');
      parentSlide.className += (' ' + addAspectRatioClass(thumb));
      core.ImageLoader.load(thumb, {
        load: true,
        mode: 'fill'
      });
    });
  };

  /* Sync and Destroy */
  const sync = () => {
    images.forEach((img) => {
      img.addEventListener('load', removeImgLoadingClass);
      setSlideClasses(img);
      setMaxWidthOnImgWrapper(img);
    });

    if (firstImage) {
      loadFirstImage();
      firstImage.addEventListener('load', loadAllImages);
    }

    slidesToAnimate = getSlidesToAnimate();
    if (slidesToAnimate.length) {
      slidesToAnimate[0].classList.add('slide-in');
    }

    setVideoWidth();
    collapseLandscapeSpacing();

    window.addEventListener('resize', resizeVideoThumbs);
    window.addEventListener('resize', resizeProjectImages);
    window.addEventListener('scroll', slideIntoView);

  };

  const destroy = () => {
    window.removeEventListener('resize', resizeVideoThumbs);
    window.removeEventListener('resize', resizeProjectImages);
    window.removeEventListener('scroll', slideIntoView);
    if (firstImage) {
      firstImage.removeEventListener('load', loadAllImages);
    }
    images.forEach((img) => {
      img.removeEventListener('load', removeImgLoadingClass);
    });
  };

  /* Tweak Watchers */

  // Reload portrait and square images when allowed full width
  core.Tweak.watch('allow-full-width-portrait', (tweak) => {
    Array.prototype.forEach.call(document.querySelectorAll('img[data-src]'), (img) => {
      core.ImageLoader.load(img, { load: true });
    });
  });

  // Caption Style tweak watcher
  core.Tweak.watch(captionTweaks, (tweak) => {
    const animatedSlides = [].slice.call(document.querySelectorAll('.slide-in'));
    animatedSlides.forEach((slide) => {
      slide.classList.remove('slide-in');
    });
    slidesToAnimate = getSlidesToAnimate();
    slidesToAnimate.forEach((slide, index, arr) => {
      const inView = isElementInViewport(slide);
      if (inView && !slide.classList.contains('already-animated')) {
        slide.classList.add('slide-in');
        return;
      }
    });

    util.reloadImages(document.querySelectorAll('img[data-src]'), {
      load: true
    });
  });

  core.Tweak.watch(['collapse-landscape-spacing', 'show-project-captions'], collapseLandscapeSpacing);

  // Cascade Images and Captions tweak watcher
  core.Tweak.watch(['tweak-project-slide-transition'], (tweak) => {
    slidesToAnimate = getSlidesToAnimate();
    const animatedSlides = [].slice.call(document.querySelectorAll('.already-animated'));
    animatedSlides.forEach((slide) => {
      slide.classList.add('slide-in');
    });
  });

  sync();

  return {
    sync,
    destroy
  };

}


module.exports = ProjectController;
