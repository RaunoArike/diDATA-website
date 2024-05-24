async function checkExistingKey() {
    if (localStorage.getItem('apiKey')) {
        window.location.href = '/';
        return;
    }
}

checkExistingKey()


const infoButton = document.getElementById("info-button");
const infoTooltip = document.getElementById("info-tooltip");

let tooltipVisible = false;

infoButton.addEventListener("click", function() {
    if (!tooltipVisible) {
        infoTooltip.style.display = "block";
    } else {
        infoTooltip.style.display = "none";
    }
    tooltipVisible = !tooltipVisible;
});

infoButton.addEventListener("mouseenter", function() {
    if (!tooltipVisible) {
        const rect = infoButton.getBoundingClientRect();
        infoTooltip.style.top = rect.top - infoTooltip.offsetHeight - 5 + "px";
        infoTooltip.style.left = rect.left + "px";
        infoTooltip.style.display = "block";
    }
});

infoButton.addEventListener("mouseleave", function() {
    if (!tooltipVisible) {
        infoTooltip.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const apiKeyInput = document.getElementById("api-key-input");
    const submitButton = document.getElementById("submit-button");
    const errorMessage = document.getElementById("error-message");

    submitButton.addEventListener("click", async function(event) {
        event.preventDefault();
        
        const apiKey = apiKeyInput.value;
        
        if (!apiKey.trim()) {
            errorMessage.textContent = "Please enter your API key.";
            errorMessage.style.display = "block";
            return;
        }

        try {
            // assuming the backend supports HTTPS, the header of the request will be encrypted and I can send the API key through that
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };

            const response = await fetch(`/api/verify/`, {
                method: 'POST',
                headers: headers
            });

            if (response.ok) {
                localStorage.setItem('apiKey', apiKey);
                window.location.href = `/`;
            } else {
                errorMessage.textContent = "Invalid API key. Please try again.";
                errorMessage.style.display = "block";
            }
        } catch (error) {
            errorMessage.textContent = "An error occurred. Please try again later.";
            errorMessage.style.display = "block";
        }
    });
});
