
const wallpapers = [
  "assets/wallpapers/wall1.jpg",
  "assets/wallpapers/wall2.jpg",
  "assets/wallpapers/wall3.jpg"
];
function setWallpaper(index) {
  document.getElementById('desktop').style.backgroundImage = 'url(' + wallpapers[index] + ')';
}
window.onload = () => setWallpaper(0);
