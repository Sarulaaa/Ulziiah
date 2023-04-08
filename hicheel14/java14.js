var byMbaa = document.getElementById("bymbaa");
var btn = document.getElementById("puntsagaa");
var sav = document.getElementById("ganbaa");

function addValue() {
  var eneId;
  if (byMbaa.value === "") {
    alert("hooson baina buglu");
  } else {
    var li = document.createElement("li");
    li.innerHTML = `<div ${byMbaa.value}<button id="${
      "f" + Math.floor(Math.random() * 100)
    }">delete</button> </div>`;
    sav.appendChild(li);
    localStorage.setItem(eneId, byMbaa.value);
  }

  var deleteBtn = document.getElementById(eneId);
  deleteBtn.addEventListener("click", function () {
    if (eneId === eneId) {
      sav.removeChild(li);
      console.log(eneId + "ustlaa");
      localStorage.removeItem(eneId);
    }
  });
  ////// eppendChild n tuhain sogoson  elementiinhee dotor yamar child  el baihvee gedegee songono
  byMbaa.value = "";
  // console.log(localStorage.key(eneId));
}
btn.addEventListener("click", addValue);

// var bymbaa = document.getElementById("byambaa");
// var btn = document.getElementById("puntsagaa");
// var sav = document.getElementById("ganbaa");

// function addValue() {
//   var eneId;
//   if (bymbaa.value === "") {
//     alert("Та сэтгэгдэл үлдээмээргүй байна уу? тэгвэл ок дээр дараарай😊");
//   } else {
//     var li = document.createElement("li"); //element create hiij ugnu
//     li.innerHTML = `<div>${bymbaa.value}<button id="${(eneId =
//       "q" + Math.floor(Math.random() * 100))}">X</button></div>`;
//     sav.appendChild(li);
//     //appendChild n tuhain songoson elementiinha dotor ymar child nemeh , baihwee gedgee oruulna
//     localStorage.setItem(eneId, bymbaa.value);
//   }

//   var deletebtn = document.getElementById(eneId);
//   deletebtn.addEventListener("click", function () {
//     if (eneId === eneId) {
//       console.log(eneId + "ene id element ustlaa");
//       sav.removeChild(li);
//       localStorage.removeItem(eneId);
//     }
//   });
//   bymbaa.value = "";
// }
