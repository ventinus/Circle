// Dependencies
import $ from 'jquery';
import 'throttle';
import 'transform';
import 'hammer';
import 'jquery-hammer';

// Local Module Variables
var WAIT_TIME, DRAG_END_SPEED = 1500;
var DRAG_SPEED = 500;
var TIMING_FN = 'ease-out';

var CLASSES = [
  '',
  'circle_position2',
  'circle_position3',
  'circle_position4'
]

// Lower the number, the higher the sensitivity
var SENSITIVITY = 3;

// Amount of pixels along the x-axis that causes a quarter rotation
var QUARTER_ROTATION = 90 * SENSITIVITY;

export default class CircleView {
  constructor(element) {
    /**
     * Flag to indicate whether the module has been enabled
     *
     * @property isEnabled
     * @type {Boolean}
     * @default false
     */
    this.isEnabled = false;

    /**
     * Primary jQuery Element
     *
     * @property $element
     * @type {jQuery}
     */
    this.$element = $(element);

    this.currentPosition = 0;

    this.startXCoords = null;
    this.currentXCoords = null;
    this.endXCoords = null;
    this.isDragging = false;
    this.currentRotation = 0;
    this.rotateAmount = null;

    this.init();
  }

  // Alias prototype
  // var proto = CircleView.prototype;

  /**
   * Init
   *
   * Top level function which kicks off
   * functionality of the constructor
   *
   * @public
   * @chainable
   * @method init
   */
  init() {

    this.setupHandlers()
      .createChildren()
      .onWindowResize()
      .enable();

    return this;
  }

  /**
   * Setup Handlers
   *
   * Ensure that the proper context of
   * 'this' is referenced by event handlers
   *
   * @public
   * @chainable
   * @method setupHandlers
   */
  setupHandlers() {
    this.windowResizeHandler = this.onWindowResize.bind(this);
    this.mouseDownHandler = this.onMouseDown.bind(this);
    this.mouseMoveHandler = this.onMouseDrag.bind(this);
    this.mouseUpHandler = this.onMouseUp.bind(this);

    return this;
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
    this.$circleMain = this.$element.children();
    this.$circleItems = this.$circleMain.children();

    return this;
  }

  /**
   * Enable
   *
   * Event listeners and any other calls required to
   * make the constructor work properly.
   *
   * @public
   * @chainable
   * @method enable
   */
  enable() {
    if (this.isEnabled) {
      return this;
    }

    this.isEnabled = true;

    window.addEventListener('resize', this.windowResizeHandler);
    this.$circleMain.on('mousedown', this.mouseDownHandler);
    window.addEventListener('mousemove', $.throttle(100, this.mouseMoveHandler));
    window.addEventListener('mouseup', this.mouseUpHandler);

    return this;
  }

  /**
   * Disables the view
   * Tears down any event binding to handlers
   * Exits early if it is already disabled
   *
   * @method disable
   * @chainable
   */
  disable() {
    if (!this.isEnabled) {
      return this;
    }

    this.isEnabled = false;


    window.removeEventListener('resize', this.windowResizeHandler);
    this.$circleMain.off('mousedown', this.mouseDownHandler);
    window.removeEventListener('mousemove', $.throttle(100, this.mouseMoveHandler));
    window.removeEventListener('mouseup', this.mouseUpHandler);


    return this;
  }

  /**
   * Destroys the view
   * Tears down any events, handlers, elements
   * Should be called when the object should be left unused
   *
   * @method destroy
   * @chainable
   */
  destroy() {
    this.disable();

    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        this[key] = null;
      }
    }

    return this;
  }

  onMouseDown(event) {
    this.startXCoords = event.screenX;
    this.isDragging = true;

    return this;
  }

  onMouseUp(event) {
    if (!this.isDragging) {
      return this;
    }

    this.isDragging = false;
    this.endXCoords = event.screenX;

    // If user clicked and did not drag
    if (this.endXCoords === this.startXCoords) {
      return this;
    }

    // Sanitize element of the last class added
    this.$circleMain.removeClass(CLASSES[this.currentPosition]);

    var remainder = null;
    // Set remainder to value only for values greater than 90 or lower than -90
    if (this.rotateAmount < -90 || this.rotateAmount > 90) {
      remainder = this.rotateAmount % 90;
    }

    // Find the nearest multiple of 90 and set the rotateAmount and currentRotation to it
    this.rotateAmount = this.currentRotation = this.getNearestMultiple(remainder);

    // Update styles for position of text items around circle
    this.updateStyles(DRAG_END_SPEED);

    // Determine which quadrant/position the circle landed
    this.getQuadrant();

    // Set class of current position
    this.$circleMain.addClass(CLASSES[this.currentPosition]);

    return this;
  }

  getNearestMultiple(remainder) {
    var nearestMultiple = null;
    if (!remainder) {
      if (this.rotateAmount >= -45 && this.rotateAmount <= 45) {
        nearestMultiple = 0;
      } else {
        nearestMultiple = this.rotateAmount < -45 ? -90 : 90;
      }
    } else if (remainder < 0) {
      nearestMultiple = remainder >= -45 ? this.rotateAmount - remainder : this.rotateAmount - (90 + remainder);
    } else if (remainder > 0) {
      nearestMultiple = remainder <= 45 ? this.rotateAmount - remainder : this.rotateAmount + (90 - remainder);
    }

    return nearestMultiple;
  }

  onMouseDrag(event) {
    if (!this.isDragging) {
      return this;
    }

    this.currentXCoords = event.screenX;
    var xDiff = (this.currentXCoords - this.startXCoords) / SENSITIVITY;
    this.rotateAmount = xDiff + this.currentRotation;

    this.updateStyles(DRAG_SPEED);

    return this;
  }

  getQuadrant() {
    var fullDragX = (this.endXCoords - this.startXCoords) + (QUARTER_ROTATION * this.currentPosition);

    var index = Math.round(fullDragX / QUARTER_ROTATION) % 4;
    if (index < 0) {
      index = CLASSES.length + index;
    }

    this.currentPosition = index;

    return this;
  }

  onWindowResize(event) {
    var width = this.$circleMain.width();
    this.$element.css('height', width);
    this.$circleMain.css('height', width);

    return this;
  }

  updateStyles(speed) {
    var circleTransform = 'rotate(' + this.rotateAmount + 'deg)';
    var circleTransition = 'transform ' + TIMING_FN + ' ' + speed + 'ms';

    var circleYItemTransform = 'translate(-50%, 0) rotate(' + -this.rotateAmount + 'deg)';
    var circleXItemTransform = 'translate(0, -50%) rotate(' + -this.rotateAmount + 'deg)';
    var circleItemTransition = 'all ' + TIMING_FN + ' ' + speed + 'ms';
    
    $.transform(this.$circleMain, circleTransform, circleTransition);
    $.transform(this.$circleItems.eq(0), circleYItemTransform, circleItemTransition);
    $.transform(this.$circleItems.eq(2), circleYItemTransform, circleItemTransition);
    $.transform(this.$circleItems.eq(1), circleXItemTransform, circleItemTransition);
    $.transform(this.$circleItems.eq(3), circleXItemTransform, circleItemTransition);

    return this;
  }
}
