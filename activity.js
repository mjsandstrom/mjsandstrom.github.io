console.log('the change is pushed 7')
//Fetches the codename of the marketing consent
async function getConsentCodeName(){
    let consentJson;
    const res = await fetch("https://trainingguidesweb20231129161152.azurewebsites.net/consent/marketing/");

    consentJson = await res.json();

    return JSON.stringify(consentJson).replace(/"+/g, '');
}


// Click handler that creates a consent agreement for the current contact
function trackingConsentAgree(consentName) {
    console.log('agreed to consent 1: '+ consentName);
    kxt('consentagree', {
        codeName: consentName,
        callback: () => {
            // Enables tracking for any subsequent logging scripts
            kxt('updateconsent', {
                allow_tracking: true,
                allow_datainput: true
            });
            alert('agreed to consent 2: ' + consentName);
        },
        onerror: t => console.log(t)
    });
}

// Click handler that revokes the tracking consent agreement for the current contact
function trackingConsentRevoke(consentName) {
    console.log('revoked consent 1: '+ consentName);
    kxt('consentrevoke', {
        codeName: consentName,
        callback: () => {
            // Disables tracking for any subsequent logging scripts
            kxt('updateconsent', {
                allow_tracking: false,
                allow_datainput: false
            });
            alert('revoked consent 2: ' + consentName);
        },
        onerror: t => console.log(t)
    });
}

//Click handler that logs a link click.
function logLinkClick() {
    kxt('click', {
        label: this.getAttribute("alt"),
        onerror: t => console.log(t)
    });
    console.log('logged standard click');
}

//Click handler that logs a file download activity
function logDownload() {
    kxt('customactivity', {
        type: 'filedownload',
        value: this.getAttribute('alt') + ', '  + window.location.pathname,
        title: 'File download',
        onerror: t => console.log(t)
    });
    console.log('logged file download');
}

//When the document loads
document.addEventListener('DOMContentLoaded', function () {
    // Disables all tracking by default
    kxt('consentdefault', {
        allow_tracking: false,
        allow_datainput: false
    });
    getConsentCodeName().then((consentName) => {
        console.log('consent name: ' + consentName);
        trackingConsentAgree(consentName);
        // Retrieves and displays the consent text
        kxt('consentdata', {
            codeName: consentName,
            languageName: 'en',
            callback: consentData => {
                document.getElementById('lblConsentText').innerHTML = consentData.shortText;
            },
            onerror: t => console.log(t)
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
                    console.log('tracking enabled because consent is already accepted');
                }
            },
            onerror: t => console.log(t)
        });

        // Logs a page visit activity (if tracking is enabled for the current contact)
        kxt('pagevisit');

        //Registers click event handlers for consent functions
        const consentAgreeButton = document.getElementById("btnConsentAgree");
        consentAgreeButton.addEventListener("click", function () {
            trackingConsentAgree(consentName);  
        });
        console.log('agree HAndler Registered');

        const consentRevokeButton = document.getElementById("btnConsentRevoke");
        consentRevokeButton.addEventListener("click", function () {
            trackingConsentRevoke(consentName);
        });
        console.log('revoke Handler Registered');

        console.log(consentName);
    });

    const links = document.getElementsByTagName("a");
    //Registers click event handlers for download and standard links
    for (let i = 0; i < links.length; i++) {
        if (links[i].hasAttribute("download")) {
            links[i].addEventListener("click", logDownload);
            console.log('added click handler for a download link');
        }
        else{
            links[i].addEventListener("click", logLinkClick);
            console.log('added click handler for a standard link');
        }
    }
});