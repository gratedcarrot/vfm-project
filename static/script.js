document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(); // Fetch products once on page load

    // Handle Clear All button
    document.getElementById("clear-all").addEventListener("click", () => {
        document.querySelectorAll(".filter-checkbox").forEach((checkbox) => (checkbox.checked = false));
        fetchProducts(); // Fetch all products when filters are cleared
    });

    // Handle filter checkboxes
    document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const selectedCategories = Array.from(document.querySelectorAll(".filter-checkbox:checked"))
                .map((cb) => cb.value);
            fetchProducts(selectedCategories); // Fetch products based on selected filters
        });
    });
});

// Automatically detect whether the app is running locally or on Render
const baseURL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://127.0.0.1:5001" 
    : "https://vfm-project.onrender.com";

// Function to fetch products (works for both local and Render)
function fetchProducts(selectedCategories = []) {
    let url = `${baseURL}/products`;

    if (selectedCategories.length > 0) {
        url += `?categories=${selectedCategories.join(',')}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched products:", data); // Debugging
            populateCatalog(data);
        })
        .catch(error => console.error("Error fetching products:", error));
}

// Function to dynamically display products in the catalog
function populateCatalog(products) {
    const catalogContainer = document.getElementById('product-container');
    catalogContainer.innerHTML = ''; // Clear existing content

    if (!products.length) {
        catalogContainer.innerHTML = '<p>No products found.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = `
            <div class="col-md-4">
                <div class="card">
                    <img src="${baseURL}/${product.image_path}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">Price/Kg: ₹${product.price}</p>
                        <p class="card-text">Stock: ${product.stock}</p>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" placeholder="Quantity" min="1" max="${product.stock}" id="quantity-${product.id}">
                            <button class="btn btn-primary" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        catalogContainer.innerHTML += productCard;
    });
}
function updateCartModal() {
    const cartModalBody = document.getElementById('cart-modal-body');
    const totalPriceElement = document.getElementById('total-price');

    cartModalBody.innerHTML = ''; // Clear existing cart items
    let total = 0;

    if (cart.length === 0) {
        cartModalBody.innerHTML = '<p>Your cart is empty.</p>';
        totalPriceElement.textContent = '₹0';
        return;
    }

    cart.forEach((item, index) => {
        total += item.total;

        cartModalBody.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.name} (₹${item.price} per kg)</span>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQuantity(${index})">-</button>
                    <span class="mx-2">${item.quantity} kg</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="increaseQuantity(${index})">+</button>
                </div>
                <span>₹${item.total}</span>
            </div>
        `;
    });

    totalPriceElement.textContent = `₹${total}`;
}
let cart = [];

function addToCart(productId, productName, productPrice) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);

    if (!quantity || quantity < 1) {
        alert("Please enter a valid quantity.");
        return;
    }

    // Check if the product already exists in the cart
    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
        existingProduct.total = existingProduct.quantity * existingProduct.price;
    } else {
        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,
            quantity: quantity,
            total: productPrice * quantity
        };
        cart.push(cartItem);
    }

    alert(`Added ${quantity} ${productName}(s) to the cart.`);
    updateCartModal(); // Update the cart modal dynamically
}
function refreshCaptcha() {
    const captchaImage = document.getElementById('captcha-image');
    captchaImage.src = '/captcha-image?' + new Date().getTime(); 
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    cart[index].total = cart[index].quantity * cart[index].price;
    updateCartModal(); // Ensure UI updates
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        cart[index].total = cart[index].quantity * cart[index].price;
    } else {
        cart.splice(index, 1); // Remove item if quantity reaches 0
    }
    updateCartModal(); // Ensure UI updates
}


document.getElementById('signin-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const captchaInput = document.getElementById('captcha').value;
    const response = await fetch('/validate-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captcha: captchaInput })
    });

    const result = await response.json();

    if (result.success) {
        alert('CAPTCHA verified! Proceeding...');
        // Submit the form or proceed with further validation
    } else {
        alert(result.message);
        refreshCaptcha(); // Refresh CAPTCHA if validation fails
    }
});
document.getElementById('signin-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const response = await 
fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
        alert('Login successful!');
        // Redirect or show dashboard
    } else {
        alert(result.message);
    }
});

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const mobile_no = document.getElementById('register-mobile').value;
    const address = document.getElementById('register-address').value;
    const pincode = document.getElementById('register-pincode').value;

    if (password !== confirmPassword) {
        console.error("Passwords do not match!");
        document.getElementById('register-confirm-password-error').textContent = "Passwords do not match!";
        return;
    }

    console.log("Sending registration data:", { name, email, password, mobile_no, address, pincode });
const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, mobile_no, address, pincode }),
});

console.log("Response status:", response.status);
const text = await response.text();
console.log("Response body:", text);

try {
    const result = JSON.parse(text);
    if (response.ok) {
        alert(result.message);
    } else {
        alert("Error: " + result.message);
    }
} catch (err) {
    console.error("Failed to parse response as JSON:", err, text);
    alert("An unexpected error occurred.");
}
});
document.addEventListener("DOMContentLoaded", function () {
    checkUserLogin();
    fetchRecentReviews();
    fetchProductNames(); 
    fetchNavbarProducts();
    document.getElementById("review-form").addEventListener("submit", function (e) {
        e.preventDefault();
        submitReview();
    });
});
// Function to check if a user is logged in and update the Sign In/Out button
function checkUserLogin() {
    fetch('/current-user')
        .then(response => response.json())
        .then(data => {
            const authButton = document.getElementById("auth-btn");
            const profileButton = document.getElementById("profile-btn");
            if (!data.logged_in) {
                authButton.textContent = "Sign In";
                authButton.classList.remove("btn-danger");
                authButton.classList.add("btn-success");
                authButton.setAttribute("data-bs-toggle", "modal");
                authButton.setAttribute("data-bs-target", "#signinModal");
                authButton.onclick = null;
                profileButton.style.display = "none";
            } else {
                authButton.textContent = "Sign Out";
                authButton.classList.remove("btn-success");
                authButton.classList.add("btn-danger");
                authButton.removeAttribute("data-bs-toggle");
                authButton.removeAttribute("data-bs-target");
                authButton.onclick = logoutUser;
                profileButton.style.display = "block";
                fetchUserProfile(); // Ensure profile data loads when logged in
            }
        })
        .catch(error => console.error("Error checking login status:", error));
}

// Function to log out the user
function logoutUser() {
    fetch('/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("You have been signed out.");
                window.location.reload();
            } else {
                alert("Error logging out.");
            }
        })
        .catch(error => console.error("Error logging out:", error));
}

// Function to fetch and display user profile
function fetchUserProfile() {
    fetch('/current-user')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                document.getElementById("profile-name").value = data.name;
                document.getElementById("profile-email").value = data.email;
                document.getElementById("profile-contact").value = data.contact;
                document.getElementById("profile-address").value = data.address;
            } else {
                alert("Error fetching profile details");
            }
        })
        .catch(error => console.error("Error fetching profile details:", error));
}

// Function to update user profile
function updateUserProfile() {
    const name = document.getElementById("profile-name").value.trim();
    const contact = document.getElementById("profile-contact").value.trim();
    const address = document.getElementById("profile-address").value.trim();

    if (!name || !contact || !address) {
        alert("All fields are required");
        return;
    }

    fetch('/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, address })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Profile updated successfully!");
            fetchUserProfile();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error updating profile:", error));
}

// Function to fetch product names for the dropdown
function fetchProductNames() {
    fetch('/product-names')
        .then(response => response.json())
        .then(products => {
            const productDropdown = document.getElementById("product-name");
            productDropdown.innerHTML = '<option value="">Select a product</option>';
            products.forEach(product => {
                productDropdown.innerHTML += `<option value="${product}">${product}</option>`;
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}

function fetchRecentReviews() {
    fetch('/reviews')
        .then(response => response.json())
        .then(reviews => {
            const reviewContainer = document.getElementById("reviews-container");
            reviewContainer.innerHTML = "";

            const recentReviews = reviews.slice(-3).reverse(); // Get the latest 3 reviews

            recentReviews.forEach(review => {
                const reviewBlock = `
                    <div class="review-box">
                        <div class="card shadow-sm p-3">
                            <blockquote class="blockquote mb-0">
                                <p>"${review.review}"</p>
                                <footer class="blockquote-footer">
                                    <strong>${review.user_name}</strong> on <em>${review.product_name}</em>
                                    <br> ⭐ Rating: ${review.rating}/5
                                </footer>
                            </blockquote>
                        </div>
                    </div>
                `;
                reviewContainer.innerHTML += reviewBlock;
            });
        })
        .catch(error => console.error("Error fetching reviews:", error));
}

// Function to submit a review
function submitReview() {
    fetch('/current-user')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                document.getElementById("login-warning").style.display = "block";
                return;
            }

            const product_name = document.getElementById("product-name").value;
            const review = document.getElementById("review-text").value.trim();
            const rating = parseInt(document.getElementById("rating").value.trim());

            if (!product_name || review === "" || !rating || rating < 1 || rating > 5) {
                alert("Please enter a valid product, review, and rating (1-5).");
                return;
            }

            fetch('/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_name, review, rating })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Review submitted successfully!");
                    document.getElementById("review-form").reset();
                    fetchRecentReviews();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => console.error("Error submitting review:", error));
        })
        .catch(error => console.error("Error checking login status before submitting review:", error));
}

// Adjust layout to show reviews and form side by side using a flex container
document.addEventListener("DOMContentLoaded", function () {
    const reviewSection = document.getElementById("reviews");
    reviewSection.style.display = "flex";
    reviewSection.style.justifyContent = "center";
    reviewSection.style.alignItems = "flex-start";
    reviewSection.style.gap = "40px";
    reviewSection.style.flexWrap = "wrap";

    // Wrap reviews and form inside a flex container
    const reviewWrapper = document.createElement("div");
    reviewWrapper.style.display = "flex";
    reviewWrapper.style.justifyContent = "space-between";
    reviewWrapper.style.width = "100%";
    reviewWrapper.style.maxWidth = "1200px";
    reviewWrapper.style.margin = "auto";

    const reviewsContainer = document.getElementById("reviews-container");
    reviewsContainer.style.width = "48%";

    const reviewFormContainer = document.getElementById("review-form").parentElement;
    reviewFormContainer.style.width = "48%";

    reviewWrapper.appendChild(reviewsContainer);
    reviewWrapper.appendChild(reviewFormContainer);
    reviewSection.appendChild(reviewWrapper);
} );

function fetchNavbarProducts() {
    fetch('/product-names')
        .then(response => response.json())
        .then(products => {
            const searchInput = document.getElementById("nav-search-bar");
            const dataList = document.getElementById("nav-product-list");

            dataList.innerHTML = ""; // Clear existing options
            
            products.forEach(product => {
                if (product) {  // Check if product exists
                    const option = document.createElement("option");
                    option.value = product;  // Use product directly as it's a simple name
                    dataList.appendChild(option);
                }
            });
        })
        .catch(error => console.error("Error fetching navbar product names:", error));
}
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(scrollToProduct, 1000); // Delay to ensure all elements are loaded
});

window.addEventListener("hashchange", function () {
    scrollToProduct();
});

function scrollToProduct() {
    const productId = decodeURIComponent(window.location.hash.substring(1)); // Get hash without #
    if (productId) {
        const productElement = document.getElementById(productId);
        if (productElement) {
            console.log("Scrolling to:", productId);  // Debugging log
            productElement.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            console.warn("Product element not found:", productId);
        }
    }
}
