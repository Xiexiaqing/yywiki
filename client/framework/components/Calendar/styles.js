'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

var defaultClasses = {
  calendar: 'rdr-Calendar',
  dateRange: 'rdr-DateRange',
  predefinedRanges: 'rdr-PredefinedRanges',
  predefinedRangesItem: 'rdr-PredefinedRangesItem',
  monthAndYear: 'rdr-MonthAndYear',
  weekDays: 'rdr-WeekDays',
  weekDay: 'rdr-WeekDay',
  days: 'rdr-Days',
  day: 'rdr-Day',
  dayActive: 'is-selected',
  dayPassive: 'is-passive',
  dayInRange: 'is-inRange',
  monthAndYearWrapper: 'rdr-MonthAndYear-innerWrapper',
  prevButton: 'rdr-MonthAndYear-button prev',
  nextButton: 'rdr-MonthAndYear-button next',
  month: 'rdr-MonthAndYear-month',
  monthAndYearDivider: 'rdr-MonthAndYear-divider',
  year: 'rdr-MonthAndYear-year'
};

exports.defaultClasses = defaultClasses;
var defaultTheme = {
  DateRange: {
    display: 'block',
    boxSizing: 'border-box',
    background: '#ffffff',
    borderRadius: '2px'
  },

  Calendar: {
    position: 'absolute',
    border: '1px solid #ccc',
    padding: '5px',
    background: '#fff',
    width: '210px',
    height: 'auto',
    color: '#000',
    fontFamily: 'Helvetica,Arial,"Microsoft Yahei"',
    borderRadius: '2px',
    borderTop: '2px #FA7F40 solid'
  },

  Day: {
    borderRadius: '15px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'inline-block',
    textAlign: 'center',
    width: 30,
    fontSize: 14,
    height: 30,
    lineHeight: '30px',
    color: '#444',
    float: 'left'
  },
  DayPassive: {
    opacity: 0.4,
    cursor: 'normal'
  },

  DayHover: {
    color: '#FA7F40'
  },

  DayToday: {},

  DayActive: {
    background: '#95a5a6',
    color: '#ffffff',
    transform: 'scale(0.9)'
  },

  DaySelected: {
    background: '#FA7F40',
    color: '#ffffff'
  },

  DayStartEdge: {},

  DayEndEdge: {},

  DayInRange: {
    background: '#34495e',
    color: '#95a5a6'
  },

  Weekday: {
    height: 14,
    lineHeight: '14px',
    color: '#aaa',
    float: 'left',
    width: 30,
    fontSize:14,
    textAlign: 'center'
  },
  Weekdays: {
    fontSize: 14,
    marginBottom: 5
  },
  MonthAndYear: {
    position: 'relative',
    zoom: '1',
    textAlign: 'center',
    height: '30px',
    overflow: 'hidden',
    fontSize: '20px',
    marginBottom: '7px'
  },

  MonthButton: {
    width: 30,
    height: 30,
    lineHeight: '30px',
    color: '#999',
    position: 'absolute',
    left: 0,
    top: 0,
    position: 'relative'
  },
  MonthArrow: {
    display: 'block',
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
    border: '4px solid transparent',
    textAlign: 'center'
  },

  MonthArrowPrev: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    lineHeight: 30,
    color: '#999'
  },

  MonthArrowNext: {
    borderLeftWidth: '6px',
    borderLeftColor: '#34495e',
    marginLeft: 7
  },

  PredefinedRanges: {
    width: 140,
    display: 'inline-block',
    verticalAlign: 'top'
  },

  PredefinedRangesItem: {
    display: 'block',
    fontSize: 12,
    color: '#2c3e50',
    padding: '10px 14px',
    borderRadius: '2px',
    background: '#ecf0f1',
    textDecoration: 'none',
    marginBottom: 6
  },

  PredefinedRangesItemActive: {
    color: '#E74C3C'
  }
};

exports['default'] = function() {
  var customTheme = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var calendarWidth = defaultTheme.Calendar.width;
  var calendarPadding = defaultTheme.Calendar.padding;
  var cellMargin = defaultTheme.Day.margin || 0;
  if (customTheme.Calendar && customTheme.Calendar.hasOwnProperty('width')) {
    calendarWidth = customTheme.Calendar.width;
  }

  if (customTheme.Calendar && customTheme.Calendar.hasOwnProperty('padding')) {
    calendarPadding = customTheme.Calendar.padding;
  }

  if (customTheme.Day && customTheme.Day.hasOwnProperty('margin')) {
    cellMargin = customTheme.Day.margin;
  }
  var cellSize = (parseInt(calendarWidth) - parseInt(calendarPadding) * 2) / 7 - parseInt(cellMargin) * 2;
  return {
    DateRange: _extends({}, defaultTheme.DateRange, customTheme.DateRange),

    Calendar: _extends({}, defaultTheme.Calendar, customTheme.Calendar),

    Day: _extends({
      width: cellSize,
      height: cellSize,
      lineHeight: cellSize + 'px'
    }, defaultTheme.Day, customTheme.Day),
    DayPassive: _extends({}, defaultTheme.DayPassive, customTheme.DayPassive),

    DayHover: _extends({}, defaultTheme.DayHover, customTheme.DayHover),

    DayToday: _extends({}, defaultTheme.DayToday, customTheme.DayToday),

    DayActive: _extends({}, defaultTheme.DayActive, customTheme.DayActive),

    DaySelected: _extends({}, defaultTheme.DaySelected, customTheme.DaySelected),

    DayStartEdge: _extends({}, defaultTheme.DayStartEdge, customTheme.DayStartEdge),

    DayEndEdge: _extends({}, defaultTheme.DayEndEdge, customTheme.DayEndEdge),

    DayInRange: _extends({}, defaultTheme.DayInRange, customTheme.DayInRange),

    Weekday: _extends({
      width: cellSize,
      height: cellSize / 2,
      lineHeight: cellSize / 2 + 'px'
    }, defaultTheme.Weekday, customTheme.Weekday),

    MonthAndYear: _extends({}, defaultTheme.MonthAndYear, customTheme.MonthAndYear),

    MonthButton: _extends({}, defaultTheme.MonthButton, customTheme.MonthButton),

    MonthArrow: _extends({}, defaultTheme.MonthArrow, customTheme.MonthArrow),

    MonthArrowPrev: _extends({}, defaultTheme.MonthArrowPrev, customTheme.MonthArrowPrev),

    MonthArrowNext: _extends({}, defaultTheme.MonthArrowNext, customTheme.MonthArrowNext),

    PredefinedRanges: _extends({}, defaultTheme.PredefinedRanges, customTheme.PredefinedRanges),

    PredefinedRangesItem: _extends({}, defaultTheme.PredefinedRangesItem, customTheme.PredefinedRangesItem),

    PredefinedRangesItemActive: _extends({}, defaultTheme.PredefinedRangesItemActive, customTheme.PredefinedRangesItemActive)
  };
};