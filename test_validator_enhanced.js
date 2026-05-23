/**
 * Quick test for enhanced AssignmentValidator
 * Run with: node test_validator_enhanced.js
 */

// Mock DOMParser for Node.js environment
const { JSDOM } = require('jsdom');
global.DOMParser = JSDOM.FragmentParser;

// Import the validator
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('./src/components/applicantcomponents/bitLabs-LMS/AssignmentValidator.js', 'utf8');
const sandbox = { module: { exports: {} }, exports: {}, PYTHON_TEST_SPECS: {} };
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

console.log('\n✓ All manual tests completed!');
