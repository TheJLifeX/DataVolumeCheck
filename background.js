'use strict';

// TODO recuperer les donnees cotes serveur et enregistrer les donnees dans le local storage.
function createDisplayNodeDiv() {
    let div = document.createElement("DIV");
    div.id = "displaynone";
    div.style.display = "none";
    document.querySelector("body").appendChild(div);
}
createDisplayNodeDiv();

getTransfertDataFromServer();
window.setInterval(function () {
    getTransfertDataFromServer();
}, 240000);


function getTransfertDataFromServer() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            savaData(xhttp);
        }
    };
    xhttp.onerror = function (e) {
        console.log("Der Request dauert zu lange!");
    };
    xhttp.open("GET", "http://10.4.11.1/traffic.php", true);
    xhttp.send();

}

function savaData(xhttp) {
    document.querySelector("#displaynone").innerHTML = xhttp.responseText;
    let nameTemp = document.querySelector("#displaynone h3").firstChild.nodeValue;
    let index = nameTemp.indexOf(",");
    let nameValue = nameTemp.slice(5, index);

    let childNode = document.querySelector("tt").childNodes;
    let numbersFromString = childNode[0].nodeValue.match(/\d+/g).map(n => parseInt(n));
    let gesendetValue = numbersFromString[0];

    numbersFromString = childNode[2].nodeValue.match(/\d+/g).map(n => parseInt(n));
    let empfangenValue = numbersFromString[0];

    chrome.storage.sync.set({ name: nameValue, gesendet: gesendetValue, empfangen: empfangenValue }, function () {
        // notification.
        const restDaten = 10737 - (empfangenValue + gesendetValue);
        showNotification(restDaten);
        console.log('Data saved');
    });
}

// TODO mettre en place le system de notification.
function showNotification(restDaten) {
    chrome.storage.sync.get([
        "selectedIndex",
        "checkedRadio",
        "input1_Value",
        "input2_Value",
        "isNotificationAlreadyShow"],
        function (data) {
            // if (typeof data.selectedIndex !== "undefined" && data.selectedIndex !== 0) {
            //     switch (data.selectedIndex) {
            //         case 1:
            //             typeNotification(1, restDaten);
            //             break;
            //         case 2:
            //             typeNotification(2, restDaten);
            //             break;
            //         case 3:
            //             typeNotification(3, restDaten);
            //             break;
            //         case 4:
            //             typeNotification(4, restDaten);
            //             break;
            //     }
            // }
            if (typeof data.input1_Value !== "undefined" && data.input1_Value !== -1) {
                const percent = (Math.round(restDaten * 100 / 10737));
                if (data.checkedRadio === 1 && percent < data.input1_Value && !data.isNotificationAlreadyShow) {
                    typeNotification(5, restDaten, data.input1_Value);
                    chrome.storage.sync.set({ isNotificationAlreadyShow: true });
                }
                if (percent > data.input1_Value) {
                    chrome.storage.sync.set({ isNotificationAlreadyShow: false });
                    clearNotification();
                }
            }
            if (typeof data.input2_Value !== "undefined" && data.input2_Value !== -1) {
                if (data.checkedRadio === 2 && restDaten < data.input2_Value && !data.isNotificationAlreadyShow) {
                    typeNotification(6, restDaten, data.input2_Value);
                    chrome.storage.sync.set({ isNotificationAlreadyShow: true });
                }
                if (restDaten > data.input2_Value) {
                    chrome.storage.sync.set({ isNotificationAlreadyShow: false });
                    clearNotification();
                }
            }
        });
}

function typeNotification(type, restDaten, userThershold) {
    // if (type === 1) {
    //     if (restDaten < 1000) {
    //         createNotification("01", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 2000) {
    //         createNotification("02", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 3000) {
    //         createNotification("03", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 4000) {
    //         createNotification("04", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 5000) {
    //         createNotification("05", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 6000) {
    //         createNotification("06", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 7000) {
    //         createNotification("07", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 8000) {
    //         createNotification("08", "Du hast 1 Gb Datenvolumen verbraucht.");
    //     } else if (restDaten < 9000) {
    //         createNotification("09", "Du hast 1 Gb Datenvolumen verbraucht.");
    //         chrome.notifications.clear("01");
    //     }
    // }
    // TODO notification type 2 3 4.

    if (type === 5) {
        createNotification("01", "Du hast jetzt weniger als " + userThershold + "% Datenvolumen.", true);
    }
    if (type === 6) {
        createNotification("02", "Du hast jetzt weniger als " + userThershold + "MB Datenvolumen.", true);
    }
}

function createNotification(id, message, isWarning) {
    if (isWarning) {
        chrome.notifications.create(id, {
            type: "basic",
            iconUrl: "/images/warning.png",
            title: "Datenvolumen notification",
            message: message
        }, function () {
            console.log("notification show!");
        });
    } else {
        chrome.notifications.create(id, {
            type: "basic",
            iconUrl: "/images/siren.png",
            title: "Datenvolumen notification",
            message: message
        }, function () {
            console.log("notification show!");
        });
    }

}

const dayOfTheWeek = new Date().getDate();
if (dayOfTheWeek === 4) {
    clearNotification();
    console.log("All notification clear");
}

function clearNotification() {
    for (let i = 1; i < 3; i++) {
        chrome.notifications.clear("0" + i);
    }
}

// TODO considerer le cas ou on ne se situe pas sur le dorf.


// chrome.runtime.onInstalled.addListener(function () {
//   chrome.storage.sync.set({ color: '#3aa757' }, function () {
//     console.log('The color is green.');
//   });
// });
chrome.runtime.onInstalled.addListener(function () {
    //   chrome.storage.sync.set({ color: '#3aa757' }, function () {
    //     console.log('The color is green.');
    //   });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                // pageUrl: { urlMatches: "/*/" }
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

