document.addEventListener('DOMContentLoaded', function () {
    // Carousel Functionality
    const cards = document.querySelectorAll('.carousel-card');
    let current = 0;
    const total = cards.length;

    function setSlide(prev, next) {
        if (next >= total) next = 0;
        if (next < 0) next = total - 1;

        cards[prev].classList.remove('active');
        cards[next].classList.add('active');

        current = next;
    }

    const moveRight = document.getElementById('moveRight');
    const moveLeft = document.getElementById('moveLeft');

    if (moveRight) {
        moveRight.addEventListener('click', function () {
            setSlide(current, current + 1);
        });
    }

    if (moveLeft) {
        moveLeft.addEventListener('click', function () {
            setSlide(current, current - 1);
        });
    }

    // Swipe functionality for carousel
    let touchStartX = 0;
    let touchEndX = 0;
    const carousel = document.querySelector('.card-carousel');

    if (carousel) {
        carousel.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
        carousel.addEventListener('touchmove', e => touchEndX = e.changedTouches[0].screenX);
        carousel.addEventListener('touchend', () => {
            if (touchEndX < touchStartX - 50) setSlide(current, current + 1);
            if (touchEndX > touchStartX + 50) setSlide(current, current - 1);
        });
    }

    // Navbar Scroll Highlight Functionality
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Angka 100 ini buat jarak toleransi dari navbar (biar pas nyentuh atas langsung ganti)
            if (scrollY >= (sectionTop - 100)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            // Hapus warna hijau dari semua menu dulu
            link.classList.remove('active');
            // Kasih warna hijau ke menu yang href-nya sama dengan section yang lagi dilihat
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
});
