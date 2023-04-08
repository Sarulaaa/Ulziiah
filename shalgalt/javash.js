//bodlogo 1

// var b = +prompt();
// for (var i = 0; i < b.length; i++) {
//   if ((i + 1) % 2) {
//     console.log(tegsh);
//   } else {
//     console.log(sondgoi);
//   }
// }

// bodlogo  2
// var a = +prompt();
// var w = +prompt();
// for (var i = 0; i > 10; i++) {
//   if (a = w) {
//     console.log(alert);
//   }
// }
// // bodlogo 4
// var d = +prompt();
// for (var i = 0; i < 101; i++)
//   if (d > 100) {
//     console.log(alert);
//   }

var openModal = document.getElementById("open");
var div = document.getElementById("div");
var backBtn = document.getElementById("back");
var overlay = document.getElementById("overlay");
function modalOpen() {
  div.classList.remove("modal");
  div.classList.add("active");
}
openModal.addEventListener("click", modalOpen);

function backFunction() {
  div.classList.remove("active");
  div.classList.add("modal");
}

backBtn.addEventListener("click", backFunction);
overlay.addEventListener("click", backFunction);
