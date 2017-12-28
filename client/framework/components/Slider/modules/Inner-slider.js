import PropTypes from 'prop-types';
import React from 'react';
import EventHandlersMixin from './mixins/event-handlers';
import HelpersMixin from './mixins/helpers';
import initialState from '../initial-state';
import defaultProps from '../default-props';
// import classnames from 'classnames';
import classnames from '../../../utils/classnames';

import {Track} from './Track';
import {Dots} from './Dots';
import {PrevArrow, NextArrow} from './Arrows';

export var InnerSlider = React.createClass({
  mixins: [HelpersMixin, EventHandlersMixin],
  getInitialState: function () {
    return initialState;
  },
  getDefaultProps: function () {
    return defaultProps;
  },
  componentWillMount: function () {
    if (this.props.init) {
      this.props.init();
    }
    this.setState({
      mounted: true
    });
    var lazyLoadedList = [];
    for (var i = 0; i < this.props.children.length; i++) {
      if (i >= this.state.currentSlide && i < this.state.currentSlide + this.props.slidesToShow) {
        lazyLoadedList.push(i);
      }
    }

    if (this.props.lazyLoad && this.state.lazyLoadedList.length === 0) {
      this.setState({
        lazyLoadedList: lazyLoadedList
      });
    }
  },
  contextTypes: {
    sliderStyle: PropTypes.object
  },
  componentDidMount: function componentDidMount() {
    // Hack for autoplay -- Inspect Later
    this.initialize(this.props);
    this.adaptHeight();
    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (window.addEventListener) {
      window.removeEventListener('resize', this.onWindowResized);
    } else {
      window.detachEvent('onresize', this.onWindowResized);
    }
    if (this.state.autoPlayTimer) {
      window.clearTimeout(this.state.autoPlayTimer);
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (this.props.slickGoTo != nextProps.slickGoTo) {
      this.setState({currentSlide: nextProps.slickGoTo});
    }
    this.update(nextProps);
  },
  componentDidUpdate: function () {
    this.adaptHeight();
  },
  onWindowResized: function () {
    this.update(this.props);
  },
  render: function () {
    var className = classnames('slick-initialized', 'slick-slider', this.props.className);

    var trackProps = {
      fade: this.props.fade,
      cssEase: this.props.cssEase,
      speed: this.props.speed,
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      lazyLoad: this.props.lazyLoad,
      lazyLoadedList: this.state.lazyLoadedList,
      rtl: this.props.rtl,
      slideWidth: this.state.slideWidth,
      slidesToShow: this.props.slidesToShow,
      slideCount: this.state.slideCount,
      trackStyle: this.state.trackStyle,
      variableWidth: this.props.variableWidth
    };

    var dots;

    if (this.props.dots === true && this.state.slideCount > this.props.slidesToShow) {
      var dotProps = {
        dotsClass: this.props.dotsClass,
        slideCount: this.state.slideCount,
        slidesToShow: this.props.slidesToShow,
        currentSlide: this.state.currentSlide,
        slidesToScroll: this.props.slidesToScroll,
        clickHandler: this.changeSlide
      };

      dots = (<Dots {...dotProps} />);
    }

    var prevArrow, nextArrow;

    var arrowProps = {
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      slideCount: this.state.slideCount,
      slidesToShow: this.props.slidesToShow,
      prevArrow: this.props.prevArrow,
      nextArrow: this.props.nextArrow,
      clickHandler: this.changeSlide
    };

    if (this.props.arrows) {
      prevArrow = (<PrevArrow {...arrowProps} />);
      nextArrow = (<NextArrow {...arrowProps} />);
    }
    
    var styles = this.context.sliderStyle;

    return (
      <div className={styles['slick-initialized'] + ' ' + styles['slick-slider'] + this.props.className}>
        <div
          ref='list'
          className={styles['slick-list']}
          onMouseDown={this.swipeStart}
          onMouseMove={this.state.dragging ? this.swipeMove: null}
          onMouseUp={this.swipeEnd}
          onMouseLeave={this.state.dragging ? this.swipeEnd: null}
          onTouchStart={this.swipeStart}
          onTouchMove={this.state.dragging ? this.swipeMove: null}
          onTouchEnd={this.swipeEnd}
          onTouchCancel={this.state.dragging ? this.swipeEnd: null}>
          <Track ref='track' {...trackProps}>
            {this.props.children}
          </Track>
        </div>
        {prevArrow}
        {nextArrow}
        {dots}
      </div>
    );
  }
});
