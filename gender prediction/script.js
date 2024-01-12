document.addEventListener('DOMContentLoaded', () => {
    const predictionForm = document.getElementById('predictionForm');
    const nameInput = document.getElementById('nameInput');
    const errorMessage = document.getElementById('errorMessage');
    const predictionResult = document.getElementById('predictionResult');
    const savedAnswersList = document.getElementById('savedAnswers');
    const clearAllButton = document.getElementById('clearAllButton');
    const saveButton = document.getElementById('saveButton');
    let savedAnswers = loadSavedAnswers();
    let currentPrediction = null;

    predictionForm.addEventListener('submit', handleFormSubmit);
    saveButton.addEventListener('click', handleSaveButtonClick);
    clearAllButton.addEventListener('click', handleClearAllButtonClick);
    savedAnswersList.addEventListener('click', handleSavedAnswersListClick);

    function handleFormSubmit(event) {
        event.preventDefault();
        clearErrorMessage();
        const name = nameInput.value.trim();
        const selectedGender = getSelectedGender();
        if (!name) return displayError('Please enter a name.');
        fetchAndDisplayPrediction(name, selectedGender);
    }

    function getSelectedGender() {
        return document.querySelector('input[name="gender"]:checked')?.value;
    }

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

    function handleSaveButtonClick() {
        if (!currentPrediction) return;
        savePrediction(currentPrediction);
        updateSavedAnswersDisplay();
        savePredictionsToStorage();
    }

    function handleClearAllButtonClick() {
        clearSavedAnswers();
        updateSavedAnswersDisplay();
    }

    function handleSavedAnswersListClick(event) {
        if (!event.target.matches('.delete-btn')) return;
        const index = Array.from(savedAnswersList.children).indexOf(event.target.parentElement);
        deleteSavedAnswer(index);
        updateSavedAnswersDisplay();
    }

    function clearErrorMessage() {
        errorMessage.textContent = '';
    }

    function displayError(message) {
        errorMessage.textContent = message;
    }

    function displayPrediction(prediction) {
        predictionResult.textContent = `${prediction.name}: ${prediction.gender}`;
    }

    function savePrediction(prediction) {
        const existingIndex = savedAnswers.findIndex(ans => ans.name.toLowerCase() === prediction.name.toLowerCase());
        if (existingIndex !== -1) {
            savedAnswers[existingIndex] = prediction;
        } else {
            savedAnswers.push(prediction);
        }
    }

    function savePredictionsToStorage() {
        localStorage.setItem('savedPredictions', JSON.stringify(savedAnswers));
    }

    function loadSavedAnswers() {
        const storedPredictions = localStorage.getItem('savedPredictions');
        return storedPredictions ? JSON.parse(storedPredictions) : [];
    }

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

    function deleteSavedAnswer(index) {
        savedAnswers.splice(index, 1);
        savePredictionsToStorage();
    }

    function clearSavedAnswers() {
        savedAnswers = [];
        savePredictionsToStorage();
    }
});

