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
    alert("Product ID: " + productId);
}
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const inventoryBtn = document.getElementById("inventoryBtn");
const inventorySummary = document.getElementById("inventorySummary");
const inventoryResults = document.getElementById("inventoryResults");

inventoryBtn.addEventListener("click", checkInventory);

function checkInventory() {
    const minPrice = Number(minPriceInput.value);
    const maxPrice = Number(maxPriceInput.value);

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

    let products = [];

    storeData.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
            products.push(...subcategory.products);
        });
    });

    const matchingProducts = products.filter(product => {
        return product.price >= minPrice &&
               product.price <= maxPrice;
    });

    let totalInventoryValue = 0;

    matchingProducts.forEach(product => {
        totalInventoryValue += product.price * product.stock;
    });

    inventorySummary.innerHTML = `
        <p>Matching Products: ${matchingProducts.length}</p>
        <p>Total Inventory Value: ₹${totalInventoryValue}</p>
    `;

    inventoryResults.innerHTML = "";

    matchingProducts.forEach(product => {
        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
        `;

        inventoryResults.appendChild(card);
    });
}