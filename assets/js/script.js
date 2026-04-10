document.addEventListener('DOMContentLoaded', function () {
    // ... (Existing Carousel, Observer, and Helper logic)

    // Helper: Slugify (to generate product ID)
    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    // Helper: Format Currency
    function formatCurrency(amount) {
        return 'Rp. ' + parseInt(amount).toLocaleString('id-ID') + ',-';
    }

    // Helper: Calculate and Update Total Display in Modal
    function updateTotalDisplay() {
        const harga = parseInt(document.getElementById('inputHarga').value) || 0;
        const jumlah = parseInt(document.getElementById('inputJumlah').value) || 1;
        const total = harga * jumlah;
        document.getElementById('modalHarga').textContent = formatCurrency(total);
    }

    // Checkout Modal Logic
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const productId = button.getAttribute('data-id');
            const paket = button.getAttribute('data-paket');
            const bobot = button.getAttribute('data-bobot');
            const harga = button.getAttribute('data-harga');
            const image = button.getAttribute('data-image');

            // Populate Modal UI
            checkoutModal.querySelector('#modalAnimalImg').src = image;
            checkoutModal.querySelector('#modalPaketTitle').textContent = paket;
            checkoutModal.querySelector('#modalBobot').textContent = `Bobot: ${bobot}`;
            document.getElementById('inputProductId').value = productId;
            document.getElementById('inputPaket').value = paket;
            document.getElementById('inputHarga').value = harga;

            // Reset quantity to 1
            document.getElementById('displayJumlah').textContent = '1';
            document.getElementById('inputJumlah').value = '1';

            updateTotalDisplay();
        });
    }

    // Quantity Control
    const btnMinus = document.getElementById('btnMinus');
    const btnPlus = document.getElementById('btnPlus');
    const inputJumlah = document.getElementById('inputJumlah');
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

    // Form Submission with Midtrans Snap
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('inputNama').value;
            const email = document.getElementById('inputEmail').value;
            const phone = document.getElementById('inputWA').value;
            const address = document.getElementById('inputAlamat').value;
            const productId = document.getElementById('inputProductId').value;
            const packageName = document.getElementById('inputPaket').value;
            const price = parseInt(document.getElementById('inputHarga').value);
            const quantity = parseInt(document.getElementById('inputJumlah').value);
            const amount = price * quantity;

            // Prepare Structured Product Data
            const product = {
                id: productId,
                name: packageName,
                price: price,
                quantity: quantity
            };

            if (!name || !email || !phone || !address || !amount || !product.id) {
                alert('Semua field harus diisi.');
                return;
            }

            const submitBtn = checkoutForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';

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

                    snap.pay(data.token, {
                        onSuccess: function (result) {
                            const transactionTime = new Date().toLocaleString('id-ID', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                            });

                            const modalInstance = bootstrap.Modal.getInstance(checkoutModal);
                            if (modalInstance) modalInstance.hide();

                            document.getElementById('confirmation-name').textContent = name;
                            document.getElementById('confirmation-amount').textContent = formatCurrency(amount);
                            document.getElementById('order-id').textContent = result.order_id;
                            document.getElementById('transaction-time').textContent = transactionTime;
                            document.getElementById('confirmation-popup').style.display = 'block';

                            submitBtn.disabled = false;
                            submitBtn.textContent = originalBtnText;
                        },
                        onPending: function (result) {
                            alert('Pembayaran pending. Silakan selesaikan pembayaran.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalBtnText;
                        },
                        onError: function (result) {
                            alert('Pembayaran gagal. Silakan coba lagi.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalBtnText;
                        },
                        onClose: function () {
                            alert('Pop-up ditutup tanpa menyelesaikan pembayaran.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalBtnText;
                        }
                    });
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

// Confirmation Popup Handlers
function copyData() {
    const name = document.getElementById('confirmation-name').innerText;
    const amount = document.getElementById('confirmation-amount').innerText;
    const orderId = document.getElementById('order-id').innerText;
    const transactionTime = document.getElementById('transaction-time').innerText;

    const textToCopy = `Nama: ${name}\nJumlah Donasi: ${amount}\nOrder ID: ${orderId}\nWaktu Transaksi: ${transactionTime}`;
    navigator.clipboard.writeText(textToCopy).then(() => alert('Data disalin!'));
}

function closePopup() {
    document.getElementById('confirmation-popup').style.display = 'none';
}
