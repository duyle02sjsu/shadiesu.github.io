document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("videoPlayer");
  const modalImage = document.getElementById("modalImage");
  const closeBtn = document.querySelector(".close-btn");
  const thumbnails = document.querySelectorAll(".video-thumb");
  const videoCaption = document.getElementById("videoCaption");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0;

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

    // 3. Split media files
    const mediaFiles = mediaSource.split(",").map(file => file.trim()).filter(Boolean);
    const primaryFile = mediaFiles[0] || "";

    // 4. Handle PRIMARY media item layout
    const videoContainer = modal.querySelector(".video-container");

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
      modalImage.style.display = "block";
      iframe.style.display = "none";
    }

    // 5. Handle EXTRA media items
    if (mediaFiles.length > 1) {
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
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) { closeModal(); }
  });

  // Keyboard controls (Escape to close, Arrow keys to navigate)
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    }
  });
});