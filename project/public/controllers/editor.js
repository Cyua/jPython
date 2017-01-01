const mTextarea = $('#editor')[0]
const codemirrorEditor = CodeMirror.fromTextArea(mTextarea, {
    lineNumbers: true,
    indentUnit: 4
})

function btnClick() {
    try {
        var lexResult = Lex();
    } catch(e) {
        console.log(e);
        return;
    }
    var root = null;
    try{
        root = parseTree(lexResult);
    } catch(e) {
        console.log(e);
        return;
    }
    try {
        interpreter(root);
    } catch(e) {
        console.log(e);
        return;
    }
    resultTextarea.append('\n')
}
