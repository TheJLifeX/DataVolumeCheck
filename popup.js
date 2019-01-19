'use strict';

// (accompli) creer un model pour l'enregistrement des donnees de l utilisateur.
// json object :: javascript object
// ou bien tout simplement la structure key-value de chrome.
// "name",
// "gesendet",
// "empfangen",
// "checkedRadio",
// "userNotificationValueInPercent",
// "userNotificationValueInMB"

// (accompli) recuper les donnes dans le local storage et afficher les donnees.
chrome.storage.sync.get([
    "name",
    "gesendet",
    "empfangen",
    "checkedRadio",
    "userNotificationValueInPercent",
    "userNotificationValueInMB",
    "transfertLimit"
  ],
  function (data) {
    console.log(data);

    const percent = 100 - (Math.round((data.empfangen + data.gesendet) * 100 / data.transfertLimit));
    showProgressCircle(percent);
    document.querySelector("#name").innerHTML = data.name;
    document.querySelector("#gesendet").innerHTML = " " + data.gesendet;
    document.querySelector("#empfangen").innerHTML = " " + data.empfangen;
    document.querySelector("#restDaten").innerHTML = data.transfertLimit - (data.empfangen + data.gesendet) + " MB";
    document.querySelector("#limit").innerHTML = " " + data.transfertLimit;

    // config
    if (typeof data.checkedRadio !== "undefined") {
      if (data.checkedRadio === 1) {
        document.querySelector("#radio1").checked = true;
        const input2 = document.querySelector("#input2");
        input2.disabled = true;
        input2.style.opacity = 0.3;
      } else if (data.checkedRadio === 2) {
        document.querySelector("#radio2").checked = true;
        const input1 = document.querySelector("#input1");
        input1.disabled = true;
        input1.style.opacity = 0.3;
      }
    } else {
      document.querySelector("#radio1").checked = true;
      const input2 = document.querySelector("#input2");
      input2.disabled = true;
      input2.style.opacity = 0.3;
    }
    if (typeof data.userNotificationValueInPercent !== "undefined" && data.userNotificationValueInPercent !== -1) {
      document.querySelector("#input1").value = data.userNotificationValueInPercent;
    }
    if (typeof data.userNotificationValueInMB !== "undefined" && data.userNotificationValueInMB !== -1) {
      document.querySelector("#input2").value = data.userNotificationValueInMB;
    }
  }
);

// (accompli) les features des le popup

// slide up/down :: config and details
document.querySelector("#details").addEventListener("click", function () {
  document.querySelector("#box2").classList.add("hide");
  document.querySelector("#config-icon").src = "/icon/baseline-expand_more-24px.svg";
  document.querySelector("#box1").classList.toggle('hide');
  document.querySelector("#details-icon").src = "/icon/baseline-expand_less-24px.svg";
  if (document.querySelector("#box1").classList.contains("hide")) {
    document.querySelector("#details-icon").src = "/icon/baseline-expand_more-24px.svg";
  }
});
document.querySelector("#config").addEventListener("click", function () {
  document.querySelector("#box1").classList.add("hide");
  document.querySelector("#details-icon").src = "/icon/baseline-expand_more-24px.svg";
  document.querySelector("#box2").classList.toggle('hide');
  document.querySelector("#config-icon").src = "/icon/baseline-expand_less-24px.svg";
  if (document.querySelector("#box2").classList.contains("hide")) {
    document.querySelector("#config-icon").src = "/icon/baseline-expand_more-24px.svg";
  }
});

// (accompli) restreindre les possibilte au niveau des inputs (les valeurs possible que l utilisateur peut entrer)
/**
 * l'utilisateur ne peut entrer que des nombres de 0 a 9 respectivement d'une longueur de 2 et 4 
 * caractere dans le input1 et input2.
 */
