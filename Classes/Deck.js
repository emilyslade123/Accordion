import Card from './Card.js';
import UndoItem from './Undo.js';
import { ranks, suits } from '../constants.js';

export default class Deck { 
    constructor() {
        this.cards = [];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 13; j++) {
                this.cards.push(new Card(ranks[j], suits[i], i*13+j))
            }
        }
    }
    
    shuffle() {
        // returns nothing
        for (let i = this.cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); 
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
    
    isGameOver() {  
        // returns Boolean: is the game finished
        return this.cards.length === 1;
    }
    
    cardMatch(card1, card2) { 
        // returns Boolean: do the cards match
        return card1.rank === card2.rank || card1.suit === card2.suit;
    }
    
    isValidMove(currentPosition, numberOfSpaces) { 
        // returns Boolean: is the move valid
        if (currentPosition >= numberOfSpaces) {
            return this.cardMatch(this.cards[currentPosition], this.cards[currentPosition - numberOfSpaces]);
        } else {
            return false;
        };
    }
    
    makeMove(id, numberOfSpaces) { 
        // returns UndoItem or false
        const currentPosition = this.idToPosition(id);
        if (this.isValidMove(currentPosition, numberOfSpaces)) {
            const undo = new UndoItem(this.cards[currentPosition], currentPosition, numberOfSpaces, this.cards[currentPosition - numberOfSpaces]);
            this.cards[currentPosition - numberOfSpaces] = this.cards[currentPosition];
            this.cards.splice(currentPosition, 1);
            return undo;
        } else {
            return false;
        };
    }
    
    undoMove(undo) { 
        // returns nothing
        this.cards.splice(undo.pos, 0, undo.clicked);
        this.cards[undo.pos - undo.num] = undo.covered;        
    }

    idsOfRank(ranks) { 
        // returns Array: the ids of every card of the given ranks
        const arr = [];
        this.cards.forEach(elem => {
            if (ranks.includes(elem.rank)) {
                arr.push(elem.id);
            }
        });
        return arr;
    }
    
    idsOfSuit(suits) { 
        // returns Array: the ids of every card of the given suits
        const arr = [];
        this.cards.forEach(elem => {
            if (suits.includes(elem.suit)) {
                arr.push(elem.id);
            }
        })
        return arr;
    }
    
    idsOfMove(num) { 
        // returns Array: every card object that can make a move
        const arr = [];
        for (let pos = 0; pos < this.cards.length; pos++) {
            if (this.isValidMove(pos, num)) {
                arr.push({clicked: this.cards[pos].id, covered: this.cards[pos - num].id});
            }
        }
        return arr;
    }
    
    idToPosition(id) {
        return this.cards.findIndex(x => x.id == id);
    }
}
