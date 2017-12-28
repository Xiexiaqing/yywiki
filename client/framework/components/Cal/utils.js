import trim from 'lodash/trim';

module.exports = {
    solarMonth : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    format(d) {
        if(d && d.format){return d;}
        if(!d || !/\d+/.test(d)){d = new Date();}

        var ret = {};
        switch(typeof d){
            case 'string'://when d = '2011/12-12 14:23'
                d = trim(d);
                d = d.replace(/(\/|-|:| |&)/g,',');
                d = d.split(',');
                ret.d = new Date(d[0],(d[1]-1)<0?0:d[1]-1,d[2]||1,d[3]||0,d[4]||0,d[5]||0);
                break;
            case 'object'://when d = new Date()
                ret.d = d;
                break
            case 'number'://when d = 1352359118339
                ret.d = new Date(d);
                break;
        }

        isNaN(ret.d.getTime()) && (ret.d = new Date());
        ret.getTime = ret.d.getTime();
        ret.year = ret.d.getFullYear();
        ret.month = this.doubles(ret.d.getMonth()+1);
        ret.day = this.doubles(ret.d.getDate());
        ret.hour = this.doubles(ret.d.getHours());
        ret.min = this.doubles(ret.d.getMinutes());
        ret.sec = this.doubles(ret.d.getSeconds());
        ret.week = ret.d.getDay();
        ret.date = ret.year + '-' + ret.month + '-' + ret.day;
        ret.times = ret.hour + '-' + ret.min + '-' + ret.sec;
        ret.format = true;
        return ret;
    },
    doubles(numb) {
        numb = parseInt(numb,10);
        return (numb < 10)?('0'+numb):numb;
    },
    solarDays(y, m) {
        if(m == 2){
            return(((y%4 == 0) && (y%100 != 0) || (y%400 == 0))? 29: 28);
        } else {
            return (this.solarMonth[m-1]);
        } 
    },
    calcTimeline(sdate, edate, longs) {
        let _line = {};
        let _longs = parseInt(longs) * 86400000;

        if(_longs && !isNaN(_longs)){
            sdate = this.format(this.format().date);
            edate = this.format(new Date().getTime() + _longs);
        }

        _line.s = this.format(sdate || "1900-01-01");
        _line.e = this.format(edate || "2100-12-31");

        if(_line.s.getTime > _line.e.getTime){
            let _start = _line.e;
            _line.e = _line.s;
            _line.s = _start;
        }

        //时间段从00：00 - 23:59:59
        _line.s = this.format(_line.s.date);
        _line.e = this.format(_line.e.date + ' 23:59:59');
        return _line;
    },
    belong(y, m, d, lines) {
        if(!y){return 1;}

        let ret;

        if(!m){
            if(y <= lines.e.year && y >= lines.s.year){ret = 1;}
            return ret;
        }
        if(!d){
            if(y <= lines.e.year && y >= lines.s.year){
                ret = this.compare(y, m, null, lines);
            }
            return ret;
        }
        ret = this.compare(y, m, d, lines);
        return ret;
    },
    compare(y, m, d, lines) {
        let ret;
        let _s = this.getLine(y, m, d);
        let _e = this.getLine(y, m, d, 1);
        let _lineS = this.getLine(lines.s.year, lines.s.month, d && lines.s.day);
        let _lineE = this.getLine(lines.e.year, lines.e.month, d && lines.e.day, 1);

        if(_s >= _lineS && _e <= _lineE){
            ret = 1;
        }
        return ret;
    },
    getLine(y, m, d, type) {
        if(!type){
            return this.format(y + '-' + m + '-' + (d || 1) + ' 00:00:00').getTime;
        }
        return this.format(y + '-' + m + '-' + (d || this.solarDays(y,m)) + ' 23:59:59').getTime;
    },
    resetDayList(year, month, timeline) {
        let _d = this.format(year + '-' + month + '-1');
        let _lens = this.solarDays(year, month);
        let _weekly = (_d.week === 0) ? 7 : _d.week;
        let empty = _weekly - parseInt(_d.day, 10) % 7;
        let days = [];

        for(let i = 1; i <= empty; ++i){
            days.push({day: ''});
        }

        let _line = timeline;
        let _lock = this.belong(_d.year, _d.month, null, timeline);

        for(let i = 1; i <= _lens; ++i){
            let _active = null;

            if(_lock){
                _active = this.belong(_d.year, _d.month, i, timeline);
            }

            days.push({ day: (i < 10 ? '0' : '') + i, click: _active } );
        }

        return days;
    },
    resetMonthList(year, timeline) {
        let ret = [];
        let _lock = this.belong(year, null, null, timeline);

        for(let i = 1; i < 13; ++i){
            let _active = null;

            if(_lock){
                _active = this.belong(year, i, null, timeline);
            }

            ret.push({month: i, click: _active});
        }
        return ret;
    },
    resetYearList(year, timeline) {
        year = parseInt(year, 10);
        isNaN(year) && (year = new Date().getFullYear());
        let ret = [];

        for(let i = (year - 6), len = year + 6; i < len; ++i){
            let _active = this.belong(i, null, null, timeline);
            ret.push({ year: i, click: _active });
        }
        return ret;
    }
};