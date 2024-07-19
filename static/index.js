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

    // Pyodide 로드
    loadPyodide({ indexURL : "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/" }).then(async (pyodide) => {
        // turtle.py 로드 및 설정
        await pyodide.loadPackage("micropip");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install('https://raw.githubusercontent.com/trinket-io/turtle.py/master/turtle.py')
            import turtle
            turtle.restart()
        `);

        document.getElementById("run").addEventListener("click", async () => {
            var code = editor.getValue();
            document.getElementById("output-content").innerText = "";  // 이전 출력 내용 초기화
            document.getElementById("turtle").innerHTML = "";  // turtle 그래픽 초기화

            // 출력 리다이렉션을 위한 Python 코드
            await pyodide.runPythonAsync(`
                import sys
                from io import StringIO
                sys.stdout = StringIO()
                import turtle
                turtle.restart()
            `);

            try {
                await pyodide.runPythonAsync(code);
                
                // 출력 내용 가져오기
                const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
                document.getElementById("output-content").innerText = output;

                // turtle 그래픽 가져오기
                const turtleGraphics = await pyodide.runPythonAsync("turtle.get_svg()");
                document.getElementById("turtle").innerHTML = turtleGraphics;
            } catch (err) {
                document.getElementById("output-content").innerText = err.toString();
            } finally {
                document.getElementById("output-content").innerText += '\n\nEnd.';
            }
        });
    });

    document.getElementById("stop").addEventListener("click", () => {
        // Pyodide는 현재 실행 중인 코드를 중지하는 직접적인 방법을 제공하지 않습니다.
        // 대신 경고 메시지를 표시합니다.
        alert("Pyodide does not support stopping execution. Please refresh the page to stop the current execution.");
    });
};
