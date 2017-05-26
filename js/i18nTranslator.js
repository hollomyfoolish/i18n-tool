/**
 * New node file
 */

var DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer,
    fs = require('fs'),
    slice = Array.prototype.slice,
    XML_PATTERN = /\.xml$/i,
    JS_PATTERN = /\.js$/i,
    CONTENT_NAME = 'BUSMB_SBO_B1A_DemandPlanning_UI_1_1_92DEV',
    jade = require('jade'),
    path = require('path'),
    console = window?window.console:global.console;

var I18N_MAPPER = {
    "6N.js": "enGB.js",
    "0S.js": "esCO.js",
    "1P.js": "ptPT.js",
    "HE.js": "IW.js",
    "ZF.js": "zhTW.js"
};

function Translator(srcDir, destDir, contentName, collectionName, projectName){
    this.srcDir = srcDir;
    this.destDir = destDir;
    this.contentName = contentName;
    this.collectionName = collectionName;
    this.projectName = projectName;
}

Translator.prototype = {
    translate: function(){
        this.processDir();
    },

    processDir: function(){
        var srcDir = this.srcDir,
            destDir = this.destDir,
            translateFile = this.translateFile.bind(this),
            writeDestFile = this.writeDestFile.bind(this),
            needProcess = this.needProcess.bind(this);
        fs.readdir(srcDir, function(err, files){
            if(err){
                console.log(err);
                return;
            }
            files.forEach(function(fName, idx){
                var filePath = srcDir + '/' + fName;
                fs.stat(filePath, function(err, fileStat){
                    if(err){
                        console.log(err);
                        return;
                    }
                    if(fileStat.isFile() && needProcess(fName)){
                        translateFile(filePath, fName, destDir);
                    }
                });
            });
        });
    },

    translateFile: function(filePath, srcFileName, destDir){
        throw 'sub-class should inplement this method';
    },

    writeDestFile: function(fileName, content){
        fs.writeFile(this.destDir + '/' + fileName, content, {encoding: 'utf8'}, function (err) {
            if (err) {
                console.log(fileName + ' error: ' + err);
            } else {
                console.log(fileName +': done');
            }
        });
    },

    needProcess: function(fileName){
        return true;
    }
};

function Xml2JsTranslator(srcDir, destDir){
    Translator.apply(this, arguments);
}

Xml2JsTranslator.prototype = Object.create(Translator.prototype, {
    translateFile: {
        value: function(filePath, srcFileName, destDir){
            var me = this;
            fs.readFile(filePath, {encoding: 'utf8'}, function (err, data) {
                var nameParts = srcFileName.split('_'),
                    jsFileName = nameParts[nameParts.length - 1].replace(XML_PATTERN, '.js');
                    i18nStr = ['/*\r\n',
                               ' * SAP Business One '+ me.projectName +' UI Localized Resources for ' + jsFileName.substring(0, jsFileName.length-3) + '\r\n',
                               ' */\r\n',
                               'var i18n = {\r\n'],
                    indent = '    ';
                var dom = new DOMParser().parseFromString(data);
                var loEls = dom.getElementsByTagName('lo');
                slice.call(loEls, 0).forEach(function(loEl, idx){
                    var key = loEl.getAttribute('tK'),
                        value = loEl.getElementsByTagName('loC')[0].firstChild.data.trim();
                    i18nStr.push(indent);
                    i18nStr.push('"' + key + '": "' + value + '"');
                    i18nStr.push(',\r\n');
                });
                i18nStr[i18nStr.length - 1] = '\r\n};';
                me.writeDestFile(jsFileName, i18nStr.join(''));
                if(I18N_MAPPER[jsFileName]){
                    me.writeDestFile(I18N_MAPPER[jsFileName], i18nStr.join(''));
                }
            });
        }
    },

    needProcess: {
        value: function(fileName){
            return XML_PATTERN.test(fileName);
        }
    }
});

function Js2XmlTranslator(srcDir, destDir, contentName, collectionName){
    Translator.apply(this, arguments);
    this.generator = jade.compile(fs.readFileSync(path.join(__dirname, '../resource/xml-template.xml')),
     {
        doctype: 'xml',
        pretty: true
    });
}

Js2XmlTranslator.prototype = Object.create(Translator.prototype, {
    translateFile: {
        value: function(filePath, srcFileName, destDir){
            var me = this,
                language = srcFileName.replace(/\.js$/i, '');
            fs.readFile(filePath, {encoding: 'utf8'}, function (err, data) {
                eval(data);
                var xml = me.generator({
                    language: language,
                    collectionName: me.collectionName,
                    domain: 'FI',
                    contentName: me.contentName,
                    i18n: i18n
                });
                me.writeDestFile(me.contentName + '_' + language + '.xml', xml);
            });
        }
    },

    needProcess: {
        value: function(fileName){
            return JS_PATTERN.test(fileName);
        }
    }   
});

module.exports = {
    Xml2JsTranslator: Xml2JsTranslator,
    Js2XmlTranslator: Js2XmlTranslator
};