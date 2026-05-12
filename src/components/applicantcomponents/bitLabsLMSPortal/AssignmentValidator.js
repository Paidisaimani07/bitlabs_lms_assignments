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
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    
    while ((match = tagRegex.exec(code)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();
      const line = this.getLineNumber(code, match.index);
      
      if (fullTag.includes('/>') || fullTag.includes('!--') || tagName === '!doctype') continue;
      
      if (fullTag.startsWith('</')) {
        if (tagStack.length === 0) {
          errors.push({ type: 'Syntax Error', message: `Unexpected closing tag </${tagName.toUpperCase()}>`, line });
        } else {
          const last = tagStack.pop();
          if (last.name !== tagName) {
            errors.push({ type: 'Mismatched Tag', message: `Mismatched closing tag </${tagName.toUpperCase()}>. Expected </${last.name.toUpperCase()}>`, line });
          }
        }
      } else {
        tagStack.push({ name: tagName, line });
      }
    }
    
    tagStack.forEach(t => {
      errors.push({ type: 'Unclosed Tag', message: `Unclosed <${t.name.toUpperCase()}> tag found`, line: t.line });
    });
    
    return { isValid: errors.length === 0, errors };
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
        const hasText = Array.from(elements).some(el => 
          el.textContent.trim().includes(text.trim())
        );
        
        if (!hasText) {
          return {
            testCase: selector,
            passed: false,
            message: `✗ ${selector} with text "${text}" not found`,
            marks: 0
          };
        }
      }

      if (attribute) {
        const hasAttribute = Array.from(elements).some(el => 
          el.hasAttribute(attribute.name) && 
          (!attribute.value || el.getAttribute(attribute.name) === attribute.value)
        );
        
        if (!hasAttribute) {
          const attrMsg = attribute.value 
            ? `${selector} with ${attribute.name}="${attribute.value}"`
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
}

export default AssignmentValidator;
