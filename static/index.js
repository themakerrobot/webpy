// Codemirror 초기화
var editor = CodeMirror.fromTextArea(document.getElementById("python-code"), {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    theme: "monokai"
});

function changeFontSize() {
    var fontSize = document.getElementById("font-size").value + "px";
    editor.getWrapperElement().style.fontSize = fontSize;
    editor.refresh();
}

function executePython() {
    Sk.execLimit = 60 * 1000;
    var code = editor.getValue();
    document.getElementById("output-content").innerText = "";  // 이전 출력 내용 초기화

    Sk.configure({
        output: function (text) {
            document.getElementById("output-content").innerText += text.replace(/^\n+/, ''); // 공백 제거
        },
        read: function (filename) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
                throw "File not found: '" + filename + "'";
            }
            return Sk.builtinFiles["files"][filename];
        }
    });

    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';

    Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    }).then(function (mod) {
        document.getElementById("output-content").innerText += '\n\nOk';
    }).catch(function (err) {
        document.getElementById("output-content").innerText = err.toString();
    });
}

function stopExecution() {
    Sk.execLimit = 0; // 코드 실행 중지
}
