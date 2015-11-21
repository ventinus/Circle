(function($,window,undefined){
  
  var $ = window.jQuery;
 
  $.transform = function( $element, transform, transition ) {
    $element.css({
      '-webkit-transform': transform,
      '-moz-transform': transform,
      '-ms-transform': transform,
      '-o-transform': transform,
      'transform': transform,
      '-webkit-transition': transition,
      '-moz-transition': transition,
      '-ms-transition': transition,
      '-o-transition': transition,
      'transition': transition
    });
  };
    
})(window.Zepto || window.jQuery, window);
