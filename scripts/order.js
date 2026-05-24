const fs = require('fs');
const path = require('path');

// helper module for working with the orders file.  This module exports a
// handful of plain functions; the caller (typically server.cjs) is
// responsible for wiring them into whatever routing framework it uses.

const ordersFile = path.join(__dirname, '..', 'orders.txt');

function saveOrder({ name, food, quantity }) {
    const line = `${name} ordered ${food} (${quantity})\n`;
    return new Promise((resolve, reject) => {
        fs.appendFile(ordersFile, line, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function readAllOrders() {
    return new Promise((resolve, reject) => {
        fs.readFile(ordersFile, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

function streamOrdersStream(destination) {
    // destination can be a writable stream (e.g. an HTTP response)
    const stream = fs.createReadStream(ordersFile, { encoding: 'utf8' });
    stream.pipe(destination);
    return stream; // caller may listen for errors
}

// if executed in a browser, wire up the quick-order form
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // helper that attaches the submit listener if the form is present
    function attachListener() {
        const orderForm = document.querySelector('.order-form');
        if (!orderForm) return;

        orderForm.addEventListener('submit', evt => {
            evt.preventDefault();
            const formData = new FormData(orderForm);

            // convert to urlencoded string so express.urlencoded can parse it
            const params = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }

            fetch('/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            })
            .then(res => res.text())
            .then(text => {
                alert(text);
                orderForm.reset();
            })
            .catch(err => {
                console.error('Order request failed', err);
                alert('Failed to place order');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachListener);
    } else {
        attachListener();
    }
}

module.exports = {
    saveOrder,
    readAllOrders,
    streamOrdersStream,
};
