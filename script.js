let currentLevel = 0;
let score = 0;
let timer = null; // Variable for the timer
let startTime = null; // Variable for the start time
let misses = 0; // Variable for the number of incorrect guesses
let finalScore = 0; // Variable for the final score after multipliers
let statsButton = document.getElementById('stats-button');

// Puzzle data is stored locally in puzzles.js, so the game has no runtime
// dependency on the former Google App Engine service.
let levels = getDailyPuzzle();

// Start button event listener
document.getElementById('start-button').addEventListener('click', function() {
    levels = getDailyPuzzle();
    currentLevel = 0;
    score = 0;
    misses = 0;
    finalScore = 0;
    document.getElementById('misses').textContent = 'Misses: 0';
    document.getElementById('message').textContent = '';
    document.getElementById('submit-guess').disabled = false;

    updateWordAndHint();

    // Start the timer
    startTime = Date.now();
    timer = setInterval(updateTimer, 10);

    // Focus the first input field
    let firstGuessCell = document.querySelector('.guess-cell.row-1');
    if (firstGuessCell) {
        firstGuessCell.focus();
    }

    // Hide the start screen and show the game
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
});




document.getElementById('instructions-bg-color-toggle').addEventListener('click', function() {
    let body = document.body;
    if (body.style.backgroundColor === 'white' && body.style.color === 'black') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
        localStorage.setItem('theme', 'dark');  // Save theme to localStorage
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
        localStorage.setItem('theme', 'light');  // Save theme to localStorage
    }
});



function updateWordAndHint() {
    let level = levels[currentLevel];
    updateWordGrid();
    document.getElementById('hint').textContent = 'Hint: ' + level.hint;
}


function updateWordGrid() {
    let wordGrid = document.getElementById('word-grid');
    wordGrid.innerHTML = ''; // Clear the word grid


    // Create the word grid
    for (let i = 0; i <= currentLevel; i++) { // Only go up to currentLevel
        let row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 4; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            if (i <= currentLevel) {  // Add the "correct" class to completed levels and the current level
                cell.classList.add('correct');
            }
            if (i < levels.length) {
                cell.textContent = levels[i].word[j] || '';
            }
            row.appendChild(cell);
        }
        wordGrid.appendChild(row);
    }


// Create the row for the input fields
let inputRow = document.createElement('div');
inputRow.className = 'row';
for (let j = 0; j < 4; j++) {
    let cell = document.createElement('input');
    cell.type = 'text';
    cell.className = `guess-cell row-${currentLevel+1}`;  // Add the row number to the class name
    cell.maxLength = '1';
    inputRow.appendChild(cell);
}
wordGrid.appendChild(inputRow); // Append the row to the word grid


// Update the guessCells variable and add the event listeners
guessCells = Array.from(document.getElementsByClassName('guess-cell'));
guessCells.forEach(function(cell, index) {
    cell.addEventListener('input', function() {
        if (index < guessCells.length - 1) {
            guessCells[index + 1].focus();
        }
    });
    cell.addEventListener('keydown', function(e) {
        if (e.keyCode === 8 && index > 0 && this.value === '') {
            setTimeout(() => guessCells[index - 1].focus(), 0);
        }
    });
   
    cell.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            document.getElementById('submit-guess').click();
        }
    });
});
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace') {
        let activeElement = document.activeElement;
        if (activeElement && activeElement.className.includes('guess-cell') && !activeElement.value) {
            let previousCell = activeElement.previousElementSibling;
            if (previousCell && previousCell.className.includes('guess-cell')) {
                previousCell.focus();
                previousCell.value = '';  // Clear the previous cell value
            }
        }
    }
});





// Function to update the timer display
function updateTimer() {
    let now = Date.now();
    let timeDiff = now - startTime; // Time difference in milliseconds


    // Convert the time difference to minutes, seconds, and hundredths of seconds
    let minutes = Math.floor(timeDiff / 60000);
    let seconds = Math.floor((timeDiff % 60000) / 1000);
    let hundredths = Math.floor((timeDiff % 1000) / 10);


    // Format the time components with leading zeros if necessary
    let minutesStr = String(minutes).padStart(2, '0');
    let secondsStr = String(seconds).padStart(2, '0');
    let hundredthsStr = String(hundredths).padStart(2, '0');


    // Update the timer display
    document.getElementById('timer').textContent = `${minutesStr}:${secondsStr}.${hundredthsStr}`;
}




