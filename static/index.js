window.onload = function() {
    // Codemirror 초기화
    var editor = CodeMirror.fromTextArea(document.getElementById("python-code"), {
        mode: { name: "python", version: 3, singleLineStringErrors: false },
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        theme: "monokai"
    });
    editor.getWrapperElement().style.fontSize = "20px";

    function changeFontSize() {
        var fontSize = document.getElementById("font-size").value + "px";
        editor.getWrapperElement().style.fontSize = fontSize;
        editor.refresh();
    }

    document.getElementById("run").addEventListener("click", ()=> {
        Sk.execLimit = 60 * 1000;
        var code = editor.getValue();
        document.getElementById("output-content").innerText = new Date().toString() + '\n\n';
    
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
    
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'turtle';
    
        Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        }).then(function (mod) {
            document.getElementById("output-content").innerText += '\n\n종료';
        }).catch(function (err) {
            document.getElementById("output-content").innerText = err.toString();
        });
    });
    
    document.getElementById("stop").addEventListener("click", ()=> {
        Sk.execLimit = 0; // 코드 실행 중지
    });
};
