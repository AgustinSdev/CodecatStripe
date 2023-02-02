import stripekeys from "./stripe-keys.js";

const $languages = document.getElementById("showroom"),
  $template = document.getElementById("showroom__template").content,
  $fragment = document.createDocumentFragment(),
  fetchOptions = {
    headers: {
      Authorization: `Bearer ${stripekeys.secrect}`,
    },
  };
let products, prices;

const format = (price) => `$${price.slice(0, -2)}.${price.slice(-2)}`;

Promise.all([
  fetch("https://api.stripe.com/v1/products", fetchOptions),
  fetch("https://api.stripe.com/v1/prices", fetchOptions),
])
  .then((responses) => Promise.all(responses.map((res) => res.json())))
  .then((json) => {
    products = json[0].data;
    prices = json[1].data;

    // console.log(products);
    // console.log(prices);

    prices.forEach((el) => {
      let productData = products.filter((product) => product.id === el.product);

      console.log(productData);
      if (productData[0].active) {
        $template
          .querySelector(".showroom__figure")
          .setAttribute("data-price", el.id);
        ///

        /////
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector(".name").textContent = productData[0].name;
        $template.querySelector(".description").textContent =
          productData[0].description;
        $template.querySelector(".price").textContent = format(
          el.unit_amount_decimal
        );
        $template.querySelector(".btn__buy").textContent = "Start order";

        /////

        let $clone = document.importNode($template, true);
        $fragment.appendChild($clone);
      }
    });
    $languages.appendChild($fragment);
  })
  .catch((error) => {
    let errorMessage = error.statusText || "Error";
    $template.innerHTML = `<p>Error ${error.status}: ${errorMessage}</p>`;
  });
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn__buy")) {
    let priceId = e.target.parentElement.getAttribute("data-price");
    Stripe(stripekeys.public)
      .redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        successUrl: "http://127.0.0.1:5502/stripe-success.html",
        cancelUrl: "http://127.0.0.1:5502/stripe-error.html",
      })
      .then((res) => {
        if (res.error) {
          $languages.insertAdjacentHTML("afterend", res.error.message);
          console.log(res.error.message);
        }
      });
  }
});
