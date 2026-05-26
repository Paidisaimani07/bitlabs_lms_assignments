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
        appendCode: `
try:
    import math
    import types

    # Get all local numeric variables defined by the student
    student_vars = {}
    for name in list(globals().keys()):
        if name.startswith('_'):
            continue
        val = globals()[name]
        if isinstance(val, (int, float)) and not isinstance(val, bool):
            student_vars[name] = float(val)

    # We need to find a variable that represents the hypotenuse (around 5.0)
    hyp_var_name = None
    hyp_val = None
    for name, val in student_vars.items():
        if abs(val - 5.0) < 0.0001:
            hyp_var_name = name
            hyp_val = val
            break

    student_out = _stdout_capture.getvalue()

    if "5.0" not in student_out and "5" not in student_out:
        print("TEST_ERROR: You must print the calculated hypotenuse value (5.0)")
    elif not hyp_var_name:
        print("TEST_ERROR: Could not find any variable containing the calculated hypotenuse value (5.0)")
    else:
        # Check if there is a pair of sides that squares to hyp_val**2
        has_sides = False
        for name1, val1 in student_vars.items():
            for name2, val2 in student_vars.items():
                if name1 != hyp_var_name and name2 != hyp_var_name and name1 != name2:
                    if abs(math.sqrt(val1**2 + val2**2) - hyp_val) < 0.0001:
                        has_sides = True
                        break
            if has_sides:
                break
        
        print("TEST_RESULT: PASS")

except Exception as e:
    print("TEST_ERROR:", e)
`,
        checkLines: ["test_result: pass"],
        exactOutput: "Hypotenuse: 5.0"
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
     * Check if an assignment contains images in its expected output or test cases
     */
    static isImageAssignment(expectedOutput, testCases) {
        if (expectedOutput && expectedOutput.toLowerCase().includes('<img')) {
            return true;
        }
        if (testCases && testCases.some(tc => tc.selector && tc.selector.toLowerCase().includes('img'))) {
            return true;
        }
        return false;
    }

    /**
     * Get significant child nodes (ignores comment nodes, whitespace-only text, and style tags)
     */
    static getSignificantChildren(node) {
        return Array.from(node.childNodes).filter(child => {
            if (child.nodeType === 8) return false; // Node.COMMENT_NODE
            if (child.nodeType === 1) { // Node.ELEMENT_NODE
                if (child.tagName.toLowerCase() === 'style') return false;
            }
            if (child.nodeType === 3) { // Node.TEXT_NODE
                return child.nodeValue.trim().length > 0;
            }
            return true;
        });
    }

    /**
     * Parse CSS styles from text into selectors and normalized declarations list
     */
    static parseCSSRules(cssText) {
        const rules = {};
        const cleanCss = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
        const regex = /([^{]+)\{([^}]+)\}/g;
        let match;
        while ((match = regex.exec(cleanCss)) !== null) {
            const selector = match[1].trim().toLowerCase().replace(/\s+/g, ' ');
            const declarations = match[2].split(';')
                .map(d => d.trim())
                .filter(Boolean)
                .map(d => {
                    const parts = d.split(':');
                    if (parts.length < 2) return null;
                    const prop = parts[0].trim().toLowerCase();
                    const val = parts.slice(1).join(':').trim().toLowerCase().replace(/\s+/g, ' ');
                    return `${prop}:${val}`;
                })
                .filter(Boolean)
                .sort();

            if (!rules[selector]) {
                rules[selector] = [];
            }
            rules[selector] = [...rules[selector], ...declarations].sort();
        }
        return rules;
    }

    /**
     * Compare student internal CSS style block text with expected CSS text
     */
    static compareCSSDetailed(studentCSS, expectedCSS) {
        const studentRules = this.parseCSSRules(studentCSS);
        const expectedRules = this.parseCSSRules(expectedCSS);

        for (const selector of Object.keys(expectedRules)) {
            const normalizedSelector = selector.replace(/\s+/g, '');
            const matchingStudentSelector = Object.keys(studentRules).find(
                s => s.replace(/\s+/g, '') === normalizedSelector
            );

            if (!matchingStudentSelector) {
                return {
                    passed: false,
                    message: `Missing CSS rules for selector "${selector}".`
                };
            }

            const expectedDecls = expectedRules[selector];
            const studentDecls = studentRules[matchingStudentSelector];

            for (const decl of expectedDecls) {
                const normalizedDecl = decl.replace(/\s+/g, '');
                const hasDecl = studentDecls.some(sd => sd.replace(/\s+/g, '') === normalizedDecl);
                if (!hasDecl) {
                    return {
                        passed: false,
                        message: `CSS selector "${selector}" is missing expected declaration "${decl}".`
                    };
                }
            }
        }
        return { passed: true };
    }

    /**
     * Compare student inline style string with expected inline style string
     */
    static compareInlineStylesDetailed(studentStyle, expectedStyle, tagName) {
        const studentParsed = this.parseInlineStyle(studentStyle);
        const expectedParsed = this.parseInlineStyle(expectedStyle);

        for (const [prop, expectedVal] of Object.entries(expectedParsed)) {
            const studentVal = studentParsed[prop];
            if (studentVal === undefined || studentVal === null) {
                return {
                    passed: false,
                    message: `Inline style on <${tagName}> is missing expected property "${prop}".`
                };
            }
            if (!this.matchNormalized(studentVal, expectedVal, false)) {
                return {
                    passed: false,
                    message: `Inline style "${prop}" on <${tagName}> expected "${expectedVal}" but found "${studentVal}".`
                };
            }
        }
        return { passed: true };
    }

    /**
     * Recursively compare two nodes (student and expected)
     */
    static compareNodesDetailed(studentNode, expectedNode) {
        // Node.TEXT_NODE is 3
        if (expectedNode.nodeType === 3) {
            const expectedText = expectedNode.nodeValue.trim();
            if (!expectedText) return { passed: true };

            const studentText = studentNode.textContent || '';
            const passed = this.normalize(studentText).includes(this.normalize(expectedText));
            if (!passed) {
                return {
                    passed: false,
                    message: `Expected text "${expectedText}" but found "${studentText.trim() || 'empty text'}"`
                };
            }
            return { passed: true };
        }

        // Node.ELEMENT_NODE is 1
        if (expectedNode.nodeType === 1) {
            if (studentNode.nodeType !== 1) {
                return {
                    passed: false,
                    message: `Expected an element <${expectedNode.tagName.toLowerCase()}> but found text/other node.`
                };
            }
            const expectedTag = expectedNode.tagName.toLowerCase();
            const studentTag = studentNode.tagName.toLowerCase();
            if (studentTag !== expectedTag) {
                return {
                    passed: false,
                    message: `Expected element <${expectedTag}> but found <${studentTag}>.`
                };
            }

            // Compare attributes
            for (let i = 0; i < expectedNode.attributes.length; i++) {
                const attr = expectedNode.attributes[i];
                const attrName = attr.name;
                const expectedVal = attr.value;

                if (!studentNode.hasAttribute(attrName)) {
                    return {
                        passed: false,
                        message: `Element <${expectedTag}> is missing expected attribute "${attrName}".`
                    };
                }
                const studentVal = studentNode.getAttribute(attrName);

                if (attrName === 'style') {
                    const styleCompare = this.compareInlineStylesDetailed(studentVal, expectedVal, expectedTag);
                    if (!styleCompare.passed) return styleCompare;
                } else {
                    if (this.normalize(studentVal) !== this.normalize(expectedVal)) {
                        return {
                            passed: false,
                            message: `Attribute "${attrName}" on <${expectedTag}> expected "${expectedVal}" but found "${studentVal}".`
                        };
                    }
                }
            }

            // Compare children
            const expectedChildren = this.getSignificantChildren(expectedNode);
            const studentChildren = this.getSignificantChildren(studentNode);

            if (expectedChildren.length === 0) {
                const expectedText = expectedNode.textContent.trim();
                if (expectedText) {
                    const studentText = studentNode.textContent.trim();
                    const passed = this.normalize(studentText).includes(this.normalize(expectedText));
                    if (!passed) {
                        return {
                            passed: false,
                            message: `Expected <${expectedTag}> to contain text "${expectedText}" but found "${studentText || 'empty'}"`
                        };
                    }
                }
                return { passed: true };
            }

            let studentIdx = 0;
            for (let expectedChild of expectedChildren) {
                let foundMatch = false;
                let lastError = null;
                while (studentIdx < studentChildren.length) {
                    const childResult = this.compareNodesDetailed(studentChildren[studentIdx], expectedChild);
                    if (childResult.passed) {
                        foundMatch = true;
                        studentIdx++;
                        break;
                    } else {
                        lastError = childResult.message;
                    }
                    studentIdx++;
                }
                if (!foundMatch) {
                    const expectedChildDesc = expectedChild.nodeType === 1
                        ? `<${expectedChild.tagName.toLowerCase()}>`
                        : `text "${expectedChild.nodeValue.trim()}"`;
                    return {
                        passed: false,
                        message: `Inside <${expectedTag}>: Missing or incorrect child ${expectedChildDesc}.` + (lastError ? ` Details: ${lastError}` : '')
                    };
                }
            }

            return { passed: true };
        }

        return { passed: true };
    }

    /**
     * Main validation function
     * @param {string} code - Student's HTML code
     * @param {Array} testCases - Dynamic test cases configuration
     * @param {string} expectedOutput - Expected HTML output
     * @returns {Object} - {isValid, details, results, errors}
     */
    static validate(code, testCases = [], expectedOutput = '') {
        const results = [];
        let score = 0;
        let maxScore = 0;

        try {
            // Parse HTML code
            const parser = new DOMParser();
            const doc = parser.parseFromString(code, 'text/html');

            // Check for unclosed tags first (Detailed Syntax Validation)
            const unclosedCheck = this.checkUnclosedTags(code);
            if (!unclosedCheck.isValid) {
                return {
                    isValid: false,
                    score: 0,
                    maxScore: testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0),
                    details: unclosedCheck.errors.map(e => e.message),
                    results: [],
                    errors: unclosedCheck.errors
                };
            }

            // Perform DOM matching if expectedOutput is provided and it is NOT an image assignment
            if (expectedOutput && expectedOutput.trim() && !this.isImageAssignment(expectedOutput, testCases)) {
                const expectedDoc = parser.parseFromString(expectedOutput, 'text/html');

                // Extract and validate internal CSS <style> blocks
                const expectedStyleElements = Array.from(expectedDoc.querySelectorAll('style'));
                const studentStyleElements = Array.from(doc.querySelectorAll('style'));

                for (const expectedStyleEl of expectedStyleElements) {
                    const expectedCSS = expectedStyleEl.textContent;
                    let styleMatched = false;
                    let lastCssError = null;
                    for (const studentStyleEl of studentStyleElements) {
                        const cssResult = this.compareCSSDetailed(studentStyleEl.textContent, expectedCSS);
                        if (cssResult.passed) {
                            styleMatched = true;
                            break;
                        } else {
                            lastCssError = cssResult.message;
                        }
                    }
                    if (!styleMatched) {
                        const errMsg = lastCssError || 'Missing or incorrect CSS style block.';
                        return {
                            isValid: false,
                            score: 0,
                            maxScore: testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0),
                            details: [errMsg],
                            results: [{ testCase: 'CSS Style check', passed: false, message: `✗ CSS styling did not match expected: ${errMsg}` }],
                            errors: [{ type: 'Validation Error', message: errMsg, line: 'N/A' }]
                        };
                    }
                }

                // Verify HTML nodes
                const compareResult = this.compareNodesDetailed(doc.body, expectedDoc.body);
                if (!compareResult.passed) {
                    return {
                        isValid: false,
                        score: 0,
                        maxScore: testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0),
                        details: [compareResult.message],
                        results: [{ testCase: 'Output matching', passed: false, message: `✗ Output matching failed: ${compareResult.message}` }],
                        errors: [{ type: 'Validation Error', message: compareResult.message, line: 'N/A' }]
                    };
                }
            }

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
     * Helper to verify import statements are only placed at the top of the file
     */
    static checkImportsAtTop(code) {
        const cleanedCode = String(code || '')
            .replace(/('{3}[\s\S]*?'{3}|\"{3}[\s\S]*?\"{3})/g, '')
            .replace(/#.*$/gm, '');
        const lines = cleanedCode.split('\n');
        let seenNonImportCode = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                continue;
            }
            const isImport = /^(import\b|from\b)/.test(trimmed);
            if (isImport) {
                if (seenNonImportCode) {
                    return `Import statements must be placed at the top of the file before other code. Found: "${trimmed}"`;
                }
            } else {
                seenNonImportCode = true;
            }
        }
        return null;
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
            402: {
                forbiddenPatterns: [
                    /print\s*\(\s*["']total\s+marks:\s*263/i,
                    /print\s*\(\s*["']average:\s*87/i
                ],
                description: 'must calculate total and average using actual computations with input()'
            },
            403: {
                forbiddenPatterns: [
                    /print\s*\(\s*1100\s*\)/i,
                    /print\s*\(\s*1210\s*\)/i,
                    /print\s*\(\s*1331\s*\)/i
                ],
                description: 'must use loop for compound interest calculation, not hardcoded values'
            },
            404: {
                requiredPatterns: [
                    /sorted\s*\(/i,
                    /lambda\s+/i,
                    /key\s*=/i
                ],
                forbiddenPatterns: [
                    /print\s*\(\s*["']\s*\[\(2,\s*1\)/i
                ],
                description: 'must use sorted() with lambda and key'
            },
            405: {
                forbiddenPatterns: [
                    /print\s*\(\s*\[\s*12\s*,\s*24\s*,\s*35/i,
                    /\[\s*12\s*,\s*24\s*,\s*35\s*,\s*88\s*,\s*120\s*,\s*155\s*\]/i
                ],
                description: 'must use set/dict logic to remove duplicates, not hardcoded results'
            },
            406: {
                forbiddenPatterns: [
                    /print\s*\(\s*["']HELLO\s+WORLD/i,
                    /print\s*\(\s*["']PRACTICE\s+MAKES\s+PERFECT/i
                ],
                description: 'must process strings with loop and upper/lower methods, not hardcoded output',
                strict: true
            },
            407: {
                forbiddenPatterns: [
                    /print\s*\(\s*["']catcha["']\s*\)/i
                ],
                description: 'must define a function with conditional logic and return statement'
            },
            408: {
                keywords: ['a', 'b'],
                requiredPatterns: [
                    /(sqrt\s*\()/i,
                    /(\w+)\s*=\s*(math\.)?sqrt/i
                ],
                forbiddenPatterns: [
                    /print\s*\(\s*["']hypotenuse["']\s*,\s*5(\.0+)?\s*\)/i
                ],
                description: 'must calculate hypotenuse using sqrt() and variables'
            },
            409: {
                forbiddenPatterns: [
                    /print\s*\(\s*["']M11["']\s*,\s*["']Anusha/i
                ],
                description: 'must define a Student class with __init__ and instance variables'
            },
            410: {
                forbiddenPatterns: [
                    /print\s*\(\s*130\s*\)/i,
                    /print\s*\(\s*["']130["']\s*\)/i
                ],
                description: 'must iterate through dictionary items and calculate sum with actual logic'
            },
            411: {
                forbiddenPatterns: [
                    /print\s*\(\s*["']25["']\s*,\s*["']True/i,
                    /print\s*\(\s*25\s*,\s*True\s*\)/i
                ],
                description: 'must use class inheritance with super() and method override'
            }
        };

        const assignmentLogic = requiredLogic[assignmentId];

        // Strip comments and docstrings so commented-out logic doesn't pass checks
        const codeNoComments = String(code || '')
            .replace(/('{3}[\s\S]*?'{3}|\"{3}[\s\S]*?\"{3})/g, '')
            .replace(/#.*$/gm, '')
            .trim();

        // Prefer uncommented code for validation; fallback to original
        const subjectCode = codeNoComments.length > 0 ? codeNoComments : String(code || '');

        // If assignment has required logic, check for it using uncommented code
        if (assignmentLogic) {
            // Detect hardcoded answers first
            if (assignmentLogic.forbiddenPatterns) {
                const hasForbidden = assignmentLogic.forbiddenPatterns.some(
                    pattern => pattern.test(subjectCode)
                );
                if (hasForbidden) {
                    return 'Hardcoded output detected. Use actual logic instead of directly printing the answer.';
                }
            }

            // Required regex patterns (if provided)
            if (assignmentLogic.requiredPatterns) {
                const missingPattern = assignmentLogic.requiredPatterns.find(
                    pattern => !pattern.test(subjectCode)
                );
                if (missingPattern) {
                    return `Code must contain actual logic to solve the problem. ${assignmentLogic.description}`;
                }
            }

            // Fallback keyword checks only when no requiredPatterns exist
            if (assignmentLogic.keywords && !assignmentLogic.requiredPatterns) {
                const hasRequiredLogic = assignmentLogic.keywords.some(keyword =>
                    subjectCode.toLowerCase().includes(keyword.toLowerCase())
                );
                if (!hasRequiredLogic) {
                    return `Code must contain actual logic to solve the problem. ${assignmentLogic.description}`;
                }
            }
        }

        // Check if code is just printing without processing input
        if (assignmentId === 402 || assignmentId === 406) {
            // For these assignments, input() must be called (check uncommented code)
            if (!/input\s*\(/i.test(subjectCode)) {
                return 'Code must read input using input() function';
            }
        }

        // Check for suspicious pattern: multiple print statements with expected values but no actual computation
        if (checkLines.length > 0) {
            // Use uncommented code for print-only detection
            const printCount = (subjectCode.match(/print\(/g) || []).length;
            const variableAssignments = (subjectCode.match(/\w+\s*=(?!=)/g) || []).length;
            const arithmeticOps = (subjectCode.match(/[+\-*/%]|\bsum\s*\(|\blen\s*\(|\bsorted\s*\(/g) || []).length;
            const loopCount = (subjectCode.match(/for\s+\w+\s+in|while\s+/g) || []).length;

            // If the uncommented code is empty, it's likely commented-out code
            if (!subjectCode || subjectCode.trim().length === 0) {
                return 'Code appears to be commented out or empty. Remove comments and include actual logic.';
            }

            // Suspicious if: lots of prints, few/no variable assignments, and no arithmetic/logic
            if (printCount >= checkLines.length && variableAssignments < 1 && arithmeticOps === 0 && loopCount === 0) {
                return 'Your code appears to only print expected output. You must use actual calculations, loops, or data structure operations.';
            }
        }

        return false; // Code looks legitimate
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

        // Check if import statements are only at the top of the file
        const importCheckError = this.checkImportsAtTop(code);
        if (importCheckError) {
            return {
                isValid: false,
                details: [importCheckError],
                results: [{ testCase: 'Import Placement', passed: false, message: `✗ ${importCheckError}` }],
                errors: [{ type: 'Style Error', message: importCheckError, line: 'N/A' }]
            };
        }

        const spec = PYTHON_TEST_SPECS[assignmentId] || { inputs: [], checkLines: [] };
        const results = [];
        const errors = [];
        let executionOutput = "";
        let studentOutput = "";

        // 1. Prepare inputs mock and injection code
        const mockInputs = spec.inputs || [];
        const appendCode = spec.appendCode || "";

        // Setup custom stdout capturing and input mocking in Python
        const jsonInputs = JSON.stringify(mockInputs);

        // Step 1: Initialize Python environment with custom stdout
        const initCode = `
import sys
import json
import builtins

# Custom stdout class
class OutputCapture:
    def __init__(self):
        self.lines = []
    
    def write(self, text):
        if text:
            self.lines.append(text)
        return len(text) if text else 0
    
    def flush(self):
        pass
    
    def getvalue(self):
        return ''.join(self.lines)

# Replace stdout
_stdout_capture = OutputCapture()
_original_stdout = sys.stdout
sys.stdout = _stdout_capture

# Mock input setup
_inputs_list = json.loads('''${jsonInputs}''')
_input_index = [0]

def mock_input(prompt=""):
    if _input_index[0] < len(_inputs_list):
        val = str(_inputs_list[_input_index[0]])
        _input_index[0] += 1
        return val
    return ""

builtins.input = mock_input
`;

        try {
            // Initialize the Python environment
            await pyodide.runPythonAsync(initCode);

            // Step 2: Execute student code
            await pyodide.runPythonAsync(code);

            // Capture the student's output before executing verification tests
            studentOutput = String(pyodide.runPython(`_stdout_capture.getvalue()`) || "");

            // Step 3: Execute test/verification code if provided
            if (appendCode && appendCode.trim()) {
                await pyodide.runPythonAsync(appendCode);
            }

            // Step 4: Get captured output
            executionOutput = String(pyodide.runPython(`_stdout_capture.getvalue()`) || "");
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
        const normalizedStudentOutput = AssignmentValidator.normalize(studentOutput);

        if (spec.exactOutput) {
            const normalizedExpected = AssignmentValidator.normalize(spec.exactOutput);
            const passed = normalizedStudentOutput === normalizedExpected;
            results.push({
                testCase: `Exact output check`,
                passed,
                message: passed ? `✓ Output matches expected: "${spec.exactOutput}"` : `✗ Output expected: "${spec.exactOutput}", but got: "${studentOutput.trim() || 'no output'}"`
            });
        }

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

    /**
     * SQL validation — keyword-based, no HTML parsing.
     * Checks that the student wrote a real SQL statement containing the required keywords.
     * @param {string} code - Student's SQL code
     * @param {string[]} requiredKeywords - Keywords that must appear in the query (from assignment definition)
     * @param {string} expectedOutput - Human-readable expected result label (e.g. "Table created")
     * @returns {Object} - {isValid, details, results, errors}
     */
    static validateSQL(code, requiredKeywords, expectedOutput) {
        const results = [];
        const errors = [];

        // 1. Must have some code
        const trimmed = (code || '').trim();
        if (!trimmed || trimmed === '-- Write your query here') {
            return {
                isValid: false,
                details: ['Please write your SQL query before submitting.'],
                results: [{ testCase: 'SQL Code', passed: false, message: '✗ No SQL query written.' }],
                errors: [{ type: 'Empty Code', message: 'No SQL query written.', line: 'N/A' }]
            };
        }

        // 2. Must not be only comments
        const strippedComments = trimmed.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (!strippedComments) {
            return {
                isValid: false,
                details: ['Your submission contains only comments. Please write the actual SQL query.'],
                results: [{ testCase: 'SQL Code', passed: false, message: '✗ Only comments found — no SQL query.' }],
                errors: [{ type: 'Empty Code', message: 'Only comments — no SQL query.', line: 'N/A' }]
            };
        }

        // 3. Check required SQL keywords (case-insensitive)
        const upperCode = code.toUpperCase();
        if (requiredKeywords && requiredKeywords.length > 0) {
            // At least ONE group of keywords must match (treat each entry as an OR alternative)
            const keywordGroups = Array.isArray(requiredKeywords[0]) ? requiredKeywords : [requiredKeywords];
            const anyGroupPassed = keywordGroups.some(group =>
                group.every(kw => upperCode.includes(kw.toUpperCase()))
            );

            // Flatten for display
            const allKws = [...new Set(keywordGroups.flat())];
            const foundKws = allKws.filter(kw => upperCode.includes(kw.toUpperCase()));
            const missingKws = allKws.filter(kw => !upperCode.includes(kw.toUpperCase()));

            foundKws.forEach(kw => {
                results.push({ testCase: `Keyword: ${kw}`, passed: true, message: `✓ Found expected keyword: ${kw}` });
            });

            if (!anyGroupPassed) {
                missingKws.forEach(kw => {
                    results.push({ testCase: `Keyword: ${kw}`, passed: false, message: `✗ Missing expected keyword: ${kw}` });
                    errors.push({ type: 'Missing Keyword', message: `Missing SQL keyword: ${kw}`, line: 'N/A' });
                });
            }
        }

        // 4. Basic SQL structure — must contain at least one SQL statement keyword
        const sqlStatementKws = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'GRANT', 'REVOKE'];
        const hasStatement = sqlStatementKws.some(kw => upperCode.includes(kw));
        if (!hasStatement) {
            results.push({ testCase: 'SQL Statement', passed: false, message: '✗ No recognizable SQL statement found (SELECT, INSERT, CREATE, etc.).' });
            errors.push({ type: 'Invalid SQL', message: 'No SQL statement keyword found.', line: 'N/A' });
        } else {
            results.push({ testCase: 'SQL Statement', passed: true, message: '✓ SQL statement detected.' });
        }

        const isValid = results.every(r => r.passed) && errors.length === 0;

        return {
            isValid,
            details: isValid
                ? [`✓ Query accepted. Expected result: ${expectedOutput || 'Query executed successfully.'}`]
                : results.filter(r => !r.passed).map(r => r.message),
            results,
            errors,
            executionOutput: isValid ? (expectedOutput || 'Query executed successfully.') : null
        };
    }
}

export default AssignmentValidator;