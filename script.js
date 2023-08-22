function createElement(parent, itemClass, tag='div') {
    const item = document.createElement(tag);
    item.classList.add(itemClass);
    parent.append(item);
    return elementActions(item);
}

function elementActions(item) {
    return {
        element: item,

        on: function(actionType, callback) {
            item.addEventListener(actionType, callback);
        },
        append: function (child) {
            item.append(child);
        },
        content: function (content) {
            item.textContent = content;
        },
        find: function (selector) {
            return item.querySelectorAll(selector);
        },
        show: function () {
            item.classList.remove('hidden');
        },
        hide: function () {
            item.classList.add('hidden');
        },
        disable: function (selector) {
            item.classList.add('disabled');
        },
        enable: function (selector) {
            item.classList.remove('disabled');
        },
        addClass: function (currentClass) {
            item.classList.add(currentClass);
        },
        removeClass: function (currentClass) {
            item.classList.remove(currentClass);
        },
    }
}

const formContainer = createElement(document.body, 'form-container');
const cardsContainer = createElement( document.body, 'card-container');
const buttonNextContainer = createElement(document.body, 'button-next-container');
const timerContainer = createElement(document.body, 'timer-container');

const form = createElement(formContainer.element, 'form', 'form');
const input = createElement(form.element, 'input', 'input');
const buttonStartGame = createElement(form.element, 'button', 'button');
const buttonNextGame = createElement(buttonNextContainer.element, 'button', 'button');
const displayTimerGame = createElement(timerContainer.element, 'button-timer', 'button');

form.hide();
form.on('submit', function (event) {
    event.preventDefault();
    form.hide();
    startGame();
});

input.element.placeholder = 'Кол-во карт по вертикали/горизонтали (чётные числа от 2 до 10.)';

buttonStartGame.content('Начать игру');

buttonNextGame.hide();
buttonNextGame.content('Сыграть ещё раз');
buttonNextGame.on('click', function (event) {
    buttonNextGame.hide();
    cardsContainer.find('.card').forEach(function (card) {
        card.remove();
    });
    setTimeout(initGame, 30);
});

displayTimerGame.hide();
displayTimerGame.content('Осталось: 60');

const containerVersions = [
    'two-cards',
    'four-cards',
    'six-cards',
    'eight-cards',
    'ten-cards',
];
const defaultCustomAnswer = 4;

let openedCardIndex;
let timerGame;
let gameOver = false;

initGame();

function getInputValue() {
    const inputValue = parseInt(input.element.value);
    if (inputValue >= 2 && inputValue <= 10 && inputValue % 2 === 0) {
        return inputValue;
    } else {
        return defaultCustomAnswer;
    }
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function choiceSizeContainer(items) {
    containerVersions.forEach(function (item) {
        cardsContainer.removeClass(`card-container--${item}`)
    });
    items = +items;
    switch (items) {
        case 2:
            cardsContainer.addClass('card-container--two-cards');
            break;
        case 4:
            cardsContainer.addClass('card-container--four-cards');
            break;
        case 6:
            cardsContainer.addClass('card-container--six-cards');
            break;
        case 8:
            cardsContainer.addClass('card-container--eight-cards');
            break;
        case 10:
            cardsContainer.addClass('card-container--ten-cards');
            break;
        default: cardsContainer.addClass('card-container--four-cards');
    }
}

function checkAllOpenedCards() {
    let absenceEmptyCard = true;
    cardsContainer.find('.card').forEach(function (card) {
        absenceEmptyCard = absenceEmptyCard && card.textContent !== '';
    });
    return absenceEmptyCard;
}

function createCard(index) {
    let item = createElement(cardsContainer.element, 'card');
    item.element.dataset.id = `${index}`;
    return item;
}

function initGame() {
    openedCardIndex = null;
    form.show();
}

function startGame() {
    gameOver = false;
    cardsContainer.show();
    let customAnswer = getInputValue();
    input.element.value = '';
    choiceSizeContainer(customAnswer);
    let numberCards = customAnswer * customAnswer;
    let indexArray = Array(numberCards).fill(null).map((v,i) => Math.ceil((i+1)/2));
    shuffle(indexArray);
    displayTimerGame.show();
    checkTimerGame();

    indexArray.forEach(function(value, index) {
        let card = createCard(index);
        card.on('click', function showCardContent() {
            card.content(`${value}`);
            card.disable();
            if (openedCardIndex == null) {
                openedCardIndex = index;
            } else {
                if (indexArray[openedCardIndex] !== value) {
                    let firstOpenedCard = elementActions(document.querySelector(`[data-id="${openedCardIndex}"]`));
                    cardsContainer.disable();
                    setTimeout(function () {
                        if (gameOver) {
                            return;
                        }
                        card.content('');
                        firstOpenedCard.content('');
                        cardsContainer.enable();
                        card.enable();
                        firstOpenedCard.enable();
                        openedCardIndex = null;
                    }, 500)
                } else {
                    openedCardIndex = null;
                    endGame();
                }
            }
        })
    });
}

function checkTimerGame() {
    clearInterval(timerGame);
    let time = 60;
    displayTimerGame.content(time);
    cardsContainer.enable();
    timerGame = setInterval(function () {
        if (time === 0) {
            clearInterval(timerGame);
            clearGameField();
            alert('Время вышло :(');
        }
        else {
            time--;
            displayTimerGame.content('Осталось: ' + time);
        }
    }, 1000);
}

function clearGameField() {
    gameOver = true;
    cardsContainer.disable();
    displayTimerGame.hide();
    buttonNextGame.show();
}

function endGame() {
    if (checkAllOpenedCards()) {
        clearGameField();
        clearInterval(timerGame);
        alert('Поздравляем, вы выиграли!');
    }
}
