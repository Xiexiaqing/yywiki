/* global module: false */

const TPL = [
    '<!DOCTYPE html>',
    '<html <% if (manifest) { %> manifest="<%= manifest %>"<% } %>>',
    '    <head>',
    '        <meta charset="utf-8">',
    '        <meta content="telephone=no" name="format-detection">',
    '        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">',
    '        <meta name="apple-mobile-web-app-capable" content="yes">',
    '        <meta name="apple-mobile-web-app-status-bar-style" content="#fff">',
    '        <link rel="manifest" href="/manifest.json">',
    '        <link rel="apple-touch-icon" href="/image/logo/logo072.png">',
    '        <link rel="apple-touch-startup-image" href="/image/logo/logo256.png">',
    '        <meta name="apple-mobile-web-app-title" content="YY-Wiki">',
    '        <link href="<%=css %>" rel="stylesheet">',
    '        <title><%=title %></title>',
    '        <script>',
    '            $GRA_CONFIG = {};',
    '            $GRA_CONFIG.uid = "{{ uid }}";',
    '            $GRA_CONFIG.name = "{{ name }}";',
    '        </script>',
    '        <script>',
    '           !function(e){var a,i=navigator.userAgent.toLowerCase(),n=document.documentElement,t=parseInt(n.clientWidth);if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)||i.indexOf("like mac os x")>0){var s=/os [\\d._]*/gi,o=i.match(s);a=(o+"").replace(/[^0-9|_.]/gi,"").replace(/_/gi,".")}var r=a+"";"undefined"!=r&&r.length>0&&(a=parseInt(r),a>=8&&(375==t||667==t||320==t||568==t||480==t)?n.className="iosx2":(a>=8&&414==t||736==t)&&(n.className="iosx3")),/(Android)/i.test(navigator.userAgent)&&(n.className="android")}(window);',
    '        </script>',
    '    </head>',
    '    <body>',
    '        <div id="default_loading">',
    '            <div class="E_loading" style="height:300px;">',
    '                <div class="loading_cont W_tc">',
    '                    <p class="E_MB10">',
    '                        <i class="W_loading_big"></i>',
    '                    </p>',
    '                </div>',
    '            </div>',
    '        </div>',
    '        <div id="app">',
    '            <%= html %>',
    '        </div>',
    '        <% if (js.inlineSource) {%><script><%=js.inlineSource %></script><%}%>',
    '        <% if (js.vendor) {%><script src="<%=js.vendor %>"></script><%}%>',
    '        <% if (js.bee) {%><script><%=js.bee %></script><%}%>',
    '        <script src="<%=js.app %>"></script>',
    '        <script>',
    '           if ("serviceWorker" in navigator) {navigator.serviceWorker.register("/sw.js");}',
    '        </script>',
    '    </body>',
    '</html>'
].join('\n');
 
module.exports = {
    prefix: '/',
    devPrefix: '//127.0.0.1',
    appName: '',
    title: '',
    platform: 'pc',
    tpl: TPL,
    devPort: 8081,
    proPort: 8088
};
