document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const images = Array.from(carouselContainer.querySelectorAll('img'));
    let currentIndex = 0;

    // Ensure the container displays images side by side
    carouselContainer.style.display = 'flex';
    carouselContainer.style.transition = 'transform 0.5s ease-in-out';
    carouselContainer.style.overflow = 'hidden';

    // Set the width of the container to fit all images
    carouselContainer.style.width = `${images.length * 100}%`;

    const updateCarousel = () => {
        const offset = -currentIndex * (100 / images.length);
        carouselContainer.style.transform = `translateX(${offset}%)`;
    };

    const nextImage = () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    };

    // Start autoplay on page load
    setInterval(nextImage, 3000);

    // Ensure each image takes up 100% of the viewport width
    images.forEach(image => {
        image.style.flex = '0 0 auto';
        image.style.width = '100%';
        image.style.height = '100%';
        image.style.objectFit = 'cover';
    });

    // Add event listeners for manual controls (if any)
    const nextButton = document.querySelector('.next-button');
    const prevButton = document.querySelector('.prev-button');
    if (nextButton) {
        nextButton.addEventListener('click', nextImage);
    }
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel();
        });
    }
    
});