/**
 * AssignmentEditor.js
 * 
 * Modern LMS assignment workflow component.
 * Manages coding exercises with real-time preview and validation.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AssignmentValidator from './AssignmentValidator';
import SqlEngine from './SqlEngine';
import { submitAssignment, getSubmittedAssignment, getAllAssignmentsByApplicant } from './assignmentservice';
import './AssignmentEditor.css';

const isHtmlTopic = (topic) => ['HTML Basics', 'CSS Basics', 'CSS Advanced', 'HTML Forms'].includes(topic);
const isSqlTopic = (topic) => ['Employee Table', 'Employee Data', 'Employee & Sales', 'Customer Sales', 'Student', 'Customer Table', 'Sales, Customers & Orders', 'Customer Sub-queries', 'Banks'].includes(topic);

const ASSIGNMENTS = [
    // ─── HTML BASICS (Module 1: 1.1 - 1.10) ───────────────────────────────────
    { id: 1, title: "Exercise 1.1: Names of fruits", question: "Create h1 to h6 tags to display fruit names.", expectedOutput: `<h1>Apple</h1><h2>Banana</h2><h3>Orange</h3><h4>Grape</h4><h5>Mango</h5><h6>Cherry</h6>`, testCases: [{ selector: 'h1', marks: 2 }, { selector: 'h2', marks: 2 }, { selector: 'h3', marks: 2 }, { selector: 'h4', marks: 2 }, { selector: 'h5', marks: 2 }, { selector: 'h6', marks: 2 }], topic: 'HTML Basics' },
    { id: 2, title: "Exercise 1.2: Describe family", question: "Family member names as headings with description paragraphs.", expectedOutput: `<h1>My Family</h1><h2>Father</h2><p>Description...</p>`, testCases: [{ selector: 'h1', marks: 1 }, { selector: 'h2', marks: 1 }, { selector: 'p', marks: 1 }], topic: 'HTML Basics' },
    { id: 3, title: "Exercise 1.3: Phone brands", question: "Ordered list of phone brands.", expectedOutput: `<ol><li>Apple</li><li>Samsung</li></ol>`, testCases: [{ selector: 'ol', marks: 1 }, { selector: 'li', marks: 1 }], topic: 'HTML Basics' },
    { id: 4, title: "Exercise 1.4: Unordered list of cars", question: "Unordered list of car models.", expectedOutput: `<ul><li>Tesla</li><li>BMW</li></ul>`, testCases: [{ selector: 'ul', marks: 1 }, { selector: 'li', marks: 1 }], topic: 'HTML Basics' },
    { id: 5, title: "Exercise 1.5: Soft drinks", question: "Definition list (dl, dt, dd) for soft drinks.", expectedOutput: `<dl><dt>Coke</dt><dd>Cola</dd></dl>`, testCases: [{ selector: 'dl', marks: 1 }, { selector: 'dt', marks: 1 }, { selector: 'dd', marks: 1 }], topic: 'HTML Basics' },
    { id: 6, title: "Exercise 1.6: Car Image", question: "Add an image of a car.", expectedOutput: `<img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70" alt="car" style="max-width: 100%; border-radius: 8px;" />`, testCases: [{ selector: 'img', marks: 5 }], topic: 'HTML Basics' },
    { id: 7, title: "Exercise 1.7: Table of people", question: "Table with Name, Age, City.", expectedOutput: `<table><tr><th>Name</th></tr><tr><td>John</td></tr></table>`, testCases: [{ selector: 'table', marks: 2 }, { selector: 'tr', marks: 2 }, { selector: 'td', marks: 2 }], topic: 'HTML Basics' },
    { id: 8, title: "Exercise 1.8: Links", question: "Links to YouTube and bitLabs.", expectedOutput: `<a href="https://youtube.com">YT</a>`, testCases: [{ selector: 'a', marks: 5 }], topic: 'HTML Basics' },
    { id: 9, title: "Exercise 1.9: Smartphone", question: "Heading, Image, and list of features.", expectedOutput: `<h1>Smartphone</h1><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70" alt="phone" style="max-width: 100%; border-radius: 8px;" /><ul><li>Amoled Display</li><li>5G Connectivity</li><li>Triple Camera</li></ul>`, testCases: [{ selector: 'h1', marks: 2 }, { selector: 'img', marks: 2 }, { selector: 'ul', marks: 2 }], topic: 'HTML Basics' },
    { id: 10, title: "Exercise 1.10: Sample Bill", question: "Table format for a sample bill.", expectedOutput: `<table><tr><td>Item</td><td>Price</td></tr></table>`, testCases: [{ selector: 'table', marks: 10 }], topic: 'HTML Basics' },

    // ─── CSS BASICS (Module 2: 2.1 - 2.6) ─────────────────────────────────────
    { id: 101, title: "Exercise 2.1: Inline Red Body", question: "Body with inline red color.", expectedOutput: `<body style="color: red;"><h1>This is red text</h1></body>`, testCases: [{ selector: 'body', marks: 5 }], topic: 'CSS Basics' },
    { id: 102, title: "Exercise 2.2: Internal Red Text", question: "Paragraph with red color using internal style.", expectedOutput: `<style>p{color:red;}</style><p>This paragraph should be red.</p>`, testCases: [{ selector: 'style', marks: 5 }], topic: 'CSS Basics' },
    { id: 103, title: "Exercise 2.3: External Styles", question: "Styled heading and paragraph.", expectedOutput: `<style>h1{color:blue;} p{color: green;}</style><h1>Blue Heading</h1><p>Green paragraph</p>`, testCases: [{ selector: 'h1', marks: 5 }], topic: 'CSS Basics' },
    { id: 104, title: "Exercise 2.4: ID and Class", question: "Use ID and Class selectors.", expectedOutput: `<style>#id1{color:red;} .cls1{color:blue;}</style><h1 id="id1">ID Selector</h1><p class="cls1">Class Selector</p>`, testCases: [{ selector: '#id1', marks: 5 }], topic: 'CSS Basics' },
    { id: 105, title: "Exercise 2.5: Descendant Selector", question: "Background color using descendant selector.", expectedOutput: `<style>ol li{background:yellow; padding: 5px; margin: 2px;}</style><ol><li>Item with yellow background</li></ol>`, testCases: [{ selector: 'ol li', marks: 5 }], topic: 'CSS Basics' },
    { id: 106, title: "Exercise 2.6: Pseudo-Selectors", question: "Hover effects on links.", expectedOutput: `<style>a:hover{color:orange; font-weight: bold;}</style><a href="#">Hover over me to see orange color</a>`, testCases: [{ selector: 'style', marks: 5 }], topic: 'CSS Basics' },

    // ─── CSS ADVANCED (Module 3: 3.1 - 3.8) ───────────────────────────────────
    { id: 201, title: "Exercise 3.1: Fruit Colors", question: "Color headings for fruits.", expectedOutput: `<style>.apple{color:red;} .banana{color:yellow; background: #333;}</style><h1 class="apple">Apple (Red)</h1><h1 class="banana">Banana (Yellow)</h1>`, testCases: [{ selector: 'style', marks: 5 }], topic: 'CSS Advanced' },
    { id: 202, title: "Exercise 3.2: Font Weight", question: "Heading font weight and size.", expectedOutput: `<style>h1{font-weight:bold; font-size: 48px;}</style><h1>Bold Large Heading</h1>`, testCases: [{ selector: 'h1', marks: 5 }], topic: 'CSS Advanced' },
    { id: 203, title: "Exercise 3.3: Class Attribute", question: "Apply style using class.", expectedOutput: `<style>.txt{color: purple; font-style: italic;}</style><p class="txt">Styled with class</p>`, testCases: [{ selector: '.txt', marks: 5 }], topic: 'CSS Advanced' },
    { id: 204, title: "Exercise 3.4: ID Attribute", question: "Apply style using ID.", expectedOutput: `<style>#id1{color: darkgreen; border: 2px solid green; padding: 10px;}</style><h1 id="id1">Styled with ID</h1>`, testCases: [{ selector: '#id1', marks: 5 }], topic: 'CSS Advanced' },
    { id: 205, title: "Exercise 3.5: Margin", question: "Apply margins using ID.", expectedOutput: `<style>#p1{margin: 50px; background: #eee; border: 1px solid #ccc;}</style><p id="p1">Paragraph with 50px margin</p>`, testCases: [{ selector: '#p1', marks: 5 }], topic: 'CSS Advanced' },
    { id: 206, title: "Exercise 3.6: Color with ID", question: "Change text color using ID.", expectedOutput: `<style>#p1{color:teal; font-size: 20px;}</style><p id="p1">Teal colored text</p>`, testCases: [{ selector: '#p1', marks: 5 }], topic: 'CSS Advanced' },
    { id: 207, title: "Exercise 3.7: Alignment", question: "Center and Right align text.", expectedOutput: `<style>.c{text-align:center; color: blue;} .r{text-align:right; color: red;}</style><h2 class="c">Centered Text</h2><h2 class="r">Right Aligned Text</h2>`, testCases: [{ selector: '.c', marks: 5 }], topic: 'CSS Advanced' },
    { id: 208, title: "Exercise 3.8: Styled Link", question: "Gray background for Google link.", expectedOutput: `<style>a{background:gray; color: white; padding: 10px; text-decoration: none; border-radius: 4px;}</style><a href="https://google.com">Visit Google</a>`, testCases: [{ selector: 'a', marks: 5 }], topic: 'CSS Advanced' },

    // ─── HTML FORMS (Module 4: 4.1 - 4.5) ─────────────────────────────────────
    { id: 301, title: "Exercise 4.1: Registration", question: "Registration form.", expectedOutput: `<form><input type="text" /></form>`, testCases: [{ selector: 'form', marks: 5 }], topic: 'HTML Forms' },
    { id: 302, title: "Exercise 4.2: Login", question: "Login form.", expectedOutput: `<form><input type="password" /></form>`, testCases: [{ selector: 'form', marks: 5 }], topic: 'HTML Forms' },
    { id: 303, title: "Exercise 4.3: Feedback", question: "Feedback form with textarea.", expectedOutput: `<form><textarea></textarea></form>`, testCases: [{ selector: 'textarea', marks: 5 }], topic: 'HTML Forms' },
    { id: 304, title: "Exercise 4.4: Survey", question: "Survey form with radio buttons.", expectedOutput: `<form><input type="radio" /></form>`, testCases: [{ selector: 'input[type="radio"]', marks: 5 }], topic: 'HTML Forms' },
    { id: 305, title: "Exercise 4.5: Contact", question: "Contact form with select dropdown.", expectedOutput: `<form><select><option>O</option></select></form>`, testCases: [{ selector: 'select', marks: 5 }], topic: 'HTML Forms' },

    // ─── PYTHON (Module 5: 401 - 411) ────────────────────────────────────────
    { id: 401, title: "Convert Distance", question: "Write program to convert the distance (in feet) to inches, yards, and miles.", expectedOutput: "Distance in feet : 5.0\nDistance in inches : 60.0\nDistance in yards : 1.6666666666666667\nDistance in miles : 0.000946969696969697", defaultCode: "# Input distance in feet\nfeet = float(input(\"Enter the distance in feet : \"))\n\n# Convert to inches, yards, and miles\n# ... code here ...\n", topic: 'Python', keywords: ['feet', 'float', 'input', 'print'] },
    { id: 402, title: "Total & Average Marks", question: "Write a python script to enter student number, name, marks in c, c++ and java calculate and display total marks, average, result and grade.", expectedOutput: "Enter Student Number: 101\nEnter Student Name: Sai Mani\nEnter C Marks: 85\nEnter C++ Marks: 90\nEnter Java Marks: 88\n\nTotal Marks: 263\nAverage: 87.67\nResult: Pass\nGrade: A", defaultCode: "# Enter student details\nstudent_no = input(\"Enter Student Number: \")\nname = input(\"Enter Student Name: \")\n\n# Enter marks\nc_marks = float(input(\"Enter C Marks: \"))\ncpp_marks = float(input(\"Enter C++ Marks: \"))\njava_marks = float(input(\"Enter Java Marks: \"))\n\n# Calculate total, average, result and grade\n# ... code here ...\n", topic: 'Python', keywords: ['input', 'print', 'c++', 'java', 'marks'] },
    { id: 403, title: "Calculate Interest", question: "Write a program which asks for initial balance and interest rate and calculates the capital after n years using loop.", expectedOutput: "Initial balance: 1000\nInterest rate: 10\nNumber of years: 3\n\n1100\n1210\n1331", defaultCode: "balance = float(input(\"Initial balance: \"))\nrate = float(input(\"Interest rate: \"))\nyears = int(input(\"Number of years: \"))\n\n# Calculate capital for each year\n# ... code here ...\n", topic: 'Python', keywords: ['for', 'while', 'print'] },
    { id: 404, title: "Tuple", question: "Sort tuples using last element.", expectedOutput: "[(2, 1), (1, 2), (2, 3), (4, 4), (2, 5)]", defaultCode: "data = [(2, 5), (1, 2), (4, 4), (2, 3), (2, 1)]\n\n# Sort the list of tuples based on the second element\n# ... code here ...\n", topic: 'Python', keywords: ['sort', 'lambda'] },
    { id: 405, title: "Remove Dups", question: "Remove duplicates from list while preserving order.", expectedOutput: "[12, 24, 35, 88, 120, 155]", defaultCode: "items = [12, 24, 35, 24, 88, 120, 155, 88, 120, 155]\n\n# Create a new list without duplicates\n# ... code here ...\n", topic: 'Python', keywords: ['set', 'list', 'append'] },
    { id: 406, title: "Capitalize", question: "Convert all input lines to uppercase.", expectedOutput: "HELLO WORLD\nPRACTICE MAKES PERFECT", defaultCode: "lines = []\nprint(\"Enter lines (empty line to stop):\")\nwhile True:\n    # ... read and process lines ...\n    pass\n", topic: 'Python', keywords: ['upper', 'input'] },
    { id: 407, title: "Conditional Capitalize", question: "Implement preLetterCase(string, letter)", expectedOutput: "preLetterCase(\"CAtCHa\",\"a\") → \"cATCHA\"", defaultCode: "def preLetterCase(string, letter):\n    # if string starts with letter, convert all to uppercase\n    # otherwise convert all to lowercase\n    pass\n", topic: 'Python', keywords: ['def', 'return', 'if'] },
    { id: 408, title: "Hypotenuse", question: "Calculate hypotenuse using math module.", expectedOutput: "Hypotenuse: 5.0", defaultCode: "import math\na = 3\nb = 4\n\n# Calculate hypotenuse c = sqrt(a^2 + b^2)\n# ... code here ...\n", topic: 'Python', keywords: ['import', 'math', 'sqrt'] },
    { id: 409, title: "Student Roster", question: "Create Student class with attributes and display values.", expectedOutput: "Student ID: M11\nStudent Name: Anusha Rao", defaultCode: "class Student:\n    def __init__(self, id, name):\n        # ... initialize ...\n        pass\n\n# Create and display student\n", topic: 'Python', keywords: ['class', 'def', '__init__'] },
    { id: 410, title: "Animal Counts", question: "Use try/except while summing dictionary values.", expectedOutput: "Total number of puppies:130", defaultCode: "animals = {'puppies': 70, 'kittens': 60}\n\ntry:\n    # ... sum logic ...\n    pass\nexcept Exception as e:\n    print(e)\n", topic: 'Python', keywords: ['try', 'except', 'print'] },
    { id: 411, title: "Shape", question: "Create Shape and Square class with area method.", expectedOutput: "test_result_area: 25\ntest_result_parent: true", defaultCode: "class Shape:\n    def area(self): return 0\n\nclass Square(Shape):\n    # ... override area ...\n    pass\n", topic: 'Python', keywords: ['class', 'def', 'super'] },

    // ─── SQL (Module 6) ────────────────────────────────────────

    // Employee Table
    { id: 5011, title: "Create Table", question: "Write a SQL query to create a table called Employee that contains five columns as emp_id, emp_name, emp_dept, emp_phoneno, emp_address.", expectedOutput: "Table created", defaultCode: "-- Write your query here\n", topic: 'Employee Table', keywords: ['CREATE', 'TABLE', 'Employee'] },
    { id: 5012, title: "Add Column", question: "Write a SQL query to add the new column as joining_date in Employee table.", expectedOutput: "Column added", defaultCode: "-- Write your query here\n", topic: 'Employee Table', keywords: ['ALTER', 'TABLE', 'ADD'] },
    { id: 5013, title: "Change Datatype", question: "Write a SQL query to change the datatype of a emp_phoneno in Employee table.", expectedOutput: "Datatype changed", defaultCode: "-- Write your query here\n", topic: 'Employee Table', keywords: ['ALTER', 'TABLE'] },
    { id: 5014, title: "Delete Data", question: "Write a SQL query to delete the data inside the Employee table, but not table itself.", expectedOutput: "Data deleted", defaultCode: "-- Write your query here\n", topic: 'Employee Table', keywords: [['DELETE'], ['TRUNCATE']] },
    { id: 5015, title: "Drop Column", question: "Write a SQL query to drop a emp_phoneno from employee table.", expectedOutput: "Column dropped", defaultCode: "-- Write your query here\n", topic: 'Employee Table', keywords: ['ALTER', 'TABLE', 'DROP'] },

    // Employee Data
    { id: 5021, title: "Insert Records", question: "Write a query to insert 10 records into the Employee table.", expectedOutput: "10 records inserted", defaultCode: "-- Write your query here\n", topic: 'Employee Data', keywords: ['INSERT', 'INTO'] },
    { id: 5022, title: "Update Address", question: "Write a query to update emp_address to hyderabad, joiningdate to 12-02-2022 in Employee table where employee_id=123.", expectedOutput: "Record updated", defaultCode: "-- Write your query here\n", topic: 'Employee Data', keywords: ['UPDATE', 'SET', 'WHERE'] },
    { id: 5023, title: "Select specific employee", question: "Write a query to get the employee information from Employee table whose emp_id is 101", expectedOutput: "Employee details", defaultCode: "-- Write your query here\n", topic: 'Employee Data', keywords: ['SELECT', 'WHERE'] },
    { id: 5024, title: "Filter by name", question: "Write the query to select all the employees whose name ends with 'a'", expectedOutput: "Employee details", defaultCode: "-- Write your query here\n", topic: 'Employee Data', keywords: ['SELECT', 'LIKE'] },
    { id: 5025, title: "Update Department", question: "Write a query to update employee deptname as 'IT' of Employee table where emp_id is 121", expectedOutput: "Record updated", defaultCode: "-- Write your query here\n", topic: 'Employee Data', keywords: ['UPDATE', 'SET', 'WHERE'] },

    // Employee & Sales
    { id: 5031, title: "Constraints - Employee", question: "Write a SQL query to create a table called Employee that contains five columns as emp_id, emp_name, emp_dept, emp_phoneno, emp_address and apply not null constraint on emp_phoneno, emp_dept and primary key constraint on emp_id columns.", expectedOutput: "Table created", defaultCode: "-- Write your query here\n", topic: 'Employee & Sales', keywords: ['CREATE', 'TABLE', 'PRIMARY KEY'] },
    { id: 5032, title: "Constraints - Salespeople", question: "Write a SQL query to create a table called Salespeople that contains four columns as sid, sname, city, mobile and apply primary key constraint on sid and unique constraint on mobile number columns.", expectedOutput: "Table created", defaultCode: "-- Write your query here\n", topic: 'Employee & Sales', keywords: ['CREATE', 'TABLE', 'UNIQUE'] },
    { id: 5033, title: "Constraints - Orders", question: "Write a SQL query to create a table called orders that contains four columns as oid, order_amt, Order_date, customer_id and apply following constraints: a) PK on oid, b) Not null on order_date, c) unique on customer_id, d) default order_amt is 0", expectedOutput: "Table created", defaultCode: "-- Write your query here\n", topic: 'Employee & Sales', keywords: ['CREATE', 'TABLE', 'DEFAULT'] },
    { id: 5034, title: "Foreign Key", question: "Write SQL queries to create Salespeople (Snum,Sname,city,mobile) and Customer (cid,cname,city,rating,Snum) where Snum is foreign key in customer table.", expectedOutput: "Tables created", defaultCode: "-- Write your query here\n", topic: 'Employee & Sales', keywords: ['CREATE', 'TABLE', 'FOREIGN KEY'] },
    { id: 5035, title: "Check Constraint", question: "Write a SQL query to create a table called Students with Sid, sname, city, marks, mobile. Apply PK on Sid and Check constraint for marks > 60.", expectedOutput: "Table created", defaultCode: "-- Write your query here\n", topic: 'Employee & Sales', keywords: ['CREATE', 'TABLE', 'CHECK'] },

    // Customer Sales
    { id: 5041, title: "Filter by City & Comm", question: "Write a SQL query to get salespeople whose city is London and comm is more than 0.12.", expectedOutput: "Salespeople data", defaultCode: "-- Write your query here\n", topic: 'Customer Sales', keywords: ['SELECT', 'WHERE', 'AND'] },
    { id: 5042, title: "Filter multiple cities", question: "Write a SQL query to get salespeople from San Jose and London cities.", expectedOutput: "Salespeople data", defaultCode: "-- Write your query here\n", topic: 'Customer Sales', keywords: ['SELECT', 'IN'] },
    { id: 5043, title: "Filter starts with", question: "Write a SQL query to get customer information whose customer name starts with c.", expectedOutput: "Customer data", defaultCode: "-- Write your query here\n", topic: 'Customer Sales', keywords: ['SELECT', 'LIKE'] },
    { id: 5044, title: "Filter contains & Rating", question: "Write a SQL query to get customer information whose customer name contains 'a' and rating is more than 150.", expectedOutput: "Customer data", defaultCode: "-- Write your query here\n", topic: 'Customer Sales', keywords: ['SELECT', 'LIKE', 'AND'] },
    { id: 5045, title: "Filter by Date", question: "Write a SQL query to get all the orders on 2022-01-13.", expectedOutput: "Order data", defaultCode: "-- Write your query here\n", topic: 'Customer Sales', keywords: ['SELECT', 'WHERE'] },
    { id: 5046, title: "Filter by Amount", question: "Write a SQL query to get all the orders whose order amount is more than 200", expectedOutput: "Order data", defaultCode: "-- Write your query here\n", topic: 'Customer Sales', keywords: ['SELECT', 'WHERE'] },

    // Student
    { id: 5051, title: "Filter by Age", question: "Write a query to select student names from Student table whose age is greater than 10.", expectedOutput: "Student data", defaultCode: "-- Write your query here\n", topic: 'Student', keywords: ['SELECT', 'WHERE'] },
    { id: 5052, title: "Update Student Name", question: "Write a query to update sname as 'Vikas' of Student table where student_id is 4.", expectedOutput: "Record updated", defaultCode: "-- Write your query here\n", topic: 'Student', keywords: ['UPDATE', 'SET', 'WHERE'] },
    { id: 5053, title: "Filter by Range", question: "Write a query to select all columns of Student table where student_id is from 1 to 3", expectedOutput: "Student data", defaultCode: "-- Write your query here\n", topic: 'Student', keywords: ['SELECT', 'BETWEEN'] },
    { id: 5054, title: "Delete by Name", question: "Write the query to delete the records from Student table whose sname contains 'V'.", expectedOutput: "Records deleted", defaultCode: "-- Write your query here\n", topic: 'Student', keywords: ['DELETE', 'WHERE', 'LIKE'] },

    // Customer Table
    { id: 5061, title: "Not Equal Filter", question: "Write the query to display customer details whose sales_number is not equal to 1002.", expectedOutput: "Customer data", defaultCode: "-- Write your query here\n", topic: 'Customer Table', keywords: ['SELECT', 'WHERE'] },
    { id: 5062, title: "Group & Having", question: "Write the query to display customer names with min ratings of each customer group by customer names having sum of ratings greater than 600.", expectedOutput: "Grouped data", defaultCode: "-- Write your query here\n", topic: 'Customer Table', keywords: ['GROUP BY', 'HAVING', 'MIN', 'SUM'] },
    { id: 5063, title: "Count & Having", question: "Write the query to display the customer names when customer_id count based the city and having customer_id count greater than 5.", expectedOutput: "Grouped data", defaultCode: "-- Write your query here\n", topic: 'Customer Table', keywords: ['COUNT', 'GROUP BY', 'HAVING'] },
    { id: 5064, title: "Order By", question: "Write the query to display customer details in the order of cites in decrementing order.", expectedOutput: "Ordered data", defaultCode: "-- Write your query here\n", topic: 'Customer Table', keywords: ['ORDER BY', 'DESC'] },
    { id: 5065, title: "Limit Results", question: "Write the query to display customer details with the limit of 4.", expectedOutput: "Limited data", defaultCode: "-- Write your query here\n", topic: 'Customer Table', keywords: ['LIMIT'] },

    // Sales, Customers & Orders
    { id: 5071, title: "Self Join", question: "Write a query that produces all pairs of salespeople with themselves as well as duplicate rows with the order reversed.", expectedOutput: "Pairs of salespeople", defaultCode: "-- Write your query here\n", topic: 'Sales, Customers & Orders', keywords: ['SELECT', 'FROM'] },
    { id: 5072, title: "Customer Self Join", question: "Write a query that joins the Customer table to itself to find all pairs of customers served by a single salesperson.", expectedOutput: "Pairs of customers", defaultCode: "-- Write your query here\n", topic: 'Sales, Customers & Orders', keywords: ['JOIN', 'ON'] },
    { id: 5073, title: "Join Orders & Customer", question: "Write a query that lists each order number followed by the name of the customer who made that order.", expectedOutput: "Order and Customer", defaultCode: "-- Write your query here\n", topic: 'Sales, Customers & Orders', keywords: ['JOIN', 'ON'] },
    { id: 5074, title: "Create View", question: "Write a query to create a view with order num, order amount, customer id and customer name, and display all the fields whose order amount is highest from the view table", expectedOutput: "View created and queried", defaultCode: "-- Write your query here\n", topic: 'Sales, Customers & Orders', keywords: ['CREATE', 'VIEW'] },

    // Customer Sub-queries
    { id: 5081, title: "Sub-query 1", question: "Find all rows from the Customers table for which the salesperson number is 1001.", expectedOutput: "Customer data", defaultCode: "-- Write your query here\n", topic: 'Customer Sub-queries', keywords: ['SELECT', 'WHERE'] },
    { id: 5082, title: "Sub-query 2", question: "Write a query that produces all pairs of orders by a given customer. Name that customer and eliminate duplicates.", expectedOutput: "Pairs of orders", defaultCode: "-- Write your query here\n", topic: 'Customer Sub-queries', keywords: ['SELECT', 'DISTINCT'] },
    { id: 5083, title: "Sub-query 3", question: "Find the total amount in Orders for each salesperson for whom this total is greater than the amount of the largest order in the table.", expectedOutput: "Total amounts", defaultCode: "-- Write your query here\n", topic: 'Customer Sub-queries', keywords: ['SUM', 'GROUP BY', 'HAVING'] },
    { id: 5084, title: "Sub-query 4", question: "Write a query that produces the names and ratings of all customers of all who have above average orders.", expectedOutput: "Customer data", defaultCode: "-- Write your query here\n", topic: 'Customer Sub-queries', keywords: ['SELECT', 'AVG'] },

    // Banks
    { id: 5091, title: "Transaction 1", question: "Write a query to start a transaction where ICICI bank should be credited with 50% of amount from Haiyathi’s account.", expectedOutput: "Transaction started", defaultCode: "-- Write your query here\n", topic: 'Banks', keywords: ['BEGIN', 'UPDATE'] },
    { id: 5092, title: "Transaction 2", question: "Write a query to start a transaction that all the customers should be credited with 10.6% bonus to their account from the SBI and PNB banks.", expectedOutput: "Transaction started", defaultCode: "-- Write your query here\n", topic: 'Banks', keywords: ['BEGIN', 'UPDATE'] },
    { id: 5093, title: "Commit", question: "Write a query to save both the transactions and display all the fields from both the tables.", expectedOutput: "Transactions saved", defaultCode: "-- Write your query here\n", topic: 'Banks', keywords: ['COMMIT'] },
    { id: 5094, title: "Rollback", question: "Write a query to uncommit the transaction where all the customers who got 10.6% of bonus to their account from the SBI and PNB banks.", expectedOutput: "Transaction rolled back", defaultCode: "-- Write your query here\n", topic: 'Banks', keywords: ['ROLLBACK'] }
];

/** SQL Output Panel — renders structured sql.js results */
const SqlOutputPanel = ({ sqlResult, submittedCode, isRunning }) => {
    if (isRunning) {
        return <div className="sql-output-panel"><div className="sql-running-indicator">⏳ Executing SQL...</div></div>;
    }
    if (!sqlResult) {
        return <div className="sql-output-panel sql-empty"><span>▶ Run your SQL query to see results here.</span></div>;
    }
    console.log('SqlOutputPanel sqlResult:', sqlResult);
    return (
        <div className="sql-output-panel">
            <div className="sql-section">
                <div className="sql-section-label">
                    {isRunning ? '⏳ Executing SQL...' : sqlResult?.success ? '✅ Execution Output' : '❌ Execution Error'}
                </div>
                {/* Render statements if present, else fallback */}
                {sqlResult && sqlResult.statements && sqlResult.statements.length > 0 ? (
                    sqlResult.statements.map((stmt, idx) => (
                        <div key={idx} className="sql-stmt-block">
                            <div className="sql-stmt-message">{stmt.message}</div>
                            {stmt.columns && stmt.columns.length > 0 && (
                                <div className="sql-table-wrapper">
                                    <table className="sql-result-table">
                                        <thead>
                                            <tr>{stmt.columns.map((col, ci) => <th key={ci}>{col}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {stmt.rows && stmt.rows.length > 0 ? (
                                                stmt.rows.map((row, ri) => (
                                                    <tr key={ri}>
                                                        {row.map((cell, ci) => (
                                                            <td key={ci}>{cell == null ? <span className="sql-null">NULL</span> : String(cell)}</td>
                                                        ))}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={stmt.columns.length} className="sql-no-rows">No rows returned</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    // Fallback for engines that return rows directly (e.g., sqlResult.columns && sqlResult.rows)
                    sqlResult && sqlResult.success && sqlResult.columns ? (
                        <div className="sql-table-wrapper">
                            <table className="sql-result-table">
                                <thead>
                                    <tr>{sqlResult.columns.map((col, ci) => <th key={ci}>{col}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {sqlResult.rows && sqlResult.rows.length > 0 ? (
                                        sqlResult.rows.map((row, ri) => (
                                            <tr key={ri}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci}>{cell == null ? <span className="sql-null">NULL</span> : String(cell)}</td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={sqlResult.columns.length} className="sql-no-rows">No rows returned</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="sql-error-box">
                            <span className="sql-error-icon">⚠</span>
                            <pre className="sql-error-text">{sqlResult?.error || 'No result available.'}</pre>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const ErrorModal = ({ errors, onClose }) => (
    <div className="ae-error-modal-overlay">
        <div className="ae-error-modal">
            <div className="ae-error-header"><h3>Submission Error</h3><button className="ae-error-close" onClick={onClose}>×</button></div>
            <div className="ae-error-content"><span className="ae-error-warning-icon">⚠️</span><p className="ae-error-main-msg">“Your code is not correct.”</p><div className="ae-error-details-box">{errors.map((err, idx) => (<div key={idx} className="ae-error-item"><div>{err.message}</div></div>))}</div></div>
            <div className="ae-error-footer"><button className="ae-error-btn-ok" onClick={onClose}>Understood</button></div>
        </div>
    </div>
);

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
};

const AssignmentEditor = ({ assignmentType, onClose, applicantId, onNavigate, onNextTopic }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [code, setCode] = useState('');
    const [liveOutput, setLiveOutput] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [submissionErrors, setSubmissionErrors] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false); // Track if already completed in backend
    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(false);
    const [sqlResult, setSqlResult] = useState(null);
    const [sqlRunning, setSqlRunning] = useState(false);
    const [sqlEngineReady, setSqlEngineReady] = useState(false);
    const [completedIds, setCompletedIds] = useState(() => {
        try {
            const saved = localStorage.getItem(`completed_assignments_${applicantId}`);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });
    const submissionsMapRef = useRef({});

    // Compute filtered assignments and current assignment before using in effects
    const filteredAssignments = useMemo(() => {
        const filtered = ASSIGNMENTS.filter(a => {
            if (assignmentType === 'html') return a.topic === 'HTML Basics';
            if (assignmentType === 'styling') return a.topic === 'CSS Basics';
            if (assignmentType === 'styling2') return a.topic === 'CSS Advanced';
            if (assignmentType === 'forms') return a.topic === 'HTML Forms';
            if (assignmentType?.startsWith('python')) return a.topic === 'Python';
            if (assignmentType === 'employee_table') return a.topic === 'Employee Table';
            if (assignmentType === 'employee_data') return a.topic === 'Employee Data';
            if (assignmentType === 'employee_sales') return a.topic === 'Employee & Sales';
            if (assignmentType === 'customer_sales') return a.topic === 'Customer Sales';
            if (assignmentType === 'student') return a.topic === 'Student';
            if (assignmentType === 'customer_table') return a.topic === 'Customer Table';
            if (assignmentType === 'sales_customers_orders') return a.topic === 'Sales, Customers & Orders';
            if (assignmentType === 'customer_sub_queries') return a.topic === 'Customer Sub-queries';
            if (assignmentType === 'banks') return a.topic === 'Banks';
            return true;
        });
        console.log('[AssignmentEditor] Filtered Topic Assignments:', filtered.length);
        return filtered;
    }, [assignmentType]);

    const currentAssignment = useMemo(() => filteredAssignments[currentIndex] || filteredAssignments[0] || ASSIGNMENTS[0], [currentIndex, filteredAssignments]);

    const activeAssignmentIdRef = useRef(ASSIGNMENTS[0].id);
    const isNavigatingRef = useRef(false);

    useEffect(() => {
        const loadPyodideRuntime = async () => {
            if (!pyodide && !pyodideLoading) {
                setPyodideLoading(true);
                try {
                    console.log('[AssignmentEditor] Loading Pyodide loader script dynamically...');
                    await loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js');

                    if (window.loadPyodide) {
                        console.log('[AssignmentEditor] Initializing Pyodide Wasm instance...');
                        const instance = await window.loadPyodide();
                        setPyodide(instance);
                        console.log('[AssignmentEditor] Pyodide initialized successfully.');
                    } else {
                        throw new Error('window.loadPyodide is not defined after script load.');
                    }
                } catch (e) {
                    console.error('[AssignmentEditor] Pyodide dynamic loading/initialization error:', e);
                } finally {
                    setPyodideLoading(false);
                }
            }
        };

        if (currentAssignment.topic === 'Python') {
            loadPyodideRuntime();
        }
    }, [currentAssignment.topic, pyodide, pyodideLoading]);

    // Initialize SqlEngine when a SQL topic is active
    useEffect(() => {
        if (!isSqlTopic(currentAssignment.topic)) return;
        const engine = SqlEngine.getInstance();
        if (engine.isReady) { setSqlEngineReady(true); return; }
        engine.init()
            .then(() => setSqlEngineReady(true))
            .catch(err => console.error('[AssignmentEditor] SqlEngine init error:', err));
    }, [currentAssignment.topic]);

    // Reset SQL result when navigating between assignments
    useEffect(() => {
        setSqlResult(null);
    }, [currentAssignment.id]);

    // Keep localStorage in sync
    useEffect(() => {
        if (applicantId && completedIds.size > 0) {
            localStorage.setItem(`completed_assignments_${applicantId}`, JSON.stringify(Array.from(completedIds)));
        }
    }, [completedIds, applicantId]);

    const executeSqlWithReplay = useCallback(async (targetCode, targetId) => {
        const engine = SqlEngine.getInstance();
        if (!engine.isReady) await engine.init();
        engine.reset(); // Reset DB to clean state

        // Replay all completed SQL assignments before targetId in chronological order
        const sqlAssignments = ASSIGNMENTS.filter(a => isSqlTopic(a.topic));
        for (const a of sqlAssignments) {
            if (a.id < targetId) {
                const prevCode = submissionsMapRef.current[a.id];
                if (prevCode) {
                    console.log(`[SqlReplay] Replaying assignment ${a.id} (${a.title})...`);
                    engine.execute(prevCode);
                }
            }
        }

        console.log(`[SqlReplay] Executing target assignment ${targetId}...`);
        return engine.execute(targetCode);
    }, []);

    const fetchSavedCodeFromBackend = useCallback(async (index) => {
        if (!applicantId) {
            console.log('[AssignmentEditor] No applicantId, skipping fetch');
            return;
        }
        const target = filteredAssignments[index] || filteredAssignments[0];
        if (!target) return;
        const assignmentId = target.id;

        console.log(`[AssignmentEditor] Current assignment ID: ${assignmentId}`);

        setCode('');
        setLiveOutput('');
        setValidationResult(null);
        setLoading(true);

        try {
            const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8081'}/api/assignments/${applicantId}/${assignmentId}`;
            console.log(`[AssignmentEditor] Fetch API URL: ${API_URL}`);

            const data = await getSubmittedAssignment(applicantId, assignmentId);
            console.log('[AssignmentEditor] Raw Backend response:', data);

            let backendCode = null;
            if (data) {
                backendCode = data.assignmentCode || data.assignment_code || data.code;
            }

            if (activeAssignmentIdRef.current === assignmentId) {
                if (backendCode !== null && backendCode !== undefined) {
                    const finalCode = String(backendCode);
                    setCode(finalCode);
                    const isSQL = isSqlTopic(target.topic);
                    if (isSQL) {
                        submissionsMapRef.current[assignmentId] = finalCode;
                    }
                    const isPython = target.topic === 'Python';
                    let validation = null;
                    if (isPython) {
                        if (pyodide) {
                            validation = await AssignmentValidator.validatePython(pyodide, finalCode, target.id);
                            // Display execution output for Python
                            setLiveOutput(`>>> Previous Submission Execution:\n\n${validation.executionOutput || "Code executed successfully with no output."}`);
                        } else {
                            validation = { isValid: true, details: ["Loaded previous submission."], results: [] };
                            setLiveOutput(">>> Python runtime is loading... Please wait.");
                        }
                    } else if (isSQL) {
                        try {
                            const execResult = await executeSqlWithReplay(finalCode, target.id);
                            setSqlResult(execResult);
                            validation = {
                                isValid: execResult.success,
                                details: execResult.success ? [execResult.summary || 'Query executed successfully'] : [execResult.error || 'SQL error'],
                                results: []
                            };
                        } catch (sqlErr) {
                            validation = { isValid: true, details: ["Loaded previous submission."], results: [] };
                        }
                    } else {
                        validation = AssignmentValidator.validate(finalCode, target.testCases, target.expectedOutput);
                        // Display the code for HTML/CSS
                        setLiveOutput(finalCode);
                    }

                    setValidationResult(validation);
                    setIsSubmitted(true);
                    setIsCompleted(true);
                    // Ensure this dot stays green since it exists in the database
                    setCompletedIds(prev => new Set(prev).add(assignmentId));
                } else {
                    const template = isHtmlTopic(target.topic)
                        ? `<!DOCTYPE html>\n<html>\n<head>\n    <title>${target.title}</title>\n</head>\n<body>\n\n    <!-- Write code for ${target.title} here -->\n\n</body>\n</html>`
                        : (target.defaultCode || "");
                    console.log('[AssignmentEditor] No submission found. Loading default template.');
                    setCode(template);
                    setLiveOutput(isHtmlTopic(target.topic) ? template : '');
                    setIsSubmitted(false);
                    setIsCompleted(false);
                }
            }
        } catch (e) {
            console.error('[AssignmentEditor] Fetch Error:', e);
            const template = isHtmlTopic(target?.topic)
                ? `<!DOCTYPE html>\n<html>\n<body>\n    <!-- Template Fallback -->\n</body>\n</html>`
                : (target?.defaultCode || '-- Write your query here\n');
            setCode(template);
            setLiveOutput(isHtmlTopic(target?.topic) ? template : '');
            setIsSubmitted(false);
            setIsCompleted(false);
        } finally {
            setLoading(false);
            isNavigatingRef.current = false;
        }
    }, [applicantId, filteredAssignments, executeSqlWithReplay]);

    const performNavigation = useCallback((newIndex) => {
        isNavigatingRef.current = true;
        const targetAssignment = filteredAssignments[newIndex];
        activeAssignmentIdRef.current = targetAssignment.id;
        setCurrentIndex(newIndex);

        if (onNavigate) onNavigate(targetAssignment.id);
    }, [filteredAssignments, onNavigate]);

    const handleNextAssignment = useCallback(() => {
        if (currentAssignment.topic === 'Python') {
            if (onNextTopic) onNextTopic();
            else if (onClose) onClose();
        } else {
            if (currentIndex < filteredAssignments.length - 1) performNavigation(currentIndex + 1);
        }
    }, [currentIndex, filteredAssignments, performNavigation, currentAssignment, onNextTopic, onClose]);

    const handlePrevAssignment = useCallback(() => {
        if (currentIndex > 0) performNavigation(currentIndex - 1);
    }, [currentIndex, performNavigation]);

    const handleBack = () => {
        const isHtmlCssTopic = isHtmlTopic(currentAssignment.topic);

        if (isHtmlCssTopic) {
            if (currentIndex === 0) {
                if (onClose) {
                    onClose();
                    return;
                }
            } else {
                performNavigation(0);
                return;
            }
        }

        if (onClose) onClose();
    };

    const handleCodeChange = (newCode) => {
        if (isNavigatingRef.current) return;
        setCode(newCode);
        setIsSubmitted(false);
        setValidationResult(null);
    };

    const handleClear = () => {
        const template = isHtmlTopic(currentAssignment.topic)
            ? `<!DOCTYPE html>\n<html>\n<head>\n    <title>${currentAssignment.title}</title>\n</head>\n<body>\n\n    <!-- Write code for ${currentAssignment.title} here -->\n\n</body>\n</html>`
            : (currentAssignment.defaultCode || '');
        setCode(template);
        setLiveOutput('');
        setIsSubmitted(false);
        setValidationResult(null);
    };

    useEffect(() => {
        const init = async () => {
            if (!applicantId) return;
            setLoading(true);
            try {
                const filtered = filteredAssignments;
                let targetIdx = 0;

                // Fetch ALL submissions to show progress buttons
                const allSubmissions = await getAllAssignmentsByApplicant(applicantId).catch(() => null);
                if (allSubmissions && Array.isArray(allSubmissions)) {
                    const ids = new Set();
                    const subMap = {};
                    allSubmissions.forEach(s => {
                        const status = (s.status || s.assignmentStatus || s.assignment_status || "").toUpperCase();
                        const codeVal = s.assignmentCode || s.assignment_code || s.code || s.submittedCode;
                        const hasCode = !!codeVal;
                        const assId = Number(s.assignmentNumber || s.assignment_number || s.id || s.assignmentId || s.assignment_id);
                        if (status === 'COMPLETED' || status === 'SUBMITTED' || hasCode) {
                            ids.add(assId);
                        }
                        if (codeVal) {
                            subMap[assId] = codeVal;
                        }
                    });
                    console.log('[AssignmentEditor] Found completed IDs in DB:', Array.from(ids));
                    setCompletedIds(ids);
                    submissionsMapRef.current = subMap;
                }

                // Start at the correct index based on assignmentType (e.g. 'python2' -> index 1)
                if (assignmentType?.startsWith('python')) {
                    const match = assignmentType.match(/python(\d+)/);
                    if (match) {
                        const num = parseInt(match[1]);
                        if (!isNaN(num)) targetIdx = num - 1;
                    }
                } else {
                    targetIdx = 0;
                }
                console.log(`[AssignmentEditor] Initializing with topic index ${targetIdx} (ID: ${filtered[targetIdx].id})`);
                activeAssignmentIdRef.current = filtered[targetIdx].id;

                if (currentIndex === targetIdx) {
                    fetchSavedCodeFromBackend(targetIdx);
                } else {
                    setCurrentIndex(targetIdx);
                }
            } catch (e) {
                console.error('[AssignmentEditor] Init Error:', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [applicantId, assignmentType]);

    // Main synchronization effect: When index changes (via navigation or init), fetch the code.
    // This ensures persistence works on Refresh, Previous, and Next.
    useEffect(() => {
        fetchSavedCodeFromBackend(currentIndex);
    }, [currentIndex, fetchSavedCodeFromBackend, pyodide]);

    const handleRun = async () => {
        const isSQL = isSqlTopic(currentAssignment.topic);
        if (currentAssignment.topic === 'Python') {
            if (!pyodide) {
                setLiveOutput("Python runtime is loading... Please wait.");
                return;
            }
            setLiveOutput(`>>> Executing ${currentAssignment.title}...\n`);
            try {
                const validation = await AssignmentValidator.validatePython(pyodide, code, currentAssignment.id);
                if (validation.errors && validation.errors.length > 0 && validation.errors[0].type === 'Runtime Error') {
                    setLiveOutput(`>>> Executing ${currentAssignment.title}...\n\nRuntime Error:\n${validation.errors[0].message}`);
                } else {
                    setLiveOutput(`>>> Executing ${currentAssignment.title}...\n\n${validation.executionOutput || "Code executed successfully with no output."}\n\n>>> Execution finished successfully.`);
                }
            } catch (err) {
                setLiveOutput(`Error executing code:\n${err.message}`);
            }
        } else if (isSQL) {
            setSqlRunning(true);
            try {
                const execResult = await executeSqlWithReplay(code, currentAssignment.id);
                setSqlResult(execResult);
                if (execResult.success) {
                    setLiveOutput(`✓ SQL query accepted.\nSummary:\n${execResult.summary}`);
                } else {
                    setLiveOutput(`❌ SQL Error:\n${execResult.error}`);
                }
            } catch (err) {
                setLiveOutput(`Error executing query: ${err.message}`);
            } finally {
                setSqlRunning(false);
            }
        } else {
            setLiveOutput(code);
        }
        setIsSubmitted(false);
    };

    const handleSubmit = async () => {
        const isPython = currentAssignment.topic === 'Python';
        const isSQL = isSqlTopic(currentAssignment.topic);

        let result;
        if (isPython) {
            if (!pyodide) {
                setSubmissionErrors([{ message: 'Python runtime is still loading. Please wait.' }]);
                setShowErrorModal(true);
                return;
            }
            result = await AssignmentValidator.validatePython(pyodide, code, currentAssignment.id);
        } else if (isSQL) {
            try {
                const execResult = await executeSqlWithReplay(code, currentAssignment.id);
                setSqlResult(execResult);
                if (!execResult.success) {
                    result = {
                        isValid: false,
                        details: [execResult.error || 'SQL syntax error.'],
                        errors: [{ type: 'SQL Error', message: execResult.error || 'SQL syntax error.', line: 'N/A' }]
                    };
                } else {
                    result = AssignmentValidator.validateSQL(code, currentAssignment.keywords, currentAssignment.expectedOutput);
                }
            } catch (err) {
                result = {
                    isValid: false,
                    details: [err.message],
                    errors: [{ type: 'SQL Error', message: err.message, line: 'N/A' }]
                };
            }
        } else {
            result = AssignmentValidator.validate(code, currentAssignment.testCases, currentAssignment.expectedOutput);
        }

        setValidationResult(result);
        setIsSubmitted(true);
        if (!result.isValid) { setSubmissionErrors(result.errors || []); setShowErrorModal(true); return; }

        try {
            await submitAssignment({ applicantId: applicantId || 101, assignmentNumber: currentAssignment.id, assignmentCode: code, status: 'COMPLETED' });

            if (isSQL) {
                submissionsMapRef.current[currentAssignment.id] = code;
            }
            setShowSuccessModal(true);
            setCompletedIds(prev => new Set(prev).add(currentAssignment.id));
            setTimeout(() => setShowSuccessModal(false), 3500);
            window.dispatchEvent(new CustomEvent('assignmentCompleted', { detail: { assignmentId: currentAssignment.id } }));
        } catch (e) {
            setSubmissionErrors([{ message: e.message || 'Submit Failed' }]);
            setShowErrorModal(true);
        }
    };


    return (
        <div className="assignment-editor">
            <div className="ae-header">
                <button className="ae-back-btn" onClick={handleBack}>← Back</button>
                <div className="ae-title-section"><h2>{currentAssignment.title}</h2><span className="ae-badge">{currentAssignment.topic}</span></div>
                {currentAssignment.topic !== 'Python' && (
                    <div className="ae-progress">
                        <div className="ae-nav-dots">
                            {filteredAssignments.map((a, tIdx) => (
                                <button
                                    key={a.id}
                                    className={`ae-dot ${tIdx === currentIndex ? 'active' : ''} ${completedIds.has(a.id) ? 'completed' : ''}`}
                                    onClick={() => performNavigation(tIdx)}
                                    title={a.title}
                                >
                                    {tIdx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="ae-content">
                <div className="ae-left-panel">
                    <div className="ae-question"><h3>Question</h3><p>{currentAssignment.question}</p></div>
                    <div className="ae-editor-section">
                        <div className="ae-editor-header">
                            <label className="ae-label">{currentAssignment.topic === 'Python' ? 'Python Code:' : (isSqlTopic(currentAssignment.topic) ? 'SQL Code:' : 'HTML Code:')}</label>
                            <button className="ae-clear-btn" onClick={handleClear} disabled={loading || (currentAssignment.topic === 'Python' && pyodideLoading) || (isSqlTopic(currentAssignment.topic) && !sqlEngineReady)}>Clear</button>
                        </div>
                        <textarea className="ae-textarea" ae-python-editor value={code} onChange={(e) => handleCodeChange(e.target.value)} placeholder={isSqlTopic(currentAssignment.topic) && !sqlEngineReady ? "Loading SQL engine..." : (currentAssignment.topic === 'Python' && pyodideLoading ? "Loading Python runtime..." : "Type here...")} spellCheck="false" disabled={loading || (currentAssignment.topic === 'Python' && pyodideLoading) || (isSqlTopic(currentAssignment.topic) && !sqlEngineReady)} style={(currentAssignment.topic === 'Python' || isSqlTopic(currentAssignment.topic)) ? { fontFamily: 'Consolas, monospace', fontSize: '14px' } : {}} />
                    </div>
                    <div className="ae-button-group">
                        <div className="ae-btn-slot">
                            {currentIndex > 0 && <button className="ae-btn ae-btn-prev" onClick={handlePrevAssignment}>← Previous</button>}
                        </div>

                        <div className="ae-btn-center">
                            <button className="ae-btn ae-btn-primary" onClick={handleRun} disabled={loading || (currentAssignment.topic === 'Python' && (!pyodide || pyodideLoading)) || (isSqlTopic(currentAssignment.topic) && !sqlEngineReady)}>▶ Run</button>
                            {(!isSubmitted || !validationResult?.isValid) && (
                                <button className="ae-btn ae-btn-success" onClick={handleSubmit} disabled={!code.trim() || loading || (currentAssignment.topic === 'Python' && (!pyodide || pyodideLoading)) || (isSqlTopic(currentAssignment.topic) && !sqlEngineReady)}>✓ Submit</button>
                            )}
                        </div>

                        <div className="ae-btn-slot ae-btn-right">
                            {((isSubmitted && validationResult?.isValid) || isCompleted) && currentIndex < filteredAssignments.length - 1 && (
                                <button className="ae-btn ae-btn-next" onClick={handleNextAssignment}>
                                    {currentAssignment.topic === 'Python' ? 'Next Topic →' : 'Next Assignment →'}
                                </button>
                            )}
                        </div>
                    </div>
                    {isSubmitted && validationResult && <div className={`ae-submission-status ${validationResult.isValid ? 'ae-passed' : 'ae-failed'}`}><h4>{validationResult.isValid ? '✓ Passed!' : '⚠ Failed'}</h4>{validationResult.details.map((d, i) => <p key={i} className="ae-detail">{d}</p>)}</div>}
                </div>
                <div className="ae-right-panel">
                    {isSqlTopic(currentAssignment.topic) ? (
                        <>
                            <div className="ae-output-section">
                                <h3>SQL Execution Result {sqlRunning && "..."}</h3>
                                <div className="ae-iframe-container" style={{ background: '#1e1e1e', border: '1px solid #333' }}>
                                    <SqlOutputPanel sqlResult={sqlResult} submittedCode={code} isRunning={sqlRunning} />
                                </div>
                            </div>
                            <div className="ae-output-section ae-expected">
                                <h3>Expected Result Description</h3>
                                <div className="ae-iframe-container" style={{ background: '#1e1e1e', border: '1px solid #333' }}>
                                    <pre className="ae-python-output ae-expected-output">{currentAssignment.expectedOutput}</pre>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="ae-output-section">
                                <h3>Your Output {loading && "..."}</h3>
                                <div className="ae-iframe-container">
                                    {currentAssignment.topic === 'Python' ? (
                                        <pre className="ae-python-output">{liveOutput}</pre>
                                    ) : (
                                        <iframe className="ae-preview-iframe" srcDoc={liveOutput} title="User Output" />
                                    )}
                                </div>
                            </div>
                            <div className="ae-output-section ae-expected">
                                <h3>Expected Output</h3>
                                <div className="ae-iframe-container">
                                    {currentAssignment.topic === 'Python' ? (
                                        <pre className="ae-python-output ae-expected-output">{currentAssignment.expectedOutput}</pre>
                                    ) : (
                                        <iframe className="ae-preview-iframe ae-expected-iframe" srcDoc={currentAssignment.expectedOutput} title="Expected Output" />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showSuccessModal && <div className="ae-success-modal-overlay"><div className="ae-success-modal"><h3>Success!</h3><p>Problem solved!</p><button className="ae-success-btn" onClick={() => setShowSuccessModal(false)}>Continue</button></div></div>}
            {showErrorModal && <ErrorModal errors={submissionErrors} onClose={() => setShowErrorModal(false)} />}
        </div>
    );
};


export default AssignmentEditor;
