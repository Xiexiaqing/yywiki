import temp from './raphael';

let Raphael = temp();

Raphael.fn.renderTitle = function(opts) {
    if (!opts.title.label || opts.title['float']) {
        this.options.seriesOpt.marginTop = opts.seriesOpt.minMarginTop + opts.chart.marginTop;
        return false;
    } else {
        var title = this.text(0, 0, opts.title.label);
        title.attr({
            "fill"       : "#3E576F",
            "font-family": "Tahoma, 'microsoft yahei', 微软雅黑, 宋体",
            "font-size"  : opts.title['font-size'],
            x            : this.width / 2,
            y            : title.getBBox().height / 2 + opts.chart.marginTop
        });
        this.options.seriesOpt.marginTop = title.getBBox().height + opts.chart.marginTop;
        return title;
    }
};

Raphael.fn.drawLegend = function() { //图例
    var options = this.options;
    if (options.legend.enabled == false) {
        options.seriesOpt.marginBottom = options.chart.marginBottom + 10 || 5;
        return;
    }
    var legendOptions = options.legend || {};
    var legendHeight = legendOptions.size || 18; //图例宽度
    var marginBottom = options.chart.marginBottom || 5;
    var seriesNumber = options.series.length;
    var lineHeight = legendHeight * 1.6;
    var space = legendOptions.space || 10;
    var seriesOpts = options.seriesOpt;
    var labelColors = ['#3E576F', '#000', '#CCC'];

    var tempLength = 0//字母长度
    for (var i = 0; i < seriesNumber; i++) {
        tempLength += options.series[i].name.length * 10;
    }
    var initX = (this.width - (tempLength + legendHeight * seriesNumber + (2 * seriesNumber - 1) * space)) / 2;
    seriesOpts.marginBottom = lineHeight + marginBottom + 12;
    var initY = this.height - seriesOpts.marginBottom + 24;
    var x = initX,
        y = initY;
    if(options.legend.position == "top"){
        y = 0;
    }
    var legendSet = this.set();
    for (var i = 0, l = options.series.length; i < l; i++) {
        var legend = this.set();
        var symbol = this.rect(x, y, 25, 4, 2)
            .attr({ //高度应该就是每一个bar高度的2倍
                fill          : options.colors[i],
                "stroke-width": 0,
                "cursor"      : "pointer"
            });
        symbol.data("series-index", i);
        symbol.set = legend;
        legend.push(symbol);
        x += legendHeight + space;
        var text = options.series[i]['name'];
        var label = this.text(x, y + 6, text)
            .attr({//10是上下居中校正
                "text-anchor": "start",//如果不设置成start,会居中
                "fill"       : labelColors[0],
                "font-family": "Tahoma, 'microsoft yahei', 微软雅黑, 宋体",
                "font-size"  : 12,
                "cursor"     : "pointer"
            });
        label.data("series-index", i);
        label.set = legend;
        legend.push(label);
        x += label.getBBox().width + space; //字号
        legend.mouseover(function () {
            this.set[1].attr({fill: labelColors[1]});
        });
        legend.mouseout(function () {
            var index = parseInt(this.data("series-index"));
            if (this.paper.seriesItems[index].data('visible')) {
                this.set[1].attr({fill: labelColors[0]});
            } else {
                this.set[1].attr({fill: labelColors[2]});
            }
        });
        legendSet.push(legend);
    }
    //interaction
    legendSet.click(function () {
        var chart = this.paper;
        var seriesData = chart.options.series;
        var seriesOpts = chart.options.seriesOpt;
        var axisOpts = chart.options.axis;
        var seriesItems = chart.seriesItems;
        var shadowItems = chart.shadowItems;
        var pointItems = chart.pointItems;
        var index = parseInt(this.data("series-index"));
        var max_min;
        if (seriesItems[index].data("visible")) {
            if (chart.hiddenSeriesIndexArr.indexOf(index) < 0) chart.hiddenSeriesIndexArr.push(index);
            this.set.attr({fill: labelColors[2]});
            seriesItems[index].data("visible", false);
            shadowItems[index].data("visible", false);
        } else {
            chart.hiddenSeriesIndexArr.splice(chart.hiddenSeriesIndexArr.indexOf(index), 1);
            this.set[0].attr({fill: chart.options.colors[index]});
            this.set[1].attr({fill: labelColors[0]});
            seriesItems[index].data("visible", true);
            shadowItems[index].data("visible", true);
        }
        if (this.paper.options.chart.hasSubAxis) {
            //隐藏相关部件。
            if (chart.hiddenSeriesIndexArr.length === seriesData.length){
                chart.grid[0].attr({"opacity":0});
                chart.grid[1].attr({"opacity":0});
                chart.grid[2].attr({"opacity":0});
            } else {
                chart.grid[0].attr({"opacity":1});
                if (seriesData[index].subAxis){
                    chart.grid[2].attr({"opacity":seriesItems[index].data("visible")?1:0});
                } else {
                    chart.grid[1].attr({"opacity":seriesItems[index].data("visible")?1:0});
                }
            }
            if (!seriesItems[index].data("visible")) {
                seriesItems[index].attr({"opacity":0});
                shadowItems[index].attr({"opacity":0});
            } else {
                seriesItems[index].attr({"opacity":1});
                shadowItems[index].attr({"opacity":.1});
            }
            return;
        }
        //pointItems[0][0].attr({cy: 100});
        max_min = calculateMaxAndMin(chart.options, chart.hiddenSeriesIndexArr);

        //重新绘制坐标轴，计算每根tick的当前位置，及目标位置，执行动画
        for (var g = 0, len = chart.grid.length; g < len; g++) {
            chart.grid[g].remove();
        }
        chart.options.axis.dataMax = max_min.max;
        chart.options.axis.dataMin = max_min.min;
        setTickPositions(chart);

        chart.grid = chart.drawGrid(chart.options.axis.tickInterval, chart.options.axis.tickPositions);
        chart.grid.toBack();
        //重新计算series、shadow、points、axis的位置。
        var transA = (axisOpts.tickPositions.length === 1) ?
            (chart.height - seriesOpts.marginBottom - seriesOpts.marginTop - 24) :
            (chart.height - seriesOpts.marginBottom - seriesOpts.marginTop - 24) / (axisOpts.tickPositions[axisOpts.tickPositions.length - 1] - axisOpts.tickPositions[0]);
        var seriesPathArr = [];

        for (var j = 0, seriesNum = seriesData.length; j < seriesNum; j++) {
            if (!seriesItems[j].data("visible")) {
                seriesItems[j].attr({"opacity": 0});
                shadowItems[j].attr({"opacity": 0});
                for (var g = 0, len = pointItems[j].length; g < len; g++) {
                    pointItems[j][g].attr({"opacity": 0});
                }
                continue;
            }
            var lastX = 0,
                lastY = 0,
                shadowPath,
                seriesPath;
            var dotArr = [];
            var basePos = chart.height - chart.options.seriesOpt.marginBottom - 7 - 5;
            var basePosX = chart.options.chart.marginLeft + chart.options.seriesOpt.paddingLeft;
            var data = seriesData[j].data;

            //获取路径
            for (var i = 0, len = chart.options.labels.length; i < len; i++) {
                var y = basePos - transA * data[i] + chart.options.axis.tickPositions[0] * transA,
                    x = (len === 1) ? basePosX + chart.options.transAX : basePosX + chart.options.transAX * (i);

                if (!i) {//起始位置：阴影是从基线位置开始到第一个点
                    seriesPath = ["M", x, y];
                    shadowPath = ["M", x, basePos, "L", x, y];
                }
                if (i) {
                    if (data[i] !== null) {//如果没有空值（断点），继续画线。
                        if (data[i - 1] === null) {//如果上一个点是空值，则先改变起始位置，再继续画线
                            seriesPath = seriesPath.concat(["M", x, y]);
                            shadowPath = shadowPath.concat(["M", x, basePos, "L", x, y]);
                        } else {//连续画线
                            seriesPath = seriesPath.concat(["L", x, y]);
                            if (i < len - 1) {
                                shadowPath = shadowPath.concat(["L", x, y]);
                            } else {
                                shadowPath = shadowPath.concat(["L", x, y, "L", x, basePos]);
                            }
                        }
                    } else {//如果为空值（断点），则先改变起始位置，再继续画线
                        seriesPath = seriesPath.concat(["M", x, basePos]);
                        y = basePos;
                        shadowPath = shadowPath.concat([lastX, basePos]);
                    }
                }
                if (data[i] !== null) {
                    dotArr.push({"cx": x, "cy": y, "opacity": 1});
                }
                lastX = x;
                lastY = y;
            }
            seriesPathArr.push(seriesPath);
            seriesItems[j].stop().animate({path: seriesPath.join(" "), opacity: 1}, 500);
            shadowItems[j].stop().animate({path: shadowPath.join(" "), opacity: .1}, 500);
            for (var k = 0; k < pointItems[j].length; k++) {
                pointItems[j][k].attr(dotArr[k]);
            }
        }

    });
};
Raphael.fn.drawXAxis = function (opt) {
    var labels = opt.labels;
    var chart = this;
    var rendererOptions = chart.options;
    var seriesOpts = chart.options.seriesOpt;

    seriesOpts.marginLeft = rendererOptions.chart.marginLeft;
    seriesOpts.marginRight = rendererOptions.chart.marginRight;
    seriesOpts.paddingLeft = 0;
    seriesOpts.paddingRight = 10;
    var xAxisLabelSet = this.set();
    var initX = chart.options.transBX = seriesOpts.marginLeft + seriesOpts.paddingLeft+chart.yAxisLeft+15;
    seriesOpts.width = chart.width - initX - seriesOpts.paddingLeft - seriesOpts.paddingRight - seriesOpts.marginRight;
    var transB = chart.options.transAX = labels.length === 1 ? correctFloat(seriesOpts.width / 2) : correctFloat(seriesOpts.width / (labels.length - 1));
    var tickPositionsX = [];
    var posY = this.height - seriesOpts.marginBottom;
    for (var g = 0, len = labels.length; g < len; g++) {
        tickPositionsX.push(g);
        var posX = (len === 1) ? initX + transB : initX + transB * g;
        if (g % chart.options.xAxis.labelStep === 0 && !chart.options.xAxis.xAxisHide) {
            if(!((len == 14) && (g == len-2))){
                var label = chart.text(0, 0, labels[g])
                    .attr({
                        "text-anchor": "middle",
                        'font-size'  : 12,
                        "fill"       : "#848484",
                        "font-family": "Tahoma, 'microsoft yahei', 微软雅黑, 宋体",
                        x            : posX,
                        y            : posY
                    });
                //render tick
                if(!chart.options.xAxis.xAxisHide){
                    chart.path([
                            "M",
                            posX,
                            posY - 7 - 5,
                            "L",
                            posX,
                            posY - 7
                        ])
                        .attr({
                            "stroke"      : "#BDC1CA",
                            "stroke-width": "1"
                        });
                    xAxisLabelSet.push(label);
                }
            }
        }
        if((len === 30 || len === 14 )&& (g ===len-1)){
            var label = chart.text(0, 0, labels[g])
                .attr({
                    "text-anchor": "middle",
                    'font-size'  : 12,
                    "fill"       : "#848484",
                    "font-family": "Tahoma, 'microsoft yahei', 微软雅黑, 宋体",
                    x            : posX,
                    y            : posY
                });
            //render tick
            if(!chart.options.xAxis.xAxisHide){
                chart.path([
                        "M",
                        posX,
                        posY - 7 - 5,
                        "L",
                        posX,
                        posY - 7
                    ])
                    .attr({
                        "stroke"      : "#FACBB9",
                        "stroke-width": "1"
                    });
                xAxisLabelSet.push(label);
            }
        }
    }
};
Raphael.fn.drawGrid = function (tickInterval, tickPositions) {
    var chart = this;
    if (this.options.yAxis.minSize) {//如果显示最小值（负数）
        var tickPositionsAdjust = [].concat(tickPositions);
        chart.options.tickPositionsAdjust = tickPositionsAdjust;
        for (var g = 0, len = tickPositions.length; g < len; g++) {
            tickPositionsAdjust[g] -= tickPositions[0];
        }
    } else {
        tickPositionsAdjust = tickPositions.concat();
    }
    var seriesOpts = this.options.seriesOpt;
    var color = "#F2F2F5";
    var transB = this.height - seriesOpts.marginBottom - 7 - 5;
    var pieceNum = (tickPositionsAdjust[tickPositionsAdjust.length - 1] - tickPositionsAdjust[0]) || 1;
    var transA = (this.height - seriesOpts.marginBottom - seriesOpts.marginTop - chart.options.chart.marginTop - 12) / pieceNum;
    var gridSet = this.set();
    var gridLineSet = this.set();
    var gridLabelSet = this.set();
    var gridSubLabelSet = this.set();
    for (var i = 0; i <= tickPositionsAdjust.length - 1; i++) { //空过去x=0的黑实线
        var gridItemSet = this.set();
        var py = transB - tickPositionsAdjust[i] * transA;
        var dasharray = [];
        var strokeColor = "#BDC1CA";
        if(i != 0){
            dasharray = ["-"];
            strokeColor = "#848484";
        }
        chart.options.yAxis.backgroundLineHide || gridLineSet.push(this.path(["M", seriesOpts.marginLeft+chart.yAxisLeft + 15, py,
                "L", this.width - seriesOpts.marginRight - seriesOpts.paddingRight+chart.yAxisLeft - 15, py])
            .attr({
                'stroke'        : strokeColor,
                'stroke-dasharray':dasharray,
                'stroke-width': 0.9
            }));
        chart.options.yAxis.yAxisHide || gridLabelSet.push(this.text(seriesOpts.marginLeft , py, chart.options.yAxis.labelFormatter?chart.options.yAxis.labelFormatter.apply(tickPositions[i]):tickPositions[i])
            .attr({
                'text-anchor' : 'start',
                'fill'        : "#848484",
                'stroke-width': 1,
                'font-size'   : 11
            }));
        chart.options.yAxis.yAxisHide || chart.options.chart.hasSubAxis && gridSubLabelSet.push(this.text(chart.width - seriesOpts.marginRight - 5 , py, chart.options.yAxis.labelFormatter?chart.options.yAxis.labelFormatter.apply(chart.options.subTickPositions[i]):chart.options.subTickPositions[i])
            .attr({
                'text-anchor' : 'start',
                'fill'        : "#848484",
                'stroke-width': 1,
                'font-size'   : 11
            }));
    }
    gridSet.push(gridLineSet);
    gridSet.push(gridLabelSet);
    gridSet.push(gridSubLabelSet);
    return gridSet;
};
var correctFloat = function (num) {
    return parseFloat(num.toPrecision(14));
};
var calculateMaxAndMin = function (options, indexArr) {
    var data = [],
        dataMax = 0,
        dataMin = 0,
        subDataMax = 0,
        subDataMin = 0;
    indexArr = indexArr || [];
    for (var i = 0, l = options.series.length; i < l; i++) {
        if (indexArr.indexOf(i) > -1) continue;
        for (var j = 0, lj = options.series[i].data.length; j < lj; j++) {
            if (options.series[i].data[j]) {
                if (options.series[i].subAxis) {
                    subDataMax = Math.max(options.series[i].data[j], subDataMax);
                    subDataMin = Math.min(options.series[i].data[j], subDataMin);
                } else {
                    dataMax = Math.max(options.series[i].data[j], dataMax);
                    dataMin = Math.min(options.series[i].data[j], dataMin);
                }
            }
        }
    }
    return {
        'max'   : dataMax,
        'min'   : dataMin,
        'subMax': subDataMax,
        'subMin': subDataMin
    }
};
var getMagnitude = function (num) {//获取当前数字的数量级，如0.1、1、10、1000等
    return Math.pow(10, Math.floor(Math.log(num) / Math.LN10));
};
var normalizeTickInterval = function (interval, multiples, magnitude, chart, options) {
    var normalized;

    // round to a tenfold of 1, 2, 2.5 or 5
    magnitude = magnitude || 1;
    normalized = interval / magnitude;

    // multiples for a linear scale
    if (!multiples) {
        multiples = chart.options.yAxis.multiples || [1, 2, 2.5, 5, 10];
        // the allowDecimals option
        if (chart.options && chart.options.allowDecimals === false) {
            if (magnitude === 1) {
                multiples = [1, 2, 5, 10];
            } else if (magnitude <= 0.1) {
                multiples = [1 / magnitude];
            }
        }
    }

    // normalize the interval to the nearest multiple
    for (var i = 0, len = multiples.length; i < len; i++) {
        interval = multiples[i];
        if (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2) {
            break;
        }
    }
    // multiply back to the correct magnitude
    interval *= magnitude;
    //chart.options.tickInterval = interval;
    return interval;
};
var getLinearTickPositions = function (tickInterval, min, max) {
    var pos,
        lastPos,
        roundedMin = correctFloat(Math.floor(min / tickInterval) * tickInterval),
        roundedMax = correctFloat(Math.ceil(max / tickInterval) * tickInterval),
        tickPositions = [];
    // Populate the intermediate values
    pos = roundedMin;
    while (pos <= roundedMax) {
        tickPositions.push(pos);
        // Always add the raw tickInterval, not the corrected one.
        pos = correctFloat(pos + tickInterval);
        if (pos === lastPos) {
            break;
        }
        // Record the last value
        lastPos = pos;
    }
    return tickPositions;
};
var setTickPositions = function (chart) {
    var options = chart.options.axis,
        maxPadding = options.maxPadding || 0.05,//axis的留白比例
        minPadding = options.minPadding || 0.05,
        length,
        tickIntervalOption = options.tickInterval,
        tickPixelIntervalOption = options.tickPixelInterval || 100,
        tickPositions;
    options.min = options.userMin || options.dataMin;
    options.max = options.userMax || options.dataMax;

    // adjust min and max for the minimum range
    //axis.adjustForMinRange();

    // Pad the values to get clear of the chart's edges. To avoid tickInterval taking the padding
    // into account, we do this after computing tick interval (#1337).
    if ((options.min !== undefined) && options.max) {
        length = options.max - options.min;
        if (length) {
            if (minPadding && options.dataMin < 0) {
                //options.min -= length * minPadding;
            }
            if (maxPadding && options.dataMax > 0) {
                options.max += length * maxPadding;
            }
        }
    }

    // get tickInterval
    var axisHeight = chart.height - chart.options.seriesOpt.marginTop - chart.options.seriesOpt.marginBottom;
    //console.log(axisHeight, chart.height, chart.options.seriesOpt.marginTop, chart.options.seriesOpt.marginBottom, options.max, options.min,tickPixelIntervalOption,axisHeight);
    if (options.max !== 0 && (options.min === options.max || options.min === undefined || options.max === undefined)) {
        options.tickInterval = 1;
    } else {
        options.tickInterval = tickIntervalOption || (options.max - options.min) * tickPixelIntervalOption / Math.max(axisHeight, tickPixelIntervalOption);
    }
    // set the translation factor used in translate function
    //axis.setAxisTranslation(true);

    // for linear axes, get magnitude and normalize the interval
    if (true) { // linear
        if (!tickIntervalOption) {
            options.tickInterval = normalizeTickInterval(options.tickInterval, null, getMagnitude(options.tickInterval), chart);
        }
    }
    // find the tick positions
    if (!tickPositions) {
        var tickIntervalYaxis = options.tickInterval;
        var maxYaxis = options.max;
        //百分比数据处理
        if(chart.options.yAxis.percentage){
            (tickIntervalYaxis > 25) && (tickIntervalYaxis = 25);
            (maxYaxis > 100) && (maxYaxis = 100);
        }
        tickPositions = getLinearTickPositions(tickIntervalYaxis, options.min, maxYaxis);
    }
    options.tickPositions = tickPositions;
};
Raphael.fn.drawSeries = function () {
    var chart = this;
    var options = chart.options;
    var axisOpts = chart.options.axis;
    var seriesOpts = chart.options.seriesOpt;
    var transA = (this.height - seriesOpts.marginBottom - seriesOpts.marginTop - chart.options.chart.marginTop - 12) / (axisOpts.tickPositions[axisOpts.tickPositions.length - 1] - axisOpts.tickPositions[0]);

    var data = options.series;
    var labels = options.labels;
    var dots = {};
    var is_label_visible = false;
    var blanket = chart.set();
    chart.blanket = blanket;
    if (options.series instanceof Array) {
        var seriesNum = options.series.length;
        for (var j = 0, lj = seriesNum; j < lj; j++) {
            var conf = {
                color        : !options.colors[j] ? options.colors : options.colors[j],
                series       : j,
                isSub        : data[j].subAxis,
                transA       : data[j].subAxis ? (chart.height - seriesOpts.marginTop - seriesOpts.marginBottom - 24) / (options.subTickPositions[options.subTickPositions.length - 1] - options.subTickPositions[0]) : transA,
                tickPositions: !data[j].subAxis ? options.axis.tickPositions : options.subTickPositions
            }
            draw(data[j].data, conf);
        }
    } else {
        draw(data);
        var seriesNum = 1;
    }

    function draw(data, conf) {
        var seriesPath, shadowPath;
        var data = data;
        var color = conf.color || '#CCC';
        var series = conf.series || '0';
        chart.pointItems[series] = [];
        var bgp = chart.path().attr({
                stroke : "none",
                opacity: .1,
                fill   : color
            }), //阴影
            path = chart.path().attr({
                stroke           : color,
                "stroke-width"   : 1.5,
                "stroke-linejoin": "round",
                "zIndex"         : 2
            }).hover(function () {
                    path.attr({
                        "stroke-width": 3
                    })
                }, function () {
                    path.attr({
                        "stroke-width": 2
                    })
                }); //连线
        bgp.data("visible", true);
        path.data("visible", true);
        chart.shadowItems.push(bgp);
        chart.seriesItems.push(path);

        var lastX = 0,
            lastY = 0;
        var resultArr = [],
            dotArr = [],
            bgArr = [];
        var basePos = chart.height - chart.options.seriesOpt.marginBottom - 7 - 5;
        var basePosX = chart.options.chart.marginLeft + chart.options.seriesOpt.paddingLeft+chart.yAxisLeft+15;

        conf.transA = (conf.transA === Infinity) ? 0 : conf.transA;
        for (var i = 0, len = chart.options.labels.length; i < len; i++) {
            var y = basePos - conf.transA * data[i] + conf.tickPositions[0] * conf.transA,
                x = len === 1 ? basePosX + chart.options.transAX : basePosX + chart.options.transAX * (i);
            if (!i) {
                seriesPath = ["M", x, y];
                shadowPath = ["M", x, basePos, "L", x, y];
                resultArr.push(seriesPath);
            }
            if (i) {
                if (data[i] !== null) {
                    if (data[i - 1] === null) {//如果上一个点是空值，则先改变起始位置，再继续画线
                        seriesPath = seriesPath.concat(["M", x, y, "L", x, y]);
                        shadowPath = shadowPath.concat(["M", x, basePos, "L", x, basePos]);
                    } else {
                        seriesPath = seriesPath.concat(["L", x, y]);
                        resultArr.push(seriesPath);
                        if (i < len - 1) {
                            shadowPath = shadowPath.concat(["L", x, y]);
                        } else {
                            shadowPath = shadowPath.concat(["L", x, y, "L", x, basePos]);
                        }
                        bgArr.push(shadowPath);
                    }
                } else {
                    y = basePos;
                    shadowPath = shadowPath.concat([lastX, basePos]);
                }
            }
            if (data[i] !== null) {
                dotArr.push([x, y]);

                var dot = chart.circle(x, y, 6)
                    .attr({
                        stroke        : len === 1 ? color : chart.options.chart.backgroundColor || "#FFFFFF",
                        fill          : color,
                        "stroke-width": 3
                    });
                len > 1 && dot.hide();
                dots[x] = dots[x] || [];
                dots[x].push(dot);
                chart.pointItems[series].push(dot);
            }
            if (conf.series == seriesNum - 1) {
                //console.log('dotssssssssss', dots);
                blanket.push(chart.rect(len === 1 ? basePosX : x, 0, len === 1 ? chart.options.seriesOpt.width : chart.options.transAX, basePos)
                    .attr({
                        stroke : "none",
                        fill   : "#333",
                        opacity: 0
                    }));
                var rect = blanket[blanket.length - 1];
                (function (x, y, i, data, lbl, dot, series) {
                    rect.hover(function () {
                        if(!chart.options.tooltip.hidden){
                            chart.tooltip.setData(i).show().setPosition(x, y, true, i);
                            for (var j = 0, jl = dot[x].length; j < jl; j++) {
                                //bugfix:双轴时，隐藏线条的dot还会显示；
                                if (!chart.seriesItems[j].data('visible')) continue;
                                if (len > 1) {
                                    dot[x][j].attr("chart", 4).show();
                                } else {
                                    dot[x][j].attr("stroke-width", 4)
                                }
                            }
                            chart.verticalGrid.show().stop().transform('t' + x + ',' + '0');
                            is_label_visible = true;
                        }
                    }, function () {
                        for (var j = 0, jl = dot[x].length; j < jl; j++) {
                            if (len > 1) {
                                dot[x][j].attr("chart", 4).hide();
                            } else {
                                dot[x][j].attr("stroke-width", 2);
                            }
                        }
                        chart.verticalGrid.hide();
                        chart.tooltip.hide();
                        is_label_visible = false;
                    });
                })(x, y, i, data[i], labels[i], dots, series);
            }
            lastX = x;
            lastY = y;
        }
        seriesPath = seriesPath.concat(["L", x, y]);
        resultArr.push(seriesPath);
        shadowPath = shadowPath.concat([x, y, x, y, "L", x, basePos, "z"]);

        var i = 0;
        var temp_p = [],
            loop = resultArr.length;
        var aniTime = 20;
        function looper() {
            path.stop().animate({
                'path': resultArr[i]

            }, aniTime, function () {
                if (i < loop) {
                    looper();
                    i++;
                } else {
                    //dot(i - 1);
                    bgp.attr({
                        path: shadowPath
                    });

                }
            });
        }

        looper();
        options.labelSet[0] && options.labelSet[0].toFront();
        options.labelSet[1] && options.labelSet[1].toFront();
        blanket.toFront();
    }
};
Raphael.fn.Tooltip = function () {
    var Tooltip = {};
    var chart = this;
    var w = chart.options.tooltip.width;
    var h = chart.options.tooltip.height == "auto" ? 100 : chart.options.tooltip.height;
    var margin = chart.options.tooltip.margin;
    var labelSet = chart.set();
    var background;
    var title;
    var prompt;
    var labelAttr = {
        "text-anchor": "start",
        "fill"       : "#333333",
        "font-family": "Tahoma, 'microsoft yahei', 微软雅黑, 宋体",
        "font-size"  : 12
    };
    var init = function () {//初始化背景框和各个标签
        background = chart.rect(0, 0, w, h, 3).attr({"fill": "#FFFFFF", "opacity": .9, 'stroke': "#E1D4CD", "stroke-width": 1});
        title = chart.text(0, 0, chart.options.labels[0]).attr(labelAttr)
            .attr(labelAttr).attr({"font-weight": "bold"});
        for (var i = 0, len = chart.options.series.length; i < len; i++) {
            var label = chart.set();//每行标签de集合
            var nameLabel = chart.text(0, 60, chart.options.series[i].name).attr(labelAttr);
            label.push(nameLabel);
            var dataLabel = chart.text(0 + 120, 60, chart.options.series[i].data[0]).attr(labelAttr)
                .attr({"text-anchor": "end"});
            label.push(dataLabel);
            labelSet.push(label);
        }
        if(chart.options.tooltip.prompt){
            prompt = chart.text(0, 60,"").attr(labelAttr)
                .attr({"fill":"#FF9862"});
        }
        Tooltip.background = background;
    }
    Tooltip.setPosition = function (x, y, anim, index) {
        var maxData = -9999;
        var seriesIndex = 0;
        for (var j = 0, seriesLen = chart.options.series.length; j < seriesLen; j++) {
            if (!chart.seriesItems[j].data('visible')) continue;
            if (chart.options.series[j].data[index] > maxData) {
                seriesIndex = j;
            }
        }
        //判定边界
        x = x + 10;
        y = y + 10;
        if (x + chart.options.tooltip.width > chart.width) x = x - chart.options.tooltip.width - 10;
        if (x < 0) x = 2;
        if (y + this.background.attrs.height > (chart.height - chart.options.seriesOpt.marginBottom)) y = y - this.background.attrs.height - 10;
        if (y < 0) y = 2;
        var action = !anim ? "animate" : "attr";
        background[action]({x: x, y: y});
        title[action]({x: x + margin, y: y + margin + 8});
        if(chart.options.tooltip.prompt){
            prompt[action]({x: x + margin, y: y + margin + 58});
        }
        //数据标签
        var prevLabel = title;
        for (var i = 0, len = labelSet.length; i < len; i++) {
            if (!chart.seriesItems[i].data('visible')) {
                labelSet[i].hide();
                continue;
            }
            var prevLabelHeight = 0;
            prevLabelHeight = prevLabel.getBBox().height;
            
            labelSet[i][0][action]({x: prevLabel.attrs.x, y: prevLabel.attrs.y + prevLabelHeight + margin});
            labelSet[i][1][action]({x: prevLabel.attrs.x + w - 2 * margin, y: prevLabel.attrs.y + prevLabelHeight + margin});
            prevLabel = labelSet[i][0];
            background[action]({height: prevLabel.attrs.y  + prevLabelHeight + margin - background.attrs.y - 8});
        }
        if(chart.options.tooltip.prompt && (chart.options.tooltip.prompt[index] == 1)){
            background[action]({height: prevLabel.attrs.y  + prevLabelHeight + margin - background.attrs.y + 12})
        }
        return this;
    }
    Tooltip.setData = function (index) {
        title.attr({text: chart.options.labels[index]});
        if(chart.options.tooltip.prompt){
            if(chart.options.tooltip.prompt[index] == 1){
                prompt.attr({text: "已使用推广"});
            }else{
                prompt.attr({text: ""});
            }
        }
        for (var i = 0, len = labelSet.length; i < len; i++) {
            if (!chart.seriesItems[i].data('visible')) {
                labelSet[i].hide();
                continue;
            }
            var data = chart.options.series[i].data;
            var tootipText = String(data[index]);
            chart.options.yAxis.percentage && (tootipText = tootipText+"%");
            chart.options.tooltip.desc && (tootipText = tootipText +" "+ chart.options.tooltip.desc);
            labelSet[i][1].attr({text: tootipText});
        }
        return this;
    }
    Tooltip.show = function () {
        background.show();
        title.show();
        if(chart.options.tooltip.prompt){
            prompt.show();
        }
        labelSet.show();
        return this;
    };
    Tooltip.hide = function () {
        background.hide();
        title.hide();
        if(chart.options.tooltip.prompt){
            prompt.hide();
        }
        labelSet.hide();
        return this;
    };
    init();
    return Tooltip;
}