function isOneLetterDifferent(word1, word2) {
    word1 = word1.toLowerCase();
    word2 = word2.toLowerCase();
    if (word1.length !== word2.length) {
        return false;
    }
    let diffCount = 0;
    for (let i = 0; i < word1.length; i++) {
        if (word1[i] !== word2[i]) {
            diffCount++;
        }
    }
    return diffCount === 1;
}



document.getElementById('submit-guess').addEventListener('click', function() {
    if (!timer) {
        return;
    }
    
    let guess = guessCells.map(cell => cell.value.toUpperCase()).join('');

    if (isOneLetterDifferent(guess, levels[currentLevel].word) && guess === levels[currentLevel+1].word.toUpperCase()) {
        score++;
        document.getElementById('score').textContent = 'Score: ' + score;
        
        if (score === levels.length - 1) {
            clearInterval(timer);
            document.getElementById('submit-guess').disabled = true;

            let timeInSeconds = (Date.now() - startTime) / 1000;
            finalScore = timeInSeconds * (10 + misses);
            finalScore = Math.round(finalScore);

            // Show the end screen
            showEndScreen(timeInSeconds + 's', (10 + misses), finalScore);
        
            // Disable the input fields
            guessCells.forEach(cell => cell.disabled = true);

            // Store the user's statistics in localStorage
            localStorage.setItem('finalTime', timeInSeconds + 's');
            localStorage.setItem('misses', misses);
            localStorage.setItem('finalScore', finalScore);

            // Disable replayability
            localStorage.setItem('lastCompletedDate', new Date().toDateString());

            return;
        }        
        
        document.getElementById('message').textContent = 'Correct!';
        currentLevel++;
        if (currentLevel < levels.length) {
            updateWordAndHint();
            let nextGuessCell = document.querySelector(`.guess-cell.row-${currentLevel + 1}`);
            if (nextGuessCell) {
                nextGuessCell.focus();
            }
        } else {
            document.getElementById('message').textContent = 'Congratulations! You completed all levels.';
            clearInterval(timer);
            document.getElementById('submit-guess').disabled = true;
        }
    } else {
        document.getElementById('message').textContent = 'Incorrect, try again.';
        misses++;
        document.getElementById('misses').textContent = 'Misses: ' + misses;
        guessCells.forEach(cell => cell.value = '');
        guessCells[0].focus();
    }
});







document.getElementById('bg-color-toggle').addEventListener('click', function() {
    let body = document.body;
    if (body.style.backgroundColor === 'white' && body.style.color === 'black') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
        localStorage.setItem('theme', 'dark');  // Save theme to localStorage
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
        localStorage.setItem('theme', 'light');  // Save theme to localStorage
    }
});




// Initialization code
document.getElementById('game-container').style.display = 'none'; // Hide the game initially
if (levels.length > 0) {
    updateWordAndHint();
}




let closeEndScreen;

function showEndScreen(finalTime, multiplier, finalScore) {
    document.getElementById('endFinalTime').innerText = `Final time: ${finalTime}`;
    document.getElementById('endMisses').innerText = `Misses: ${misses}`; // Display number of misses
    document.getElementById('endFinalScore').innerText = `Final score: ${finalScore}`;
    endScreen.style.display = "block";
    statsButton.style.display = "block"; // Show the stats button
}


statsButton.addEventListener('click', function() {
    endScreen.style.display = "block";
});



