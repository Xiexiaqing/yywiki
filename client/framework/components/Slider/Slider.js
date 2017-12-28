import PropTypes from 'prop-types';
import React from 'react';
import {InnerSlider} from './modules/Inner-slider';
// import assign from 'object-assign';
import json2mq from 'json2mq';
import ResponsiveMixin from 'react-responsive-mixin';
import defaultProps from './default-props';

import sliderStyle from './Slider.css';
import CSSModules from 'react-css-modules';

var Slider = React.createClass({
  mixins: [ResponsiveMixin],
  getInitialState: function () {
    return {
      breakpoint: null
    };
  },
  componentDidMount: function () {
    if (this.props.responsive) {
      var breakpoints = this.props.responsive.map(breakpt => breakpt.breakpoint);
      breakpoints.sort((x, y) => x - y);

      breakpoints.forEach((breakpoint, index) => {
        var bQuery;
        if (index === 0) {
          bQuery = json2mq({minWidth: 0, maxWidth: breakpoint});
        } else {
          bQuery = json2mq({minWidth: breakpoints[index-1], maxWidth: breakpoint});
        }
        this.media(bQuery, () => {
          this.setState({breakpoint: breakpoint});
        });
      });

      // Register media query for full screen. Need to support resize from small to large
      var query = json2mq({minWidth: breakpoints.slice(-1)[0]});

      this.media(query, () => {
        this.setState({breakpoint: null});
      });
    }
  },
  childContextTypes: {
    sliderStyle: PropTypes.object
  },
  getChildContext: function() {
    return {sliderStyle: this.props.styles};
  },
  render: function () {
    var settings;
    var newProps;
    var assign = Object.assign;
    if (this.state.breakpoint) {
      newProps = this.props.responsive.filter(resp => resp.breakpoint === this.state.breakpoint);
      settings = newProps[0].settings === 'unslick' ? 'unslick' : assign({}, this.props, newProps[0].settings);
    } else {
      settings = assign({}, defaultProps, this.props);
    }
    if (settings === 'unslick') {
      // if 'unslick' responsive breakpoint setting used, just return the <Slider> tag nested HTML
      return (
        <div>{this.props.children}</div>
      );
    } else {
      return (
        <InnerSlider {...settings}>
          {this.props.children}
        </InnerSlider>
      );
    }
  }
});

export default CSSModules(Slider, sliderStyle);
module.exports = Slider;
