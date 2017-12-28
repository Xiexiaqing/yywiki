import lineChart from './lineChart';

// 线性图标题设置
var CHART_TITLE = { label: "", fill: "#3E576F", fontFamily: "Tahoma, 'microsoft yahei', 微软雅黑, 宋体", fontSize: 14, align: "center", verticalAlign: "top", float: false };
// 线性图位置控制
var CHART_POS   = { marginLeft: 0, marginBottom: 0, marginRight: 10, marginTop: 0 };
// 线性图颜色
var CHART_COLOR = ["#FF9C68"];
// 图例开关
var CHART_LENGED = { enabled: false };
// TIPS设置
var CHART_TIPS = { width: 150, height: 'auto', margin: 10, hidden: true };

export function initLine(chartPars, chartDom, opts) {
    var el = chartDom;
    var data = chartPars;
    var labels = data.labels || [];
    var series = data.series;
    el.innerHTML = "";
    var labelStep = (labels.length === 7) && 1 || Math.floor(labels.length / 7) + 1;
    var duration = (labels.length > 80) && 2000 || 500;
    var lineOpts = {
        wrap   : el,
        title  : (opts && opts.chart_title) || CHART_TITLE,
        labels : labels,
        series : series,
        colors : (opts && opts.chart_color) || CHART_COLOR,
        chart  : (opts && opts.chart_pos) || CHART_POS,
        legend : (opts && opts.chart_legend) || CHART_LENGED,
        tooltip: CHART_TIPS,
        xAxis  : { labelStep: labelStep, xAxisHide: false },
        animate: { duration: duration },
        yAxis  : { minSize: true, yAxisHide: false, backgroundLineHide: false,
            labelFormatter: function() {
                // var labelValue = this;
                return farmatLabel(this);
            }
        },
        allowDecimals: true
    };

    lineChart(lineOpts);
}

export function initPie(chartPars, chartDom) {
}

function farmatLabel(labelValue) {
    var labelText = labelValue;
    if (labelValue >= 10000) {
        if ((labelValue % 10000) === 0) {
            labelText = (labelValue / 10000) + "万";
        } else {
            labelText = (labelValue / 10000).toFixed(1) + "万";
        }
    }
    if (labelValue >= 100000000) {
        if ((labelValue % 100000000) === 0) {
            labelText = (labelValue / 100000000) + "亿";
        } else {
            labelText = (labelValue / 100000000).toFixed(1) + "亿";
        }
    }
    return labelText;
}