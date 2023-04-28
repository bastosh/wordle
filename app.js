"use strict";
/*----------------
/     CONFIG
-----------------*/
const maxTries = 8;
const minTries = 1;
const maxLetters = 12;
const minLetters = 4;
const messages = [
    'Vous avez triché !',
    'Exceptionnel !',
    'Magnifique !',
    'Superbe !',
    'Bravo !',
    'Pas mal !',
    'Enfin !',
];
const feedbackMessages = [];
let wordLength = 5;
let tries = 6;
const animationDuration = 1500 / wordLength;
let gameIsOver = false;
let wordle;
const bestStartingWords = [
    null,
    null,
    null,
    null,
    ['aine', 'sort'],
    ['saint', 'roule'],
    ['catins', 'lourde'],
    ['castine', 'doubler'],
    ['notaires'],
    ['relations'],
    ['soutiendra'],
    ['precautions'],
    ['recapitulons'],
    null,
    null,
    null,
    null,
];
const keys = [
    'A',
    'Z',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'Q',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'BACKSPACE',
    'W',
    'X',
    'C',
    'V',
    'B',
    'N',
    'ENTER'
];
/*----------------
/    SET GAME
-----------------*/
const getWordle = () => {
    fetch(`http://words.test/api/random?min=${wordLength}&max=${wordLength}`)
        .then(response => response.json())
        .then(response => {
        wordle = response.data.toUpperCase();
        console.log(wordle);
    })
        .catch(error => {
        console.error(error);
    });
};
const setMessages = () => {
    for (let index = 0; index < tries - 1; index++) {
        feedbackMessages.push(messages[index]);
    }
    messages.push('De justesse !');
};
const setKeyboard = () => {
    const keyboard = document.getElementById('keyboard');
    keys.forEach(key => {
        const button = document.createElement('button');
        if (key === 'BACKSPACE') {
            button.textContent = 'RETOUR';
        }
        else if (key === 'ENTER') {
            button.textContent = 'VALIDER';
        }
        else {
            button.textContent = key;
        }
        button.setAttribute('id', key);
        button.addEventListener('click', () => handleClick(key));
        keyboard.append(button);
    });
};
const makeLine = () => {
    const line = [];
    for (let index = 1; index <= wordLength; index++) {
        line.push('');
    }
    return line;
};
const makeLetter = (lineIndex, letterIndex) => {
    const letterElement = document.createElement('div');
    letterElement.setAttribute('id', 'guess-row-' + lineIndex + '-letter-' + letterIndex);
    letterElement.classList.add('letter');
    return letterElement;
};
const makeRow = (line, lineIndex) => {
    const rowElement = document.createElement('div');
    rowElement.setAttribute('id', 'guess-row-' + lineIndex);
    line.forEach((_letter, letterIndex) => {
        const letterElement = makeLetter(lineIndex, letterIndex);
        rowElement.append(letterElement);
    });
    return rowElement;
};
const removeAllChildNodes = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};
const guessRows = document.getElementById('guesses');
const setRows = () => {
    const rows = [];
    for (let index = 1; index <= tries; index++) {
        const line = makeLine();
        rows.push(line);
    }
    rows.forEach((line, lineIndex) => {
        const rowElement = makeRow(line, lineIndex);
        guessRows.append(rowElement);
    });
};
const startGame = () => {
    getWordle();
    setMessages();
    setKeyboard();
    setRows();
};
/*----------------
/   HERE WE GO!
-----------------*/
startGame();
let triedWords = [];
let guesses = [];
let currentGuess = [];
let guessHistory = [];
const handleClick = (key) => {
    if (!gameIsOver) {
        if (key === 'ENTER') {
            return checkGuess();
        }
        else if (key === 'BACKSPACE') {
            return removeLetter(key);
        }
        addLetter(key);
    }
};
const addLetter = (letter) => {
    if (currentGuess.length < wordLength && guesses.length < tries) {
        let currentLetter = document.getElementById('guess-row-' + guesses.length + '-letter-' + currentGuess.length);
        currentGuess.push(letter);
        currentLetter.textContent = letter;
        currentLetter.setAttribute('data', letter);
    }
};
const removeLetter = (letter) => {
    if (currentGuess.length && guesses.length < tries) {
        currentGuess.pop();
        let currentLetter = document.getElementById('guess-row-' + guesses.length + '-letter-' + currentGuess.length);
        currentLetter.removeAttribute('data');
        currentLetter.textContent = '';
    }
};
const checkGuess = () => {
    if (currentGuess.length === wordLength && guesses.length < tries) {
        const guess = currentGuess.join('').toLowerCase();
        triedWords.push(guess);
        fetch(`http://words.test/api/search/${guess}`)
            .then(response => response.json())
            .then(response => {
            if (response.data === true) {
                processGuess();
            }
            else {
                showMessage('Ce mot n’existe pas !');
            }
        })
            .catch(error => {
            console.error(error);
        });
    }
};
const processGuess = () => {
    const guess = currentGuess.join('');
    flipLetters();
    guesses.push(currentGuess);
    if (guess === wordle) {
        const message = tries === 6 ? messages[guesses.length - 1] : 'Bravo !';
        gameIsOver = true;
        setTimeout(() => { showMessage(message); }, animationDuration * wordLength);
    }
    else {
        if (guesses.length === tries) {
            gameIsOver = true;
            setTimeout(() => { showMessage('Dommage !'); }, animationDuration * wordLength);
            setTimeout(() => {
                guessRows.lastElementChild.childNodes.forEach((letter, index) => {
                    setTimeout(() => {
                        letter.textContent = wordle[index];
                        letter.setAttribute('data', letter.textContent);
                        letter.classList.replace('yellow-overlay', 'green-overlay');
                        letter.classList.replace('grey-overlay', 'green-overlay');
                    }, animationDuration * index);
                });
            }, animationDuration * wordLength + 1000);
        }
    }
    currentGuess = [];
    if (gameIsOver) {
        const link = document.getElementById('wiki');
        link.setAttribute('href', 'https://fr.wiktionary.org/wiki/' + wordle.toLowerCase());
        const gameOver = document.getElementById('game-over');
        setTimeout(() => { gameOver.classList.remove('hidden'); }, animationDuration * wordLength);
    }
};
const flipLetters = () => {
    const letters = document.getElementById('guess-row-' + (guesses.length)).childNodes;
    let checkWordle = wordle;
    const guess = [];
    letters.forEach(letter => {
        const tile = { letter: letter.getAttribute('data'), color: 'grey-overlay' };
        guess.push(tile);
    });
    guess.forEach((guess, index) => {
        if (guess.letter === wordle[index]) {
            guess.color = 'green-overlay';
            checkWordle = setCharAt(checkWordle, index, 'x');
        }
    });
    checkWordle = checkWordle.replaceAll('x', '');
    function setCharAt(str, index, chr) {
        if (index > str.length - 1)
            return str;
        return str.substring(0, index) + chr + str.substring(index + 1);
    }
    guess.forEach(guess => {
        if (guess.color !== 'green-overlay' && checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay';
            checkWordle = checkWordle.replace(guess.letter, '');
        }
    });
    guessHistory.push(guess);
    letters.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip');
            tile.classList.add(guess[index].color);
            addColorToKey(guess[index].letter, guess[index].color);
        }, animationDuration * index);
    });
};
const addColorToKey = (letter, color) => {
    const keyElement = document.getElementById(letter);
    if ((keyElement.classList.contains('green-overlay') || keyElement.classList.contains('yellow-overlay')) && (color === 'grey-overlay')) {
        return;
    }
    keyElement.className = "";
    keyElement.classList.add(color);
};
const showMessage = (message) => {
    let title = document.querySelector('h1');
    title.textContent = message;
    setTimeout(() => title.textContent = 'Wordle', 3000);
};
const restart = () => {
    gameIsOver = false;
    triedWords = [];
    guesses = [];
    currentGuess = [];
    guessHistory = [];
    startsWith = '';
    endsWith = '';
    contains = '';
    excludes = '';
    goodPositions = '';
    wrongPositions = '';
    const keys = document.getElementById('keyboard').childNodes;
    keys.forEach(key => {
        key.className = "";
    });
    removeAllChildNodes(guessRows);
    setRows();
    getWordle();
    const gameOver = document.getElementById('game-over');
    gameOver.classList.add('hidden');
};
/*----------------
/     HELP
-----------------*/
let startsWith = '';
let endsWith = '';
let contains = '';
let excludes = '';
let goodPositions = '';
let wrongPositions = '';
const getHint = () => {
    if (!guesses.length && bestStartingWords[wordLength]) {
        let hint = bestStartingWords[wordLength][0];
        const currentRow = document.getElementById('guess-row-' + (guesses.length)).childNodes;
        currentRow.forEach((letter, index) => {
            setTimeout(() => {
                letter.textContent = hint[index].toUpperCase();
                currentGuess.push(letter.textContent);
                letter.setAttribute('data', letter.textContent);
            }, animationDuration * index);
        });
    }
    else if (guesses.length === 1 && bestStartingWords[wordLength][1]) {
        let hint = bestStartingWords[wordLength][1];
        const currentRow = document.getElementById('guess-row-' + (guesses.length)).childNodes;
        currentRow.forEach((letter, index) => {
            setTimeout(() => {
                letter.textContent = hint[index].toUpperCase();
                currentGuess.push(letter.textContent);
                letter.setAttribute('data', letter.textContent);
            }, animationDuration * index);
        });
    }
    else {
        if (guesses.length) {
            let includedCharacters = [];
            document.querySelectorAll('#keyboard > .yellow-overlay, #keyboard > .yellow-green').forEach(key => {
                includedCharacters.push(key.textContent);
            });
            contains = includedCharacters.join(',').toLowerCase() + ',';
            let excludedCharacters = [];
            document.querySelectorAll('#keyboard > .grey-overlay').forEach(key => {
                excludedCharacters.push(key.textContent);
            });
            excludes = excludedCharacters.join(',').toLowerCase();
            const startCharacters = [];
            const lastGuess = document.getElementById('guess-row-' + (guesses.length - 1)).childNodes;
            for (let guess of lastGuess) {
                if (guess.classList.contains('green-overlay')) {
                    startCharacters.push(guess.textContent);
                }
                else {
                    break;
                }
            }
            startsWith = startCharacters.join('').toLowerCase();
            const endCharacters = [];
            for (let i = lastGuess.length - 1; i >= 0; i--) {
                if (lastGuess[i].classList.contains('green-overlay')) {
                    endCharacters.unshift(lastGuess[i].textContent);
                }
                else {
                    break;
                }
            }
            endsWith = endCharacters.join('').toLowerCase();
            guessHistory.forEach(row => {
                row.forEach((guess, index) => {
                    let clue = index + ',' + guess.letter.toLowerCase();
                    if (guess.color === 'green-overlay' && !goodPositions.includes(clue)) {
                        goodPositions += !goodPositions ? '' : '-';
                        goodPositions += clue;
                    }
                });
            });
            guessHistory.forEach(row => {
                row.forEach((guess, index) => {
                    let clue = index + ',' + guess.letter.toLowerCase();
                    if (guess.color === 'yellow-overlay' && !wrongPositions.includes(clue)) {
                        wrongPositions += !wrongPositions ? '' : '-';
                        wrongPositions += clue;
                    }
                });
            });
            contains = contains.replace(/,\s*$/, "");
            excludes = excludes.replace(/,\s*$/, "");
            console.log('contains :', contains);
            console.log('excluded :', excludes);
            console.log('starts with :', startsWith);
            console.log('ends with :', endsWith);
            console.log('good positions: ', goodPositions);
            console.log('bad positions: ', wrongPositions);
        }
        fetch(`http://words.test/api/search?min=${wordLength}&max=${wordLength}&start=${startsWith}&end=${endsWith}&contains=${contains}&excludes=${excludes}&good=${goodPositions}&bad=${wrongPositions}&hint=1`)
            .then(response => response.json())
            .then(response => {
            console.log(response.data);
            let hint = '';
            if (triedWords.includes(response.data.hint)) {
                let words = Object.values(response.data.words).filter((word) => word !== response.data.hint);
                hint = words[0];
            }
            else {
                hint = response.data.hint;
            }
            const currentRow = document.getElementById('guess-row-' + (guesses.length)).childNodes;
            currentRow.forEach((letter, index) => {
                setTimeout(() => {
                    letter.textContent = hint[index].toUpperCase();
                    currentGuess.push(letter.textContent);
                    letter.setAttribute('data', letter.textContent);
                }, animationDuration * index);
            });
        })
            .catch(error => {
            console.error(error);
        });
    }
};
/*----------------
/    LISTENERS
-----------------*/
document.addEventListener('keyup', (event) => {
    if (keys.includes(event.key.toUpperCase())) {
        handleClick(event.key.toUpperCase());
    }
});
document.getElementById('more-tries').addEventListener('click', () => {
    if (!gameIsOver && !guesses.length && tries < maxTries) {
        tries++;
        const line = makeLine();
        const rowElement = makeRow(line, tries - 1);
        guessRows.appendChild(rowElement);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
});
document.getElementById('less-tries').addEventListener('click', () => {
    if (!gameIsOver && !guesses.length && tries > minTries) {
        tries--;
        guessRows.removeChild(guessRows.lastElementChild);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
});
document.getElementById('less-letters').addEventListener('click', () => {
    if (!gameIsOver && !guesses.length && wordLength > minLetters) {
        wordLength--;
        const guessRows = document.getElementById('guesses').childNodes;
        guessRows.forEach(row => {
            row.removeChild(row.lastElementChild);
        });
        getWordle();
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
});
document.getElementById('more-letters').addEventListener('click', () => {
    if (!gameIsOver && !guesses.length && wordLength < maxLetters) {
        wordLength++;
        const guessRows = document.getElementById('guesses').childNodes;
        guessRows.forEach((row, rowIndex) => {
            const letterElement = makeLetter(rowIndex, wordLength - 1);
            row.appendChild(letterElement);
        });
        getWordle();
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
});
document.getElementById('help').addEventListener('click', () => {
    if (!gameIsOver) {
        getHint();
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
});
document.getElementById('restart').addEventListener('click', () => {
    restart();
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
});
