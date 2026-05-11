/**
 * AssignmentValidator.js
 * 
 * Modern dynamic testcase-based validation engine
 * Lightweight, scalable, production-ready assessment platform
 * 
 * Features:
 * - Dynamic testcase execution
 * - Selector, text, and attribute validation
 * - Partial scoring support
 * - Reusable architecture
 */

class AssignmentValidator {
  /**
   * Main validation function
   * @param {string} code - Student's HTML code
   * @param {Array} testCases - Dynamic test cases configuration
   * @returns {Object} - {score, maxScore, passed, results}
   */
  static validate(code, testCases = []) {
    const results = [];
    let score = 0;
    let maxScore = 0;

    try {
      // Parse HTML code
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');

      // Check for unclosed tags first
      const unclosedCheck = this.checkUnclosedTags(code);
      if (!unclosedCheck.isValid) {
        return {
          score: 0,
          maxScore: testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0),
          passed: false,
          results: unclosedCheck.errors
        };
      }

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
        score,
        maxScore,
        passed: score === maxScore,
        results
      };

    } catch (error) {
      return {
        score: 0,
        maxScore: testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0),
        passed: false,
        results: [{
          testCase: 'error',
          passed: false,
          message: `Error parsing code: ${error.message}`,
          marks: 0
        }]
      };
    }
  }

  /**
   * Check for unclosed HTML tags
   * @param {string} code - HTML code to check
   * @returns {Object} - {isValid, errors}
   */
  static checkUnclosedTags(code) {
    const errors = [];
    const tagStack = [];
    
    // Simple regex to find opening and closing tags
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    
    while ((match = tagRegex.exec(code)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();
      
      // Skip self-closing tags and comments
      if (fullTag.includes('/>') || fullTag.includes('!--') || tagName === '!doctype') {
        continue;
      }
      
      if (fullTag.startsWith('</')) {
        // Closing tag
        if (tagStack.length === 0) {
          errors.push({
            testCase: 'unclosed',
            passed: false,
            message: `✗ Unexpected closing tag </${tagName.toUpperCase()}>`,
            marks: 0
          });
        } else {
          const lastOpenTag = tagStack.pop();
          if (lastOpenTag !== tagName) {
            errors.push({
              testCase: 'unclosed',
              passed: false,
              message: `✗ Mismatched closing tag </${tagName.toUpperCase()}>. Expected </${lastOpenTag.toUpperCase()}>`,
              marks: 0
            });
          }
        }
      } else {
        // Opening tag
        tagStack.push(tagName);
      }
    }
    
    // Report unclosed tags
    tagStack.forEach(unclosedTag => {
      errors.push({
        testCase: 'unclosed',
        passed: false,
        message: `✗ Unclosed <${unclosedTag.toUpperCase()}> tag found`,
        marks: 0
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Execute individual test case
   * @param {Document} doc - Parsed HTML document
   * @param {Object} testCase - Test case configuration
   * @returns {Object} - Test result
   */
  static executeTestCase(doc, testCase) {
    const { selector, text, attribute, marks = 0, message } = testCase;
    
    try {
      // Find element(s) by selector
      const elements = doc.querySelectorAll(selector);
      
      if (elements.length === 0) {
        return {
          testCase: selector,
          passed: false,
          message: message || `✗ ${selector} not found`,
          marks: 0
        };
      }

      // Check text content if specified
      if (text) {
        const hasText = Array.from(elements).some(el => 
          el.textContent.trim().includes(text.trim())
        );
        
        if (!hasText) {
          return {
            testCase: selector,
            passed: false,
            message: message || `✗ ${selector} with text "${text}" not found`,
            marks: 0
          };
        }
      }

      // Check attribute if specified
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
            message: message || `✗ ${attrMsg} not found`,
            marks: 0
          };
        }
      }

      // Test passed
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
   * Legacy compatibility method
   * @param {string} code - Student's HTML code
   * @param {string} validationType - Type of validation (for backward compatibility)
   * @returns {Object} - Validation result in old format
   */
  static validateLegacy(code, validationType) {
    // Map old validation types to new test cases
    const testCaseMap = {
      headings: [
        { selector: 'h1', marks: 2, message: '✓ H1 tag found' },
        { selector: 'h2', marks: 2, message: '✓ H2 tag found' },
        { selector: 'h3', marks: 2, message: '✓ H3 tag found' },
        { selector: 'h4', marks: 2, message: '✓ H4 tag found' },
        { selector: 'h5', marks: 2, message: '✓ H5 tag found' },
        { selector: 'h6', marks: 2, message: '✓ H6 tag found' }
      ],
      table: [
        { selector: 'table', marks: 2, message: '✓ Table found' },
        { selector: 'tr', marks: 4, message: '✓ Table rows found' },
        { selector: 'td, th', marks: 4, message: '✓ Table cells found' }
      ],
      image: [
        { selector: 'img', marks: 3, message: '✓ Image found' },
        { selector: 'img', attribute: { name: 'alt' }, marks: 7, message: '✓ Image with alt text found' }
      ],
      form: [
        { selector: 'form', marks: 2, message: '✓ Form found' },
        { selector: 'input', marks: 4, message: '✓ Input fields found' },
        { selector: 'label', marks: 4, message: '✓ Labels found' }
      ],
      links: [
        { selector: 'a', marks: 5, message: '✓ Links found' },
        { selector: 'a', attribute: { name: 'href' }, marks: 5, message: '✓ Links with href found' }
      ]
    };

    const testCases = testCaseMap[validationType] || [];
    const result = this.validate(code, testCases);

    // Convert to old format for compatibility
    return {
      isValid: result.passed,
      score: result.score,
      maxScore: result.maxScore,
      details: result.results.map(r => r.message),
      message: result.passed ? 'All tests passed!' : 'Some tests failed'
    };
  }
}

export default AssignmentValidator;
