var mTextarea = $('#editor')[0]
var codemirrorEditor = CodeMirror.fromTextArea(mTextarea, {
    lineNumbers: true,
    indentUnit: 4
})
