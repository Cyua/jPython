const mTextarea = $('#editor')[0]
const codemirrorEditor = CodeMirror.fromTextArea(mTextarea, {
    lineNumbers: true,
    indentUnit: 4
})

function btnClick() {
    try {
        var lexResult = Lex()
    } catch(e) {
        resultTextarea.append(e)
        resultTextarea.append('\n\n')
        return
    }
    var root = null
    try{
        root = parseTree(lexResult)
    } catch(e) {
        resultTextarea.append(e)
        resultTextarea.append('\n\n')
        return
    }
    try {
        interpreter(root)
    } catch(e) {
        resultTextarea.append(e.value)
        resultTextarea.append('\n\n')
        return
    }
    resultTextarea.append('\n')
}
