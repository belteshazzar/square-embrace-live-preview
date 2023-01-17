
import sqrm from './sqrm-0.1.8.js'

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

    window.sqrmCB = function() {
        switch (arguments[0]) {
            case 'href' : 
                window.open(arguments[1],'_blank');
                break
            case 'task':
                const lineNum = arguments[1]
                const newState = arguments[2]
                const txt = editor.getValue()
                const lines = txt.split('\n')
                const line = lines[lineNum - 1]
                const m = line.match(/^(.*?\[)( *[xX]? *)(\].*)$/)
                const newLine = m[1]+(newState ? 'X'+m[2].substring(1) : m[2].replace(/[xX]/,' ')) +m[3]
                let newTxt = ''
                for (let i=0 ; i<lines.length ; i++) {
                    if (i>0) newTxt += '\n'
                    if (i == lineNum - 1) newTxt += newLine
                    else newTxt += lines[i]
                }
                editor.setValue(newTxt)
                break
            default:
                console.log('sqrmCB',arguments)
            }

        return false
    }

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

        console.log(result)
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
//        let sanitized = DOMPurify.sanitize(html);
        $('#output').html(html);
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
    // fetch('callback_test.sqrm')
        .then(r => r.text())
        .then(t => {
            editor.setValue(t);
        })
});
