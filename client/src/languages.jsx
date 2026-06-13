import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";

export const LANGUAGE_OPTIONS = {
  cpp: {
    label: "C++",
    extension: cpp(),
  },
  javascript: {
    label: "JavaScript",
    extension: javascript(),
  },
  python: {
    label: "Python",
    extension: python(),
  },
  java: {
    label: "Java",
    extension: java(),
  },
};