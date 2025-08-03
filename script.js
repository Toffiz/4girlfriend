// Wait for page load, then start the beautiful flower animation
window.onload = () => {
  // Small delay to ensure everything is loaded
  const startAnimation = setTimeout(() => {
    // Remove the 'not-loaded' class to start all animations
    document.body.classList.remove("not-loaded");
    clearTimeout(startAnimation);
  }, 1000);
};