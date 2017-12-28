/* eslint-env commonjs */
/* global process */
import { repochReducer } from './createReduxStore';
import * as repoch  from './coreRepochStore';

const modulesRequired = { repoch };

function checkModuleNotExist(store, storeShapes) {
    let processedList = {};
    let moduleNotExist = []; 

    storeShapes.map(function (shapeRegular) {
        let methodPos = shapeRegular.lastIndexOf('.');
        let cacheKey = shapeRegular.substring(0, methodPos);

        if (processedList[cacheKey]) {
            return;
        }

        processedList[cacheKey] = true;
        if (!store.cacheKey) {
            moduleNotExist.push(cacheKey);
        }
    });

    return moduleNotExist.length > 0 ? moduleNotExist : false;
}

function requireAsyncModules(mods, callback) {
    let promises = mods.map(function(mod) {
        if (modulesRequired[mod]) {
            return Promise.resolve();
        }

        return new Promise(function(resolve) {
            let path = mod.replace(/\./g, '/');
            require("repoch!states/" + path)(function(module) {
                if (process.env.NODE_ENV !== 'production') {
                    if (!module.reducer || !module.initialState) {
                        console.error('Must export "reducer" and "initialState" from ' + path);
                    }
                }

                repochReducer.register({ [mod]: module.reducer });
                modulesRequired[mod] = module;

                resolve();
            });
        }); 
    });

    Promise.all(promises).then(function() {
        callback(modulesRequired);
    });
}

export default function requireModules(store, mods, callback) {
    let notExistModules = checkModuleNotExist(store, mods);
    if (notExistModules) {
        requireAsyncModules(notExistModules, callback);
    } else {
        callback(modulesRequired)
    }
}


