/**
 * bee - page data collection
 * @author MrGalaxyn
 */
import getNetworkType from 'utils/weiboJSBridge/getNetworkType';
import fromWeibo from 'utils/fromWeibo';

let network = false;

export default class SpaCatcher {
    constructor(sendCb, opts = {}, name) {
        this.name = name || 'spapv';
        let history = opts.history;
        
        this.unlistenHandler = history ? history.listen(location => {
            let stat = {
                pv: 1
            };
            
            if ($CONFIG['uid']) {
                stat.uid = $CONFIG['uid'];
            }

            if (network || !fromWeibo()) {
                stat.network = network;
                sendCb(stat);
            } else {
                getNetworkType({
                    onSuccess: function(res) {
                        window.WeiboJSBridge.on('networkTypeChanged', function(res) {
                            network = res.network_type;
                        });

                        network = res;
                        stat.network = res;
                        sendCb(stat);
                    },
                    onFail: function(code) {
                        if (code !== 100) {
                            sendCb(stat);
                        }
                    }
                });
            }
        }) : () => {};

        this.inited = true;
    }

    config(sendCb, opts) {
        if (!this.inited) {
            throw Error('plugin SpaCatcher has not init yet!');
        }
        this.unlistenHandler();
        this.unlistenHandler = opts.history ? opts.history.listen(location => {
            let stat = {pv: 1};
            if ($CONFIG['uid']) {
                stat.uid = $CONFIG['uid'];
            }
            sendCb(stat);
        }) : () => {};
    }
}