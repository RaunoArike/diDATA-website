async function checkExistingKey() {
    if (localStorage.getItem('apiKey')) {
        window.location.href = '/courses/';
        return;
    }
}

checkExistingKey()


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
                window.location.href = `/courses`;
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
