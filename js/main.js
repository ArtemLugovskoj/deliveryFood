const authButton = document.querySelector(".button-auth");
const outButton = document.querySelector(".button-out");
const userNameSpan = document.getElementById("user-name");
const modalAuth = document.querySelector(".modal-auth");
const closeAuthButton = document.querySelector(".close-auth");
const logInForm = document.getElementById("logInForm");
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const buttonLogin = document.querySelector(".button-login");
const loginErrorText = document.getElementById("login-error");
const passwordErrorText = document.getElementById("password-error");
const authErrorText = document.getElementById("auth-error");

const cardsRestaurants = document.querySelector(".cards-restaurants");
const searchInput = document.querySelector(".input-search");
const searchResultsSection = document.querySelector(".search-results");
const cardsMenu = document.querySelector(".cards-menu");
const containerPromo = document.querySelector(".containerPromo");
const restaurantsSection = document.querySelector(".restaurants");

const cartButton = document.querySelector("#cart-button");
const modalCart = document.querySelector(".modal-cart");
const modalBody = modalCart.querySelector(".modal-body");
const modalPrice = modalCart.querySelector(".modal-pricetag");
const buttonClearCart = modalCart.querySelector(".clear-cart");
const cartCountElement = document.getElementById("cart-count");
const orderButton = modalCart.querySelector("#order-button"); 

let cart = [];

function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function removeUser() {
    localStorage.removeItem("user");
}

function updateUI(user) {
    if (user) {
        userNameSpan.textContent = `Привіт, ${user.login}`;
        userNameSpan.style.display = "inline";
        authButton.style.display = "none";
        outButton.style.display = "inline-block";
        cartButton.style.display = "flex";
    } else {
        userNameSpan.textContent = "";
        userNameSpan.style.display = "none";
        authButton.style.display = "inline-block";
        outButton.style.display = "none";
        cartButton.style.display = "none";
    }
}

function openAuthModal() {
    modalAuth.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeAuthModal() {
    modalAuth.style.display = "none";
    document.body.style.overflow = "";
    resetForm();
}

window.addEventListener("click", function (event) {
    if (event.target === modalAuth) {
        closeAuthModal();
    }
});

function updateButtonState() {
    const isLoginFilled = loginInput.value.trim() !== "";
    const isPasswordFilled = passwordInput.value.trim() !== "";
    loginErrorText.style.display = isLoginFilled ? "none" : "block";
    passwordErrorText.style.display = isPasswordFilled ? "none" : "block";

    buttonLogin.disabled = !(isLoginFilled && isPasswordFilled);
    authErrorText.style.display = "none";
}

function resetForm() {
    loginInput.value = "";
    passwordInput.value = "";
    loginErrorText.style.display = "none";
    passwordErrorText.style.display = "none";
    authErrorText.style.display = "none";
    buttonLogin.disabled = true;
}

logInForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (login === "Artem" && password === "12345") {
        const user = { login };
        saveUser(user);
        updateUI(user);
        closeAuthModal();
        resetForm();
    } else {
        authErrorText.style.display = "block";
    }
});

loginInput.addEventListener("input", updateButtonState);
passwordInput.addEventListener("input", updateButtonState);

authButton.addEventListener("click", openAuthModal);
closeAuthButton.addEventListener("click", closeAuthModal);

outButton.addEventListener("click", function () {
    removeUser();
    updateUI(null);
});

