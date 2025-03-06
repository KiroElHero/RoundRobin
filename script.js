const nameMap = new Map();
let currentIndex = 0;


function addName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    if (name && !nameMap.has(name)) {
        nameMap.set(name, [0, 0]); // Initialize with zero cases taken and moved
        nameInput.value = '';
        updateNameList();
        if (nameMap.size === 1) {
            updateCurrentPersonDisplay();
        }
    } else if (nameMap.has(name)) {
        alert('Name already exists in the list.');
    }
}

function updateNameList() {
    const nameList = document.getElementById('nameList');
    nameList.innerHTML = ''; // Clear the list

    for (const [name, value] of nameMap) {
        const card = document.createElement('div');
        card.className = 'card';

        const nameHeading = document.createElement('h3');
        nameHeading.innerText = name;
        card.appendChild(nameHeading);

        const badges = document.createElement('div');
        badges.className = 'badges';

        const casesTakenBadge = document.createElement('span');
        casesTakenBadge.className = 'badge cases-taken-badge';
        casesTakenBadge.innerText = `Cases Taken: ${value[0]}`;
        badges.appendChild(casesTakenBadge);

        const casesMovedBadge = document.createElement('span');
        casesMovedBadge.className = 'badge cases-moved-badge';
        casesMovedBadge.innerText = `Cases Moved: ${value[1]}`;
        badges.appendChild(casesMovedBadge);

        card.appendChild(badges);

        const cardButtons = document.createElement('div');
        cardButtons.className = 'card-buttons';

        // Create Move button
        const moveButton = document.createElement('button');
        moveButton.innerText = "Move";
        moveButton.className = 'move-btn';
        moveButton.onclick = () => move(name);
        cardButtons.appendChild(moveButton);

        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = "Delete";
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteName(name);
        cardButtons.appendChild(deleteButton);

        card.appendChild(cardButtons);
        nameList.appendChild(card);
    }
}


function deleteName(name) {
    if (!nameMap.has(name)) return;

    nameMap.delete(name); // Remove the name from the map
    updateNameList(); // Refresh the list

    // Reset currentIndex if necessary
    if (nameMap.size === 0) {
        currentIndex = 0;
        updateCurrentPersonDisplay();
    } else if (currentIndex >= nameMap.size) {
        currentIndex = 0; // Reset to start if last person was deleted
    }
}


function move(name) {
    if (!nameMap.has(name)) return;

    const value = nameMap.get(name);
    if (value[0] === 0) {
        alert('No cases taken by this person');
        return;
    }
    nameMap.set(name, [value[0] - 1, value[1] + 1]);
    updateNameList();
}




function updateCurrentPersonDisplay() {
    const currentPersonDisplay = document.getElementById('currentPerson');
    const namesArray = Array.from(nameMap.keys());
    if (namesArray.length > 0) {
        const currentName = namesArray[currentIndex];
        currentPersonDisplay.innerText = `Current Person: ${currentName}`;
    } else {
        currentPersonDisplay.innerText = 'No names added yet.';
    }
}

function nextPerson() {
    if (nameMap.size === 0) {
        alert('No names in the list.');
        return;
    }
    const namesArray = Array.from(nameMap.keys());
    const currentName = namesArray[currentIndex];
    const currentAppendedText = nameMap.get(currentName);
    nameMap.set(currentName, [currentAppendedText[0]+1,currentAppendedText[1]]); // Append new text
    updateNameList(); // Refresh the list to reflect appended text
    currentIndex = (currentIndex + 1) % nameMap.size;
    updateCurrentPersonDisplay();
}

function skipPerson() {
    if (nameMap.size === 0) {
        alert('No names in the list.');
        return;
    }
    updateNameList(); // Refresh the list to reflect appended text
    currentIndex = (currentIndex + 1) % nameMap.size;
    updateCurrentPersonDisplay();
}


function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addName();
    }
}