function setupEventListeners() {
    endScreen = document.getElementById('endScreen');
    closeEndScreen = document.getElementById('closeEndScreen');

    closeEndScreen.onclick = function() {
        endScreen.style.display = "none";
    }

    // Get a reference to the share button
    let shareTwitter = document.getElementById('shareTwitter');

    document.querySelector('#share-button').addEventListener('click', function() {
        var messageToShare = `I just scored ${finalScore} on today's word ladder, see if you can beat my score! https://www.dailywordladder.com`;

        if (window.matchMedia('(max-width: 600px)').matches) {
            if (navigator.share) {
                navigator.share({
                    title: 'Word Ladder Game',
                    text: messageToShare,
                    url: window.location.href,
                })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
            } else {
                console.log('Web Share not supported on this browser');
            }
        } else {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(messageToShare)
                .then(() => {
                    console.log('Text copied to clipboard');
                    document.getElementById('clipboard-notification').style.display = 'block';
                    setTimeout(function() {
                        document.getElementById('clipboard-notification').style.display = 'none';
                    }, 3000);
                })
                .catch((error) => console.log('Error copying text', error));
            } else {
                console.log('Clipboard API not supported on this browser');
            }
        }
    });
}

window.onload = function() {
    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    // Set the date on the elements
    document.getElementById('current-date').innerText = formattedDate;
    document.getElementById('main-game-date').innerText = formattedDate;
    document.getElementById('end-screen-date').innerText = formattedDate;
    console.log("window.onload is called");
    
    setupEventListeners();

    let theme = localStorage.getItem('theme');
    let body = document.body;
    if (theme === 'dark') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
    }

    let today = new Date();
    let lastCompletedDate = localStorage.getItem('lastCompletedDate');
    if (lastCompletedDate && lastCompletedDate === today.toDateString()) {
        let finalTime = localStorage.getItem('finalTime');
        let misses = localStorage.getItem('misses');
        let finalScore = localStorage.getItem('finalScore');

        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        showEndScreen(finalTime, misses, finalScore);

        currentLevel = levels.length - 1;
        updateWordAndHint();
    }
}

    // Theme setting code
    let theme = localStorage.getItem('theme');  // Get theme from localStorage
    let body = document.body;
    
    if (theme === 'dark') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
    }

    // Check if the game was already completed today
    let today = new Date();
    let lastCompletedDate = localStorage.getItem('lastCompletedDate');
    if (lastCompletedDate && lastCompletedDate === today.toDateString()) {
        // Show the completed game screen
        document.getElementById('endScreen').style.display = 'block';
    } 

    if (lastCompletedDate && lastCompletedDate === today.toDateString()) {
        // Retrieve the user's statistics from localStorage
        let finalTime = localStorage.getItem('finalTime');
        let misses = localStorage.getItem('misses');
        let finalScore = localStorage.getItem('finalScore');

        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        // Show the end screen
        showEndScreen(finalTime, misses, finalScore);

        // Show the completed word ladder
        currentLevel = levels.length - 1;
        updateWordAndHint();
        
    } 

    // Other onload code
    endScreen = document.getElementById('endScreen');
    closeEndScreen = document.getElementById('closeEndScreen');

    closeEndScreen.onclick = function() {
        endScreen.style.display = "none";
    }

    // Get a reference to the share button
    let shareTwitter = document.getElementById('shareTwitter');

    document.querySelector('#share-button').addEventListener('click', function() {
        var messageToShare = `I just scored ${finalScore} on today's word ladder, see if you can beat my score! https://www.examplewordladder.com`;  // Replace with your message
    
        if (window.matchMedia('(max-width: 600px)').matches) {
            // The device is a mobile device, so use the Web Share API
            if (navigator.share) {
                navigator.share({
                    title: 'Word Ladder Game',
                    text: messageToShare,
                    url: window.location.href,
                })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
            } else {
                console.log('Web Share not supported on this browser');
            }
        } else {
            // The device is a desktop device, so use the Clipboard API
            if (navigator.clipboard) {
                navigator.clipboard.writeText(messageToShare)
                .then(() => {
                    console.log('Text copied to clipboard');
    
                    // Show the notification
                    document.getElementById('clipboard-notification').style.display = 'block';

                    // Hide the notification after 3 seconds
                    setTimeout(function() {
                        document.getElementById('clipboard-notification').style.display = 'none';
                    }, 3000);
                })
                .catch((error) => console.log('Error copying text', error));
            } else {
                console.log('Clipboard API not supported on this browser');
            }
        }
    });
