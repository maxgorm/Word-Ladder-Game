# Word-Ladder-Game
A simple daily word game consisting of linking similar words together.

Instructions

Guess the next word by changing one letter from the current word.

Use the hints to help you complete the word.

Repeat until you reach the final word in the ladder.

Try to complete the ladder as quickly as possible.

Your score is calculated based on your time and number of incorrect guesses (misses).

Try to score as low as possible.

Puzzles will update daily, share your scores and compete with friends to be the best!

## Puzzle data

Puzzle records are stored locally in `puzzles.js`. Each record has a date, a
ladder, and its hints. Add a new dated record to publish a new daily puzzle;
the app uses the most recent available record when a date has not been added
yet. The former Google App Engine puzzle API is no longer required at runtime.
