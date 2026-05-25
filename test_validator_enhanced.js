/**
 * Quick test for enhanced AssignmentValidator
 * Run with: node test_validator_enhanced.js
 */

// Mock DOMParser for Node.js environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
global.DOMParser = dom.window.DOMParser;
global.Node = dom.window.Node;

// Import the validator
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('./src/components/applicantcomponents/bitLabs-LMS/AssignmentValidator.js', 'utf8')
    .replace('export default AssignmentValidator;', '');
const sandbox = { 
    module: { exports: {} }, 
    exports: {}, 
    PYTHON_TEST_SPECS: {}, 
    DOMParser: global.DOMParser, 
    Node: global.Node 
};
vm.createContext(sandbox);
vm.runInContext(code + '\nmodule.exports = AssignmentValidator;', sandbox);
const AssignmentValidator = sandbox.module.exports;

// Test 1: Old style testCase (backward compatibility)
console.log('\n=== TEST 1: Old-style testCase (backward compatibility) ===');
const html1 = '<!DOCTYPE html><html><body><h1>Title</h1></body></html>';
const result1 = AssignmentValidator.validate(html1, [
  { selector: 'h1', text: 'Title', marks: 5, message: 'h1 with text found' }
]);
console.log('Test 1 Result:', result1);
console.log('Expected: isValid=true, score=5, maxScore=5');
console.log('PASS:', result1.isValid && result1.score === 5 && result1.maxScore === 5);

// Test 2: New style with enhanced features
console.log('\n=== TEST 2: Enhanced testCase with className ===');
const html2 = '<!DOCTYPE html><html><body><header class="main"><h1>Welcome</h1></header></body></html>';
const result2 = AssignmentValidator.validate(html2, [
  { selector: 'header', className: 'main', marks: 3, message: 'Header with class' },
  { selector: 'h1', contains: 'Welcome', marks: 2, message: 'H1 with text' }
]);
console.log('Test 2 Result:', result2);
console.log('Expected: isValid=true, score=5, maxScore=5');
console.log('PASS:', result2.isValid && result2.score === 5 && result2.maxScore === 5);

// Test 3: Partial scoring
console.log('\n=== TEST 3: Partial scoring (one test fails) ===');
const html3 = '<!DOCTYPE html><html><body><nav></nav></body></html>';
const result3 = AssignmentValidator.validate(html3, [
  { selector: 'nav', marks: 2, message: 'Nav exists' },
  { selector: 'header', marks: 3, message: 'Header missing' }
]);
console.log('Test 3 Result:', result3);
console.log('Expected: isValid=false, score=2, maxScore=5');
console.log('PASS:', !result3.isValid && result3.score === 2 && result3.maxScore === 5);

// Test 4: Helper methods
console.log('\n=== TEST 4: Helper Methods ===');
console.log('normalize(" HELLO  WORLD "):', AssignmentValidator.normalize(' HELLO  WORLD '));
console.log('Expected: "hello world"');

console.log('matchNormalized("Hello World", "hello"):', AssignmentValidator.matchNormalized('Hello World', 'hello'));
console.log('Expected: true');

console.log('parseInlineStyle("color: red; margin: 10px;"):', AssignmentValidator.parseInlineStyle('color: red; margin: 10px;'));
console.log('Expected: { color: "red", margin: "10px" }');

// Test 5: Structural & Text comparison
console.log('\n=== TEST 5: HTML Structure and Style Matching ===');

const expectedHTML = '<h1>Apple</h1><h2>Banana</h2>';
const studentHTMLPass = '<!DOCTYPE html><html><body><h1>Apple</h1><h2>Banana</h2></body></html>';
const studentHTMLFail = '<!DOCTYPE html><html><body><h1>Apple</h1><h2>Orange</h2></body></html>';
const studentHTMLMissingTag = '<!DOCTYPE html><html><body><h1>Apple</h1></body></html>';

const testCases = [
  { selector: 'h1', marks: 2 },
  { selector: 'h2', marks: 2 }
];

console.log('Subtest 5a (Exact Match):');
const res5a = AssignmentValidator.validate(studentHTMLPass, testCases, expectedHTML);
console.log('Result:', res5a.isValid, 'Score:', res5a.score);
console.log('Expected: isValid=true, score=4');
console.log('PASS:', res5a.isValid && res5a.score === 4);

console.log('Subtest 5b (Mismatched Text):');
const res5b = AssignmentValidator.validate(studentHTMLFail, testCases, expectedHTML);
console.log('Result:', res5b.isValid, 'Error:', res5b.details[0]);
console.log('Expected: isValid=false, containing mismatched text details');
console.log('PASS:', !res5b.isValid && res5b.details[0].includes('Expected text "Banana" but found "Orange"'));

console.log('Subtest 5c (Missing Element):');
const res5c = AssignmentValidator.validate(studentHTMLMissingTag, testCases, expectedHTML);
console.log('Result:', res5c.isValid, 'Error:', res5c.details[0]);
console.log('Expected: isValid=false, containing missing child details');
console.log('PASS:', !res5c.isValid && res5c.details[0].includes('Missing or incorrect child <h2>'));

// Test 6: CSS internal styles comparison
console.log('\n=== TEST 6: Internal CSS Style Matching ===');
const expectedHTMLCSS = '<style>p{color:red; font-weight:bold;}</style><p>Text</p>';
const studentCSSPass = '<style>p { font-weight: bold; color: red; }</style><p>Text</p>';
const studentCSSFail = '<style>p { color: red; }</style><p>Text</p>';

const cssTestCases = [{ selector: 'p', marks: 5 }];

console.log('Subtest 6a (CSS Match):');
const res6a = AssignmentValidator.validate(studentCSSPass, cssTestCases, expectedHTMLCSS);
console.log('Result:', res6a.isValid);
console.log('Expected: isValid=true');
console.log('PASS:', res6a.isValid);

console.log('Subtest 6b (CSS Mismatch/Missing Declaration):');
const res6b = AssignmentValidator.validate(studentCSSFail, cssTestCases, expectedHTMLCSS);
console.log('Result:', res6b.isValid, 'Error:', res6b.details[0]);
console.log('Expected: isValid=false, missing declaration info');
console.log('PASS:', !res6b.isValid && res6b.details[0].includes('missing expected declaration "font-weight:bold"'));

// Test 7: Image exception validation
console.log('\n=== TEST 7: Image Exception Bypassing ===');
const expectedImgHTML = '<img src="test.jpg" alt="car" />';
// Student uses a different image URL and different alt, which normally fails strict DOM compare
const studentImgHTML = '<img src="my_car.jpg" alt="my awesome car" />';
const imgTestCases = [
  { selector: 'img', marks: 5 }
];

const res7 = AssignmentValidator.validate(studentImgHTML, imgTestCases, expectedImgHTML);
console.log('Result:', res7.isValid, 'Score:', res7.score);
console.log('Expected: isValid=true, score=5 (strict check bypassed)');
console.log('PASS:', res7.isValid && res7.score === 5);

console.log('\n✓ All manual tests completed!');
