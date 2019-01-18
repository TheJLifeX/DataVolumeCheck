'use strict';

// (accompli) creer un model pour l'enregistrement des donnees de l utilisateur.
// json object :: javascript object
// ou bien tout simplement la structure key-value de chrome.
// "name",
// "gesendet",
// "empfangen",
// "selectedIndex",
// "checkedRadio",
// "input1_Value",
// "input2_Value"

// (accompli) recuper les donnes dans le local storage et afficher les donnees.
chrome.storage.sync.get([
    "name",
    "gesendet",
    "empfangen",
    "selectedIndex",
    "checkedRadio",
    "input1_Value",
    "input2_Value",
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
    document.querySelector("#select").selectedIndex = (typeof data.selectedIndex !== "undefined") ? data.selectedIndex : 0;
    if (typeof data.checkedRadio !== "undefined") {
      if (data.checkedRadio === 1) {
        document.querySelector("#radio1").checked = true;
        let input2 = document.querySelector("#input2");
        input2.disabled = true;
        input2.style.opacity = 0.3;
      } else if (data.checkedRadio === 2) {
        document.querySelector("#radio2").checked = true;
        let input1 = document.querySelector("#input1");
        input1.disabled = true;
        input1.style.opacity = 0.3;
      }
    } else {
      document.querySelector("#radio1").checked = true;
      let input2 = document.querySelector("#input2");
      input2.disabled = true;
      input2.style.opacity = 0.3;
    }
    if (typeof data.input1_Value !== "undefined" && data.input1_Value !== -1) {
      document.querySelector("#input1").value = data.input1_Value;
    }
    if (typeof data.input2_Value !== "undefined" && data.input2_Value !== -1) {
      document.querySelector("#input2").value = data.input2_Value;
    }
  }
);

// TODO les features des le popup

// slide up/down :: config and details
document.querySelector("#details").addEventListener("click", function (event) {
  document.querySelector("#box2").classList.add("hide");
  document.querySelector("#config-icon").src = "/icon/baseline-expand_more-24px.svg";
  document.querySelector("#box1").classList.toggle('hide');
  document.querySelector("#details-icon").src = "/icon/baseline-expand_less-24px.svg";
  if (document.querySelector("#box1").classList.contains("hide")) {
    document.querySelector("#details-icon").src = "/icon/baseline-expand_more-24px.svg";
  }
});
document.querySelector("#config").addEventListener("click", function (event) {
  document.querySelector("#box1").classList.add("hide");
  document.querySelector("#details-icon").src = "/icon/baseline-expand_more-24px.svg";
  document.querySelector("#box2").classList.toggle('hide');
  document.querySelector("#config-icon").src = "/icon/baseline-expand_less-24px.svg";
  if (document.querySelector("#box2").classList.contains("hide")) {
    document.querySelector("#config-icon").src = "/icon/baseline-expand_more-24px.svg";
  }
});

// changement de couleur lorsque le pourcentage est dessous de 25.
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

// TODO gerer le cas ou l utilisateur ne se situe pas chez lui
// spript et puis html

// TODO restreindre les possibilte au niveau des inputs (les valeurs possible que l utilisateur peut entrer)
/**
 * done :: l utilisateur ne peut entrer que des nombres de 0 a 9 respectivement d'une longueur de 2 et 4 
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


// TODO enregistrer dans le local storage la config de l utilisateur

document.querySelector("#save").addEventListener("click", (event) => {
  var doneIcon = event.target.nextElementSibling;
  doneIcon.style.visibility = "visible";
  let value1 = parseInt(document.querySelector("#select").selectedIndex);
  let value2 = parseInt(document.querySelector("#radio1:checked, #radio2:checked").value);
  let value3;
  if (document.querySelector("#input1").value !== "") {
    value3 = parseInt(document.querySelector("#input1").value);
  } else {
    value3 = -1;
  }
  let value4;
  if (document.querySelector("#input2").value !== "") {
    value4 = parseInt(document.querySelector("#input2").value);
  } else {
    value4 = -1;
  }


  chrome.storage.sync.set({
    selectedIndex: value1,
    checkedRadio: value2,
    input1_Value: value3,
    input2_Value: value4
  }, function () {
    console.log('User Config saved');
  });
  window.setTimeout(() => {
    doneIcon.style.visibility = "hidden";
  }, 1000);
});

// TODO reset button tout ce qui l entoure
document.querySelector("#reset").addEventListener("click", (event) => {
  var doneIcon = event.target.nextElementSibling;
  doneIcon.style.visibility = "visible";
  document.querySelector("#select").selectedIndex = 0;
  document.querySelector("#radio1").checked = true;
  document.querySelector("#input1").value = "";
  document.querySelector("#input2").value = "";
  chrome.storage.sync.set({
    selectedIndex: 0,
    checkedRadio: 1,
    input1_Value: -1,
    input2_Value: -1
  }, function () {
    console.log('User Config reset');
  });
  window.setTimeout(() => {
    doneIcon.style.visibility = "hidden";
  }, 1000);
});

// TODO faire un test avec marius pour voir si il comprend tout.

// TODO eventuellement repatir chaque groupe de tache dans un fichier js specifique.

// TODO mettre le place le system de salution en fonction de l heure qu il est.
let hours = new Date().getHours();
var guten = document.querySelector("#guten");
if (hours >= 4 && hours < 10) {
  guten.innerHTML = "Guten Morgen..."
} else if (hours >= 10 && hours < 18) {
  guten.innerHTML = "Guten Tag..."
} else if (hours >= 18 && hours <= 22) {
  guten.innerHTML = "Guten Abend..."
} else if (hours >= 22 && hours <= 23) {
  guten.innerHTML = "Gute Nacht..."
} else {
  guten.innerHTML = "Hi..."
}

// TODO placer le nombre de mega restant en bas de la bulle !?.

// implement Options page

/// alert du bist nicht in dem Domain
// if(document.querySelector("#xhttpsucces").innerText === ""){
//   document.querySelector("body").innerHTML = "Du bist nicht in dem Dorf domain";
// }


// cacher un input lorqu il n a pas ete selectionne
var checkbox = document.querySelectorAll(".form-check-input");
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







// let changeColor = document.getElementById('changeColor');
// chrome.storage.sync.get('color', function (data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });

// changeColor.onclick = function (element) {
//   let color = element.target.value;
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     chrome.tabs.executeScript(
//       tabs[0].id,
//       { code: 'document.body.style.backgroundColor = "' + color + '";' });
//   });
// };