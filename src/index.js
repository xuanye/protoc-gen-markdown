#!/usr/bin/env node

const protocPlugin = require('./libs/proto-gen-plugin');
const findCommentByPath = protocPlugin.findCommentByPath;
//const CodeGeneratorResponse = protocPlugin.CodeGeneratorResponse;
const template = require('art-template');
//const fs = require('fs');
const path = require('path');

const { formatMessageType } = require('./libs/helper');

const markdownTemplate = path.resolve(__dirname, './templates/markdown.art');
const markdownIndexTemplate = path.resolve(
    __dirname,
    './templates/markdown-index.art'
);

String.prototype.firstUpperCase = function () {
    return this.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    });
};

template.defaults.imports.findCommentByPath = findCommentByPath;

template.defaults.excape = false;

generateBPE();

function generateBPE() {
    protocPlugin((protos) => {
        var genFiles = [];

        var markMeta = {
            enable: false,
            serviceList: [],
            messageList: {},
        };

        protos.forEach((proto) => {
            proto.serviceList.forEach((service, s) => {
                let comment = findCommentByPath(
                    [6, s],
                    proto.sourceCodeInfo.locationList
                );

                console.error('SERVICE|', service.name, comment);

                var serviceMeta = {
                    fileName: proto.name,
                    serviceName: service.name,
                    commentName: getFirstLineComment(comment),
                    serviceOptions: service.options,
                    description: comment,
                    nameSpace: proto.options.csharpNamespace,
                    methodList: [],
                };

                service.methodList.forEach((rpc, r) => {
                    let methodComment = findCommentByPath(
                        [6, s, 2, r],
                        proto.sourceCodeInfo.locationList
                    );
                    var methodMeta = {
                        methodName: rpc.name,
                        commentName: getFirstLineComment(methodComment),
                        description: methodComment,
                        inputType: formatMessageType(rpc.inputType),
                        outputType: formatMessageType(rpc.outputType),
                        methodOptions: rpc.options,
                    };
                    serviceMeta.methodList.push(methodMeta);
                });
                markMeta.serviceList.push(serviceMeta);
            });

            //循环遍历消息
            /**/
            let commonFields = {};
            if (proto.options.commonFields) {
                proto.options.commonFields.split(',').forEach((field) => {
                    let fV = field.split(':');
                    let fieldType = fV[1] ? parseInt(fV[1]) : 1;
                    commonFields[fV[0]] = fieldType;
                });
            }

            proto.messageTypeList.forEach((message, m) => {
                var msgMeta = {
                    name: message.name,
                    description: findCommentByPath(
                        [4, m],
                        proto.sourceCodeInfo.locationList
                    ),
                    fieldList: [],
                };

                // console.error('MESSAGE', message.name, findCommentByPath([4, m], proto.sourceCodeInfo.locationList))
                message.fieldList.forEach((field, f) => {
                    var fieldMeta = {
                        name: field.name,
                        jsonName: field.jsonName,
                        type: field.type,
                        fieldType: commonFields[field.name] || 0,
                        fullTypeName: field.typeName || '',
                        description: findCommentByPath(
                            [4, m, 2, f],
                            proto.sourceCodeInfo.locationList
                        ),
                    };
                    //console.error('FIELD', field.name, findCommentByPath([4, m, 2, f], proto.sourceCodeInfo.locationList))
                    msgMeta.fieldList.push(fieldMeta);
                });
                let name = formatMessageType(msgMeta.name);
                markMeta.messageList[name] = msgMeta;
            });
        });

        if (true) {
            genFiles.push({
                name: 'docs/index.md',
                content: template(markdownIndexTemplate, markMeta),
            });

            // 生成每个服务接口
            markMeta.serviceList.forEach((serviceMeta, i) => {
                let refMessageType = {};
                getServiceRefMessageType(
                    serviceMeta,
                    markMeta.messageList,
                    refMessageType
                );
                var tmp = {
                    service: serviceMeta,
                    refMessages: refMessageType,
                };

                genFiles.push({
                    name:
                        'docs/' + serviceMeta.serviceName.toLowerCase() + '.md',
                    content: template(markdownTemplate, tmp),
                });
            });
        }

        // no files written
        return genFiles;
    });
}

function getServiceRefMessageType(serviceMeta, msgHub, refMessageType) {
    refMessageType = refMessageType || {};
    serviceMeta.methodList.forEach((method) => {
        let inputShortType = formatMessageType(method.inputType);
        if (msgHub[inputShortType] && !refMessageType[inputShortType]) {
            refMessageType[inputShortType] = msgHub[inputShortType];

            msgHub[inputShortType].fieldList.forEach((field) => {
                if (field.fullTypeName) {
                    //自定义类型
                    let shortName = formatMessageType(field.fullTypeName);
                    if (refMessageType[shortName]) {
                        return;
                    }
                    if (!msgHub[shortName]) {
                        return;
                    }
                    refMessageType[refMessageType] = msgHub[shortName];
                    getMessageRefMessageType(
                        msgHub[shortName],
                        msgHub,
                        refMessageType
                    );
                }
            });
        }
        let outputShortType = formatMessageType(method.outputType);

        if (msgHub[outputShortType] && !refMessageType[outputShortType]) {
            refMessageType[outputShortType] = msgHub[outputShortType];

            msgHub[outputShortType].fieldList.forEach((field) => {
                if (field.fullTypeName) {
                    //自定义类型
                    let shortName = formatMessageType(field.fullTypeName);
                    if (refMessageType[shortName]) {
                        return;
                    }
                    if (!msgHub[shortName]) {
                        return;
                    }
                    refMessageType[shortName] = msgHub[shortName];

                    getMessageRefMessageType(
                        msgHub[shortName],
                        msgHub,
                        refMessageType
                    );
                }
            });
        }
    });
}

function getMessageRefMessageType(message, msgHub, refMessageType) {
    message.fieldList.forEach((field) => {
        if (field.fullTypeName) {
            //自定义类型
            let shortName = formatMessageType(field.fullTypeName);
            if (refMessageType[shortName]) {
                return;
            }
            if (!msgHub[shortName]) {
                return;
            }
            refMessageType[shortName] = msgHub[shortName];
            getMessageRefMessageType(msgHub[shortName], msgHub, refMessageType);
        }
    });
}
function getFirstLineComment(comment) {
    if (comment) {
        var lines = comment.split(/[\r\n]+/gi);
        return lines[0];
    }
    return '无说明';
}
