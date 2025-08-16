const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');

let currentIndex = 0;

function updateCarousel() {
  const slideWidth = slides[0].getBoundingClientRect().width + 20; // largura + margin
  const maxIndex = slides.length - Math.floor(track.parentElement.offsetWidth / slideWidth);
  
  if(currentIndex > maxIndex) currentIndex = 0; // volta ao começo
  if(currentIndex < 0) currentIndex = maxIndex; // volta para o final
  
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

// Botões
nextButton.addEventListener('click', () => {
  currentIndex++;
  updateCarousel();
});

prevButton.addEventListener('click', () => {
  currentIndex--;
  updateCarousel();
});

updateCarousel();
window.addEventListener('resize', updateCarousel);
