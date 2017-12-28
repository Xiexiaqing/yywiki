import temp from './raphael';
let Raphael = temp();

Raphael.fn.pieChart = function(options) {
    var paper = this,
        rad = Math.PI / 180,
        chart = this.set(),
        cx = paper.width / 2,
        cy = paper.height / 2,
        values = options.datas,
        percents = [],
        r = options.chart.redius,
        innerR_a = options.chart.innerRedius,
        angle = 180,
        total = 0,
        start = 0,
        prevPopAngle;

    var sector = function(cx, cy, r, startAngle, endAngle, params, innerR) {
        var innerR = innerR || 150;
        if (innerR > r * .7) innerR = r * .7;
        var cosStart = Math.cos(-startAngle * rad),
            sinStart = Math.sin(-startAngle * rad),
            cosEnd = Math.cos(-endAngle * rad),
            sinEnd = Math.sin(-endAngle * rad);
        var x1 = cx + innerR * cosStart,
            x2 = cx + innerR * cosEnd,
            y1 = cy + innerR * sinStart,
            y2 = cy + innerR * sinEnd,
            x3 = cx + r * cosEnd,
            x4 = cx + r * cosStart,
            y3 = cy + r * sinEnd,
            y4 = cy + r * sinStart;
        if ((endAngle - startAngle) % 360 === 0){
            return paper.path(["M", cx - innerR, cy,
                "A", innerR, innerR, 0, +(endAngle - startAngle > 180), 0, cx + innerR, cy,
                "A", innerR, innerR, 0, +(endAngle - startAngle > 180), 0, cx - innerR, cy,
                "M", cx - r, cy,
                "A", r, r, 0, +(endAngle - startAngle > 180), 1, cx + r, cy,
                "A", r, r, 0, +(endAngle - startAngle > 180), 1, cx - r, cy,
                "z"]).attr(params);
        }
        return paper.path(["M", x1, y1, "A", innerR, innerR, 0, +(endAngle - startAngle > 180), 0, x2, y2, "L", x3, y3, "A", r, r, 0, +(endAngle - startAngle > 180), 1, x4, y4, "z"]).attr(params);
    };

    var	process = function(j) {
        var value = values[j],
            angleplus = 360 * value / total ,
            popangle = angle + (angleplus / 2),
            bcolor = options.colors[j] || Raphael.hsb(start, 1, 1),
            p = sector(cx, cy, r, angle, angle + angleplus, {fill: bcolor, stroke: 'white', "stroke-width": 2}, innerR_a),
            txt,
            guideline;
        var xOffset = (Math.cos(-popangle * rad) > 0)?-1:1;
        var xSet = (Math.cos(-popangle * rad) > 0)?-1:0;
        txt = paper.text(cx+r * Math.cos(popangle * rad)-10*xSet,cy-10 ,percents[j] + "%")
            .attr({"text-anchor":(xOffset>0)?"end":"start", fill: "#393939", stroke: "none", opacity: 1, "font-size": 24});
        var stPos = cx + r * Math.cos(popangle * rad);
        guideline = paper.path(["M", stPos, cy*1.2,'L', stPos - xOffset*70, cy*1.2])//txt.attrs.y
            .attr({opacity:1, fill: bcolor, stroke: bcolor,"stroke-width": 2}).toBack();
        prevPopAngle = popangle;
        angle += angleplus;
        chart.push(p);
        chart.push(txt);
        chart.push(guideline);
        start += .1;
    };

    for (var i = 0, ii = values.length; i < ii; i++) {
        total += values[i];
    }
    var anPos = 10;
    (values[1] < values[0]) && (anPos = -10);
    angle = (360 * values[1]/ (total*2))+anPos;
    var totalPercent = 0;
    for (i = 0; i < ii; i++) {
        if (i == ii - 1){
            percents.push((100 - totalPercent).toFixed(options.chart.decimalNum));
        } else {
            percents.push((values[i] / total * 100).toFixed(options.chart.decimalNum));
        }
        totalPercent += parseFloat(percents[i]);
        process(i);
    }
//    drawLegend();

    return chart;
};
