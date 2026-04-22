document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - script.js running');

    // ==========================================================================
    // 1. Gallery Carousel (Documentation Section)
    // ==========================================================================
    const cards = document.querySelectorAll('.carousel-card');
    const moveRight = document.getElementById('moveRight');
    const moveLeft = document.getElementById('moveLeft');
    const carousel = document.querySelector('.card-carousel');

    let currentSlide = 0;
    const totalSlides = cards.length;

    console.log('Carousel initialized with', totalSlides, 'slides');

    function setSlide(next) {
        if (totalSlides === 0) return;

        // Handle index wrapping
        let prev = currentSlide;
        if (next >= totalSlides) next = 0;
        if (next < 0) next = totalSlides - 1;

        console.log('Switching slide from', prev, 'to', next);

        cards[prev].classList.remove('active');
        cards[next].classList.add('active');

        currentSlide = next;
    }

    if (moveRight) {
        moveRight.addEventListener('click', () => setSlide(currentSlide + 1));
    }

    if (moveLeft) {
        moveLeft.addEventListener('click', () => setSlide(currentSlide - 1));
    }

    // Swipe functionality for carousel
    if (carousel) {
        let touchStartX = 0;
        let touchEndX = 0;
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) setSlide(currentSlide + 1);
            if (touchEndX > touchStartX + 50) setSlide(currentSlide - 1);
        }, { passive: true });
    }

    // ==========================================================================
    // 2. Navbar Scroll Highlight (IntersectionObserver)
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -40% 0px',
        threshold: [0, 0.25, 0.5]
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.classList.add('active');
                    } else if (href && href.startsWith('#')) {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // ==========================================================================
    // 3. Navbar Scroll Animation (Background & Shadow)
    // ==========================================================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('py-2', 'shadow');
                navbar.classList.remove('py-3', 'shadow-sm');
            } else {
                navbar.classList.add('py-3', 'shadow-sm');
                navbar.classList.remove('py-2', 'shadow');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Run once on load
    }

    // ==========================================================================
    // 4. Checkout Modal & Quantity logic
    // ==========================================================================
    function formatCurrency(amount) {
        return 'Rp. ' + parseInt(amount).toLocaleString('id-ID') + ',-';
    }

    const inputHarga = document.getElementById('inputHarga');
    const inputJumlah = document.getElementById('inputJumlah');
    const modalHargaDisplay = document.getElementById('modalHarga');

    function updateTotalDisplay() {
        if (inputHarga && inputJumlah && modalHargaDisplay) {
            const harga = parseInt(inputHarga.value) || 0;
            const jumlah = parseInt(inputJumlah.value) || 1;
            modalHargaDisplay.textContent = formatCurrency(harga * jumlah);
        }
    }

    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const productId = button.getAttribute('data-id');
            const paket = button.getAttribute('data-paket');
            const bobot = button.getAttribute('data-bobot');
            const harga = button.getAttribute('data-harga');
            const image = button.getAttribute('data-image');

            checkoutModal.querySelector('#modalAnimalImg').src = image;
            checkoutModal.querySelector('#modalPaketTitle').textContent = paket;
            checkoutModal.querySelector('#modalBobot').textContent = `Bobot: ${bobot}`;

            if (document.getElementById('inputProductId')) document.getElementById('inputProductId').value = productId;
            if (document.getElementById('inputPaket')) document.getElementById('inputPaket').value = paket;
            if (inputHarga) inputHarga.value = harga;

            const displayJumlah = document.getElementById('displayJumlah');
            if (displayJumlah) displayJumlah.textContent = '1';
            if (inputJumlah) inputJumlah.value = '1';

            updateTotalDisplay();
        });
    }

    const btnMinus = document.getElementById('btnMinus');
    const btnPlus = document.getElementById('btnPlus');
    const displayJumlah = document.getElementById('displayJumlah');

    if (btnMinus && btnPlus && displayJumlah && inputJumlah) {
        btnPlus.addEventListener('click', function () {
            let current = parseInt(inputJumlah.value);
            current++;
            inputJumlah.value = current;
            displayJumlah.textContent = current;
            updateTotalDisplay();
        });

        btnMinus.addEventListener('click', function () {
            let current = parseInt(inputJumlah.value);
            if (current > 1) {
                current--;
                inputJumlah.value = current;
                displayJumlah.textContent = current;
                updateTotalDisplay();
            }
        });
    }

    // ==========================================================================
    // 5. Midtrans Integration
    // ==========================================================================
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('inputNama');
            const phoneInput = document.getElementById('inputWA');
            const productIdInput = document.getElementById('inputProductId');
            const paketInput = document.getElementById('inputPaket');

            if (!nameInput || !phoneInput || !productIdInput || !paketInput || !inputHarga || !inputJumlah) return;

            const name = nameInput.value;
            const phone = phoneInput.value;
            const productId = productIdInput.value;
            const packageName = paketInput.value;
            const price = parseInt(inputHarga.value);
            const quantity = parseInt(inputJumlah.value);
            const amount = price * quantity;

            const product = { id: productId, name: packageName, price: price, quantity: quantity };

            if (!name || !phone || !amount || !product.id) {
                alert('Semua field harus diisi.');
                return;
            }

            const submitBtn = checkoutForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';

            // Backend requires these
            const email = 'customer@example.com';
            const address = '-';

            fetch('https://cintasedekah.org/generate-token-qurban.php', {
                method: 'POST',
                body: JSON.stringify({ name, email, phone, address, amount, product }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.error_messages) {
                        alert('Error: ' + data.error_messages.join(', '));
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                        return;
                    }

                    // Snap.js loaded in index.html
                    const snapCallbacks = {
                        onSuccess: function (result) {
                            const targetUrl = `thankyou.html?order_id=${result.order_id}&status=success&amount=${amount}&payment_type=${result.payment_type || 'Midtrans'}`;
                            window.location.href = targetUrl;
                        },
                        onPending: function (result) {
                            const targetUrl = `thankyou.html?order_id=${result.order_id}&status=pending&amount=${amount}&payment_type=${result.payment_type || 'Midtrans'}`;
                            window.location.href = targetUrl;
                        },
                        onError: function () {
                            alert('Pembayaran gagal. Silakan coba lagi.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalBtnText;
                        },
                        onClose: function () {
                            const wantToClose = confirm("Apakah Anda yakin ingin menutup jendela pembayaran ini?");
                            if (!wantToClose) {
                                // User clicked "No" (Cancel), so we re-open the Snap window
                                window.snap.pay(data.token, snapCallbacks);
                            } else {
                                // User clicked "Yes" (OK), so we just reset the button
                                submitBtn.disabled = false;
                                submitBtn.textContent = originalBtnText;
                            }
                        }
                    };

                    window.snap.pay(data.token, snapCallbacks);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan. Silakan coba lagi.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                });
        });
    }
});

// Helper Functions (Global)
function copyData() {
    const name = document.getElementById('confirmation-name').innerText;
    const amount = document.getElementById('confirmation-amount').innerText;
    const orderId = document.getElementById('order-id').innerText;
    const transactionTime = document.getElementById('transaction-time').innerText;

    const textToCopy = `Nama: ${name}\nJumlah Donasi: ${amount}\nOrder ID: ${orderId}\nWaktu Transaksi: ${transactionTime}`;
    navigator.clipboard.writeText(textToCopy).then(() => alert('Data disalin!'));
}

function closePopup() {
    const popup = document.getElementById('confirmation-popup');
    if (popup) popup.style.display = 'none';
}