import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { createCodeEditorRenderer } from '@jbpark/workbench/code-editor';

// Created once: a new renderer builds new language extensions, which
// reconfigures the editor.
export const codeRenderer = createCodeEditorRenderer({
  languages: { css: css(), html: html(), json: json(), markdown: markdown() },
});
