import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve the subjects selection page
  app.get('/subjects', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Eatpl.in - Select ATPL Subject</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%);
              min-height: 100vh;
              color: white;
            }
            
            /* Header */
            .header {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              padding: 0 24px;
              height: 64px;
              display: flex;
              align-items: center;
            }
            .nav-container {
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .logo {
              display: flex;
              align-items: center;
              font-size: 18px;
              font-weight: 600;
              color: white;
              text-decoration: none;
            }
            .logo::before {
              content: "✈️";
              margin-right: 8px;
            }
            .nav-links {
              display: flex;
              align-items: center;
              gap: 32px;
              flex: 1;
              justify-content: center;
            }
            .nav-link {
              color: rgba(255, 255, 255, 0.8);
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s;
            }
            .nav-link:hover {
              color: white;
            }
            .header-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .theme-toggle {
              background: none;
              border: none;
              padding: 8px;
              border-radius: 6px;
              cursor: pointer;
              color: rgba(255, 255, 255, 0.8);
              font-size: 16px;
            }
            .sign-in-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            }
            .sign-in-btn:hover {
              background: #5b57f2;
            }
            
            /* Main Content */
            .main-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 24px;
            }
            .subjects-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .subject-card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s;
              text-decoration: none;
              color: white;
              display: block;
            }
            .subject-card:hover {
              transform: translateY(-5px);
              background: rgba(255, 255, 255, 0.2);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .subject-title {
              font-size: 16px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.4;
            }
            .subject-description {
              font-size: 14px;
              opacity: 0.8;
              margin-top: 8px;
            }
            .loading {
              text-align: center;
              padding: 60px;
              font-size: 18px;
              opacity: 0.8;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
              .nav-links { display: none; }
              .subjects-grid {
                grid-template-columns: 1fr;
                gap: 16px;
              }
              .main-content {
                padding: 20px 16px;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <header class="header">
            <div class="nav-container">
              <a href="/" class="logo">Eatpl.in</a>
              
              <nav class="nav-links">
                <a href="/question-bank" class="nav-link">Question Bank</a>
                <a href="/airline-interviews" class="nav-link">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" class="nav-link">ATPL Viva</a>
                <a href="/classes" class="nav-link">Classes</a>
                <a href="/aptitude-test" class="nav-link">Aptitude Test</a>
                <a href="/airbus-320" class="nav-link">Airbus 320</a>
                <a href="/syllabus" class="nav-link">Syllabus</a>
                <a href="/pilot-resume" class="nav-link">Pilot Resume</a>
              </nav>
              
              <div class="header-actions">
                <button class="theme-toggle">🌙</button>
                <button class="sign-in-btn">Sign In</button>
              </div>
            </div>
          </header>
          
          <!-- Main Content -->
          <main class="main-content">
            <div id="subjects-container">
              <div class="loading">Loading ATPL Subjects...</div>
            </div>
          </main>
          
          <script>
            async function loadSubjects() {
              try {
                const response = await fetch('/api/subjects');
                const subjects = await response.json();
                
                const container = document.getElementById('subjects-container');
                container.innerHTML = '';
                
                const grid = document.createElement('div');
                grid.className = 'subjects-grid';
                
                subjects.forEach(subject => {
                  const card = document.createElement('a');
                  card.className = 'subject-card';
                  card.href = '/mcq-test'; // For now, all subjects go to the same test
                  
                  const title = document.createElement('div');
                  title.className = 'subject-title';
                  title.textContent = subject.name || subject.title || subject.code || 'Subject';
                  
                  const description = document.createElement('div');
                  description.className = 'subject-description';
                  description.textContent = subject.description || 'ATPL Exam Practice';
                  
                  card.appendChild(title);
                  card.appendChild(description);
                  grid.appendChild(card);
                });
                
                container.appendChild(grid);
                
              } catch (error) {
                console.error('Error loading subjects:', error);
                document.getElementById('subjects-container').innerHTML = 
                  '<div class="loading">Error loading subjects. Please try again.</div>';
              }
            }
            
            // Load subjects on page load
            loadSubjects();
            
            // Sign in functionality
            document.querySelector('.sign-in-btn').addEventListener('click', () => {
              window.location.href = '/api/login';
            });
          </script>
        </body>
      </html>
    `);
  });

  // Serve the dynamic MCQ test interface for PRESSURE HEADS
  app.get('/mcq-test', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATPL MCQ Test - Question 10</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2980b9 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .test-container { 
              display: flex; 
              gap: 20px; 
              max-width: 1400px; 
              margin: 0 auto; 
              height: calc(100vh - 40px);
            }
            .sidebar { 
              background: rgba(255, 255, 255, 0.95); 
              border-radius: 16px; 
              padding: 20px; 
              width: 280px; 
              height: fit-content;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .sidebar h3 { 
              font-size: 16px; 
              margin-bottom: 20px; 
              color: #2c3e50;
              display: flex;
              align-items: center;
            }
            .sidebar h3::before { 
              content: "📋"; 
              margin-right: 8px; 
            }
            .question-grid { 
              display: grid; 
              grid-template-columns: repeat(5, 1fr); 
              gap: 8px; 
              margin-bottom: 20px; 
            }
            .question-number { 
              width: 40px; 
              height: 40px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 600; 
              cursor: pointer; 
              transition: all 0.2s;
            }
            .question-number.answered { 
              background: #27ae60; 
              color: white; 
            }
            .question-number.current { 
              background: #3498db; 
              color: white; 
              box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
            }
            .question-number.unanswered { 
              background: #ecf0f1; 
              color: #7f8c8d; 
            }
            .finish-btn { 
              background: #e74c3c; 
              color: white; 
              border: none; 
              padding: 12px 20px; 
              border-radius: 8px; 
              font-weight: 600; 
              cursor: pointer; 
              width: 100%;
              transition: background 0.2s;
            }
            .finish-btn:hover { 
              background: #c0392b; 
            }
            .main-content { 
              background: rgba(255, 255, 255, 0.95); 
              border-radius: 16px; 
              flex: 1; 
              padding: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .tab-nav { 
              display: flex; 
              background: #ecf0f1; 
              border-radius: 8px; 
              padding: 4px; 
              margin-bottom: 24px; 
            }
            .tab { 
              flex: 1; 
              padding: 12px 16px; 
              text-align: center; 
              border-radius: 6px; 
              cursor: pointer; 
              font-weight: 500;
              transition: all 0.2s;
            }
            .tab.active { 
              background: white; 
              color: #2c3e50;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .question-header { 
              display: flex; 
              justify-content: between; 
              align-items: center; 
              margin-bottom: 20px; 
            }
            .question-text { 
              font-size: 18px; 
              font-weight: 600; 
              color: #2c3e50; 
              margin-bottom: 24px; 
            }
            .report-btn { 
              background: none; 
              border: 1px solid #bdc3c7; 
              padding: 8px 16px; 
              border-radius: 6px; 
              cursor: pointer;
              color: #7f8c8d;
              font-size: 14px;
              margin-left: auto;
            }
            .options { 
              display: flex; 
              flex-direction: column; 
              gap: 12px; 
              margin-bottom: 24px; 
            }
            .option { 
              padding: 16px 20px; 
              border: 2px solid #ecf0f1; 
              border-radius: 12px; 
              cursor: pointer; 
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .option.selected { 
              background: #d5f4e6; 
              border-color: #27ae60;
              color: #27ae60;
            }
            .option-letter { 
              font-weight: 700; 
              font-size: 16px;
              min-width: 24px;
            }
            .option.selected .option-letter::after { 
              content: " ✓"; 
              color: #27ae60; 
            }
            .explanation { 
              background: #ebf3fd; 
              border: 1px solid #bde0ff; 
              border-radius: 12px; 
              padding: 20px; 
              margin-bottom: 24px; 
            }
            .explanation h4 { 
              color: #2c3e50; 
              margin-bottom: 12px; 
            }
            .explanation p { 
              color: #34495e; 
              line-height: 1.6; 
            }
            .navigation { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
            }
            .nav-btn { 
              padding: 12px 24px; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: 500;
              transition: all 0.2s;
            }
            .nav-btn.previous { 
              background: #95a5a6; 
              color: white; 
            }
            .nav-btn.next { 
              background: #9b59b6; 
              color: white; 
            }
            .nav-btn:hover { 
              transform: translateY(-1px); 
              box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            }
          </style>
        </head>
        <body>
          <div class="test-container">
            <div class="sidebar">
              <h3>Questions (10/10)</h3>
              <div class="question-grid">
                <div class="question-number answered">1</div>
                <div class="question-number answered">2</div>
                <div class="question-number answered">3</div>
                <div class="question-number answered">4</div>
                <div class="question-number answered">5</div>
                <div class="question-number answered">6</div>
                <div class="question-number answered">7</div>
                <div class="question-number answered">8</div>
                <div class="question-number answered">9</div>
                <div class="question-number current">10</div>
              </div>
              <button class="finish-btn">Finish Test</button>
            </div>
            
            <div class="main-content">
              <div class="tab-nav">
                <div class="tab active">Question</div>
                <div class="tab">Explanation</div>
                <div class="tab">Comments</div>
              </div>
              
              <div class="question-header">
                <button class="report-btn">📊 Report</button>
              </div>
              
              <div class="question-text">
                #10. Where an alternate static source is fitted, use of this source usually leads to:
              </div>
              
              <div class="options">
                <div class="option selected">
                  <span class="option-letter">A.</span>
                  <span>a temporary increase in lag error.</span>
                </div>
                <div class="option">
                  <span class="option-letter">B.</span>
                  <span>a lower pressure error than with normal sources.</span>
                </div>
                <div class="option">
                  <span class="option-letter">C.</span>
                  <span>an increase in position error.</span>
                </div>
                <div class="option">
                  <span class="option-letter">D.</span>
                  <span>no change in position error.</span>
                </div>
              </div>
              
              <div class="explanation">
                <h4>Explanation:</h4>
                <p>Using an alternate static source on a non-pressurized aircraft typically leads to an increase in position error because the airspeed and altitude readings will be higher than normal. (Alternate instruments are not as accurate as primary instruments.)</p>
              </div>
              
              <div class="navigation">
                <button class="nav-btn previous">Previous</button>
                <button class="nav-btn next">Next</button>
              </div>
            </div>
          </div>
          
          <script>
            // Dynamic MCQ functionality
            let questions = [];
            let currentQuestionIndex = 0;
            let selectedAnswers = {};
            
            // Fetch questions from database
            async function loadQuestions() {
              try {
                const response = await fetch('/api/sections/7/questions'); // PRESSURE HEADS section ID
                questions = await response.json();
                if (questions.length > 0) {
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                }
              } catch (error) {
                console.error('Error loading questions:', error);
              }
            }
            
            function renderQuestionGrid() {
              const grid = document.querySelector('.question-grid');
              grid.innerHTML = '';
              
              questions.forEach((q, index) => {
                const btn = document.createElement('div');
                btn.className = 'question-number';
                btn.textContent = index + 1;
                
                if (selectedAnswers[q.id]) {
                  btn.classList.add('answered');
                }
                if (index === currentQuestionIndex) {
                  btn.classList.add('current');
                }
                if (!selectedAnswers[q.id] && index !== currentQuestionIndex) {
                  btn.classList.add('unanswered');
                }
                
                btn.addEventListener('click', () => {
                  currentQuestionIndex = index;
                  renderQuestion(index);
                  renderQuestionGrid();
                });
                
                grid.appendChild(btn);
              });
            }
            
            function renderQuestion(index) {
              const question = questions[index];
              if (!question) return;
              
              // Update question text
              document.querySelector('.question-text').textContent = 
                '#' + (index + 1) + '. ' + question.question_text;
              
              // Update options
              const options = document.querySelectorAll('.option');
              const optionTexts = [question.option_a, question.option_b, question.option_c, question.option_d];
              const letters = ['A', 'B', 'C', 'D'];
              
              options.forEach((option, i) => {
                const letterSpan = option.querySelector('.option-letter');
                const textSpan = option.querySelector('span:last-child');
                
                letterSpan.textContent = letters[i] + '.';
                textSpan.textContent = optionTexts[i];
                
                option.classList.remove('selected');
                if (selectedAnswers[question.id] === letters[i]) {
                  option.classList.add('selected');
                }
                
                option.onclick = () => selectOption(question.id, letters[i], option);
              });
              
              // Update explanation
              const explanation = question.explanation_text || question.explanation || 'No explanation available.';
              document.querySelector('.explanation p').textContent = explanation;
              
              // Update navigation buttons
              const prevBtn = document.querySelector('.nav-btn.previous');
              const nextBtn = document.querySelector('.nav-btn.next');
              
              prevBtn.disabled = index === 0;
              nextBtn.disabled = index === questions.length - 1;
              
              prevBtn.onclick = () => {
                if (index > 0) {
                  currentQuestionIndex = index - 1;
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                }
              };
              
              nextBtn.onclick = () => {
                if (index < questions.length - 1) {
                  currentQuestionIndex = index + 1;
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                }
              };
            }
            
            function selectOption(questionId, answer, optionElement) {
              selectedAnswers[questionId] = answer;
              
              // Remove selected class from all options
              document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
              
              // Add selected class to clicked option
              optionElement.classList.add('selected');
              
              // Update question grid to show answered state
              renderQuestionGrid();
            }
            
            // Tab functionality
            document.querySelectorAll('.tab').forEach(tab => {
              tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
              });
            });
            
            // Initialize
            loadQuestions();
          </script>
        </body>
      </html>
    `);
  });

  // Serve the Eatpl.in home page design
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Eatpl.in - 14 ATPL Subject Modules</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Master all EASA ATPL subjects with our comprehensive question bank and practice tests">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: #ffffff;
              color: #1f2937;
              line-height: 1.6;
            }
            
            /* Header */
            .header {
              background: white;
              border-bottom: 1px solid #e5e7eb;
              padding: 0 24px;
              height: 64px;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .nav-container {
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .logo {
              display: flex;
              align-items: center;
              font-size: 18px;
              font-weight: 600;
              color: #6366f1;
              text-decoration: none;
            }
            .logo::before {
              content: "✈️";
              margin-right: 8px;
            }
            .nav-links {
              display: flex;
              align-items: center;
              gap: 32px;
              flex: 1;
              justify-content: center;
            }
            .nav-link {
              color: #6b7280;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s;
            }
            .nav-link:hover {
              color: #6366f1;
            }
            .header-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .theme-toggle {
              background: none;
              border: none;
              padding: 8px;
              border-radius: 6px;
              cursor: pointer;
              color: #6b7280;
              font-size: 16px;
            }
            .sign-in-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            }
            .sign-in-btn:hover {
              background: #5b57f2;
            }
            
            /* Main Content */
            .main-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 80px 24px;
              text-align: center;
            }
            .main-title {
              font-size: 48px;
              font-weight: 700;
              color: #6366f1;
              margin-bottom: 24px;
              line-height: 1.2;
            }
            .subtitle {
              font-size: 18px;
              color: #6b7280;
              margin-bottom: 40px;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
            }
            .cta-button {
              display: inline-flex;
              align-items: center;
              background: #3b82f6;
              color: white;
              padding: 14px 28px;
              border: none;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
              margin-bottom: 40px;
            }
            .cta-button:hover {
              background: #2563eb;
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
            }
            .cta-button::before {
              content: "✈️";
              margin-right: 8px;
            }
            
            /* Search Bar */
            .search-container {
              max-width: 400px;
              margin: 0 auto;
              position: relative;
            }
            .search-input {
              width: 100%;
              padding: 12px 16px 12px 48px;
              border: 1px solid #d1d5db;
              border-radius: 12px;
              font-size: 16px;
              background: white;
              outline: none;
              transition: border-color 0.2s, box-shadow 0.2s;
            }
            .search-input:focus {
              border-color: #6366f1;
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            .search-icon {
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              color: #9ca3af;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
              .nav-links {
                display: none;
              }
              .main-title {
                font-size: 36px;
              }
              .subtitle {
                font-size: 16px;
              }
              .main-content {
                padding: 60px 20px;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <header class="header">
            <div class="nav-container">
              <a href="/" class="logo">Eatpl.in</a>
              
              <nav class="nav-links">
                <a href="/question-bank" class="nav-link">Question Bank</a>
                <a href="/airline-interviews" class="nav-link">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" class="nav-link">ATPL Viva</a>
                <a href="/classes" class="nav-link">Classes</a>
                <a href="/aptitude-test" class="nav-link">Aptitude Test</a>
                <a href="/airbus-320" class="nav-link">Airbus 320</a>
                <a href="/syllabus" class="nav-link">Syllabus</a>
                <a href="/pilot-resume" class="nav-link">Pilot Resume</a>
              </nav>
              
              <div class="header-actions">
                <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
                <button class="sign-in-btn">Sign In</button>
              </div>
            </div>
          </header>
          
          <!-- Main Content -->
          <main class="main-content">
            <h1 class="main-title">14 ATPL Subject Modules</h1>
            <p class="subtitle">
              Master all EASA ATPL subjects with our comprehensive question bank 
              and practice tests
            </p>
            
            <a href="/subjects" class="cta-button">Start Your Flight Prep</a>
            
            <div class="search-container">
              <div class="search-icon">🔍</div>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search subjects..."
                onkeyup="searchSubjects(this.value)"
              >
            </div>
          </main>
          
          <script>
            function toggleTheme() {
              // Theme toggle functionality
              const body = document.body;
              const isDark = body.classList.contains('dark-theme');
              
              if (isDark) {
                body.classList.remove('dark-theme');
                document.querySelector('.theme-toggle').textContent = '🌙';
              } else {
                body.classList.add('dark-theme');
                document.querySelector('.theme-toggle').textContent = '☀️';
              }
            }
            
            function searchSubjects(query) {
              // Search functionality - can be connected to actual search later
              if (query.length > 2) {
                console.log('Searching for:', query);
                // Here you would implement the actual search logic
              }
            }
            
            // Sign in functionality
            document.querySelector('.sign-in-btn').addEventListener('click', () => {
              window.location.href = '/api/login';
            });
          </script>
        </body>
      </html>
    `);
  });
  
  const port = parseInt(process.env.PORT || '80', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server serving on port ${port} (API + Next.js proxy)`);
  });
})();
