document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("videoPlayer");
  const closeBtn = document.querySelector(".close-btn");
  const thumbnails = document.querySelectorAll(".video-thumb");

  // Open Modal and Inject Video URL
  thumbnails.forEach(thumb => {
    thumb.addEventListener("click", () => {
      const videoId = thumb.getAttribute("data-video-id");
      // Adding autoplay=1 forces the player to start immediately
      iframe.src = `https://youtube.com{videoId}?autoplay=1&origin=${window.location.origin}`;
      modal.style.display = "flex";
    });
  });

  // Close Modal and Wipe Source URL to kill background playback
  function closeModal() {
    modal.style.display = "none";
    iframe.src = ""; 
  }

  closeBtn.addEventListener("click", closeModal);

  // Close Modal if user clicks outside of the video canvas
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});