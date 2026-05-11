import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './FirstHtmlPage.css';

const FirstHtmlPage = ({ type: propType, onClose }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = propType || queryParams.get('type');

  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (window.opener) {
      window.close();
    } else {
      window.parent.postMessage({ action: 'closeModal' }, '*');
    }
  };

  const htmlExercises = [
    {
      title: "Exercise 1.1: Using six heading tags display names of fruits",
      description: "Logic is more you like fruit bigger it should be.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Apple</h1>
  <h2>Banana</h2>
  <h3>Orange</h3>
  <h4>Grape</h4>
  <h5>Mango</h5>
  <h6>Cherry</h6>
</body>
</html>`
    },
    {
      title: "Exercise 1.2: Describe about your family",
      description: "Each one's name as heading followed by a three to four lines paragraph about them.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>My Family</h1>
  <h2>Father</h2>
  <p>My father is a hardworking man who always supports our family. He works as an engineer and loves to spend time with us on weekends.</p>
  <p>He enjoys reading books and helping me with my studies whenever I need guidance.</p>
  <h2>Mother</h2>
  <p>My mother is a caring and loving person who takes care of our family. She is a teacher and is very patient with her students.</p>
  <p>She enjoys cooking delicious meals for us and always makes sure we eat healthy food.</p>
  <h2>Sister</h2>
  <p>My sister is younger than me and is currently studying in college. She is very intelligent and always helps me with my homework.</p>
  <p>She loves painting and wants to become an artist in the future.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.3: Display ordered list of Phone brands",
      description: "Logic is more you prioritise.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>My Favorite Phone Brands</h1>
  <ol>
    <li>Apple iPhone</li>
    <li>Samsung Galaxy</li>
    <li>Google Pixel</li>
    <li>OnePlus</li>
    <li>Xiaomi</li>
  </ol>
</body>
</html>`
    },
    {
      title: "Exercise 1.4: Display unordered list of cars",
      description: "Logic is more you prefer.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>My Preferred Cars</h1>
  <ul>
    <li>Tesla Model 3</li>
    <li>BMW 3 Series</li>
    <li>Mercedes C-Class</li>
    <li>Audi A4</li>
    <li>Honda Civic</li>
  </ul>
</body>
</html>`
    },
    {
      title: "Exercise 1.5: Display soft drink brands",
      description: "Use dd,dt,dl tags to five brands.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Favorite Soft Drink Brands</h1>
  <dl>
    <dt>Coca-Cola</dt>
    <dd>Classic carbonated soft drink with original formula</dd>
    <dt>Pepsi</dt>
    <dd>Popular competitor to Coca-Cola with sweeter taste</dd>
    <dt>Sprite</dt>
    <dd>Lemon-lime flavored soft drink from Coca-Cola company</dd>
    <dt>Mountain Dew</dt>
    <dd>Citrus-flavored soft drink with high caffeine content</dd>
    <dt>7 Up</dt>
    <dd>Lemon-lime flavored soft drink with crisp taste</dd>
  </dl>
</body>
</html>`
    },
    {
      title: "Exercise 1.6: Display Car Image",
      description: "Add alternate text for image.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>My Dream Car</h1>
  <img src="https://via.placeholder.com/400x300" alt="A beautiful red sports car" />
  <p>This is my dream car - a sleek red sports car with modern design and powerful engine.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.7: Display people's names with age and city",
      description: "In a tabular format.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>People Information</h1>
  <table border="1">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Smith</td>
        <td>25</td>
        <td>New York</td>
      </tr>
      <tr>
        <td>Jane Doe</td>
        <td>30</td>
        <td>Los Angeles</td>
      </tr>
      <tr>
        <td>Mike Johnson</td>
        <td>28</td>
        <td>Chicago</td>
      </tr>
      <tr>
        <td>Sarah Williams</td>
        <td>22</td>
        <td>Houston</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`
    },
    {
      title: "Exercise 1.8: Create HTML links",
      description: "Navigate to YouTube and bitLabs website.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Useful Websites</h1>
  <p>Check out these helpful websites:</p>
  <a href="https://www.youtube.com" target="_blank">YouTube</a><br>
  <a href="https://www.bitlabs.in" target="_blank">BitLabs</a>
</body>
</html>`
    },
    {
      title: "Exercise 1.9: Describe smart phone",
      description: "With image and features using HTML Tags.",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>iPhone 14 Pro</h1>
  <img src="https://via.placeholder.com/300x400" alt="iPhone 14 Pro smartphone" />
  <h2>Key Features:</h2>
  <ul>
    <li>6.1-inch Super Retina XDR display</li>
    <li>A16 Bionic chip with 6-core CPU</li>
    <li>48MP main camera with 12MP ultra-wide</li>
    <li>5G connectivity support</li>
    <li>Face ID security</li>
  </ul>
</body>
</html>`
    },
    {
      title: "Exercise 1.10: Create sample bill in table format",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Sample Bill</h1>
  <table border="1">
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Notebook</td>
        <td>2</td>
        <td>$5.00</td>
        <td>$10.00</td>
      </tr>
      <tr>
        <td>Pen</td>
        <td>5</td>
        <td>$1.00</td>
        <td>$5.00</td>
      </tr>
      <tr>
        <td>Pencil</td>
        <td>10</td>
        <td>$0.50</td>
        <td>$5.00</td>
      </tr>
      <tr>
        <td><strong>Subtotal</strong></td>
        <td></td>
        <td></td>
        <td><strong>$20.00</strong></td>
      </tr>
      <tr>
        <td><strong>Tax (10%)</strong></td>
        <td></td>
        <td></td>
        <td><strong>$2.00</strong></td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td></td>
        <td></td>
        <td><strong>$22.00</strong></td>
      </tr>
    </tbody>
  </table>
</body>
</html>`
    }
  ];

  const stylingExercises = [
    {
      title: "Exercise 1.1: Write a sentence and display text in red colour with inline style for the body element",
      description: "",
      html: `<!DOCTYPE html>
<html style="color: red;">
<body>
  This is a sentence in a red body.
</body>
</html>`
    },
    {
      title: "Exercise 1.2: Write another sentence and use red coloured text in the paragraph using Internal style.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    p { color: red; }
  </style>
</head>
<body>
  <p>This paragraph is red due to internal styling.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.3: Create a heading and a paragraph under it. Display text of heading and paragraph tags in different color and font size using external CSS",
      description: "Note: In this preview, we use internal style to simulate external CSS.",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    h1 { color: blue; font-size: 32px; }
    p { color: green; font-size: 18px; }
  </style>
</head>
<body>
  <h1>External Style Heading</h1>
  <p>External style paragraph.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.4: My Cities",
      description: "Main heading with background color, font color, and font family. City names as side headings. Paragraphs with line height, font color, font family, and font size.",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    .main-heading { 
      background-color: lightblue; 
      color: darkblue; 
      font-family: Arial, sans-serif; 
      padding: 10px;
    }
    .city-info { 
      line-height: 1.6; 
      color: #444; 
      font-family: Georgia, serif; 
      font-size: 16px; 
    }
  </style>
</head>
<body>
  <h1 class="main-heading">My Cities</h1>
  
  <h2>New York</h2>
  <p class="city-info">New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial and cultural centers.</p>
  
  <h2>London</h2>
  <p class="city-info">London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times. At its centre stand the imposing Houses of Parliament, the iconic ‘Big Ben’ clock tower and Westminster Abbey.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.5: Create an ordered list and change the background colour to yellow for the selected list items using descendent selectors.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    ol .highlight { background-color: yellow; }
  </style>
</head>
<body>
  <h1>Ordered List</h1>
  <ol>
    <li>Item 1</li>
    <li class="highlight">Item 2 (Highlighted)</li>
    <li>Item 3</li>
    <li class="highlight">Item 4 (Highlighted)</li>
  </ol>
</body>
</html>`
    },
    {
      title: "Exercise 1.6: Create 3 links and using pseudo selector, change the colours of the link when it is active, visited, hover.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    a:link { color: blue; }
    a:visited { color: purple; }
    a:hover { color: red; }
    a:active { color: yellow; }
  </style>
</head>
<body>
  <h1>Pseudo Selectors</h1>
  <a href="https://google.com">Google</a><br>
  <a href="https://bing.com">Bing</a><br>
  <a href="https://duckduckgo.com">DuckDuckGo</a>
</body>
</html>`
    }
  ];

  const styling2Exercises = [
    {
      title: "Exercise 1.1: Use six heading tags to display the names of fruits and change the colour of the fruit accordingly.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    .apple { color: red; }
    .banana { color: yellow; }
    .orange { color: orange; }
    .grape { color: purple; }
    .mango { color: gold; }
    .cherry { color: darkred; }
  </style>
</head>
<body>
  <h1 class="apple">Apple</h1>
  <h2 class="banana">Banana</h2>
  <h3 class="orange">Orange</h3>
  <h4 class="grape">Grape</h4>
  <h5 class="mango">Mango</h5>
  <h6 class="cherry">Cherry</h6>
</body>
</html>`
    },
    {
      title: "Exercise 1.2: Display text in the heading and para by changing the font size, font-weight.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    h1 { font-size: 40px; font-weight: 900; }
    p { font-size: 20px; font-weight: 300; }
  </style>
</head>
<body>
  <h1>Large Bold Heading</h1>
  <p>Light medium paragraph text.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.3: Display text in the heading and para using “class” attribute in CSS.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    .custom-heading { color: navy; text-decoration: underline; }
    .custom-para { color: gray; font-style: italic; }
  </style>
</head>
<body>
  <h1 class="custom-heading">Class-based Heading</h1>
  <p class="custom-para">This paragraph uses a CSS class for styling.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.4: Apply CSS for the HTML elements using “class” and “Id” attributes.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    #unique-element { border: 2px solid black; padding: 10px; }
    .shared-style { background-color: lightgreen; }
  </style>
</head>
<body>
  <div id="unique-element">This div has a unique ID style.</div>
  <p class="shared-style">This paragraph has a class style.</p>
  <span class="shared-style">This span shares the same class style.</span>
</body>
</html>`
    },
    {
      title: "Exercise 1.5: Display a paragraph and apply margin (right, left, bottom, top) property. use id property for this paragraph",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    #margin-para { 
      margin-top: 50px; 
      margin-bottom: 50px; 
      margin-left: 100px; 
      margin-right: 100px; 
      background-color: lightgray;
    }
  </style>
</head>
<body>
  <p>Standard paragraph above.</p>
  <p id="margin-para">This paragraph has large margins on all sides.</p>
  <p>Standard paragraph below.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.6: Display a para with text and change text colour to red. use id or class property to separate with other paragraph's",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    #red-alert { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <p>Normal paragraph.</p>
  <p id="red-alert">This paragraph is specifically red and bold.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.7: Display text by using text-alignment property (Center, right, left).",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1 style="text-align: center;">Centered Heading</h1>
  <p style="text-align: right;">Right-aligned paragraph.</p>
  <p style="text-align: left;">Left-aligned paragraph.</p>
</body>
</html>`
    },
    {
      title: "Exercise 1.8: Display a link with background colour as light Gray with navigation to google page.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    .google-link { 
      background-color: lightgray; 
      padding: 5px 10px; 
      text-decoration: none; 
      color: blue; 
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <a href="https://www.google.com" class="google-link">Go to Google</a>
</body>
</html>`
    }
  ];

  const formExercises = [
    {
      title: "Exercise 1.1: Create a form with input fields such as first name, last name, email and Password.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Registration Form</h1>
  <form>
    <label for="fname">First Name:</label><br>
    <input type="text" id="fname" name="fname"><br>
    <label for="lname">Last Name:</label><br>
    <input type="text" id="lname" name="lname"><br>
    <label for="email">Email:</label><br>
    <input type="email" id="email" name="email"><br>
    <label for="pwd">Password:</label><br>
    <input type="password" id="pwd" name="pwd"><br>
  </form>
</body>
</html>`
    },
    {
      title: "Exercise 1.2: Create multi-line input text used to take Address in existing form",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Registration Form</h1>
  <form>
    <label for="fname">First Name:</label><br>
    <input type="text" id="fname" name="fname"><br>
    <label for="address">Address:</label><br>
    <textarea id="address" name="address" rows="4" cols="50"></textarea>
  </form>
</body>
</html>`
    },
    {
      title: "Exercise 1.3: Create a list of checkboxes which illustrates hobbies",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>My Hobbies</h1>
  <form>
    <input type="checkbox" id="hobby1" name="hobby1" value="Reading">
    <label for="hobby1"> Reading</label><br>
    <input type="checkbox" id="hobby2" name="hobby2" value="Painting">
    <label for="hobby2"> Painting</label><br>
    <input type="checkbox" id="hobby3" name="hobby3" value="Coding">
    <label for="hobby3"> Coding</label><br>
  </form>
</body>
</html>`
    },
    {
      title: "Exercise 1.4: Create a list radio buttons for group of colours",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Favorite Color</h1>
  <form>
    <input type="radio" id="red" name="fav_color" value="Red">
    <label for="red">Red</label><br>
    <input type="radio" id="blue" name="fav_color" value="Blue">
    <label for="blue">Blue</label><br>
    <input type="radio" id="green" name="fav_color" value="Green">
    <label for="green">Green</label><br>
  </form>
</body>
</html>`
    },
    {
      title: "Exercise 1.5: Create file input element to upload your resume.",
      description: "",
      html: `<!DOCTYPE html>
<html>
<body>
  <h1>Upload Resume</h1>
  <form>
    <label for="resume">Select your resume (PDF/DOC):</label><br>
    <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx">
  </form>
</body>
</html>`
    }
  ];

  let exercises = htmlExercises;
  let pageTitle = "First HTML Page Exercises";

  if (type === 'styling') {
    exercises = stylingExercises;
    pageTitle = "Styling Exercises (CSS)";
  } else if (type === 'styling2') {
    exercises = styling2Exercises;
    pageTitle = "Styling Part 2 Exercises (CSS)";
  } else if (type === 'forms') {
    exercises = formExercises;
    pageTitle = "Registration Form Exercises";
  }

  const handlePreview = (index) => {
    setCurrentIndex(index);
    setShowPreview(true);
  };

  const currentExerciseData = currentIndex !== null ? exercises[currentIndex] : null;

  return (
    <div className="first-html-page">
      <div className="exercise-header">
        <button className="back-btn-top" onClick={handleBack}>
          ← Back
        </button>
        <h2>{pageTitle}</h2>
        <div className="assignment-notice" style={{ marginTop: '15px', color: '#555', fontSize: '15px', lineHeight: '1.6' }}>
          <p>In this HTML page, do the following exercises. Click <strong>Preview</strong> link after completion of each exercise to see your output.</p>
          <p>Use <a href="https://www.replit.com" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', fontWeight: 'bold' }}>www.replit.com</a> if you need an IDE</p>
        </div>
      </div>

      {!showPreview ? (
        <div className="exercises-list">
          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-item">
              <div className="exercise-content">
                <h3>{exercise.title}</h3>
                <p>{exercise.description}</p>
                <div className="exercise-code">
                  <pre>
                    <code>{exercise.html}</code>
                  </pre>
                </div>
              </div>
              <div className="exercise-actions">
                <button 
                  className="preview-btn"
                  onClick={() => handlePreview(index)}
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="preview-container">
          <div className="preview-header">
            <h3>Preview: {currentExerciseData?.title}</h3>
            <button 
              className="back-btn"
              onClick={() => setShowPreview(false)}
            >
              Back to Exercises
            </button>
          </div>
          <div className="preview-frame">
            <iframe
              srcDoc={currentExerciseData?.html}
              title="HTML Preview"
              className="preview-iframe"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstHtmlPage;
