document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("videoPlayer");
  const modalImage = document.getElementById("modalImage"); // Target the new image tag
  const closeBtn = document.querySelector(".close-btn");
  const thumbnails = document.querySelectorAll(".video-thumb");
  const videoCaption = document.getElementById("videoCaption");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0; // Track the index of the currently displayed thumbnail

  // Smart update function that handles both videos and images
  function updateModalMedia(index) {
    const thumb = thumbnails[index];
    const mediaType = thumb.getAttribute("data-type");
    const mediaSource = thumb.getAttribute("data-video-id");
    const captionText = thumb.getAttribute("data-caption");

    // 1. Clear out previous primary elements to prevent overlapping data
    iframe.src = "";
    modalImage.src = "";
    videoCaption.innerHTML = captionText;

    // 2. Safely clear any dynamic extra media elements generated on a previous click
    const oldExtras = modal.querySelectorAll(".modal-extra-media");
    oldExtras.forEach(el => el.remove());

    // 3. Split the media sources by commas and clean up extra spaces
    const mediaFiles = mediaSource.split(",").map(file => file.trim());
    const primaryFile = mediaFiles[0];

    // 4. Handle the PRIMARY media item (Image or YouTube Video)
const videoContainer = modal.querySelector(".video-container");

if (mediaType === "video") {
    // Enable 16:9 video layout
    videoContainer.classList.add("has-video");
    videoContainer.classList.remove("has-image");
    
    iframe.src = `https://www.youtube.com/embed/${primaryFile}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}`;
    iframe.style.display = "block";
    modalImage.style.display = "none";
} else if (mediaType === "image") {
    // Disable 16:9 padding so the GIF flows naturally above the text
    videoContainer.classList.add("has-image");
    videoContainer.classList.remove("has-video");
    
    modalImage.src = primaryFile;
    modalImage.style.display = "block";
    iframe.style.display = "none";
}
    // 5. Handle EXTRA media items if they exist, stacking them right above the caption
    if (mediaFiles.length > 1) {
      for (let i = 1; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];

        // Detect if the extra media is a YouTube ID (no extension) or a traditional video file
        const isYoutube = !file.includes(".") || file.includes("youtube.com") || file.includes("youtu.be");
        const isNativeVideo = file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".ogg");

        if (isYoutube) {
          // Create an extra responsive container + iframe for an extra YouTube video
          const videoContainer = document.createElement("div");
          videoContainer.className = "video-container modal-extra-media";
          videoContainer.style.marginTop = "20px";

          const extraIframe = document.createElement("iframe");
          extraIframe.src = `https://www.youtube.com/embed/${file}?origin=${window.location.origin}`;
          extraIframe.frameBorder = "0";
          extraIframe.allow = "autoplay; encrypted-media";
          extraIframe.allowFullscreen = true;

          videoContainer.appendChild(extraIframe);
          videoCaption.parentNode.insertBefore(videoContainer, videoCaption);

        } else if (isNativeVideo) {
          // Create an extra HTML5 native video player tag
          const extraVideo = document.createElement("video");
          extraVideo.src = file;
          extraVideo.controls = true;
          extraVideo.className = "modal-extra-media";
          extraVideo.style.cssText = "width: 100%; max-width: 900px; display: block; margin: 20px auto 0 auto; border-radius: 8px;";
          
          videoCaption.parentNode.insertBefore(extraVideo, videoCaption);

        } else {
          // Default: Create an extra image tag that mirrors your CSS #modalImage properties
          const extraImg = document.createElement("img");
          extraImg.src = file;
          extraImg.className = "modal-extra-media";
          extraImg.style.cssText = "width: 100%; max-width: 900px; max-height: 700px; display: block; margin: 20px auto 0 auto; object-fit: contain; border-radius: 8px;";
          
          videoCaption.parentNode.insertBefore(extraImg, videoCaption);
        }
      }
    }
  }

  // Open Modal
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      currentIndex = index;
      updateModalMedia(currentIndex);
      modal.style.display = "flex";
    });
  });

  // Next and Prev controls stay exactly the same!
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % thumbnails.length;
    updateModalMedia(currentIndex);
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    updateModalMedia(currentIndex);
  });

  // Close Modal cleanup
  function closeModal() {
    modal.style.display = "none";
    iframe.src = ""; 
    modalImage.src = "";
    videoCaption.innerHTML = "";
    
    // Clear out extra elements on close to prevent ghost media sounds or artifacts
    const oldExtras = modal.querySelectorAll(".modal-extra-media");
    oldExtras.forEach(el => el.remove());
  }

  closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) { closeModal(); }
  });
});