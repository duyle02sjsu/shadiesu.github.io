document.addEventListener("DOMContentLoaded", () => {
  const originalNavigation = document.querySelector(".top-header");
  const stickyHeader = document.querySelector(".site-header");

  if (originalNavigation && stickyHeader) {
    const navigationObserver = new IntersectionObserver(([entry]) => {
      const shouldShowStickyHeader = !entry.isIntersecting;
      stickyHeader.classList.toggle("is-visible", shouldShowStickyHeader);
      stickyHeader.setAttribute("aria-hidden", String(!shouldShowStickyHeader));
      stickyHeader.inert = !shouldShowStickyHeader;
    });

    navigationObserver.observe(originalNavigation);
  }

  const transitionKey = "__portfolio_page_transition__:";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    if (window.name.startsWith(transitionKey)) {
      window.name = window.name.slice(transitionKey.length);
      document.body.classList.add("page-entering");
      window.setTimeout(() => document.body.classList.remove("page-entering"), 260);
    }

    document.addEventListener("click", event => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;

      event.preventDefault();
      window.name = `${transitionKey}${window.name}`;
      document.body.classList.add("page-leaving");
      window.setTimeout(() => window.location.assign(destination.href), 180);
    });
  }

  const modal = document.getElementById("videoModal");
  if (!modal) return;

  const iframe = document.getElementById("videoPlayer");
  const modalImage = document.getElementById("modalImage");
  const closeBtn = document.querySelector(".close-btn");
  const thumbnails = document.querySelectorAll(".video-thumb");
  const videoCaption = document.getElementById("videoCaption");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0;
  let activeGalleryFiles = [];
  let activeGalleryIndex = 0;

  modalImage.tabIndex = 0;
  modalImage.addEventListener("click", () => modalImage.focus());

  function setGalleryImage(index) {
    if (activeGalleryFiles.length === 0) return;

    activeGalleryIndex = (index + activeGalleryFiles.length) % activeGalleryFiles.length;
    modalImage.src = activeGalleryFiles[activeGalleryIndex];
    modalImage.alt = `${thumbnails[currentIndex].getAttribute("data-hover-text") || "Project"} image ${activeGalleryIndex + 1} of ${activeGalleryFiles.length}`;

    const counter = modal.querySelector(".gallery-carousel-counter");
    if (counter) counter.textContent = `${activeGalleryIndex + 1} / ${activeGalleryFiles.length}`;
  }

  // Smart update function handling videos, images, and layout classes
  function updateModalMedia(index) {
    const thumb = thumbnails[index];
    if (!thumb) return;

    const mediaType = thumb.getAttribute("data-type");
    const mediaSource = thumb.getAttribute("data-video-id") || "";
    const captionText = thumb.getAttribute("data-caption") || "";

    // 1. Reset primary elements
    iframe.src = "";
    modalImage.src = "";
    videoCaption.innerHTML = captionText;

    // 2. Clear out extra media generated on previous view
    const oldExtras = modal.querySelectorAll(".modal-extra-media");
    oldExtras.forEach(el => el.remove());
    const oldCarouselControls = modal.querySelectorAll(".gallery-carousel-controls");
    oldCarouselControls.forEach(el => el.remove());

    // 3. Split media files
    const mediaFiles = mediaSource.split(",").map(file => file.trim()).filter(Boolean);
    const primaryFile = mediaFiles[0] || "";

    // 4. Handle PRIMARY media item layout
    const videoContainer = modal.querySelector(".video-container");
    const modalContent = modal.querySelector(".modal-content");
    const hasImageCarousel = thumb.hasAttribute("data-gallery-carousel");
    activeGalleryFiles = hasImageCarousel ? mediaFiles : [];
    activeGalleryIndex = 0;
    modalContent.classList.toggle("has-large-images", thumb.hasAttribute("data-modal-large-images"));
    modalContent.classList.toggle("is-compact-gallery", thumb.hasAttribute("data-compact-gallery"));
    modalContent.classList.toggle("has-image-carousel", hasImageCarousel);

    if (mediaType === "video") {
      videoContainer.classList.add("has-video");
      videoContainer.classList.remove("has-image");
      
      iframe.src = `https://www.youtube.com/embed/${primaryFile}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}`;
      iframe.style.display = "block";
      modalImage.style.display = "none";
    } else if (mediaType === "image") {
      videoContainer.classList.add("has-image");
      videoContainer.classList.remove("has-video");
      
      modalImage.src = primaryFile;
      const thumbnailImage = thumb.querySelector("img");
      modalImage.alt = thumbnailImage ? thumbnailImage.alt : "";
      modalImage.style.display = "block";
      iframe.style.display = "none";

      if (hasImageCarousel) {
        modalImage.alt = `${thumb.getAttribute("data-hover-text") || "Project"} image 1 of ${mediaFiles.length}`;

        const controls = document.createElement("div");
        controls.className = "gallery-carousel-controls";

        const previousImage = document.createElement("button");
        previousImage.type = "button";
        previousImage.className = "gallery-carousel-button";
        previousImage.setAttribute("aria-label", "Previous image");
        previousImage.textContent = "Previous";
        previousImage.addEventListener("click", () => setGalleryImage(activeGalleryIndex - 1));

        const counter = document.createElement("span");
        counter.className = "gallery-carousel-counter";
        counter.setAttribute("aria-live", "polite");
        counter.textContent = `1 / ${mediaFiles.length}`;

        const nextImage = document.createElement("button");
        nextImage.type = "button";
        nextImage.className = "gallery-carousel-button";
        nextImage.setAttribute("aria-label", "Next image");
        nextImage.textContent = "Next";
        nextImage.addEventListener("click", () => setGalleryImage(activeGalleryIndex + 1));

        controls.append(previousImage, counter, nextImage);
        videoCaption.parentNode.insertBefore(controls, videoCaption);
      }
    }

    // 5. Handle EXTRA media items
    if (mediaFiles.length > 1 && !hasImageCarousel) {
      for (let i = 1; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];

        const isYoutube = !file.includes(".") || file.includes("youtube.com") || file.includes("youtu.be");
        const isNativeVideo = file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".ogg");

        if (isYoutube) {
          const extraContainer = document.createElement("div");
          extraContainer.className = "video-container modal-extra-media";
          extraContainer.style.marginTop = "20px";

          const extraIframe = document.createElement("iframe");
          extraIframe.src = `https://www.youtube.com/embed/${file}?origin=${encodeURIComponent(window.location.origin)}`;
          extraIframe.frameBorder = "0";
          extraIframe.allow = "autoplay; encrypted-media";
          extraIframe.allowFullscreen = true;

          extraContainer.appendChild(extraIframe);
          videoCaption.parentNode.insertBefore(extraContainer, videoCaption);

        } else if (isNativeVideo) {
          const extraVideo = document.createElement("video");
          extraVideo.src = file;
          extraVideo.controls = true;
          extraVideo.className = "modal-extra-media";
          extraVideo.style.cssText = "width: 100%; max-width: 900px; display: block; margin: 20px auto 0 auto; border-radius: 8px;";
          
          videoCaption.parentNode.insertBefore(extraVideo, videoCaption);

        } else {
          const extraImg = document.createElement("img");
          extraImg.src = file;
          extraImg.className = "modal-extra-media";
          extraImg.alt = `${thumb.getAttribute("data-hover-text") || "Project"} image ${i + 1}`;
          extraImg.loading = "lazy";
          
          videoCaption.parentNode.insertBefore(extraImg, videoCaption);
        }
      }
    }
  }

  // Smooth Fade Navigation Helper
  function switchMediaWithFade(nextIndex) {
    const mediaElements = modal.querySelectorAll("#modalImage, #videoPlayer, .modal-extra-media");
    
    // Fade out current content
    mediaElements.forEach(el => el.classList.add("fade-out"));

    // Wait 300ms for fade out to complete before swapping content
    setTimeout(() => {
      currentIndex = nextIndex;
      updateModalMedia(currentIndex);

      // Select new content and fade back in
      const newMediaElements = modal.querySelectorAll("#modalImage, #videoPlayer, .modal-extra-media");
      newMediaElements.forEach(el => el.classList.add("fade-out"));

      requestAnimationFrame(() => {
        newMediaElements.forEach(el => el.classList.remove("fade-out"));
      });
    }, 400);
  }

  // Next & Prev controls using fade
  function showNext() {
    if (thumbnails.length === 0) return;
    const nextIndex = (currentIndex + 1) % thumbnails.length;
    switchMediaWithFade(nextIndex);
  }

  function showPrev() {
    if (thumbnails.length === 0) return;
    const prevIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    switchMediaWithFade(prevIndex);
  }

  // Open Modal
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      currentIndex = index;
      updateModalMedia(currentIndex);
      
      const mediaElements = modal.querySelectorAll("#modalImage, #videoPlayer, .modal-extra-media");
      mediaElements.forEach(el => el.classList.remove("fade-out"));

      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // Event Listeners for Navigation Buttons
  if (nextBtn) nextBtn.addEventListener("click", showNext);
  if (prevBtn) prevBtn.addEventListener("click", showPrev);

  // Close Modal cleanup
  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    iframe.src = ""; 
    modalImage.src = "";
    videoCaption.innerHTML = "";
    
    const oldExtras = modal.querySelectorAll(".modal-extra-media");
    oldExtras.forEach(el => el.remove());
    const oldCarouselControls = modal.querySelectorAll(".gallery-carousel-controls");
    oldCarouselControls.forEach(el => el.remove());
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) { closeModal(); }
  });

  // Keyboard controls (Escape to close, Arrow keys to navigate)
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") {
        if (activeGalleryFiles.length && document.activeElement === modalImage) {
          e.preventDefault();
          setGalleryImage(activeGalleryIndex + 1);
        }
        else showNext();
      }
      if (e.key === "ArrowLeft") {
        if (activeGalleryFiles.length && document.activeElement === modalImage) {
          e.preventDefault();
          setGalleryImage(activeGalleryIndex - 1);
        }
        else showPrev();
      }
    }
  });
});