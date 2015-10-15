import CircleView from './views/CircleView';

export default class App {
    constructor() {
        this.createChildren()
            .initCircleView();
    }

    /**
     * Create Children
     *
     * Cache DOM selectors as properties of the
     * constructor for public use.
     *
     * @public
     * @chainable
     * @method createChildren
     */
    createChildren() {
        this.circles = document.getElementsByClassName('js-circle');

        return this;
    }

    initCircleView() {
        for (let singleCircle of Array.from(this.circles)) {
            this.CircleInstance = new CircleView(singleCircle);
        }

        return this;
    }
}
