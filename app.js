const priceInput = document.getElementById("priceInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");
const productSearchInput = document.getElementById("productSearchInput");
const productSuggestions = document.getElementById("productSuggestions");
let activeSuggestionIndex = -1;

productSearchInput.addEventListener("input", () => {
    showProductSuggestions();
});

productSearchInput.addEventListener("keydown", handleAutocompleteKeydown);
productSuggestions.addEventListener("click", selectClickedSuggestion);

function showProductSuggestions() {
    const searchTerm = productSearchInput.value.trim().toLowerCase();
    productSuggestions.innerHTML = "";
    activeSuggestionIndex = -1;
    productSearchInput.removeAttribute("aria-activedescendant");

    if (searchTerm === "") {
        hideProductSuggestions();
        return;
    }

    const matchingProducts = getAllProducts().filter(product => {
        const nameMatches = product.name.toLowerCase().includes(searchTerm);
        const brandMatches = product.brand.toLowerCase().includes(searchTerm);
        const tagsMatch = (product.tags || []).some(tag =>
            tag.toLowerCase().includes(searchTerm)
        );

        return nameMatches || brandMatches || tagsMatch;
    });

    const displayedProducts = [];
    const seenProductIds = new Set();

    matchingProducts.forEach(product => {
        if (!seenProductIds.has(product.id) && displayedProducts.length < 8) {
            seenProductIds.add(product.id);
            displayedProducts.push(product);
        }
    });

    if (displayedProducts.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "suggestion-empty";
        emptyMessage.setAttribute("role", "status");
        emptyMessage.textContent = "No products found";
        productSuggestions.appendChild(emptyMessage);
    } else {
        displayedProducts.forEach((product, index) => {
            const suggestion = document.createElement("button");
            suggestion.type = "button";
            suggestion.className = "suggestion-option";
            suggestion.id = `product-suggestion-${index}`;
            suggestion.dataset.productId = product.id;
            suggestion.setAttribute("role", "option");
            suggestion.setAttribute("aria-selected", "false");
            suggestion.textContent = `${product.name} - ${product.brand}`;
            productSuggestions.appendChild(suggestion);
        });
    }

    productSuggestions.hidden = false;
    productSearchInput.setAttribute("aria-expanded", "true");
}

function handleAutocompleteKeydown(event) {
    const suggestions = productSuggestions.querySelectorAll(".suggestion-option");

    if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        activeSuggestionIndex =
            (activeSuggestionIndex + 1) % suggestions.length;
        updateActiveSuggestion(suggestions);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
        event.preventDefault();
        activeSuggestionIndex = activeSuggestionIndex <= 0
            ? suggestions.length - 1
            : activeSuggestionIndex - 1;
        updateActiveSuggestion(suggestions);
    } else if (event.key === "Enter" && activeSuggestionIndex >= 0) {
        event.preventDefault();
        selectProductSuggestion(suggestions[activeSuggestionIndex]);
    } else if (event.key === "Escape") {
        hideProductSuggestions();
    }
}

function updateActiveSuggestion(suggestions) {
    suggestions.forEach((suggestion, index) => {
        const isActive = index === activeSuggestionIndex;
        suggestion.setAttribute("aria-selected", isActive);
    });

    const activeSuggestion = suggestions[activeSuggestionIndex];
    productSearchInput.setAttribute("aria-activedescendant", activeSuggestion.id);
    activeSuggestion.scrollIntoView({ block: "nearest" });
}

function selectClickedSuggestion(event) {
    const suggestion = event.target.closest(".suggestion-option");

    if (suggestion) {
        selectProductSuggestion(suggestion);
    }
}

function selectProductSuggestion(suggestion) {
    const product = getAllProducts().find(
        item => item.id === suggestion.dataset.productId
    );

    if (product) {
        productSearchInput.value = product.name;
        hideProductSuggestions();
        productSearchInput.focus();
    }
}

function hideProductSuggestions() {
    productSuggestions.hidden = true;
    productSuggestions.innerHTML = "";
    activeSuggestionIndex = -1;
    productSearchInput.setAttribute("aria-expanded", "false");
    productSearchInput.removeAttribute("aria-activedescendant");
}

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
    if (!currentUserViewed.includes(productId)) {
        currentUserViewed.push(productId);
    }
    lastViewedProductId = productId;
    showRecommendations();
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

const recommendations = document.getElementById("recommendations");
const refreshRecommendationsBtn = document.getElementById("refreshRecommendationsBtn");
const simulatedUsers = {
    userA: ["p-101", "p-301", "p-302"],
    userB: ["p-101", "p-301", "p-303"],
    userC: ["p-101", "p-302", "p-304"],
    userD: ["p-301", "p-302", "p-601"]
};
let currentUserViewed = [];
let lastViewedProductId = null;

refreshRecommendationsBtn.addEventListener("click", showRecommendations);

function showRecommendations() {
    recommendations.innerHTML = "";

    if (lastViewedProductId === null) {
        recommendations.textContent =
            "No recommendations available. View a product to get started.";
        return;
    }

    const productCounts = {};

    Object.values(simulatedUsers).forEach(userViews => {
        if (userViews.includes(lastViewedProductId)) {
            userViews.forEach(productId => {
                if (
                    productId !== lastViewedProductId &&
                    !currentUserViewed.includes(productId)
                ) {
                    productCounts[productId] =
                        (productCounts[productId] || 0) + 1;
                }
            });
        }
    });

    const products = getAllProducts();
    const recommendedProducts = Object.keys(productCounts)
        .map(productId => ({
            product: products.find(item => item.id === productId),
            count: productCounts[productId]
        }))
        .filter(recommendation => recommendation.product)
        .sort((first, second) => second.count - first.count)
        .slice(0, 5);

    if (recommendedProducts.length === 0) {
        recommendations.textContent =
            "No recommendations available for this product yet.";
        return;
    }

    recommendedProducts.forEach(recommendation => {
        const product = recommendation.product;
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
            <p>Viewed together by ${recommendation.count} ${recommendation.count === 1 ? "user" : "users"}</p>
            <button onclick="viewProduct('${product.id}')">
                View Product
            </button>
        `;
        recommendations.appendChild(card);
    });
}