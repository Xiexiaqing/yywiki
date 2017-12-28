export default function wrap (node, errorHander, filename, start, end) {
    console.log(errorHander)
    return {
        "body": [
            {
                "block": node,
                "finalizer": null,
                "handler": {
                    "body": {
                        "body": [
                            {
                                "expression": {
                                    "arguments": [
                                        {
                                            "name": "e",
                                            "type": "Identifier"
                                        },
                                        {
                                            "value": filename,
                                            "type": "StringLiteral"
                                        },
                                        {
                                            "value": start,
                                            "type": "NumericLiteral"
                                        },
                                        {
                                            "value": end,
                                            "type": "NumericLiteral"
                                        },
                                    ],
                                    "callee": {
                                        "computed": false,
                                        "object": {
                                            "name": 'window',
                                            "type": "Identifier"
                                        },
                                        "property": {
                                            "name": errorHander,
                                            "type": "Identifier"
                                        },
                                        "type": "MemberExpression"
                                    },
                                    "type": "CallExpression"
                                },
                                "type": "ExpressionStatement"
                            },
                            {
                                "argument": {
                                    "name": 'e',
                                    "type": "Identifier"
                                },
                                "type": "ThrowStatement"
                            }
                        ],
                        "type": "BlockStatement"
                    },
                    "param": {
                        "name": "e",
                        "type": "Identifier"
                    },
                    "type": "CatchClause"
                },
                "type": "TryStatement"
            }
        ],
        "type": "BlockStatement"
    }
}
