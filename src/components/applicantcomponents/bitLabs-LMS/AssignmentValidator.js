/**
 * AssignmentValidator.js
 * 
 * Modern dynamic testcase-based validation engine
 * Lightweight, scalable, production-ready assessment platform
 */

const PYTHON_TEST_SPECS = {
    401: {
        inputs: ["5"],
        checkLines: ["distance in feet : 5", "distance in inches : 60", "distance in yards : 1.666", "distance in miles : 0.000946"]
    },
    402: {
        inputs: ["101", "Sai Mani", "85", "90", "88"],
        checkLines: ["total marks: 263", "average: 87.67", "result: pass", "grade: a"]
    },
    403: {
        inputs: ["1000", "10", "3"],
        checkLines: ["1100", "1210", "1331"]
    },
    404: {
        inputs: [],
        checkLines: ["[(2, 1), (1, 2), (2, 3), (4, 4), (2, 5)]"]
    },
    405: {
        inputs: [],
        checkLines: ["[12, 24, 35, 88, 120, 155]"]
    },
    406: {
        inputs: ["hello world", "practice makes perfect", ""],
        checkLines: ["HELLO WORLD", "PRACTICE MAKES PERFECT"]
    },
    407: {
        inputs: [],
        appendCode: `\n\ntry:\n    print("TEST_RESULT:", preLetterCase("CAtCHa", "a"))\nexcept Exception as e:\n    print("TEST_ERROR:", e)\n`,
        checkLines: ["test_result: catcha"]
    },
    408: {
        inputs: [],
        appendCode: `\n\ntry:\n    import math\n    # Student should have defined a, b, and calculated c\n    if 'a' in dir() and 'b' in dir():\n        if 'c' in dir():\n            result = c\n        elif 'hypotenuse' in dir():\n            result = hypotenuse  \n        else:\n            result = math.sqrt(a**2 + b**2)\n        print(f"Hypotenuse: {result}")\nexcept Exception as e:\n    print(f"Error: {e}")\n`,
        checkLines: ["hypotenuse: 5.0"]
    },
    409: {
        inputs: [],
        appendCode: `\n\ntry:\n    s = Student("M11", "Anusha Rao")\n    print("TEST_RESULT:", s.id, s.name)\nexcept Exception as e:\n    print("TEST_ERROR:", e)\n`,
        checkLines: ["m11", "anusha rao"]
    },
    410: {
        inputs: [],
        checkLines: ["130"]
    },
    411: {
        inputs: [],
        appendCode: `\n\ntry:\n    sq = Square(5)\n    print("TEST_RESULT_AREA:", sq.area())\n    print("TEST_RESULT_PARENT:", isinstance(sq, Shape))\nexcept Exception as e:\n    print("TEST_ERROR:", e)\n`,
        checkLines: ["test_result_area: 25", "test_result_parent: true"]
    }
};

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
                const result = this.executeTestCase(doc, testCase);
                results.push(result);
                maxScore += result.maxMarks || (testCase.marks || 0);
                score += result.marks || 0;
            });

            const passedAll = results.every(result => result.passed);

            return {
                isValid: passedAll && unclosedCheck.isValid,
                score,
                maxScore,
                details: results.flatMap(r => r.subResults ? r.subResults.map(sr => sr.message) : [r.message]),
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

    static matchNormalized(actual, expected, exact = false) {
        const normalizedActual = AssignmentValidator.normalize(actual);
        const normalizedExpected = AssignmentValidator.normalize(expected);
        return exact
            ? normalizedActual === normalizedExpected
            : normalizedActual.includes(normalizedExpected);
    }

    static parseInlineStyle(styleString) {
        if (!styleString) return {};
        return String(styleString)
            .split(';')
            .map(decl => decl.split(':').map(part => part && part.trim()))
            .filter(([prop]) => prop)
            .reduce((styles, [prop, value]) => {
                styles[prop.toLowerCase()] = value || '';
                return styles;
            }, {});
    }

    static hasClasses(element, classNames) {
        if (!classNames) return true;
        const required = Array.isArray(classNames) ? classNames : String(classNames).split(/\s+/).filter(Boolean);
        const actual = new Set(
            String(element.className || '')
                .split(/\s+/)
                .filter(Boolean)
                .map(cls => cls.toLowerCase())
        );
        return required.every(cls => actual.has(String(cls).toLowerCase()));
    }

    static matchAttribute(element, attribute) {
        if (!element || !attribute || !attribute.name) return false;
        if (!element.hasAttribute(attribute.name)) return false;
        if (!attribute.value) return true;
        return AssignmentValidator.matchNormalized(
            element.getAttribute(attribute.name),
            attribute.value,
            Boolean(attribute.exact)
        );
    }

    static evaluateStyle(element, styleExpectations) {
        if (!styleExpectations || Object.keys(styleExpectations).length === 0) return true;
        const inlineStyles = AssignmentValidator.parseInlineStyle(element.getAttribute('style') || '');
        return Object.entries(styleExpectations).every(([property, expectedValue]) => {
            const actualValue = inlineStyles[property.toLowerCase()];
            if (actualValue === undefined || actualValue === null) return false;
            return AssignmentValidator.matchNormalized(actualValue, expectedValue, false);
        });
    }

    static executeTestCase(doc, testCase) {
        const {
            selector,
            checks,
            text,
            contains,
            exactText = false,
            attribute,
            className,
            classes,
            style,
            parentSelector,
            childSelector,
            minCount,
            maxCount,
            requiredCount,
            theme,
            role,
            ariaLabel,
            marks = 0,
            message
        } = testCase;

        if (Array.isArray(checks) && checks.length > 0) {
            let subtotal = 0;
            let submax = 0;
            const childResults = checks.map(subcase => {
                const result = AssignmentValidator.executeTestCase(doc, subcase);
                submax += result.maxMarks || (subcase.marks || 0);
                subtotal += result.marks || 0;
                return result;
            });

            return {
                testCase: message || selector || 'Group check',
                passed: subtotal === submax,
                message: message || `Group validation ${subtotal === submax ? 'passed' : 'had issues'}`,
                marks: subtotal,
                maxMarks: submax,
                subResults: childResults
            };
        }

        const targetElements = selector
            ? Array.from(doc.querySelectorAll(selector))
            : [doc.documentElement];

        if (selector && targetElements.length === 0) {
            return {
                testCase: selector,
                passed: false,
                message: `✗ ${selector} not found`,
                marks: 0,
                maxMarks: marks
            };
        }

        if (requiredCount && targetElements.length < requiredCount) {
            return {
                testCase: selector || message || 'Count validation',
                passed: false,
                message: `✗ Expected at least ${requiredCount} element(s) for ${selector || 'root'}`,
                marks: 0,
                maxMarks: marks
            };
        }

        if (minCount && targetElements.length < minCount) {
            return {
                testCase: selector || message || 'Count validation',
                passed: false,
                message: `✗ Expected at least ${minCount} element(s) for ${selector || 'root'}`,
                marks: 0,
                maxMarks: marks
            };
        }

        if (maxCount && targetElements.length > maxCount) {
            return {
                testCase: selector || message || 'Count validation',
                passed: false,
                message: `✗ Expected no more than ${maxCount} element(s) for ${selector || 'root'}`,
                marks: 0,
                maxMarks: marks
            };
        }

        const hasTextCheck = () => {
            if (!text && !contains) return true;
            const expected = text || contains;
            return targetElements.some(el => {
                const actual = el.textContent || '';
                return AssignmentValidator.matchNormalized(actual, expected, exactText);
            });
        };

        const hasClassCheck = () => {
            if (!className && !classes) return true;
            return targetElements.some(el => AssignmentValidator.hasClasses(el, className || classes));
        };

        const hasAttributeCheck = () => {
            if (!attribute) return true;
            return targetElements.some(el => AssignmentValidator.matchAttribute(el, attribute));
        };

        const hasParentCheck = () => {
            if (!parentSelector) return true;
            return targetElements.some(el => el.closest(parentSelector));
        };

        const hasChildCheck = () => {
            if (!childSelector) return true;
            return targetElements.some(el => el.querySelector(childSelector));
        };

        const hasRoleCheck = () => {
            if (!role && !ariaLabel) return true;
            return targetElements.some(el => {
                const roleMatch = role ? AssignmentValidator.matchNormalized(el.getAttribute('role') || '', role, exactText) : true;
                const ariaMatch = ariaLabel ? AssignmentValidator.matchNormalized(el.getAttribute('aria-label') || '', ariaLabel, exactText) : true;
                return roleMatch && ariaMatch;
            });
        };

        const hasStyleCheck = () => {
            if (!style && !theme) return true;
            return targetElements.some(el => {
                const styleOk = style ? AssignmentValidator.evaluateStyle(el, style) : true;
                let themeOk = true;
                if (theme) {
                    if (theme.classIncludes) {
                        themeOk = AssignmentValidator.hasClasses(el, theme.classIncludes);
                    }
                    if (themeOk && theme.styleIncludes) {
                        themeOk = AssignmentValidator.evaluateStyle(el, theme.styleIncludes);
                    }
                }
                return styleOk && themeOk;
            });
        };

        const passed = hasTextCheck() && hasClassCheck() && hasAttributeCheck() && hasParentCheck() && hasChildCheck() && hasRoleCheck() && hasStyleCheck();
        const defaultMessage = passed
            ? `✓ ${selector || 'HTML structure'} passed` 
            : `✗ ${selector || 'HTML structure'} did not satisfy all checks`;

        return {
            testCase: selector || message || 'HTML validation',
            passed,
            message: message || defaultMessage,
            marks: passed ? marks : 0,
            maxMarks: marks
        };
    }

    /**
     * Check if code is suspicious (just printing expected output)
     */
    static isSuspiciousCode(code, assignmentId) {
        const spec = PYTHON_TEST_SPECS[assignmentId] || {};
        const checkLines = spec.checkLines || [];
        
        // Define required keywords/logic patterns for each assignment
        const requiredLogic = {
            402: { keywords: ['total', '+', 'average', '/', 'if'], description: 'must calculate total and average with conditional logic' },
            403: { keywords: ['for', 'while', 'loop', '*', '+'], description: 'must use loop for yearly calculation' },
            404: { keywords: ['sort', 'lambda', 'key'], description: 'must use sorted() with lambda' },
            405: { keywords: ['set(', 'list(', 'dict', 'for'], description: 'must remove duplicates using logic (set/dict/loop)' },
            406: { keywords: ['upper', 'lower', 'for', 'while'], description: 'must process with loop and string methods' },
            407: { keywords: ['def', 'if', 'else'], description: 'must define a function with conditional logic' },
            408: { keywords: ['math', 'sqrt', 'import', '**'], description: 'must use math module or ** operator' },
            409: { keywords: ['class', '__init__', 'self'], description: 'must define a class with __init__' },
            410: { keywords: ['for', 'sum', 'values', 'items'], description: 'must iterate through dictionary' },
            411: { keywords: ['class', 'def', 'super', 'inherit'], description: 'must use class inheritance' }
        };

        const assignmentLogic = requiredLogic[assignmentId];
        
        // If assignment has required logic, check for it
        if (assignmentLogic) {
            const hasRequiredLogic = assignmentLogic.keywords.some(keyword => 
                code.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (!hasRequiredLogic) {
                return `Code must contain actual logic to solve the problem. ${assignmentLogic.description}`;
            }
        }
        
        // Check if code is just printing without processing input
        if (assignmentId === 402 || assignmentId === 406) {
            // For these assignments, input() must be called
            if (!code.includes('input(')) {
                return 'Code must read input using input() function';
            }
        }
        
        // Check for suspicious pattern: printing expected outputs without variables
        if (checkLines.length > 0) {
            const printCount = (code.match(/print\(/g) || []).length;
            const variableAssignments = (code.match(/\w+\s*=/g) || []).length;
            
            // If more prints than variable assignments, suspicious
            if (printCount > 0 && variableAssignments === 0 && printCount >= checkLines.length) {
                return 'Your code appears to only print expected output. You must calculate values and store in variables.';
            }
        }
        
        return false; // Code looks legitimate
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
                const normalizedExpected = AssignmentValidator.normalize(text);
                const hasText = Array.from(elements).some(el =>
                    AssignmentValidator.normalize(el.textContent).includes(normalizedExpected)
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

                    const actualAttr = AssignmentValidator.normalize(el.getAttribute(attribute.name));
                    const expectedAttr = AssignmentValidator.normalize(attribute.value);
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
     * Python validation function using Pyodide
     * @param {Object} pyodide - Loaded Pyodide instance
     * @param {string} code - Student's Python code
     * @param {number} assignmentId - The ID of the assignment
     * @returns {Promise<Object>} - {isValid, details, results, errors}
     */
    static async validatePython(pyodide, code, assignmentId) {
        if (!pyodide) {
            return {
                isValid: false,
                details: ["Pyodide runtime is not ready."],
                results: [],
                errors: [{ type: 'Runtime Error', message: 'Python runtime is loading...', line: 'N/A' }]
            };
        }

        // Check for suspicious code (just printing expected output)
        const suspiciousResult = this.isSuspiciousCode(code, assignmentId);
        if (suspiciousResult) {
            return {
                isValid: false,
                details: [suspiciousResult],
                results: [{ testCase: 'Code Logic', passed: false, message: '✗ ' + suspiciousResult }],
                errors: [{ type: 'Logic Error', message: suspiciousResult, line: 'N/A' }]
            };
        }

        const spec = PYTHON_TEST_SPECS[assignmentId] || { inputs: [], checkLines: [] };
        const results = [];
        const errors = [];
        let executionOutput = "";

        // 1. Prepare inputs mock and injection code
        const mockInputs = spec.inputs || [];
        const appendCode = spec.appendCode || "";

        // Setup custom stdout capturing and input mocking in Python
        const jsonInputs = JSON.stringify(mockInputs);
        const bootstrapCode = `
import sys
import json
import builtins

# Capture stdout
class StdoutCapturer:
    def __init__(self):
        self.data = []
    def write(self, s):
        self.data.append(s)
    def flush(self):
        pass

capturer = StdoutCapturer()
sys.stdout = capturer

# Mock input
inputs = json.loads('''${jsonInputs}''')
input_index = 0

def mock_input(prompt=""):
    global input_index
    if input_index < len(inputs):
        val = str(inputs[input_index])
        input_index += 1
        # Print prompt and value to mimic console interaction
        print(f"{prompt}{val}")
        return val
    return ""

builtins.input = mock_input
`;

        const executionCode = `${bootstrapCode}\n\n# --- Student Code ---\n${code}\n\n# --- Test Runner ---\n${appendCode}\n\n# Restore stdout and get captured output\nsys.stdout = sys.__stdout__\ncaptured_output = "".join(capturer.data)\n`;

        try {
            // Run the code in Pyodide
            await pyodide.runPythonAsync(executionCode);
            
            // Extract captured output
            executionOutput = pyodide.globals.get('captured_output');
        } catch (error) {
            return {
                isValid: false,
                details: [`Syntax/Runtime Error: ${error.message}`],
                results: [{ testCase: 'Execution', passed: false, message: `Error: ${error.message}` }],
                errors: [{ type: 'Runtime Error', message: error.message, line: 'N/A' }]
            };
        }

        // 2. Perform validation checks
        const normalizedActual = AssignmentValidator.normalize(executionOutput);

        // Verification criteria:
        // If the spec lists specific checkLines, verify each one is in the output (case-insensitive check)
        if (spec.checkLines && spec.checkLines.length > 0) {
            spec.checkLines.forEach(line => {
                const normalizedLine = AssignmentValidator.normalize(line);
                const passed = normalizedActual.includes(normalizedLine);
                results.push({
                    testCase: `Output check: "${line}"`,
                    passed,
                    message: passed ? `✓ Found expected output: "${line}"` : `✗ Missing expected output: "${line}"`
                });
            });
        } else {
            // Fallback to basic execution check
            results.push({
                testCase: 'Execution',
                passed: true,
                message: '✓ Code executed successfully.'
            });
        }

        const isValid = results.every(r => r.passed);

        return {
            isValid,
            details: results.map(r => r.message),
            results,
            errors: isValid ? [] : [{ type: 'Logic Error', message: 'Assignment criteria not fully met. Review output details.', line: 'N/A' }],
            executionOutput
        };
    }
}

export default AssignmentValidator;