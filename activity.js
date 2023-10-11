async function getConsentCodeName(){
    let consentJson;
    const res = await fetch("https://kbankweb20231004140405.azurewebsites.net/consent/marketing/");

    consentJson = await res.json();

    return JSON.stringify(consentJson).replace(/"+/g, '');
}

(function (w, d, s, e, n) {
    w.XperienceTrackerName = n;
    w[n] = w[n] || function () {
        (w[n].q = w[n].q || []).push(arguments);
    };
    var scriptElement = d.createElement(s);
    var scriptSection = d.getElementsByTagName(s)[0];
    scriptElement.async = 1;
    scriptElement.src = e.replace(/\/+$/, '') + '/Kentico.Resource/CrossSiteTracking/Logger.js';
    scriptSection.parentNode.insertBefore(scriptElement, scriptSection);
    w[n]('init', { mainSiteUrl: e, document: d, window: w });
})(window, document, 'script', 'https://kbankweb20231004140405.azurewebsites.net', 'kxt');

// Disables all tracking by default
kxt('consentdefault', {
    allow_tracking: false,
    allow_datainput: false
});

window.onload = function () {
    getConsentCodeName().then((consentName) => {
        // Retrieves and displays the consent text
        kxt('consentdata', {
            codeName: consentName,
            cultureCode: 'en-US',
            callback: consentData => {
                document.getElementById('lblConsentText').innerHTML = consentData.shortText;
            }
        });

        // Enables tracking if the current contact has agreed with the consent
        kxt('consentcontactstatus', {
            codeName: consentName,
            callback: consentStatus => {
                if (consentStatus.isAgreed) {
                    kxt('updateconsent', {
                        allow_tracking: true,
                        allow_datainput: true
                    });
                }
            }
        });

        // Logs a page visit activity (if tracking is enabled for the current contact)
        kxt('pagevisit');

        //Registers click event handlers for tracking functions
        const consentAgreeButton = document.getElementById("btnConsentAgree");
        consentAgreeButton.addEventListener("click", function () {
            trackingConsentAgree(consentName);
        })
        const consentRevokeButton = document.getElementById("btnConsentRevoke");
        consentRevokeButton.addEventListener("click", function () {
            trackingConsentRevoke(consentName);
        })
    });

    const links = document.getElementsByTagName("a");

    for (let i = 0; i < links.length; i++) {
        if (links[i].hasAttribute("download")) {
            links[i].addEventListener("click", logDownload);
        }
    }
}


// Click handler that creates a consent agreement for the current contact
function trackingConsentAgree(consentName) {
    kxt('consentagree', {
        codeName: consentName,
        callback: () => {
            // Enables tracking for any subsequent logging scripts
            kxt('updateconsent', {
                allow_tracking: true,
                allow_datainput: true
            });
        }
    });
}

// Click handler that revokes the tracking consent agreement for the current contact
function trackingConsentRevoke(consentName) {
    kxt('consentrevoke', {
        codeName: consentName,
        callback: () => {
            // Disables tracking for any subsequent logging scripts
            kxt('updateconsent', {
                allow_tracking: false,
                allow_datainput: false
            });
        }
    });
}

function logDownload() {
    kxt('customactivity', {
        type: 'filedownload',
        value: window.location.pathname,
        title: 'File downloaded - ' + this.getAttribute("alt")
    });
    alert("download");
}

function logLinkClick(linkLabel) {
    kxt('click', {
        label: linkLabel
    });
}