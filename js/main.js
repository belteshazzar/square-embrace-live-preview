
import sqrm from './sqrm-0.1.6.min.js'

$(function() {
    let isEdited = false;

    let adjustScreen = () => {
        let screenHeight = $(window).height();
        let headerHeight = $('#header').outerHeight();
        let footerHeight = $('#footer').outerHeight();
        let containerHeight = screenHeight - headerHeight - footerHeight;
        $('#container').css({ top: `${headerHeight}px` });
        $('.column').css({ height: `${containerHeight}px`});
    };

    $(window).resize(() => {
        adjustScreen();
    });

    // Setup editor
    let editor = ace.edit('editor');
    editor.getSession().setUseWrapMode(true);
    editor.renderer.setScrollMargin(10, 10, 10, 10);
    editor.setOptions({
        maxLines: Infinity,
        indentedSoftWrap: false,
        fontSize: 14,
        autoScrollEditorIntoView: true,
        theme: 'ace/theme/github',
        // TODO consider some options
    });
    editor.on('change', () => {
        isEdited = true;
        convert();
        adjustScreen();
    });

    let convert = () => {
        let result = sqrm(editor.getValue());
        let html,json;
        if (result.docs !== undefined && Array.isArray(result.docs)) {
            html = '';
            json = [];
            result.docs.forEach(r => {
                html += '\n' + r.html;
                json.push(r.json);
            });
        } else {
            html = result.html;
            json = result.json;
        }
        console.log(json);
        let sanitized = DOMPurify.sanitize(html);
        $('#output').html(sanitized);
    }
    
    //leave
    // $(window).bind('beforeunload', function() {
    //   if (isEdited) {
    //     return 'Are you sure you want to leave? Your changes will be lost.';
    //   }
    // });

    convert();
    adjustScreen();

    fetch('example.sqrm')
        .then(r => r.text())
        .then(t => {
            editor.setValue(t);
        })
});
