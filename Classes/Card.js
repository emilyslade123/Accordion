export default class Card {
    constructor(rank, suit, id) {
        this.rank = rank;
        this.suit = suit;
        this.id = id;
    }
    
    isRed() {
        return this.suit === 'Diamonds' || this.suit === 'Hearts';
    }
}