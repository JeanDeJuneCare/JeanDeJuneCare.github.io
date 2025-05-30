(function () {
    'use strict';

    const configuration = {
        display: true,
        probability_display: 0.1,
        partner : "greengo",
        url_filters: {
            data_collection: "https://www.greengo.voyage/checkout/",
            display_offer: "https://www.greengo.voyage/checkout#success"
        },
        value_getters: [
            {
                start_date: {
                    js_path: "form > div > div.w-full > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(2)",
                    post_processor: {
                        type: "regex",
                        value: "^(.*) -"
                    }
                }
            },
            {
                end_date: {
                    js_path: "form > div > div.w-full > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(2)",
                    post_processor: {
                        type: "regex",
                        value: "- (.*)$"
                    }
                }
            }
        ],
        insurance_price: {
            "type": "percentage",
            "value": 10,
        },
        main_color: "#f00",
        step1_offer: {
            title: "Assurance annulation",
            description: "...",
            conditions: [
                "Greve",
                "Maladie"
            ],    
            call_to_action: "S'assurer pour [prix]"
        },
        step2_values: {
            title: "Assurance annulation",
            description: "...",
            call_to_action: "C'est Parti"
        }
    };

    function extractAndStoreValues(value_getters) {
        const values = {};
        //DONE Implement function here to get values
        value_getters.forEach(getter => {
            for (const [key, config] of Object.entries(getter)) {
                const element = document.querySelector(config.js_path);
                if (element) {
                    let value = element.textContent || element.value;
    
                    if (config.post_processor && config.post_processor.type === "regex") {
                        const regex = new RegExp(config.post_processor.value);
                        const match = value.match(regex);
                        if (match) {
                            value = match[1];
                        }
                    }
    
                    values[key] = value;
                }
            }
        });
        localStorage.setItem('june-care-values', JSON.stringify(values));
    }

    function retrieveStoredValues() {
        const values = localStorage.getItem('june-care-values');
        if (!values) {
            // Error, notify
            console.error('No values found in localStorage.');
            return null;
        }

        try {
            return JSON.parse(values);
        } catch (error) {
            // Error parsing JSON
            console.error('Error parsing stored values:', error);
            return null;
        }
    }

    function buildPopup(configuration, values) {
        const popup = document.createElement('div');
        popup.classList.add('june-care-popup');
    
        // Create the header element using HTML
        const headerDiv = createHeader(configuration.step1_offer.title);
    
        const description = document.createElement('p');
        description.textContent = configuration.step1_offer.description;
    
        const coverage = createCoverageDetails(configuration.step1_offer.condition);
    
        // Event details section
        const eventDetailsDiv = createEventDetails(values);
    
        // Append the header to the popup
        popup.appendChild(headerDiv);
        popup.appendChild(description);
        popup.appendChild(coverage);
        popup.appendChild(eventDetailsDiv);
    
        return popup;
    }
    
    function createHeader(title) {
        const headerHTML = `
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false"
                    class="june-care-icon" viewBox="0 0 512 512">
                    <path fill="currentColor"
                        d="M269.4 2.9C265.2 1 260.7 0 256 0s-9.2 1-13.4 2.9L54.3 82.8c-22 9.3-38.4 31-38.3 57.2c.5 99.2 41.3 280.7 213.6 363.2c16.7 8 36.1 8 52.8 0C454.7 420.7 495.5 239.2 496 140c.1-26.2-16.3-47.9-38.3-57.2L269.4 2.9zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z">
                    </path>
                </svg>
                <h2>${title}</h2>
            </span>
            <button id="june-care-close-popup" class="june-care-close-button">&times;</button>
        `;
    
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = headerHTML;
        headerDiv.classList.add("june-care-header");
    
        return headerDiv;
    }
    
    function createCoverageDetails(conditions) {
        const coverage = document.createElement('div');
        coverage.classList.add("june-care-coverage-details");
    
        const cover = document.createElement('h4');
        cover.textContent = "Ce qui est couvert";
    
        const ulElement = document.createElement('ul');
        ulElement.className = 'june-care-benefits';
    
        const svgContent = `
        <svg class="june-care-icon" version="1.1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" fill="#000000">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g>
                    <g id="check_x5F_alt">
                        <path style="fill:currentColor;"
                            d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M13.52,23.383 L6.158,16.02l2.828-2.828l4.533,4.535l9.617-9.617l2.828,2.828L13.52,23.383z">
                        </path>
                    </g>
                </g>
            </g>
        </svg>
        `;
    
        conditions.forEach(condition => {
            const liElement = document.createElement('li');
    
            // Add the SVG
            liElement.innerHTML = svgContent;
    
            // Create the span element
            const spanElement = document.createElement('span');
            spanElement.textContent = ` ${condition}`;
    
            // Append the span to the li
            liElement.appendChild(spanElement);
    
            // Append the li to the ul
            ulElement.appendChild(liElement);
        });
    
        coverage.appendChild(cover);
        coverage.appendChild(ulElement);
    
        return coverage;
    }
    
    function createEventDetails(values) {
        const eventDetailsDiv = document.createElement('div');
        eventDetailsDiv.id = "june-care-eventDetails";
        eventDetailsDiv.style.display = "none";
    
        const eventDetails = [
            { label: "Evenement", id: "june-care-nameInput", value: values.name },
            { label: "Date", id: "june-care-dateInput", value: values.start_date },
            { label: "Lieu", id: "june-care-placeInput", value: values.place },
            { label: "Nombre de billets", id: "june-care-ticketsInput", value: values.numberOfTickets},
            { label: "Prix final", id: "june-care-priceInput", value: values.price },
            { label: "Email", id: "june-care-emailInput", value: "" },
            { label: "Prénom", id: "june-care-firstNameInput", value: "" },
            { label: "Nom de famille", id: "june-care-lastNameInput", value: "" }
        ];
    
        eventDetails.forEach(detail => {
            const inputContainer = document.createElement('p');
            inputContainer.classList.add("june-care-input-container");
    
            const strongElement = document.createElement('strong');
            strongElement.textContent = detail.label;
    
            const inputElement = document.createElement('input');
            inputElement.type = "text";
            inputElement.id = detail.id;
            inputElement.value = detail.value;
            inputElement.classList.add("june-care-input");
            if (detail.value) {
                inputElement.classList.add("june-care-readonly");
                inputElement.readOnly = true;
            }
    
            inputContainer.appendChild(strongElement);
            inputContainer.appendChild(inputElement);
            eventDetailsDiv.appendChild(inputContainer);
        });
    
        const checkboxContainer = document.createElement('p');
        const checkboxInput = document.createElement('input');
        checkboxInput.type = "checkbox";
        checkboxInput.id = "june-care-assurance";
        checkboxInput.name = "assurance";
    
        const checkboxLabel = document.createElement('label');
        checkboxLabel.textContent = "En sélectionnant cette assurance, je confirme être résident de l’Union Européenne et déclare avoir pris connaissance, puis accepter le ";
    
        const conditionsLink = document.createElement('a');
        conditionsLink.href = "https://junecare-assurance.github.io/conditions-generales.pdf";
        conditionsLink.classList.add("june-care-link");
        conditionsLink.target = "_blank";
        conditionsLink.textContent = "conditions générales";
    
        const infoLink = document.createElement('a');
        infoLink.href = "https://junecare-assurance.io/document-informations.pdf";
        infoLink.classList.add("june-care-link");
        infoLink.target = "_blank";
        infoLink.textContent = "document d'information";
    
        checkboxLabel.appendChild(conditionsLink);
        checkboxLabel.appendChild(document.createTextNode(" et le "));
        checkboxLabel.appendChild(infoLink);
        checkboxLabel.appendChild(document.createTextNode("."));
    
        checkboxContainer.appendChild(checkboxInput);
        checkboxContainer.appendChild(checkboxLabel);
        eventDetailsDiv.appendChild(checkboxContainer);
    
        return eventDetailsDiv;
    }
    
    function subscribe(values, partner) {
        const accepted_terms_and_conditions = document.getElementById('june-care-terms-and-conditions').checked;
        const email = document.getElementById('june-care-emailInput').value.trim();
        const firstName = document.getElementById('june-care-firstNameInput').value.trim();
        const lastName = document.getElementById('june-care-lastNameInput').value.trim();
        if (!(accepted_terms_and_conditions && email && firstName && lastName)) { 
            alert('Veuillez remplir tous les champs et accepter les conditions générales et le document d\'information.');
            return; 
        };

        fetch('https://pg-ai.bubbleapps.io/version-test/api/1.1/wf/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price: values.price,
                partner: partner,
                email: email,
                firstname: firstName,
                lastname: lastName,
                redirect_url: window.location.href
            })
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = data.payment_url;
        });
    }



    // Fonction pour fermer la popup et l'overlay
    function closePopupAndOverlay(popup, overlay) {
        if (popup) {
            document.body.removeChild(popup);
        }
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }

    // Fonction pour mettre à jour les champs de la popup avec les données localStorage
    function updatePopupFields(localStorageData) {
        if (localStorageData) {
            updateInputField('june-care-nameInput', localStorageData.name, 'Non trouvé');
            updateInputField('june-care-dateInput', localStorageData.date, 'Non trouvé');
            updateInputField('june-care-placeInput', localStorageData.place, 'Non trouvé');
            updateInputField('june-care-ticketsInput', localStorageData.numberOfTickets, 'Non trouvé');
            updateInputField('june-care-priceInput', (localStorageData.finalPrice * 8 / 100).toFixed(2) + ' €', 'Non trouvé');
            updateInputField('june-care-emailInput', localStorageData.email, '');
            updateInputField('june-care-firstNameInput', localStorageData.firstName, '');
            updateInputField('june-care-lastNameInput', localStorageData.lastName, '');
        }
    }

    // Fonction pour mettre à jour un champ d'entrée avec une valeur donnée
    function updateInputField(id, value, defaultValue) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value ? value : defaultValue;
        }
    }

    // Fonction pour ajouter les écouteurs d'événements à la popup
    function addPopupEventListeners(localStorageData) {
        const closePopupButton = document.getElementById('june-care-closePopup');
        if (closePopupButton) {
            closePopupButton.addEventListener('click', closePopup);
        } else {
            console.error('Bouton de fermeture de la popup non trouvé');
        }

        const payButton = createPayButton(localStorageData);
        payButton.addEventListener('click', handlePayButtonClick);
    }

    // Fonction pour créer et retourner le bouton de paiement
    function createPayButton(localStorageData) {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('june-care-button-container');

        const payButton = document.createElement('button');
        payButton.id = 'june-care-payNow';
        payButton.textContent = localStorageData ? 'M\'assurer pour ' + ((localStorageData.finalPrice * 8 / 100).toFixed(2) || 'Non trouvé') + '€' : 'M\'assurer pour 10€';
        buttonContainer.appendChild(payButton);
        document.querySelector('.june-care-popup').appendChild(buttonContainer);

        return payButton;
    }

    // Fonction pour gérer le clic sur le bouton de paiement
    function handlePayButtonClick(values, partner) {
        const coverageDetails = document.getElementById('june-care-coverageDetails');
        const eventDetails = document.getElementById('june-care-eventDetails');
        const payButton = document.getElementById('june-care-payNow');

        if (isFirstClick) {
            coverageDetails.style.display = 'none';
            eventDetails.style.display = 'block';
            payButton.textContent = 'Continuer';
            isFirstClick = false;
        } else {
            subscribe(values, partner);
        }
    }

    // Fonction pour fermer la popup
    function closePopup() {
        document.body.removeChild(document.querySelector('.june-care-popup'));
        document.body.removeChild(document.querySelector('.june-care-overlay'));
    }

    // Initialisation au chargement de la page
    // Initialisation au chargement de la page
    function initialize(configuration) {
        const currentUrl = window.location.href;

        if (currentUrl.includes(configuration.url_filters.data_collection)) {
            extractAndStoreValues(configuration.value_getters);
        } else if (currentUrl.includes(configuration.url_filters.display_offer)) {
            buildPopup();
        }
    }

    // Variables globales
    let isFirstClick = true;

    // Appel direct de la fonction d'initialisation
    initialize(configuration);

})();
