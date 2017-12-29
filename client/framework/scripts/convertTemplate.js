var html2jade = require("html2jade");
var fs = require("fs");
var path = require("path");
var root = process.cwd();
var colors = require('colors');

try {
    var template_html = fs.readFileSync(path.join(root, "/dist/index.html"));
    template_html.toString().replace(/\\n/g, "");

    html2jade.convertHtml(template_html, {}, function(err, jade) {
        if (err) {
            throw err;
            return;
        }

        var res = [];
        var jade_lines = jade.split("\n");

        for (var i = 0; i < jade_lines.length; i++) {
            if (!jade_lines[i].match(/^\s+\|\s*$/)) {
                res.push(jade_lines[i]);
            }
        }

        fs.writeFileSync(path.join(root, '../../server/src/views/release.pug'), res.join("\n"), 'utf-8','w+');
        
        console.log('模板转换成功'.green);
    });
} catch(e) {
    throw e;
}
