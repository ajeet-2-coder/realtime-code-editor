import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import socket from "../Socket";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";

import "codemirror/addon/edit/closebrackets";

const Editor = ({ roomId, onCodeChange, language }) => {
    const editorRef = useRef(null);
    const textareaRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
            mode: "text/x-c++src",
            theme: "dracula",
            lineNumbers: true,
            autoCloseBrackets: true,
        });

        editorRef.current.on("change", (instance, changes) => {
            const code = instance.getValue();

            onCodeChange(code);

            if (changes.origin !== "setValue") {
                socket.emit("code-change", {
                    roomId,
                    code,
                });
            }
        });

        const handleCodeChange = ({ code }) => {
            if (code !== null && editorRef.current) {
                editorRef.current.setValue(code);
            }
        };

        socket.on("code-change", handleCodeChange);

        return () => {
            socket.off("code-change", handleCodeChange);

            if (editorRef.current) {
                editorRef.current.toTextArea();
                editorRef.current = null;
            }

            initializedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!editorRef.current) return;

        let mode = "text/x-c++src";

        if (language === "javascript") mode = "javascript";
        else if (language === "python") mode = "python";

        editorRef.current.setOption("mode", mode);
    }, [language]);

    return <textarea ref={textareaRef}></textarea>;
};

export default Editor;