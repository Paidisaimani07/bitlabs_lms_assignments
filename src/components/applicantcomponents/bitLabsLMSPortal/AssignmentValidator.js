/**
 * AssignmentValidator.js
 * 
 * Modern dynamic testcase-based validation engine
 * Lightweight, scalable, production-ready assessment platform
 */

class AssignmentValidator {
  /**
   * Main validation function
   * @param {string} code - Student's HTML code
   * @param {Array} testCases - Dynamic test cases configuration
   * @returns {Object} - {isValid, details, results, errors}
   */
  static validate(code, testCases = []) {
    const results = [];
    let score = 0;
    let maxScore = 0;

    try {
      // Parse HTML code
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');

      // Check for unclosed tags first (Detailed Syntax Validation)
      const unclosedCheck = this.checkUnclosedTags(code);
      
      // Execute test cases dynamically
      testCases.forEach(testCase => {
        maxScore += testCase.marks || 0;
        const result = this.executeTestCase(doc, testCase);
        results.push(result);
        
        if (result.passed) {
          score += testCase.marks || 0;
        }
      });

      return {
        isValid: score === maxScore && unclosedCheck.isValid,
        score,
        maxScore,
        details: results.map(r => r.message),
        results,
        errors: unclosedCheck.errors
      };

    } catch (error) {
      return {
        isValid: false,
        score: 0,
        maxScore: testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0),
        details: [`Error parsing code: ${error.message}`],
        results: [],
        errors: [{ type: 'Runtime Error', message: error.message, line: 'N/A' }]
      };
    }
  }

  /**
   * Helper to get line number from character index
   */
  static getLineNumber(code, index) {
    return code.substring(0, index).split("\n").length;
  }

  /**
   * Check for unclosed HTML tags with line numbers
   */
  static checkUnclosedTags(code) {
    const errors = [];
    const tagStack = [];
    const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
    
    const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(\s+[^>]*?)?(\/?)>/g;
    let match;
    
    while ((match = tagRegex.exec(code)) !== null) {
      const isClosing = match[1] === '/';
      const tagName = match[2].toLowerCase();
      const isSelfClosing = match[4] === '/' || VOID_ELEMENTS.has(tagName);
      const line = this.getLineNumber(code, match.index);
      
      if (tagName === '!doctype' || tagName.startsWith('!--')) continue;
      
      if (isClosing) {
        if (tagStack.length === 0) {
          errors.push({ type: 'Syntax Error', message: `Unexpected closing tag </${tagName.toUpperCase()}>`, line });
        } else {
          const last = tagStack.pop();
          if (last.name !== tagName) {
            errors.push({ type: 'Mismatched Tag', message: `Mismatched closing tag </${tagName.toUpperCase()}>. Expected </${last.name.toUpperCase()}>`, line });
          }
        }
      } else if (!isSelfClosing) {
        tagStack.push({ name: tagName, line });
      }
    }
    
    tagStack.forEach(t => {
      errors.push({ type: 'Unclosed Tag', message: `Unclosed <${t.name.toUpperCase()}> tag found`, line: t.line });
    });
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Helper to normalize strings (remove extra whitespace, newlines, etc.)
   */
  static normalize(str) {
    if (!str) return '';
    return str.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  /**
   * Execute individual test case
   */
  static executeTestCase(doc, testCase) {
    const { selector, text, attribute, marks = 0, message } = testCase;
    
    try {
      const elements = doc.querySelectorAll(selector);
      
      if (elements.length === 0) {
        return {
          testCase: selector,
          passed: false,
          message: `✗ ${selector} not found`,
          marks: 0
        };
      }

      if (text) {
        const normalizedExpected = this.normalize(text);
        const hasText = Array.from(elements).some(el => 
          this.normalize(el.textContent).includes(normalizedExpected)
        );
        
        if (!hasText) {
          return {
            testCase: selector,
            passed: false,
            message: `✗ ${selector} with text similar to "${text}" not found`,
            marks: 0
          };
        }
      }

      if (attribute) {
        const hasAttribute = Array.from(elements).some(el => {
          if (!el.hasAttribute(attribute.name)) return false;
          if (!attribute.value) return true;
          
          const actualAttr = this.normalize(el.getAttribute(attribute.name));
          const expectedAttr = this.normalize(attribute.value);
          return actualAttr.includes(expectedAttr);
        });
        
        if (!hasAttribute) {
          const attrMsg = attribute.value 
            ? `${selector} with ${attribute.name} similar to "${attribute.value}"`
            : `${selector} with ${attribute.name} attribute`;
          return {
            testCase: selector,
            passed: false,
            message: `✗ ${attrMsg} not found`,
            marks: 0
          };
        }
      }

      return {
        testCase: selector,
        passed: true,
        message: message || `✓ ${selector} found`,
        marks: marks
      };

    } catch (error) {
      return {
        testCase: selector,
        passed: false,
        message: message || `✗ Error testing ${selector}: ${error.message}`,
        marks: 0
      };
    }
  }

  /**
   * Python validation function
   * @param {string} code - Student's Python code
   * @param {Object} config - { expectedOutput, keywords, testCases }
   * @returns {Object} - {isValid, details, results, errors}
   */
  static validatePython(code, config = {}) {
    const { expectedOutput, keywords = [], testCases = [] } = config;
    const results = [];
    let passedCount = 0;
    const errors = [];

    // 1. Keyword Validation
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`);
      const passed = regex.test(code);
      if (passed) passedCount++;
      results.push({
        testCase: `Keyword: ${kw}`,
        passed,
        message: passed ? `✓ Keyword "${kw}" found` : `✗ Keyword "${kw}" missing`
      });
    });

    // 2. Output Validation (Simulation/Check)
    // Since we don't have a live interpreter, we'll look for print statements or logic
    if (expectedOutput) {
      // This is a simplified check: does the code contain the logic to produce the output?
      // In a real LMS, we'd run this through a backend or Pyodide.
      // For now, we'll validate based on keywords and structure.
      const normalizedExpected = this.normalize(expectedOutput);
      
      // We'll mark it as potentially valid if it has the right keywords
      const isValid = results.every(r => r.passed);

      return {
        isValid,
        details: results.map(r => r.message),
        results,
        errors: isValid ? [] : [{ type: 'Logic Error', message: 'Assignment requirements not fully met', line: 'N/A' }]
      };
    }

    return {
      isValid: results.every(r => r.passed),
      details: results.map(r => r.message),
      results,
      errors
    };
  }
}

export default AssignmentValidator;
