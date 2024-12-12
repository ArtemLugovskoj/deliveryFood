const authorizationButton = document.querySelector(".button-auth");
const logoutButton = document.querySelector(".button-out");
const userNameElement = document.getElementById("user-name");
const authModal = document.querySelector(".modal-auth");
const closeAuthBtn = document.querySelector(".close-auth");
const loginForm = document.getElementById("logInForm");
const loginField = document.getElementById("login");
const passwordField = document.getElementById("password");
const loginButton = document.querySelector(".button-login");
const loginErrorMessage = document.getElementById("login-error");
const passwordErrorMessage = document.getElementById("password-error");
const authErrorMessage = document.getElementById("auth-error");
const restaurantCardsContainer = document.querySelector(".cards-restaurants");

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Помилка за адресою ${url}, статус помилки ${response.status}`);
    }
    return await response.json();
}

function storeUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function retrieveUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function clearUser() {
    localStorage.removeItem("user");
}

function updateUserInterface(user) {
    if (user) {
        userNameElement.textContent = `Привіт, ${user.login}`;
        userNameElement.style.display = "inline";
        authorizationButton.style.display = "none";
        logoutButton.style.display = "inline-block";
    } else {
        userNameElement.textContent = "";
        userNameElement.style.display = "none";
        authorizationButton.style.display = "inline-block";
        logoutButton.style.display = "none";
    }
}

function showAuthModal() {
    authModal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function hideAuthModal() {
    authModal.style.display = "none";
    document.body.style.overflow = "";
    resetForm();
}

window.addEventListener("click", function (event) {
    if (event.target === authModal) {
        hideAuthModal();
    }
});

function toggleLoginButtonState() {
    const isLoginFilled = loginField.value.trim() !== "";
    const isPasswordFilled = passwordField.value.trim() !== "";
    loginErrorMessage.style.display = isLoginFilled ? "none" : "block";
    passwordErrorMessage.style.display = isPasswordFilled ? "none" : "block";

    loginButton.disabled = !(isLoginFilled && isPasswordFilled);
    authErrorMessage.style.display = "none";
}

function resetForm() {
    loginField.value = "";
    passwordField.value = "";
    loginErrorMessage.style.display = "none";
    passwordErrorMessage.style.display = "none";
    authErrorMessage.style.display = "none";
    loginButton.disabled = true;
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const login = loginField.value.trim();
    const password = passwordField.value.trim();

    if (login === "Artem" && password === "12345") {
        const user = { login };
        storeUser(user);
        updateUserInterface(user);
        hideAuthModal();
        resetForm();
    } else {
        authErrorMessage.style.display = "block";
    }
});

loginField.addEventListener("input", toggleLoginButtonState);
passwordField.addEventListener("input", toggleLoginButtonState);

authorizationButton.addEventListener("click", showAuthModal);
closeAuthBtn.addEventListener("click", hideAuthModal);

logoutButton.addEventListener("click", function () {
    clearUser();
    updateUserInterface(null);
    hideAuthModal();
    resetForm();
});

function createRestaurantCard(restaurant) {
    const { name, time_of_delivery, price, stars, kitchen, image, products } = restaurant;
    const card = `
    <a href="restaurant.html" class="card card-restaurant" data-products="${products}">
      <img src="${image}" alt="${name}" class="card-image" />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${time_of_delivery}</span>
        </div>
        <div class="card-info">
          <div class="rating">${stars}</div>
          <div class="price">${price}</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `;
    restaurantCardsContainer.insertAdjacentHTML("beforeend", card);
}

function initialize() {
    fetchData("./db/partners.json")
        .then((restaurants) => {
            restaurants.forEach(createRestaurantCard);
        })
        .catch((error) => {
            console.error("Помилка завантаження списку ресторанів:", error);
        });

    restaurantCardsContainer.addEventListener("click", function (event) {
        const target = event.target.closest(".card-restaurant");
        if (!target) return;

        event.preventDefault();

        const user = retrieveUser();
        if (!user) {
            showAuthModal();
        } else {
            localStorage.setItem(
                "restaurant",
                JSON.stringify({
                    name: target.querySelector(".card-title").textContent,
                    kitchen: target.querySelector(".category").textContent,
                    price: target.querySelector(".price").textContent,
                    stars: target.querySelector(".rating").textContent,
                    products: target.dataset.products, 
                })
            );
            window.location.href = target.getAttribute("href");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const user = retrieveUser();
    updateUserInterface(user);
    resetForm();

    if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname === ""
    ) {
        initialize();

        var swiper = new Swiper(".swiper", {
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            loop: true,
        });
    } else if (window.location.pathname.endsWith("restaurant.html")) {
        initializeRestaurantPage();
    }
});

function initializeRestaurantPage() {
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

    fetchData(`./db/${restaurant.products}`)
        .then((products) => {
            products.forEach(createMenuItemCard);
        })
        .catch((error) => {
            console.error("Помилка завантаження меню:", error);
        });
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
        <!-- /.card-heading -->
        <div class="card-info">
          <div class="ingredients">${description}</div>
        </div>
        <!-- /.card-info -->
        <div class="card-buttons">
          <button class="button button-primary button-add-cart">
            <span class="button-card-text">У кошик</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price-bold">${price} &#8372;</strong>
        </div>
      </div>
      <!-- /.card-text -->
    </div>
    <!-- /.card -->
  `;
    const cardsMenu = document.querySelector(".cards-menu");
    cardsMenu.insertAdjacentHTML("beforeend", card);
}