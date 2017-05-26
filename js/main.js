(function(){
    var messagePane = $('#message');
    console = {
        log: function(s){
            var html = '<h3>' + new Date().toLocaleTimeString() + '</h3>'
                + '<li>' + s + '</li>';
            messagePane.prepend(html);
        },

        error: function(s){
            this.log(s);
        }
    };
    var slice = Array.prototype.slice;
    var isBlank = function(s){
        return !s || s.trim().length === 0;
    };

    var fileUtil = {
        readFiles: function(files){
            slice.call(files, 0).forEach(function(f){
                var fr = new FileReader(f);
                fr.onload = function(e){
                    var data = e.currentTarget.result;
                };
            });
        }
    };

    var main = $('#main');
    main.find('.not-allow-blank').on('input', function(e){
        $(this).removeClass('not-allow-blank');
    });
    main.find('input').blur(function(){
        var input = $(this);
        if(isBlank(input.val()) && !input.parent('.field').hasClass('not-allow-blank')){
            input.parent('.field').addClass('not-allow-blank');
        }
    });
    main.find('input[name="translationType"]').change(function(event) {
        if($(this).val() === 'XmlToJs'){
            $('.jsToXml').hide();
            $('.xmlToJs').show();
        }else{
            $('.jsToXml').show();
            $('.xmlToJs').hide();
        }
    });

    // var srcFilesDrop = document.querySelector('#srcFiles');
    // srcFilesDrop.addEventListener('dragover', function(e){
    //     e.stopPropagation();
    //     e.preventDefault();
    //     e.dataTransfer.dropEffect = 'copy';
    // });
    // srcFilesDrop.addEventListener('drop', function(e){
    //     e.stopPropagation();
    //     e.preventDefault();
    //     fileUtil.readFiles(e.dataTransfer.files);
    // });

    $('#submit').click(function(event) {
        event.stopPropagation();
        event.preventDefault();
        var projectName = $('#projectName').val(),
            srcDir = $('#srcFolder').val(),
            destDir = $('#destFolder').val(),
            contentName = $('#contentName').val(),
            collectionName = $('#collectionName').val(),
            translatorType = $('input[name="translationType"]:checked').val(),
            translator = require('./js/i18nTranslator.js');

        switch(translatorType){
            case 'XmlToJs':
                return new translator.Xml2JsTranslator(srcDir, destDir, contentName, null, projectName).translate();
            case 'JsToXml':
                return new translator.Js2XmlTranslator(srcDir, destDir, contentName, collectionName, null).translate();
            default:
                return;
        }
    });

})();