/*
 * Local puzzle store.
 *
 * The former Google App Engine endpoint did not expose a puzzle archive, so
 * each recovered puzzle is kept here as a dated, editable text record. Add a
 * new dated record when publishing a new daily puzzle.
 */
window.WORD_LADDER_PUZZLES = [
    {
        date: '2023-08-02',
        levels: [
            { word: 'RAGE', hint: 'Trapped in a ___' },
            { word: 'CAGE', hint: 'Helps you to walk' },
            { word: 'CANE', hint: 'Helps to direct traffic' },
            { word: 'CONE', hint: 'Refers to pitch or emotion of voice' },
            { word: 'TONE', hint: 'Units of weight measurement' },
            { word: 'TONS', hint: 'Level Complete' }
        ]
    },
    {
        date: '2026-08-02',
        levels: [
            { word: 'WIND', hint: 'Locate' },
            { word: 'FIND', hint: '___ off' },
            { word: 'FEND', hint: 'Heal' },
            { word: 'MEND', hint: 'Common bathroom sign' },
            { word: 'MENS', hint: 'Multiple female chickens' },
            { word: 'HENS', hint: 'Level Complete' }
        ]
    }
];

function getDateKey(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDailyPuzzle(date = new Date()) {
    let requestedDate = getDateKey(date);
    let exactPuzzle = window.WORD_LADDER_PUZZLES.find(puzzle => puzzle.date === requestedDate);

    // Use the most recent available puzzle until a newer dated record is added.
    let fallbackPuzzle = window.WORD_LADDER_PUZZLES
        .filter(puzzle => puzzle.date <= requestedDate)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
        || window.WORD_LADDER_PUZZLES[0];

    let puzzle = exactPuzzle || fallbackPuzzle;
    return puzzle.levels.map(level => ({ ...level }));
}