var getSize = function (dom) {
    return {
        width: dom.offsetWidth,
        height: dom.offsetHeight
    };
}

export default function (opt) {
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt /*, from*/) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++) {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }
    var containerSize = getSize(opt.wrap);
    var colorhue = .6 || Math.random(),
        color = opt.colors || "hsl(" + [colorhue, .5, .5] + ")",
        width = opt.chart.width && opt.chart.width || containerSize.width,
        height = opt.chart.height && opt.chart.height || containerSize.height,

        axisExtremes,//axis坐标的最大最小数值
        chart = Raphael(opt.wrap, width, height);
    chart.options = opt;
    chart.options.seriesOptions = {};
    chart.seriesItems = [];
    chart.shadowItems = [];
    chart.pointItems = [];
    chart.hiddenSeriesIndexArr = [];
    axisExtremes = calculateMaxAndMin(chart.options);
    chart.options.axis = {
        range            : axisExtremes.max - axisExtremes.min,
        dataMax          : axisExtremes.max,
        dataMin          : axisExtremes.min,
        subRange         : axisExtremes.subMax - axisExtremes.subMin,
        subDataMax       : axisExtremes.subMax,
        subDataMin       : axisExtremes.subMin,
        maxPadding       : 0,
        minPadding       : 0,
        tickPixelInterval: 100
    };
    chart.options.seriesOpt = {marginTop: chart.options.chart.marginTop};
    chart.options.seriesOpt.minMarginTop = 11 / 2;
    //图表标题
    chart.renderTitle(opt);
    //图例
    chart.drawLegend();

    setTickPositions(chart);
    for (var i = 0; i < chart.options.series.length; i++) {
        if (chart.options.series[i].subAxis) {//temparory get subTickPostions;
            chart.options.subTickPositions = [];
            chart.options.subTickInterval = chart.options.axis.subRange / (chart.options.axis.tickPositions.length - 1);
            chart.options.subTickInterval = normalizeTickInterval(chart.options.subTickInterval, null, getMagnitude(chart.options.subTickInterval), chart);
            chart.options.subTickPositions = getLinearTickPositions(chart.options.subTickInterval, chart.options.axis.subDataMin, chart.options.axis.subDataMax);
            chart.options.chart.hasSubAxis = true;
            var tickLen = chart.options.axis.tickPositions.length;
            var subMaxTick = chart.options.subTickPositions[chart.options.subTickPositions.length-1];
            var tickIntervalBase = subMaxTick / (tickLen - 1);
            if(tickIntervalBase > 1){
                chart.options.subTickInterval = Math.round(tickIntervalBase);
            }
            var subMinTick = chart.options.subTickPositions[0];
            chart.options.subTickPositions = [subMinTick];
            for (var sub = 1; sub < tickLen - 1; sub++){
                chart.options.subTickPositions[sub] = subMinTick + chart.options.subTickInterval * sub;
            }
            chart.options.subTickPositions[sub] = subMaxTick;
        }
    }
    //x轴label和tick、baseLine；
    chart.yAxisLeft = 8*(chart.options.yAxis.labelFormatter.apply(chart.options.axis.tickPositions[chart.options.axis.tickPositions.length-1]).toString().length-1);

    chart.drawXAxis(opt);
    chart.grid = chart.drawGrid(chart.options.axis.tickInterval, chart.options.axis.tickPositions);

    chart.options.labelSet = chart.set();

    chart.verticalGrid = chart.path().attr({
        "path"            : ["M", 0, chart.options.seriesOpt.marginTop, "L", 0, chart.height - chart.options.seriesOpt.marginBottom - 12],
        stroke            : '#7ac943',
        "stroke-width"    : 1,
        'stroke-dasharray': '-'
    }).hide(); //鼠标放上去的线

    var series = chart.drawSeries(chart.options.axis.tickPositions, color);

    chart.tooltip = chart.Tooltip().hide();

    chart.blanket.toFront();

    chart.resize = function () {
        opt.wrap.innerHTML = "";
        var containerSize = getSize(opt.wrap);
        var colorhue = .6 || Math.random(),
            color = opt.colors || "hsl(" + [colorhue, .5, .5] + ")",
            width = opt.chart.width && opt.chart.width || containerSize.width,
            height = opt.chart.height && opt.chart.height || containerSize.height,

            axisExtremes,//axis坐标的最大最小数值
            chart = Raphael(opt.wrap, width, height);
        chart.options = opt;
        chart.options.seriesOptions = {};
        chart.seriesItems = [];
        chart.shadowItems = [];
        chart.pointItems = [];
        chart.hiddenSeriesIndexArr = [];
        axisExtremes = calculateMaxAndMin(chart.options);
        chart.options.axis = {
            range            : axisExtremes.max - axisExtremes.min,
            dataMax          : axisExtremes.max,
            dataMin          : axisExtremes.min,
            subRange         : axisExtremes.subMax - axisExtremes.subMin,
            subDataMax       : axisExtremes.subMax,
            subDataMin       : axisExtremes.subMin,
            maxPadding       : 0,
            minPadding       : 0,
            tickPixelInterval: 100
        };
        chart.options.seriesOpt = {marginTop: chart.options.chart.marginTop};
        chart.options.seriesOpt.minMarginTop = 11 / 2;
        //图表标题
        chart.renderTitle(opt);
        //图例
        chart.drawLegend();
        //x轴label和tick、baseLine；
        chart.drawXAxis(opt);

        setTickPositions(chart);
        for (var i = 0; i < chart.options.series.length; i++) {
            if (chart.options.series[i].subAxis) {//temparory get subTickPostions;
                chart.options.subTickPositions = [];
                chart.options.subTickInterval = chart.options.axis.subRange / (chart.options.axis.tickPositions.length - 1);
                chart.options.subTickInterval = normalizeTickInterval(chart.options.subTickInterval, null, getMagnitude(chart.options.subTickInterval), chart);
                chart.options.subTickPositions = getLinearTickPositions(chart.options.subTickInterval, chart.options.axis.subDataMin, chart.options.axis.subDataMax);
                chart.options.chart.hasSubAxis = true;
                var tickLen = chart.options.axis.tickPositions.length;
                var subMaxTick = chart.options.subTickPositions[chart.options.subTickPositions.length-1];
                var tickIntervalBase = subMaxTick / (tickLen - 1);
                if(tickIntervalBase > 1){
                    chart.options.subTickInterval = Math.round(tickIntervalBase);
                }
                var subMinTick = chart.options.subTickPositions[0];
                chart.options.subTickPositions = [subMinTick];
                for (var sub = 1; sub < tickLen - 1; sub++){
                    chart.options.subTickPositions[sub] = subMinTick + chart.options.subTickInterval * sub;
                }
                chart.options.subTickPositions[sub] = subMaxTick;
            }
        }

        chart.grid = chart.drawGrid(chart.options.axis.tickInterval, chart.options.axis.tickPositions);

        chart.options.labelSet = chart.set();

        chart.verticalGrid = chart.path().attr({
            "path"            : ["M", 0, chart.options.seriesOpt.marginTop, "L", 0, chart.height - chart.options.seriesOpt.marginBottom - 12],
            stroke            : '#7ac943',
            "stroke-width"    : 1,
            'stroke-dasharray': '-'
        }).hide(); //鼠标放上去的线

        var series = chart.drawSeries(chart.options.axis.tickPositions, color);

        chart.tooltip = chart.Tooltip().hide();

        chart.blanket.toFront();
    }
}