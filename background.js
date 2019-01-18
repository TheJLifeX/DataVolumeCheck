'use strict';

/**
 * Active the Extension.
 */
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                // pageUrl: { urlMatches: "/*/" }
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

createDiv();

getTransfertDataFromServer();
window.setInterval(function () {
    getTransfertDataFromServer();
}, 240000); // always with intervall of 3 Min.

// (accompli) recuperer les donnees cotes serveur et enregistrer les donnees dans le local storage. 
/**
 * Create a display none DIV
 */
function createDiv() {
    let div = document.createElement("DIV");
    div.id = "displaynone";

    // L'element ne sera pas afficer, c'est pas tres important parce que le background na pas vraiment de page html
    div.style.display = "none";

    document.querySelector("body").appendChild(div);
}

/**
 * Send a Request to the Datavolumen Server.
 */
function getTransfertDataFromServer() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            saveData(xhttp);
        }
    };

    // TODO Afficher une information a l'utilisateur lorsqu'il ne se trouve pas dans le dorfnetz.
    xhttp.onerror = function (event) {
        console.log("Der Request dauert zu lange!");
    };
    xhttp.open("GET", "http://10.4.11.1/traffic.php", true);
    xhttp.send();

}

/**
 * save the Data in local storage
 * 
 * @param {XMLHttpRequest} xhttp 
 */
function saveData(xhttp) {
    document.querySelector("#displaynone").innerHTML = xhttp.responseText;
    const nameTemp = document.querySelector("#displaynone h3").firstChild.nodeValue;
    const index = nameTemp.indexOf(",");
    const name = nameTemp.slice(5, index);

    const childNodes = document.querySelector("tt").childNodes;
    let numbersFromString = childNodes[0].nodeValue.match(/\d+/g).map(n => parseInt(n));
    const gesendet = numbersFromString[0];

    numbersFromString = childNodes[2].nodeValue.match(/\d+/g).map(n => parseInt(n));
    const empfangen = numbersFromString[0];

    numbersFromString = childNodes[9].nodeValue.match(/\d+/g).map(n => parseInt(n));

    let transfertLimit = 10737;
    if (numbersFromString.length > 0) {
        transfertLimit = numbersFromString[0];
    }


    chrome.storage.sync.set({
        name: name,
        gesendet: gesendet,
        empfangen: empfangen,
        transfertLimit: transfertLimit
    }, function () {
        const restDaten = transfertLimit - (empfangen + gesendet);
        showNotification(restDaten, transfertLimit);
        console.log('Data saved :: ',
            "Name: " + name, "Gesendet: ", gesendet,
            "Empfangen: ", empfangen,
            "TransfertLimit: ", transfertLimit);
    });
}

// (accompli) mettre en place le system de notification.
/**
 * Affiche une notification quand certaines conditions sont remplis.
 * 
 * @param {number} restDaten - le reste de donnees. 
 * @param {number} transfertLimit - la limite des donnees.
 */
function showNotification(restDaten, transfertLimit) {
    chrome.storage.sync.get([
            "checkedRadio",
            "input1_Value",
            "input2_Value",
            "isNotificationAlreadyShow"
        ],
        function (data) {
            if (typeof data.input1_Value !== "undefined" && data.input1_Value !== -1) {
                const percent = (Math.round(restDaten * 100 / transfertLimit));
                if (data.checkedRadio === 1 && percent < data.input1_Value && !data.isNotificationAlreadyShow) {
                    typeNotification(1, data.input1_Value);
                    chrome.storage.sync.set({
                        isNotificationAlreadyShow: true
                    });
                }
                if (percent > data.input1_Value) {
                    clearAllNotifications();
                }
            }
            if (typeof data.input2_Value !== "undefined" && data.input2_Value !== -1) {
                if (data.checkedRadio === 2 && restDaten < data.input2_Value && !data.isNotificationAlreadyShow) {
                    typeNotification(2, data.input2_Value);
                    chrome.storage.sync.set({
                        isNotificationAlreadyShow: true
                    });
                }
                if (restDaten > data.input2_Value) {
                    clearAllNotifications();
                }
            }
        });
}

/**
 * Create a notification corresponding to the @param type.
 * @param {number} type 
 * @param {number} userThershold 
 */
function typeNotification(type, userThershold) {
    if (type === 1) {
        createNotification("01", "Du hast jetzt weniger als " + userThershold + "% Datenvolumen.");
    }
    if (type === 2) {
        createNotification("02", "Du hast jetzt weniger als " + userThershold + " MB Datenvolumen.");
    }
}

/**
 *  Create a notification
 * @param {number} id 
 * @param {string} message 
 */
function createNotification(id, message) {
    chrome.notifications.create(id, {
        type: "basic",
        iconUrl: "/images/warning.png",
        title: "Datenvolumen notification",
        message: message
    }, function () {
        console.log("notification show!");
    });
}

/**
 * clear all notifications.
 */
function clearAllNotifications() {
    for (let i = 1; i < 3; i++) {
        chrome.notifications.clear("0" + i);
    }
    chrome.storage.sync.set({
        isNotificationAlreadyShow: false
    });
}