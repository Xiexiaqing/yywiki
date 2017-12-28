'use strict';

import PropTypes from 'prop-types';

import React from 'react';
// import classnames from 'classnames';
import classnames from '../../../utils/classnames';

var getSlideClasses = (spec) => {
  var slickActive, slickCenter, slickCloned;
  var centerOffset, index;

  if (spec.rtl) {
    index = spec.slideCount - 1 - spec.index;
    console.log();
  } else {
    index = spec.index;
  }

  slickCloned = (index < 0) || (index >= spec.slideCount);
  if (spec.centerMode) {
    centerOffset = Math.floor(spec.slidesToShow / 2);
    slickCenter = (spec.currentSlide === index);
    if ((index > spec.currentSlide - centerOffset - 1) && (index <= spec.currentSlide + centerOffset)) {
      slickActive = true;
    }
  } else {
    slickActive = (spec.currentSlide <= index) && (index < spec.currentSlide + spec.slidesToShow);
  }
  return classnames({
    'slick-slide': true,
    'slick-active': slickActive,
    'slick-center': slickCenter,
    'slick-cloned': slickCloned
  });
};

var getSlideStyle = function (spec) {
  var style = {};

  if (spec.variableWidth === undefined || spec.variableWidth === false) {
    style.width = spec.slideWidth;
  }

  if (spec.fade) {
    style.position = 'relative';
    style.left = -spec.index * spec.slideWidth;
    style.opacity = (spec.currentSlide === spec.index) ? 1 : 0;
    style.transition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
    style.WebkitTransition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
  }

  return style;
};

var getTrackClass = (classArr, styles) => {
  var res = [];
  classArr.forEach((ele, index, array) => {
    res.push(styles[ele])
  })
  return res.join(' ');
};

var renderSlides = (spec, styles) => {
  var key;
  var slides = [];
  var preCloneSlides = [];
  var postCloneSlides = [];
  var count = React.Children.count(spec.children);
  var child;
  var assign = Object.assign;

  React.Children.forEach(spec.children, (elem, index) => {
    if (!spec.lazyLoad | (spec.lazyLoad && spec.lazyLoadedList.indexOf(index) >= 0)) {
      child = elem;
    } else {
      child = (<div></div>);
    }
    var childStyle = getSlideStyle(assign({}, spec, {index: index}));
    var slickClasses = getSlideClasses(assign({index: index}, spec));
    var cssClasses;

    if (child.props.className) {
        cssClasses = classnames(slickClasses, child.props.className);
    }
    else {
        cssClasses = slickClasses;
    }

    //框架融合处理
    // var sina_cssClasses = cssClasses.split(' ');

    slides.push(React.cloneElement(child, {
      key: index,
      'data-index': index,
      className: getTrackClass(cssClasses.split(' '), styles),
      style: assign({}, child.props.style || {}, childStyle)
    }));

    // variableWidth doesn't wrap properly.
    if (spec.infinite && spec.fade === false) {
      var infiniteCount = spec.variableWidth ? spec.slidesToShow + 1 : spec.slidesToShow;

      if (index >= (count - infiniteCount)) {
        key = -(count - index);
        preCloneSlides.push(React.cloneElement(child, {
          key: key,
          'data-index': key,
          className: getTrackClass(getSlideClasses(assign({index: key}, spec)).split(' '),styles),
          style: assign({}, child.props.style || {}, childStyle)
        }));
      }

      if (index < infiniteCount) {
        key = count + index;
        postCloneSlides.push(React.cloneElement(child, {
          key: key,
          'data-index': key,
          className: getTrackClass(getSlideClasses(assign({index: key}, spec)).split(' '),styles),
          style: assign({}, child.props.style || {}, childStyle)
        }));
      }
    }
  });

  if (spec.rtl) {
    return preCloneSlides.concat(slides, postCloneSlides).reverse();
  } else {
    return preCloneSlides.concat(slides, postCloneSlides);
  }


};

export var Track = React.createClass({
  contextTypes: {
    sliderStyle: PropTypes.object
  },
  render: function () {
    var styles = this.context.sliderStyle;
    var slides = renderSlides(this.props, styles);
    return (
      <div className={styles['slick-track']} style={this.props.trackStyle}>
        { slides }
      </div>
    );
  }
});
