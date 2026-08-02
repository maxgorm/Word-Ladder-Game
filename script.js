(() => {
    let currentLevel = 0;
    let score = 0;
    let timer = null;
    let startTime = null;
    let misses = 0;
    let finalScore = 0;
    const dailyPuzzleNumber = getDailyPuzzleNumber();
    let activePuzzleNumber = dailyPuzzleNumber;
    let activePuzzleIsDaily = true;
    let levels = getPuzzleByNumber(activePuzzleNumber);
    let guessCells = [];

    const elements = {};

    function cacheElements() {
        [
            'start-screen', 'start-button', 'current-date', 'start-puzzle-link', 'start-puzzle-number',
            'instructions-bg-color-toggle',
            'game-container', 'main-game-date', 'timer', 'misses', 'score', 'word-grid',
            'hint', 'submit-guess', 'message', 'bg-color-toggle', 'stats-button', 'game-puzzle-link', 'game-puzzle-number',
            'endScreen', 'end-screen-date', 'end-puzzle-link', 'end-puzzle-number', 'endFinalTime', 'endMisses', 'endFinalScore',
            'share-button', 'clipboard-notification', 'closeEndScreen', 'puzzle-select-screen', 'puzzle-options',
            'close-puzzle-select'
        ].forEach(id => {
            elements[id] = document.getElementById(id);
        });

        Object.assign(elements, {
            startScreen: elements['start-screen'],
            startButton: elements['start-button'],
            currentDate: elements['current-date'],
            startPuzzleLink: elements['start-puzzle-link'],
            startPuzzleNumber: elements['start-puzzle-number'],
            instructionsToggle: elements['instructions-bg-color-toggle'],
            gameContainer: elements['game-container'],
            mainGameDate: elements['main-game-date'],
            gamePuzzleLink: elements['game-puzzle-link'],
            gamePuzzleNumber: elements['game-puzzle-number'],
            submitGuess: elements['submit-guess'],
            bgColorToggle: elements['bg-color-toggle'],
            statsButton: elements['stats-button'],
            endScreenDate: elements['end-screen-date'],
            endPuzzleLink: elements['end-puzzle-link'],
            endPuzzleNumber: elements['end-puzzle-number'],
            shareButton: elements['share-button'],
            clipboardNotification: elements['clipboard-notification'],
            puzzleSelectScreen: elements['puzzle-select-screen'],
            puzzleOptions: elements['puzzle-options'],
            closePuzzleSelect: elements['close-puzzle-select']
        });
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }

    function setTheme(theme) {
        const activeTheme = theme === 'dark' ? 'dark' : 'light';
        document.body.dataset.theme = activeTheme;
        document.body.style.backgroundColor = activeTheme === 'dark' ? '#17201a' : '#f6f7f5';
        localStorage.setItem('theme', activeTheme);

        [elements['instructions-bg-color-toggle'], elements['bg-color-toggle']].forEach(button => {
            if (button) {
                button.setAttribute('aria-pressed', activeTheme === 'dark');
            }
        });
    }

    function toggleTheme() {
        setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    }

    function getPuzzleDate(number) {
        const puzzle = window.WORD_LADDER_PUZZLES[Number(number) - 1] || window.WORD_LADDER_PUZZLES[0];
        return new Date(`${puzzle.date}T00:00:00`);
    }

    function updatePuzzleContext() {
        const activeDate = formatDate(getPuzzleDate(activePuzzleNumber));
        const numberText = String(activePuzzleNumber);

        elements.currentDate.textContent = formatDate(new Date());
        elements.mainGameDate.textContent = activeDate;
        elements.endScreenDate.textContent = activeDate;
        elements.startPuzzleNumber.textContent = String(dailyPuzzleNumber);
        elements.gamePuzzleNumber.textContent = numberText;
        elements.endPuzzleNumber.textContent = numberText;
    }

    function renderPuzzleOptions() {
        elements.puzzleOptions.replaceChildren();

        window.WORD_LADDER_PUZZLES.forEach((_, index) => {
            const number = index + 1;
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'puzzle-option';
            option.dataset.puzzleNumber = String(number);
            option.setAttribute('aria-label', `Play puzzle ${number}`);
            if (number === dailyPuzzleNumber) {
                option.classList.add('daily-puzzle');
            }
            if (number === activePuzzleNumber) {
                option.classList.add('selected-puzzle');
            }

            const numberLabel = document.createElement('span');
            numberLabel.className = 'puzzle-option-number';
            numberLabel.textContent = String(number);
            option.append(numberLabel);
            option.addEventListener('click', () => startPuzzle(number));
            elements.puzzleOptions.appendChild(option);
        });
    }

    function openPuzzleSelect(event) {
        if (event) {
            event.preventDefault();
        }
        renderPuzzleOptions();
        elements.endScreen.style.display = 'none';
        elements.puzzleSelectScreen.style.display = 'flex';
    }

    function closePuzzleSelect() {
        elements.puzzleSelectScreen.style.display = 'none';
    }

    function updateTimer() {
        if (!startTime) {
            return;
        }

        const timeDiff = Date.now() - startTime;
        const minutes = String(Math.floor(timeDiff / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((timeDiff % 60000) / 1000)).padStart(2, '0');
        const hundredths = String(Math.floor((timeDiff % 1000) / 10)).padStart(2, '0');
        elements.timer.textContent = `${minutes}:${seconds}.${hundredths}`;
    }

    function isOneLetterDifferent(word1, word2) {
        if (word1.length !== word2.length) {
            return false;
        }

        let differences = 0;
        for (let index = 0; index < word1.length; index += 1) {
            if (word1[index] !== word2[index]) {
                differences += 1;
            }
        }
        return differences === 1;
    }

    function clearGuess() {
        guessCells.forEach(cell => {
            cell.value = '';
        });
    }

    function focusFirstGuessCell() {
        const firstCell = guessCells[0];
        if (firstCell) {
            firstCell.focus();
        }
    }

    function createGuessRow() {
        const inputRow = document.createElement('div');
        inputRow.className = 'row guess-row';
        inputRow.setAttribute('aria-label', `Guess ${currentLevel + 1}`);

        for (let index = 0; index < 4; index += 1) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.inputMode = 'text';
            cell.autoComplete = 'off';
            cell.maxLength = 1;
            cell.className = `guess-cell row-${currentLevel + 1}`;
            cell.setAttribute('aria-label', `Letter ${index + 1}`);
            inputRow.appendChild(cell);
        }

        elements['word-grid'].appendChild(inputRow);
        guessCells = Array.from(document.querySelectorAll('.guess-cell'));

        guessCells.forEach((cell, index) => {
            cell.addEventListener('input', event => {
                event.target.value = event.target.value.replace(/[^a-z]/gi, '').toUpperCase();
                if (event.target.value && guessCells[index + 1]) {
                    guessCells[index + 1].focus();
                }
            });

            cell.addEventListener('keydown', event => {
                if (event.key === 'Backspace' && !cell.value && guessCells[index - 1]) {
                    guessCells[index - 1].focus();
                    guessCells[index - 1].value = '';
                }
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitGuess();
                }
            });
        });
    }

    function updateWordGrid() {
        elements['word-grid'].replaceChildren();

        for (let index = 0; index <= currentLevel && index < levels.length; index += 1) {
            const row = document.createElement('div');
            row.className = 'row completed-row';

            levels[index].word.split('').forEach(letter => {
                const cell = document.createElement('div');
                cell.className = 'cell correct';
                cell.textContent = letter;
                row.appendChild(cell);
            });
            elements['word-grid'].appendChild(row);
        }

        if (currentLevel < levels.length - 1) {
            createGuessRow();
        }
    }

    function updateWordAndHint() {
        if (!levels.length) {
            elements.hint.textContent = 'No puzzle is available.';
            return;
        }

        updateWordGrid();
        elements.hint.textContent = `Hint: ${levels[currentLevel].hint}`;
    }

    function showEndScreen(finalTime, completedMisses, completedScore) {
        elements.endFinalTime.textContent = `Final time: ${finalTime}`;
        elements.endMisses.textContent = `Misses: ${completedMisses}`;
        elements.endFinalScore.textContent = `Final score: ${completedScore}`;
        elements.endScreen.style.display = 'flex';
        elements.statsButton.style.display = 'inline-flex';
    }

    function finishGame() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        elements.submitGuess.disabled = true;
        guessCells.forEach(cell => {
            cell.disabled = true;
        });

        const timeInSeconds = (Date.now() - startTime) / 1000;
        finalScore = Math.round(timeInSeconds * (10 + misses));
        const finalTime = `${timeInSeconds.toFixed(2)}s`;

        if (activePuzzleIsDaily) {
            localStorage.setItem('finalTime', finalTime);
            localStorage.setItem('misses', String(misses));
            localStorage.setItem('finalScore', String(finalScore));
            localStorage.setItem('lastCompletedDate', new Date().toDateString());
        }

        showEndScreen(finalTime, misses, finalScore);
    }

    function submitGuess() {
        if (!timer || currentLevel >= levels.length - 1) {
            return;
        }

        const guess = guessCells.map(cell => cell.value).join('').toUpperCase();
        const currentWord = levels[currentLevel].word.toUpperCase();
        const nextWord = levels[currentLevel + 1].word.toUpperCase();
        const isCorrect = guess === nextWord && isOneLetterDifferent(guess, currentWord);

        if (!isCorrect) {
            misses += 1;
            elements.misses.textContent = `Misses: ${misses}`;
            elements.message.textContent = 'Not quite. Try another word.';
            clearGuess();
            focusFirstGuessCell();
            return;
        }

        score += 1;
        elements.score.textContent = `Score: ${score}`;
        elements.message.textContent = 'Correct!';
        currentLevel += 1;

        if (score === levels.length - 1) {
            updateWordAndHint();
            finishGame();
            return;
        }

        updateWordAndHint();
        focusFirstGuessCell();
    }

    function startPuzzle(number) {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        activePuzzleNumber = Number(number);
        activePuzzleIsDaily = activePuzzleNumber === dailyPuzzleNumber;
        levels = getPuzzleByNumber(activePuzzleNumber);
        currentLevel = 0;
        score = 0;
        misses = 0;
        finalScore = 0;
        elements.misses.textContent = 'Misses: 0';
        elements.score.textContent = 'Score: 0';
        elements.message.textContent = '';
        elements.submitGuess.disabled = false;
        elements.statsButton.style.display = 'none';
        elements.endScreen.style.display = 'none';
        closePuzzleSelect();

        updatePuzzleContext();
        updateWordAndHint();
        elements.startScreen.style.display = 'none';
        elements.gameContainer.style.display = 'block';

        startTime = Date.now();
        elements.timer.textContent = '00:00.00';
        timer = setInterval(updateTimer, 10);
        focusFirstGuessCell();
    }

    function startGame() {
        startPuzzle(dailyPuzzleNumber);
    }

    async function shareResults() {
        const message = `I just scored ${finalScore} on today's word ladder. See if you can beat my score!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Daily Word Ladder',
                    text: message,
                    url: window.location.href
                });
                return;
            } catch (error) {
                if (error.name === 'AbortError') {
                    return;
                }
            }
        }

        if (navigator.clipboard) {
            await navigator.clipboard.writeText(`${message} ${window.location.href}`);
            elements.clipboardNotification.style.display = 'block';
            window.setTimeout(() => {
                elements.clipboardNotification.style.display = 'none';
            }, 3000);
        }
    }

    function restoreCompletedGame() {
        if (localStorage.getItem('lastCompletedDate') !== new Date().toDateString()) {
            return;
        }

        activePuzzleNumber = dailyPuzzleNumber;
        activePuzzleIsDaily = true;
        levels = getPuzzleByNumber(activePuzzleNumber);
        currentLevel = levels.length - 1;
        finalScore = Number(localStorage.getItem('finalScore')) || 0;
        elements.startScreen.style.display = 'none';
        elements.gameContainer.style.display = 'block';
        updateWordAndHint();
        showEndScreen(
            localStorage.getItem('finalTime') || '0.00s',
            localStorage.getItem('misses') || '0',
            localStorage.getItem('finalScore') || '0'
        );
    }

    function initialize() {
        cacheElements();

        updatePuzzleContext();
        elements.gameContainer.style.display = 'none';
        elements.endScreen.style.display = 'none';
        elements.puzzleSelectScreen.style.display = 'none';
        renderPuzzleOptions();

        setTheme(localStorage.getItem('theme') || 'light');
        elements.startButton.addEventListener('click', startGame);
        elements.startPuzzleLink.addEventListener('click', openPuzzleSelect);
        elements.gamePuzzleLink.addEventListener('click', openPuzzleSelect);
        elements.endPuzzleLink.addEventListener('click', openPuzzleSelect);
        elements.submitGuess.addEventListener('click', submitGuess);
        elements.instructionsToggle.addEventListener('click', toggleTheme);
        elements.bgColorToggle.addEventListener('click', toggleTheme);
        elements.statsButton.addEventListener('click', () => {
            elements.endScreen.style.display = 'flex';
        });
        elements.closeEndScreen.addEventListener('click', () => {
            elements.endScreen.style.display = 'none';
        });
        elements.closePuzzleSelect.addEventListener('click', closePuzzleSelect);
        elements.shareButton.addEventListener('click', shareResults);

        restoreCompletedGame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