document.querySelectorAll("#input1, #input2").forEach((element, index) => {
  element.addEventListener("keypress", (evt) => {
    let theEvent = evt || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    let regexMaxLength;
    if (index === 0) {
      regexMaxLength = /^[0-9]{0,1}$/;
    } else {
      regexMaxLength = /^[0-9]{0,3}$/;
    }
    let regexOnlyNumber = /[0-9]/;
    if (!regexOnlyNumber.test(key) || !regexMaxLength.test(evt.target.value)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  });
});


// (accompli) enregistrer dans le local storage la config de l utilisateur

document.querySelector("#save").addEventListener("click", (event) => {
  // show done icon
  const doneIcon = event.target.nextElementSibling;
  doneIcon.style.visibility = "visible";

  const checkedRadio = parseInt(document.querySelector("#radio1:checked, #radio2:checked").value);

  let userNotificationValueInPercent = -1;
  if (document.querySelector("#input1").value !== "") {
    userNotificationValueInPercent = parseInt(document.querySelector("#input1").value);
  }

  let userNotificationValueInMB = -1;
  if (document.querySelector("#input2").value !== "") {
    userNotificationValueInMB = parseInt(document.querySelector("#input2").value);
  }


  chrome.storage.sync.set({
    checkedRadio: checkedRadio,
    userNotificationValueInPercent: userNotificationValueInPercent,
    userNotificationValueInMB: userNotificationValueInMB,
    isNotificationAlreadyShow: false
  });

  // hidde done icon
  window.setTimeout(() => {
    doneIcon.style.visibility = "hidden";
  }, 1000);

});

// (accompli) reset button tout ce qui l entoure
document.querySelector("#reset").addEventListener("click", (event) => {
  const doneIcon = event.target.nextElementSibling;
  doneIcon.style.visibility = "visible";
  document.querySelector("#input1").value = "";
  document.querySelector("#input2").value = "";
  chrome.storage.sync.set({
    checkedRadio: 1,
    userNotificationValueInPercent: -1,
    userNotificationValueInMB: -1,
    isNotificationAlreadyShow: false
  }, function () {
    console.log('User Config reset');
  });
  window.setTimeout(() => {
    doneIcon.style.visibility = "hidden";
  }, 1000);
});

// TODO eventuellement repatir chaque groupe de tache dans un fichier js specifique.

// (accompli) mettre le place le system de salution en fonction de l heure qu il est.
let hours = new Date().getHours();
var greeting = document.querySelector("#guten");
if (hours >= 4 && hours < 10) {
  greeting.innerHTML = "Guten Morgen..."
} else if (hours >= 10 && hours < 18) {
  greeting.innerHTML = "Guten Tag..."
} else if (hours >= 18 && hours <= 22) {
  greeting.innerHTML = "Guten Abend..."
} else if (hours >= 22 && hours <= 23) {
  greeting.innerHTML = "Gute Nacht..."
} else {
  greeting.innerHTML = "Hi..."
}

/// alert du bist nicht in dem Domain
// if(document.querySelector("#xhttpsucces").innerText === ""){
//   document.querySelector("body").innerHTML = "Du bist nicht in dem Dorf domain";
// }


// (accompli) cacher un input lorqu il n a pas ete selectionne
let checkbox = document.querySelectorAll(".form-check-input");
checkbox[0].addEventListener("click", () => {
  var input2 = document.querySelector("#input2");
  input2.disabled = true;
  input2.style.opacity = 0.3;
  var input1 = document.querySelector("#input1");
  input1.disabled = false;
  input1.style.opacity = 1;
});
checkbox[1].addEventListener("click", () => {
  var input2 = document.querySelector("#input2");
  input2.disabled = false;
  input2.style.opacity = 1;
  var input1 = document.querySelector("#input1");
  input1.disabled = true;
  input1.style.opacity = 0.3;
});

// (accompli) changement de couleur lorsque le pourcentage est dessous de 25.
/**
 * show a progress circle corresponding to the  @param percent
 * make a progress circle red if @param percent < 25 %  
 * @param {number} percent - current rest data volume from user in percent
 */
function showProgressCircle(percent) {
  let bar;
  if (percent <= 25) {
    bar = new ldBar("#progressCircle", {
      "stroke": '#f00',
      "stroke-width": 10,
      "preset": "bubble",
      "fill": "data:ldbar/res,bubble(#DC143C,#fff,50,1)"
    });
    document.querySelector("#restDaten").style.color = "brown";
  } else {
    bar = new ldBar("#progressCircle", {
      "stroke": '#f00',
      "stroke-width": 10,
      "preset": "bubble"
    });
  }
  bar.set(percent);
}