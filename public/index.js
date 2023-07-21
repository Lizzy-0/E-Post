

$(document).ready(function () {
  $(".menu-button").click(function () {
    console.log("menuButton clicked");
    $("#menu").toggleClass("invisible");
  });
  $(".sub1").on("click", function () {
    $(this).siblings(".submenu1").toggle();
  });
});
function track() {
  var trackID = document.getElementById("track_id").value;
  if (document.getElementById("order_number")) {
      document.getElementById("order_number").innerHTML = "Order Number: " + trackID;

  }
  if (document.getElementById("details")) {
      document.getElementById("details").innerHTML = "Order Details: Being processed: "

  }
  if (document.getElementById("result")) {
    document.getElementById("result-header").innerHTML = "Your Package Details"
      document.getElementById("home_order_number").innerHTML = "Order Number: " + trackID;
      document.getElementById("home_details").innerHTML = "Order Details: Being processed: "

  }
console.log("clicked");

}

// var submenu1 = document.querySelector(".submenu1");
// var sub1 = document.querySelector(".sub1");
// setTimeout(
//   sub1.addEventListener("mouseover", function () {
//     submenu1.style.display = "block";
//     submenu1.classList.add("hovered");
//     console.log("hover");
//   }),
//   1000
// );
var splide = new Splide(".splide", {
  type: "loop",
  perMove: 1,
  perPage: 3,
  drag: true,
  snap: true,
  pagination: false,

  breakpoints: {
    955: {
      perPage: 1,
      autoplay: true,
      interval: 2000,
    },
  },
});
splide.mount();