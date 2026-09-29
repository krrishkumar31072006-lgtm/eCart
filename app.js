const priceInput = document.getElementById("priceInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");

searchBtn.addEventListener("click", findProducts);

function findProducts() {
    const targetPrice = Number(priceInput.value);

    if (priceInput.value === "" || targetPrice <= 0) {
        results.innerHTML = "<p>Please enter a valid price.</p>";
        return;
    }

    let products = [];

    storeData.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
            products.push(...subcategory.products);
        });
    });

    products.sort((a, b) => {
        return Math.abs(a.price - targetPrice) -
               Math.abs(b.price - targetPrice);
    });

    const closestProducts = products.slice(0, 5);

    displayProducts(closestProducts);
}

function displayProducts(products) {
    results.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>Rating:</strong> ⭐ ${product.rating}</p>

           <button onclick="viewProduct('${product.id}')">
    View Product
</button>
        `;

        results.appendChild(card);
    });
}

function viewProduct(productId) {
    addToRecentlyViewed(productId);
    alert("Product ID: " + productId);
}
// Challenge 6

// ===============================
// Challenge 6 - Inventory Dashboard
// ===============================

const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const inventoryBtn = document.getElementById("inventoryBtn");
const inventorySummary = document.getElementById("inventorySummary");
const inventoryResults = document.getElementById("inventoryResults");


// Get all products
function getAllProducts() {

    let products = [];

    storeData.categories.forEach(category => {

        category.subcategories.forEach(subcategory => {

            products.push(...subcategory.products);

        });

    });

    return products;
}


// Get all products once
let inventoryProducts = getAllProducts();


// Sort products by price ONCE
inventoryProducts.sort((a, b) => a.price - b.price);


// Prefix Sum Array
let prefixInventory = [0];

for (let i = 0; i < inventoryProducts.length; i++) {

    let inventoryValue =
        inventoryProducts[i].price *
        inventoryProducts[i].stock;

    prefixInventory.push(
        prefixInventory[i] + inventoryValue
    );
}


// Binary Search: first product >= target
function findFirstPrice(price) {

    let low = 0;
    let high = inventoryProducts.length - 1;
    let answer = inventoryProducts.length;

    while (low <= high) {

        let mid = Math.floor((low + high) / 2);

        if (inventoryProducts[mid].price >= price) {

            answer = mid;
            high = mid - 1;

        } else {

            low = mid + 1;

        }
    }

    return answer;
}


// Binary Search: last product <= target
function findLastPrice(price) {

    let low = 0;
    let high = inventoryProducts.length - 1;
    let answer = -1;

    while (low <= high) {

        let mid = Math.floor((low + high) / 2);

        if (inventoryProducts[mid].price <= price) {

            answer = mid;
            low = mid + 1;

        } else {

            high = mid - 1;

        }
    }

    return answer;
}


// Check Inventory
inventoryBtn.addEventListener("click", checkInventory);


function checkInventory() {

    const minPrice = Number(minPriceInput.value);
    const maxPrice = Number(maxPriceInput.value);


    // Validate input
    if (
        minPriceInput.value === "" ||
        maxPriceInput.value === "" ||
        minPrice < 0 ||
        maxPrice < 0 ||
        minPrice > maxPrice
    ) {

        inventorySummary.innerHTML =
            "<p>Please enter a valid price range.</p>";

        inventoryResults.innerHTML = "";

        return;
    }


    // Find range using Binary Search
    const firstIndex = findFirstPrice(minPrice);
    const lastIndex = findLastPrice(maxPrice);


    // No products found
    if (
        firstIndex === inventoryProducts.length ||
        firstIndex > lastIndex
    ) {

        inventorySummary.innerHTML =
            "<p>No products found in this price range.</p>";

        inventoryResults.innerHTML = "";

        return;
    }


    // Number of matching products
    const productCount =
        lastIndex - firstIndex + 1;


    // Calculate total inventory value using Prefix Sum
    const totalInventoryValue =
        prefixInventory[lastIndex + 1] -
        prefixInventory[firstIndex];


    // Display summary
    inventorySummary.innerHTML = `
        <p>Matching Products: ${productCount}</p>
        <p>Total Inventory Value: ₹${totalInventoryValue}</p>
    `;


    // Get matching products
    const matchingProducts =
        inventoryProducts.slice(firstIndex, lastIndex + 1);


    // Display products
    inventoryResults.innerHTML = "";

    matchingProducts.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <button onclick="viewProduct('${product.id}')">
                View Product
            </button>
        `;

        inventoryResults.appendChild(card);

    });
}
let recentlyViewed = [];

const recentProducts = document.getElementById("recentProducts");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

clearHistoryBtn.addEventListener("click", clearRecentlyViewed);

function addToRecentlyViewed(productId) {
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    recentlyViewed.unshift(productId);
    recentlyViewed = recentlyViewed.slice(0, 5);
    showRecentlyViewed();
}

function showRecentlyViewed() {
    recentProducts.innerHTML = "";

    if (recentlyViewed.length === 0) {
        recentProducts.textContent = "No recently viewed products.";
        return;
    }

    recentlyViewed.forEach(productId => {
        const product = getAllProducts().find(item => item.id === productId);

        if (product) {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Price:</strong> ₹${product.price}</p>
                <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
            `;
            recentProducts.appendChild(card);
        }
    });
}

function clearRecentlyViewed() {
    recentlyViewed = [];
    showRecentlyViewed();
}