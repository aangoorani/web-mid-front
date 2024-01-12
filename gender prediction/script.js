document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const predictionForm = document.getElementById('predictionForm');
    const nameInput = document.getElementById('nameInput');
    const errorMessage = document.getElementById('errorMessage');
    const predictionResult = document.getElementById('predictionResult');
    const savedAnswersList = document.getElementById('savedAnswers');
    const clearAllButton = document.getElementById('clearAllButton');
    const saveButton = document.getElementById('saveButton');

    // State variables
    let savedAnswers = loadSavedAnswers();
    let currentPrediction = null;

    // Event listeners
    predictionForm.addEventListener('submit', handleFormSubmit);
    saveButton.addEventListener('click', handleSaveButtonClick);
    clearAllButton.addEventListener('click', handleClearAllButtonClick);
    savedAnswersList.addEventListener('click', handleSavedAnswersListClick);

    // Form submission handler
    function handleFormSubmit(event) {
        event.preventDefault();
        clearErrorMessage();
        const name = nameInput.value.trim();
        const selectedGender = getSelectedGender();
        if (!name) return displayError('Please enter a name.');
        fetchAndDisplayPrediction(name, selectedGender);
    }

    // Get selected gender from the form
    function getSelectedGender() {
        return document.querySelector('input[name="gender"]:checked')?.value;
    }

    // Fetch and display gender prediction from the API
    async function fetchAndDisplayPrediction(name, selectedGender) {
        try {
            const response = await fetch(`https://api.genderize.io/?name=${name}`);
            const data = await response.json();
            if (data.gender === null) return displayError('Unable to predict gender for this name.');
            currentPrediction = { name, gender: selectedGender === 'api' ? data.gender : selectedGender };
            displayPrediction(currentPrediction);
        } catch (error) {
            displayError('An error occurred while fetching the prediction.');
        }
    }

    // Save the current prediction
    function handleSaveButtonClick() {
        if (!currentPrediction) return;
        savePrediction(currentPrediction);
        updateSavedAnswersDisplay();
        savePredictionsToStorage();
    }

    // Clear all saved predictions
    function handleClearAllButtonClick() {
        clearSavedAnswers();
        updateSavedAnswersDisplay();
    }

    // Delete a saved prediction when clicking the delete button
    function handleSavedAnswersListClick(event) {
        if (!event.target.matches('.delete-btn')) return;
        const index = Array.from(savedAnswersList.children).indexOf(event.target.parentElement);
        deleteSavedAnswer(index);
        updateSavedAnswersDisplay();
    }

    // Clear error messages
    function clearErrorMessage() {
        errorMessage.textContent = '';
    }

    // Display an error message
    function displayError(message) {
        errorMessage.textContent = message;
    }

    // Display the current prediction
    function displayPrediction(prediction) {
        predictionResult.textContent = `${prediction.name}: ${prediction.gender}`;
    }

    // Save a prediction to the list of saved answers
    function savePrediction(prediction) {
        const existingIndex = savedAnswers.findIndex(ans => ans.name.toLowerCase() === prediction.name.toLowerCase());
        if (existingIndex !== -1) {
            savedAnswers[existingIndex] = prediction;
        } else {
            savedAnswers.push(prediction);
        }
    }

    // Save all predictions to local storage
    function savePredictionsToStorage() {
        localStorage.setItem('savedPredictions', JSON.stringify(savedAnswers));
    }

    // Load saved answers from local storage
    function loadSavedAnswers() {
        const storedPredictions = localStorage.getItem('savedPredictions');
        return storedPredictions ? JSON.parse(storedPredictions) : [];
    }

    // Update the display of saved answers
    function updateSavedAnswersDisplay() {
        savedAnswersList.innerHTML = '';
        savedAnswers.forEach((answer, index) => {
            const li = document.createElement('li');
            li.textContent = `${answer.name} is ${answer.gender} `;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => deleteSavedAnswer(index);
            li.appendChild(deleteButton);
            savedAnswersList.appendChild(li);
        });
    }

    // Delete a saved answer at a specific index
    function deleteSavedAnswer(index) {
        savedAnswers.splice(index, 1);
        savePredictionsToStorage();
    }

    // Clear all saved answers
    function clearSavedAnswers() {
        savedAnswers = [];
        savePredictionsToStorage();
    }
});
