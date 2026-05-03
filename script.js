const API_URL = "https://backend-1-3kaz.onrender.com"; // Use localhost for local development
// const API_URL = "https://backend-6zpj.onrender.com"; // Use this when deployed
let cart = JSON.parse(localStorage.getItem('cart')) || [];


async function displayProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        const products = await res.json();

        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach(p => {
            container.innerHTML += `
                <div class="product">
                    <img src="${p.image || 'https://via.placeholder.com/300'}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p>₹${p.price}</p>
                    <p>${p.desc}</p>
                    <button onclick="addToCart('${p._id}')">Add to Cart</button>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

function addToCart(id) {
    fetch(`${API_URL}/api/products`)
        .then(res => res.json())
        .then(products => {
            const item = products.find(p => p._id === id);
            if (item) {
                cart.push(item);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
                viewcartlink();
            }
        });
}


const logoutbtn = document.getElementById("logoutbtn");
if (logoutbtn) {
    logoutbtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem('cart'); // Clear cart on logout
        alert("Logged out successfully!");
        window.location.href = "index.html";
    });
}

async function checkout() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const pincode = document.getElementById("pincode").value;

    if (!address || !city || !pincode) {
        alert("Please fill in all shipping details (address, city, and pincode).");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                products: cart.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: 1 // Assuming quantity 1 for now as per current cart logic
                })),
                total: cart.reduce((sum, p) => sum + p.price, 0),
                address: address,
                city: city,
                pincode: pincode
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Order placed successfully!");
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            window.location.href = "index.html";
        } else {
            alert("Failed to place order: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("An error occurred during checkout. Please try again.");
    }
}

// Call the function to load products on page load
if (document.getElementById("products")) {
    displayProducts();
}
updateCart();
viewcartlink();

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem("userName");
    const token = localStorage.getItem("token");
    const loginbtn = document.getElementById("loginbtn");
    const logoutbtn = document.getElementById("logoutbtn");

    if (userName && token) {
        if (loginbtn) {
            loginbtn.innerHTML = `Welcome, ${userName}`;
            // Change the parent link behavior if needed, or just keep it
            const parentLink = loginbtn.closest('a');
            if (parentLink) parentLink.href = "#"; 
        }
        if (logoutbtn) {
            logoutbtn.style.display = "block";
        }
    } else {
        if (logoutbtn) {
            logoutbtn.style.display = "none";
        }
        if (loginbtn) {
            loginbtn.innerHTML = "Login";
        }
    }
});

async function register() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!nameInput || !emailInput || !passwordInput) return;

    const nameVal = nameInput.value;
    const emailVal = emailInput.value;
    const passwordVal = passwordInput.value;

    if (!nameVal || !emailVal || !passwordVal) {
        alert("Please fill all fields for registration.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: nameVal,
                email: emailVal,
                password: passwordVal
            })
        });

        if (res.ok) {
            localStorage.setItem("userName", nameVal); // Save name for display
            alert("Registered successfully!");
            window.location.href = "index.html";
        } else {
            const data = await res.json();
            alert("Registration failed: " + (data.message || JSON.stringify(data)));
        }
    } catch (err) {
        console.error(err);
        alert("Server error during registration");
    }
}

async function login() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!emailInput || !passwordInput) return;

    const emailVal = emailInput.value;
    const passwordVal = passwordInput.value;

    if (!emailVal || !passwordVal) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailVal,
                password: passwordVal
            })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.user.name);
            alert("Logged in successfully!");
            window.location.href = "index.html";
        } else {
            alert("Login failed: " + (data.message || data || "Invalid credentials"));
        }

    } catch (err) {
        console.error(err);
        alert("Server error during login");
    }
}


function updateCart() {
    const cartCount = document.getElementById("cart-count");
    const cartItemsList = document.getElementById("cart-items");
    const totalSpan = document.getElementById("total");

    if (cartCount) cartCount.innerText = cart.length;

    if (cartItemsList) {
        cartItemsList.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            total += item.price;
            cartItemsList.innerHTML += `<li><span>${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}</span><span>${item.name}</span><span id="item-price">₹${item.price}</span><button onclick="removeFromCart('${item._id}')">--</button></li>`;
        });

        if (totalSpan) totalSpan.innerText = total;
    }
    viewcartlink();
}
removeFromCart = (id) => {
    cart = cart.filter(item => item._id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    viewcartlink();
}
function viewcartlink() {

    const viewcartlink = document.getElementById("view-cart-link");
    if (cart.length > 0 && viewcartlink) {
        viewcartlink.style.display = "block";
    }
}