async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Помилка за адресою ${url}, статус помилки ${response.status}`
        );
    }
    return await response.json();
}

function createCardRestaurant(restaurant) {
    const { name, time_of_delivery, price, stars, kitchen, image, products } =
        restaurant;
    const card = `
    <a href="restaurant.html" class="card card-restaurant" data-products="${products}">
      <img src="${image}" alt="${name}" class="card-image" />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${time_of_delivery} хв</span>
        </div>
        <div class="card-info">
          <div class="rating">${stars}</div>
          <div class="price">Від ${price} грн</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `;
    cardsRestaurants.insertAdjacentHTML("beforeend", card);
}

function createCardGood({ description, image, name, price, id }) {
    const card = document.createElement("div");
    card.className = "card";
    card.id = id;
    card.insertAdjacentHTML(
        "beforeend",
        `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
        <div class="card-heading">
            <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <div class="card-info">
            <div class="ingredients">${description}</div>
        </div>
        <div class="card-buttons">
            <button class="button button-primary button-add-cart" data-id="${id}">
                <span class="button-card-text">У кошик</span>
                <span class="button-cart-svg"></span>
            </button>
            <strong class="card-price-bold">${price} грн</strong>
        </div>
    </div>
    `
    );
    cardsMenu.insertAdjacentElement("beforeend", card);
}

function addToCart(event) {
    const target = event.target;
    const buttonAddToCart = target.closest(".button-add-cart");
    if (buttonAddToCart) {
        console.log('"У кошик" натиснуто');
        const card = target.closest(".card");
        const title = card.querySelector(".card-title-reg").textContent;
        const costElement =
            card.querySelector(".card-price-bold") ||
            card.querySelector(".card-price");
        const costText = costElement ? costElement.textContent : "0";
        const cost = parseFloat(costText);
        const id = buttonAddToCart.dataset.id;

        if (!id) {
            console.error("Відсутній data-id для товару");
            return;
        }

        const existingItem = cart.find((item) => item.id === id);
        if (existingItem) {
            existingItem.count += 1;
        } else {
            cart.push({
                id: id,
                title: title,
                cost: cost,
                count: 1,
            });
        }
        console.log("Товар додано до кошика:", cart);
        renderCart();
        saveCart();
        updateCartCount();
    }
}

function renderCart() {
    modalBody.textContent = "";
    cart.forEach(function ({ id, title, cost, count }) {
        const itemCart = `
            <div class="food-row">
                <span class="food-name">${title}</span>
                <strong class="food-price">${cost.toFixed(2)} грн</strong>
                <div class="food-counter">
                    <button class="counter-button counter-minus" data-id="${id}">-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button counter-plus" data-id="${id}">+</button>
                </div>
            </div>
        `;
        modalBody.insertAdjacentHTML("beforeend", itemCart);
    });

    const totalPriceValue = cart.reduce(function (result, item) {
        return result + item.cost * item.count;
    }, 0);
    modalPrice.textContent = `${totalPriceValue.toFixed(2)} грн`;
}

function changeCount(event) {
    const target = event.target;
    if (target.classList.contains("counter-button")) {
        const id = target.dataset.id;
        const item = cart.find((item) => item.id === id);
        if (item) {
            if (target.classList.contains("counter-minus")) {
                item.count -= 1;
                if (item.count === 0) {
                    cart = cart.filter((item) => item.id !== id);
                }
            }
            if (target.classList.contains("counter-plus")) {
                item.count += 1;
            }
            renderCart();
            saveCart();
            updateCartCount();
        }
    }
}

function clearCart() {
    cart = [];
    renderCart();
    saveCart();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem("cart");
    cart = savedCart ? JSON.parse(savedCart) : [];
    renderCart();
    updateCartCount();
}

function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    cartCountElement.textContent = `(${totalCount})`;
}

function toggleModalCart() {
    console.log('Кнопка "Кошик" натиснута');
    renderCart();
    modalCart.classList.toggle("show");
    document.body.style.overflow = modalCart.classList.contains("show")
        ? "hidden"
        : "";
}

function initCart() {
    cartButton.addEventListener("click", toggleModalCart);
    modalCart
        .querySelector(".close")
        .addEventListener("click", toggleModalCart);
    modalBody.addEventListener("click", changeCount);
    buttonClearCart.addEventListener("click", clearCart);
    loadCart();

    orderButton.addEventListener("click", submitOrder);
}

function init() {
    getData("./db/partners.json")
        .then((restaurants) => {
            restaurants.forEach(createCardRestaurant);
        })
        .catch((error) => {
            console.error("Помилка завантаження списку ресторанів:", error);
        });

    cardsRestaurants.addEventListener("click", function (event) {
        const target = event.target.closest(".card-restaurant");
        if (!target) return;

        event.preventDefault();

        const user = getUser();
        if (!user) {
            openAuthModal();
        } else {
            const restaurant = {
                name: target.querySelector(".card-title").textContent,
                kitchen: target.querySelector(".category").textContent,
                price: target.querySelector(".price").textContent,
                stars: target.querySelector(".rating").textContent,
                products: target.dataset.products,
            };
            localStorage.setItem("restaurant", JSON.stringify(restaurant));
            window.location.href = target.getAttribute("href");
        }
    });

    cardsMenu.addEventListener("click", addToCart);

    initCart();
}

function handleSearch(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const value = event.target.value.trim().toLowerCase();

        if (!value) {
            searchInput.style.backgroundColor = "#ffcccc";
            setTimeout(() => {
                searchInput.style.backgroundColor = "";
            }, 1500);
            return;
        }

        cardsMenu.textContent = "";
        containerPromo.classList.add("hide");
        restaurantsSection.classList.add("hide");
        searchResultsSection.classList.remove("hide");
        searchResultsSection.querySelector(
            ".section-title"
        ).textContent = `Результати пошуку: "${event.target.value.trim()}"`;

        getData("./db/partners.json")
            .then((partners) => {
                const allProductsPromises = partners.map((partner) =>
                    getData(`./db/${partner.products}`)
                );
                return Promise.all(allProductsPromises);
            })
            .then((allProductsArrays) => {
                const allProducts = allProductsArrays.flat();
                const resultSearch = allProducts.filter((product) =>
                    product.name.toLowerCase().includes(value)
                );
                if (resultSearch.length === 0) {
                    cardsMenu.innerHTML = "<p>Нічого не знайдено.</p>";
                } else {
                    resultSearch.forEach(createCardGood);
                }
            })
            .catch((error) => {
                console.error("Помилка при пошуку страв:", error);
            });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const user = getUser();
    updateUI(user);
    resetForm();

    if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname === ""
    ) {
        init();

        var swiper = new Swiper(".swiper", {
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            loop: true,
        });

        searchInput.addEventListener("keypress", handleSearch);
    } else if (window.location.pathname.endsWith("restaurant.html")) {
        initRestaurantPage();
    }
});

function initRestaurantPage() {
    const restaurant = JSON.parse(localStorage.getItem("restaurant"));

    if (!restaurant) {
        window.location.href = "index.html";
        return;
    }

    const restaurantTitle = document.querySelector(".restaurant-title");
    const rating = document.querySelector(".rating");
    const price = document.querySelector(".price");
    const category = document.querySelector(".category");

    restaurantTitle.textContent = restaurant.name;
    rating.textContent = restaurant.stars;
    price.textContent = restaurant.price;
    category.textContent = restaurant.kitchen;

    getData(`./db/${restaurant.products}`)
        .then((products) => {
            products.forEach(createMenuItemCard);
        })
        .catch((error) => {
            console.error("Помилка завантаження меню:", error);
        });

    const cardsMenuRestaurant = document.querySelector(".cards-menu");
    cardsMenuRestaurant.addEventListener("click", addToCart);

    initCart();
}

function createMenuItemCard(product) {
    const { id, name, description, price, image } = product;
    const card = `
    <div class="card">
        <img src="${image}" alt="${name}" class="card-image" />
        <div class="card-text">
            <div class="card-heading">
                <h3 class="card-title card-title-reg">${name}</h3>
            </div>
            <div class="card-info">
                <div class="ingredients">${description}</div>
            </div>
            <div class="card-buttons">
                <button class="button button-primary button-add-cart" data-id="${id}">
                    <span class="button-card-text">У кошик</span>
                    <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price-bold">${price} грн</strong>
            </div>
        </div>
    </div>
    `;
    const cardsMenu = document.querySelector(".cards-menu");
    cardsMenu.insertAdjacentHTML("beforeend", card);
}
