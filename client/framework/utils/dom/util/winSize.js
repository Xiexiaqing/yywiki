/**
 * Get window's size
 * @example
 * winSize(t) === {'width':100,'height':100};
 */
export default function winSize(_target) {
    var w, h;
    var target;
    if (_target) {
        target = _target.document;
    }
    else {
        target = document;
    }
    
    if(target.compatMode === "CSS1Compat") {
        w = target.documentElement[ "clientWidth" ];
        h = target.documentElement[ "clientHeight" ];
    }else if (self.innerHeight) { // all except Explorer
        if (_target) {
            target = _target.self;
        }
        else {
            target = self;
        }
        w = target.innerWidth;
        h = target.innerHeight;
        
    }else if (target.documentElement && target.documentElement.clientHeight) { // Explorer 6 Strict Mode
        w = target.documentElement.clientWidth;
        h = target.documentElement.clientHeight;
            
    }else if (target.body) { // other Explorers
        w = target.body.clientWidth;
        h = target.body.clientHeight;
    }
    return {
        width: w,
        height: h
    };
};
