const products = {
    Fruits: [
        { name: "Apples", price: 100, image: "image19.jpg" },
        { name: "Bananas", price: 50, image: "image20.jpg" },
        { name: "Oranges", price: 80, image: "image21.jpg" },
        { name: "Grapes", price: 120, image: "image4.jpg" },
        { name: "Mangoes", price: 150, image: "image5.jpg" },
        { name: "Pineapples", price: 70, image: "image6.jpg" },
    ],
    Vegetables: [
        { name: "Carrots", price: 40, image: "image7.jpg" },
        { name: "Potatoes", price: 30, image: "image8.jpg" },
        { name: "Tomatoes", price: 35, image: "image9.jpg" },
        { name: "Onions", price: 25, image: "image10.jpg" },
        { name: "Broccoli", price: 60, image: "image11.jpg" },
        { name: "Spinach", price: 20, image: "image12.jpg" },
    ],
    Dairy: [
        { name: "Milk", price: 50, image: "image13.jpg" },
        { name: "Cheese", price: 200, image: "image14.jpg" },
        { name: "Yogurt", price: 40, image: "image15.jpg" },
        { name: "Butter", price: 150, image: "image16.jpg" },
        { name: "Paneer", price: 250, image: "image17.jpg" },
        { name: "Cream", price: 100, image: "image18.jpg" },
    ],
};

let cart = [];

// Function to display main categories
function showMainCategories() {
    const catalogContainer = document.getElementById("product-container");
    catalogContainer.innerHTML = `
        <div class="col-md-4">
            <div class="card" onclick="updateCatalog(['Fruits'])">
                <img src="image2.jpg" class="card-img-top" alt="Fruits"height="200" width="300">
                <div class="card-body">
                    <h5 class="card-title">Fruits</h5>
                    <p class="card-text">Fresh and organic fruits sourced directly from farmers.</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card" onclick="updateCatalog(['Vegetables'])">
                <img src="image3.jpg" class="card-img-top" alt="Vegetables"height="200" width="300">
                <div class="card-body">
                    <h5 class="card-title">Vegetables</h5>
                    <p class="card-text">Locally grown vegetables for your daily needs.</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card" onclick="updateCatalog(['Dairy'])">
                <img src="image4.jpg" class="card-img-top" alt="Dairy"height="200" width="300">
                <div class="card-body">
                    <h5 class="card-title">Dairy</h5>
                    <p class="card-text">Organic milk, cheese, and other dairy products.</p>
                </div>
            </div>
        </div>
    `;
}

// Function to update catalog with products
function updateCatalog(categories) {
    const catalogContainer = document.getElementById("product-container");
    catalogContainer.innerHTML = ""; // Clear existing products

    categories.forEach((category) => {
        if (products[category]) {
            products[category].forEach((product) => {
                const productCard = `
                    <div class="col-md-4">
                        <div class="card">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text">₹${product.price}/kg</p>
                                <label for="quantity-${product.name}">Quantity (kg):</label>
                                <input type="number" id="quantity-${product.name}" class="form-control mb-3" min="1" value="1">
                                <button class="btn btn-success" onclick="addToCart('${product.name}', ${product.price}, parseInt(document.getElementById('quantity-${product.name}').value))">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
                catalogContainer.innerHTML += productCard;
            });
        }
    });
}

// Function to add items to the cart
function addToCart(name, price, quantity) {
    const existingItem = cart.find((item) => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    updateCartPreview();
}

// Function to update the cart modal preview
function updateCartPreview() {
    const cartModalBody = document.getElementById("cart-modal-body");
    const totalPriceElement = document.getElementById("total-price");
    cartModalBody.innerHTML = "";
    let totalPrice = 0;

    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        cartModalBody.innerHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} (${item.quantity} kg)</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });

    totalPriceElement.innerText = `₹${totalPrice}`;
}

// Event listener to show main categories on page load
document.addEventListener("DOMContentLoaded", () => {
    showMainCategories();

    // Handle clear all button
    document.getElementById("clear-all").addEventListener("click", () => {
        document.querySelectorAll(".filter-checkbox").forEach((checkbox) => (checkbox.checked = false));
        showMainCategories();
    });

    // Handle filter checkboxes
    document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const selectedCategories = Array.from(document.querySelectorAll(".filter-checkbox:checked")).map((cb) => cb.value);
            if (selectedCategories.length > 0) {
                updateCatalog(selectedCategories);
            } else {
                showMainCategories();
            }
        });
    });
});
