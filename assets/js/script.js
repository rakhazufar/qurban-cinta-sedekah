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

    // Navbar Scroll Highlight using IntersectionObserver (Performance optimized)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Checkout Modal Logic
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const paket = button.getAttribute('data-paket');
            const bobot = button.getAttribute('data-bobot');
            const harga = button.getAttribute('data-harga');
            const image = button.getAttribute('data-image');

            const modalAnimalImg = checkoutModal.querySelector('#modalAnimalImg');
            const modalPaketTitle = checkoutModal.querySelector('#modalPaketTitle');
            const modalBobot = checkoutModal.querySelector('#modalBobot');
            const modalHarga = checkoutModal.querySelector('#modalHarga');
            const inputPaket = checkoutModal.querySelector('#inputPaket');

            modalAnimalImg.src = image;
            modalPaketTitle.textContent = paket;
            modalBobot.textContent = `Bobot: ${bobot}`;
            modalHarga.textContent = harga;
            inputPaket.value = paket;

            // Reset quantity to 1 when modal opens
            const displayJumlah = document.getElementById('displayJumlah');
            const inputJumlah = document.getElementById('inputJumlah');
            displayJumlah.textContent = '1';
            inputJumlah.value = '1';
        });
    }

    // Quantity Counter Logic
    const btnMinus = document.getElementById('btnMinus');
    const btnPlus = document.getElementById('btnPlus');
    const displayJumlah = document.getElementById('displayJumlah');
    const inputJumlah = document.getElementById('inputJumlah');

    if (btnMinus && btnPlus && displayJumlah && inputJumlah) {
        btnPlus.addEventListener('click', function () {
            let current = parseInt(inputJumlah.value);
            current++;
            inputJumlah.value = current;
            displayJumlah.textContent = current;
        });

        btnMinus.addEventListener('click', function () {
            let current = parseInt(inputJumlah.value);
            if (current > 1) {
                current--;
                inputJumlah.value = current;
                displayJumlah.textContent = current;
            }
        });
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nama = document.getElementById('inputNama').value;
            const wa = document.getElementById('inputWA').value;
            const alamat = document.getElementById('inputAlamat').value;
            const paket = document.getElementById('inputPaket').value;
            const jumlah = document.getElementById('inputJumlah').value;

            const message = `Assalamu'alaikum, saya ingin memesan Hewan Qurban.\n\nNama: ${nama}\nNo. WhatsApp: ${wa}\nAlamat: ${alamat}\nPaket: ${paket}\nJumlah Pemesan: ${jumlah}\n\nMohon informasi lebih lanjut. Jazakallah khayran.`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/628125000170?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }
});
