export default class UndoItem {
    constructor(clicked, pos, num, covered) {
        this.clicked = clicked;
        this.pos = pos;
        this.num = num;
        this.covered = covered;
    }
}