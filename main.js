import Deck from './Classes/Deck.js';
import { suits } from './constants.js';

/* Global variables and initialisation */

let deck = [];
let undoHistory = [];

addCheckboxListeners();
init();

/* Button functions */

document.getElementById('start').onclick = function() {
    init();
};

document.getElementById('undo').onclick = function() {
    const undo = undoHistory.pop();
    if (!(undo === undefined)) {
        deck.undoMove(undo);
    }
    eventHappened();
};

document.getElementById('reset').onclick = function() {
    resetHintColours();
};

document.getElementById('and').onclick = function() {
    const andButton = document.querySelector('#and');
    if (isAndOn()) {
        andButton.value = 'And';
    }
    else {
        andButton.value = 'Or';
    }
    updateColours();
};

/* Simple functions */

function isAndOn() { 
    // returns Boolean: is ANDing hints turned on
    return document.getElementById('and').value.includes('Or');
};

function moveOn() { 
    // returns Boolean: is a move being made
    const elems = Array.from(document.querySelectorAll('.card'));
    return elems.some(elem => elem.classList.contains('selected'));
};

/* Composite  functions */

function init() {
    deck = new Deck();
    undoHistory = [];
    deck.shuffle();
    eventHappened();
};

function eventHappened() {
    removeCards();
    addCards();
    updateColours();
    isGameFinished();
};

function addCheckboxListeners() { 
    const elems = document.querySelector('nav').querySelectorAll('input');
    elems.forEach(
        elem => elem.addEventListener('change', function() {updateColours()})
    );
};

function updateColours() {
    resetHintColours();
    addHintColours();
    displayUndo();
};

function hints() { 
    // returns Array: the hints that been selected: [ranks: str, suits: str, move1: int, move3: int]
    let arr = [[], [], [], []];
    const boxes = document.querySelector('nav').querySelectorAll('input'); 
    boxes.forEach((elem) => {
            if (elem.checked) {
                const pair = elem.id.split("-");
                if (pair[0] == "rank") {
                    arr[0].push(pair[1]);
                }
                else if (pair[0] == "suit") {
                    arr[1].push(pair[1]);
                }
                else if (pair[0] == "move") {
                    const num = parseInt(pair[1]);
                    if (num == 1) {arr[2].push(num)}
                    else if (num == 3) {arr[3].push(num)}
                    else {console.log('error')};
                }
            }
        }
    );
    return arr;
};

function move(id) {
    // User clicks on a card.
    // The card may have the class 'selected', 'move1', 'move3', or no class
    // If a move is in play, and a card with no class or class 'selected' is clicked, deselect all colours
    // If a move is in play, and a card with 'move1' or 'move3' is clicked, move the selected card onto the clicked card and deselect all colours
    // If a move is not in play, the clicked card should be given the class selected, and any possible moves should be highlighted
    
    if (moveOn()) {
        const selectId = document.querySelector('.selected').id;
        let num = 0;
        const classes = document.getElementById(id).classList;
        if (classes.contains('moveOne')) {num = 1}
        else if (classes.contains('moveThree')) {num = 3}

        if (num != 0) {
            const move = deck.makeMove(selectId, num);
            if (!!move) {undoHistory.push(move)};           
        }
        
        eventHappened();
    }
    else {
        resetMoveColours();
        document.getElementById(id).classList.add('selected');
        let id1 = -1;
        let id3 = -1;
        deck.idsOfMove(1).forEach((elem) => {if (elem.clicked == id) {id1 = elem.covered}});
        deck.idsOfMove(3).forEach((elem) => {if (elem.clicked == id) {id3 = elem.covered}});
        if (id1 != -1) {
            document.getElementById(id1).classList.add('moveOne');
        }
        if (id3 != -1) {
            document.getElementById(id3).classList.add('moveThree');
        }
    }
};

function resetMoveColours() {
    document.querySelectorAll('.card').forEach((elem) => {
        elem.classList.remove('selected', 'moveOne', 'moveThree');
    })
};

function isGameFinished() {
    const over = deck.isGameOver();
    if (over) {
        removeCards();
        const elem = document.createElement('div');
        elem.innerHTML = 'Congratulations';
        elem.classList.add('congrats');
        document.querySelector('main').appendChild(elem);
    }
    else {
        const obj = document.querySelector('.congrats');
        if (!(obj === null)) {
            obj.remove();
        }
    }
};

/* HTML functions */

function addHintColours() {
    resetHintColours();
    let hintArr = hints();
    const arr = [];
    if (hintArr[0].length != 0) {arr.push(deck.idsOfRank(hintArr[0]))};
    if (hintArr[1].length != 0) {arr.push(deck.idsOfSuit(hintArr[1]))};
    if (hintArr[2].length != 0) {arr.push(deck.idsOfMove(1).map((e) => e.clicked))};
    if (hintArr[3].length != 0) {arr.push(deck.idsOfMove(3).map((e) => e.clicked))};
    const and = isAndOn();
    if (arr.some((e) => e.length != 0)) {
        document.querySelectorAll('.card').forEach((elem) => {
            const id = parseInt(elem.id);
            let display = false;
            if (and) {
                if (arr.every((e) => e.includes(id))) {
                    display = true;
                }
            }
            else {if (arr.some((e) => e.includes(id))) {display = true}}
            if (display) {
                elem.classList.add('hint');
            }
            else {
                elem.classList.add('noHint');
            }
        })
    }
};

function resetHintColours() {
    document.querySelectorAll('.card').forEach((elem) => {
        elem.classList.remove('hint', 'noHint');
    })
};

function addCards() {
    deck.cards.forEach((card) => {
        const elem = document.createElement('div');
        let suit = card.suit;
        switch(suit) {
            case suits[0]: suit = '&diams;'; break;
            case suits[1]: suit = '&hearts;'; break;
            case suits[2]: suit = '&spades;'; break;
            case suits[3]: suit = '&clubs;'; break;
        }
        elem.innerHTML = `${card.rank}<br>${suit}`;
        elem.id = card.id;
        elem.classList.add('card');
        if (card.isRed()) {elem.classList.add('colRed')}
        elem.addEventListener('click', function() {move(card.id)});
        document.querySelector('main').appendChild(elem);
    })
};

function removeCards() {
    let elems = document.querySelectorAll('.card');
    elems.forEach(elem => elem.remove());
};

function displayUndo() {
    if (undoHistory.length == 0) {
        document.getElementById('undo').style.display = 'none';
    }
    else {document.getElementById('undo').style.display = 'inline-block'}
};