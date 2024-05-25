import { linter } from '@codemirror/lint';
import { JSHINT as jshint } from 'jshint';

/**
 * Sets up the javascript linter. Documentation: https://codemirror.net/examples/lint/
 */
const jsLinter = (lintOptions) => {
  return linter((view) => {
    const diagnostics = [];
    const codeText = view.state.doc.toJSON();
    jshint(codeText, lintOptions);
    const errors = jshint?.data().errors;

    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        const selectedLine = view.state.doc.line(error.line);

        const diagnostic = {
          from: selectedLine.from,
          to: selectedLine.to,
          severity: 'error',
          message: error.reason,
        };

        diagnostics.push(diagnostic);
      });
    }
    return diagnostics;
  });
};

export default jsLinter;
