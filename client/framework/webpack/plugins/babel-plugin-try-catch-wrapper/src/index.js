'use strict'

import wrap from './wrap.js'
import namedFunction from 'babel-helper-function-name'
import template from 'babel-template'
import * as t from 'babel-types'

/*
stack format:
${error.name}: ${error.message}
    at ${functionName} (${fileNameOrUrl}:line:column)
    at ${functionName} (${fileNameOrUrl}:line:column)
    .
    .
    .
*/

const wrapFunction = template(`{
    try {
        BODY
    } catch(ERROR_VARIABLE_NAME) {
        REPORT_ERROR(ERROR_VARIABLE_NAME, FILENAME, LINE_START, LINE_END)
        ERROR_VARIABLE_NAME._r = true;
        throw ERROR_VARIABLE_NAME
    }
}`)

const shouldSkip = (() => {
    const records = new Map

    return (path, state) => {
        let include = roots.every(rootPath => filename.indexOf(rootPath) < 0)
        if (include) {
            return true
        }

        if (state.end) {
            return true
        }

        // ignore generated code
        if (!path.node.loc) {
            return true
        }

        // ignore processed nodes
        const nodeType = path.node.type
        if (!records.has(nodeType)) {
            records.set(nodeType, new Set)
        }
        const recordsOfThisType = records.get(nodeType)
        const sourceLocation = `${filename}:${path.node.start}-${path.node.end}`
        const hasRecord = recordsOfThisType.has(sourceLocation)
        recordsOfThisType.add(sourceLocation)
        return hasRecord
    }
})()

const alreadyWrapped = (node) => {
    let body = node.body.body;
    return body && body.length === 1 && t.isTryStatement(body[0]);
}

// filename of which is being processed
let filename

// function name reporting error, default: 'reportError'
let reportError

// which folder need to add try catch
let roots


export default {
    pre(file) {
        reportError = this.opts.errorHandler || '__report__';
        roots = this.opts.root || [];

        filename = this.opts.filename || file.opts.filenameRelative
        if (!filename || filename.toLowerCase() === 'unknown') {
            throw new Error('babel-plugin-try-catch-wrapper: If babel cannot grab filename, you must pass it in')
        }
    },
    visitor: {
        Function: {
            exit(path, state) {
                if (shouldSkip(path, state)) {
                    return
                }

                // ignore empty function body
                const body = path.node.body.body
                if (body.length === 0) {
                    return
                }

                if (alreadyWrapped(path.node)) {
                    return
                }

                let functionName = 'anonymous function'
                if (path.node.type === 'FunctionDeclaration') {
                    functionName = path.node.id.name
                } else {
                    let newFunction = namedFunction(path)
                    if (newFunction && newFunction.id) {
                        functionName = newFunction.id.name
                    }
                }

                const loc = path.node.loc
                const errorVariableName = path.scope.generateUidIdentifier('e')
                let file
                roots.some(rootPath => {
                    if (filename.indexOf(rootPath) >= 0) {
                        file = filename.substr(rootPath.length)
                        return true
                    }
                    return false
                })

                path.node.body = wrap(
                        path.node.body, 
                        reportError, 
                        file, 
                        loc.start.line, 
                        loc.end.line
                    )
            }
        }
    }
}

