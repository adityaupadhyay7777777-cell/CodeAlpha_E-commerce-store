const API_URL = "https://backend-1-3kaz.onrender.com"; // Use localhost for local development
// const API_URL = "https://backend-6zpj.onrender.com"; // Use this when deployed
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const nameInput = document.getElementById("name");


async function displayProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        const products = await res.json();

        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach(p => {
            container.innerHTML += `
                <div class="product">
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
            }
        });
}

function updateCart() {
    document.getElementById("cart-count").innerText = cart.length;

    const list = document.getElementById("cart-items");
    list.innerHTML = "";

    let total = 0;
    cart.forEach(item => {
        total += item.price;
        list.innerHTML += `<li>${item.name} - ₹${item.price}</li>`;
    });

    document.getElementById("total").innerText = total;
}

function toggleCart() {
    document.getElementById("cart").classList.toggle("hidden");
}
document.getElementById("cart").addEventListener("click", e => e.stopPropagation());
document.getElementById("cart-icon").addEventListener("click", e => {
    
    e.stopPropagation();
    toggleCart();
    document.getElementById("cart").classList.toggle("hidden");
    
});
document.addEventListener("click", () => {
    document.getElementById("cart").classList.add("hidden");
});
async function checkout() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first!");
        return;
    }

    await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            userId: "123", // In a real app, you'd use the logged-in user ID
            products: cart,
            total: cart.reduce((sum, p) => sum + p.price, 0)
        })
    });

    alert("Order placed!");
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Call the function to load products on page load
displayProducts();
updateCart();
async function register() {
    const nameVal = document.getElementById('name').value;
    const emailVal = document.getElementById('email').value;
    const passwordVal = document.getElementById('password').value;

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
            alert("Registered successfully!");
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
    const emailVal = document.getElementById('email').value;
    const passwordVal = document.getElementById('password').value;

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
            alert("Logged in successfully!");
        } else {
            alert("Login failed: " + (data.message || data || "Invalid credentials"));
        }
        
    } catch (err) {
        console.error(err);
        alert("Server error during login");
    }
}
const loginbtn = document.getElementById("loginbtn");
const loginpage = document.getElementById("login");

loginbtn.addEventListener("click", (e) => {
    e.stopPropagation();
    loginpage.style.display = loginpage.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
    loginpage.style.display = "none";
});

loginpage.addEventListener("click", (e) => {
    e.stopPropagation();
});