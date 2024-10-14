## Project Overview

### Summary

We are building a web application that allows users to optimize their resumes based on job descriptions. The application will analyze the user's resume against the job description using AI (OpenAI's GPT-4 model) and provide suggestions for improvement, ensuring better alignment with Applicant Tracking Systems (ATS). Users can upload their resumes in various formats, create and save multiple versions for different job applications, and customize templates and font styles. The application will feature a user-friendly interface built with React, Node.js, Lucid Icons, and will use Supabase for backend services.

### Goals

- **Improve User Employability**: Help users tailor their resumes to specific job descriptions, increasing their chances of getting noticed by recruiters and ATS.
- **User-Friendly Experience**: Provide an intuitive interface for easy navigation and usage.
- **Customization**: Allow users to customize their resumes with different templates and styles.
- **Data Security**: Ensure user data, including resumes and personal information, is securely stored and handled.

---

## Core Functionalities

### 1. Job Description Analysis

- **Description**: Analyze job descriptions to extract key skills and requirements.
- **Implementation**:
    - Utilize OpenAI's GPT-4 model to parse and analyze the job description.
    - Extract and list key skills, qualifications, and requirements.
- **Example**:
    - **Input**: User pastes a job description.
    - **Output**: A list of extracted skills and requirements displayed to the user.

### 2. Resume Matching and Scoring

- **Description**: Match the user's resume against the job description and provide a compatibility score.
- **Implementation**:
    - Use OpenAI's GPT-4 model to compare the resume content with the extracted job requirements.
    - Generate a score and highlight areas of improvement.
- **Example**:
    - **Input**: User uploads their resume and provides a job description.
    - **Output**: A compatibility score out of 100 and specific feedback.

### 3. Resume Improvement Suggestions

- **Description**: Provide AI-driven suggestions to enhance the resume based on the job description and ATS criteria.
- **Implementation**:
    - Analyze the resume for ATS optimization (keyword usage, formatting, etc.).
    - Suggest additions or modifications to align better with the job requirements.
- **Example**:
    - **Input**: User's resume and job description.
    - **Output**: Suggestions like "Include 'TypeScript' in your skills section" or "Elaborate on your experience with Node.js."

### 4. Multiple Resume Versions

- **Description**: Allow users to create, save, and manage multiple resume versions tailored to different job applications.
- **Implementation**:
    - Use Supabase to store and retrieve different resume versions per user.
    - Provide CRUD operations (Create, Read, Update, Delete) for resume versions.
- **Example**:
    - **User Flow**: User saves a tailored resume for a Software Engineer position and creates another for a Project Manager role.

### 5. User-Friendly Interface

- **Description**: Design an intuitive UI for easy navigation and interaction.
- **Implementation**:
    - Build the frontend using React and Lucid Icons for visual elements.
    - Ensure responsive design for various devices.
- **Example**:
    - **Features**: Clear navigation menus, drag-and-drop file upload, real-time feedback display.

### 6. Resume Upload in Various Formats

- **Description**: Support uploading resumes in PDF, DOC, DOCX, TXT, and other common formats.
- **Implementation**:
    - Use libraries like `pdf-lib` for PDFs, `docx-parser` for DOCX files, and handle TXT files as plain text.
    - Implement file validation and error handling.
- **Example**:
    - **User Flow**: User uploads a DOCX file, and the content is correctly parsed and displayed in the application.

### 7. Resume Customization

- **Description**: Allow users to customize resume templates and font styles.
- **Implementation**:
    - Provide a set of pre-defined templates and fonts.
    - Use `react-pdf` for generating PDFs and `react-docx` for DOCX files.
    - Allow users to preview changes in real-time.
- **Example**:
    - **User Interaction**: User selects a new template and sees the resume update accordingly.

---

## Technical Requirements

### Frontend

- **Framework**: React
- **UI Components**: Lucid Icons, Tailwind CSS
- **File Upload Handling**: Custom components using HTML5 and JavaScript APIs
- **State Management**: React Hooks and Context API

### Backend

- **Server Environment**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth for user management
- **API Services**: RESTful APIs for resume handling and analysis requests

### AI Integration

- **Model**: OpenAI GPT-4
- **Endpoints**: Utilize OpenAI's Chat Completions API
- **Data Handling**: Ensure prompts and responses are securely transmitted

### File Parsing Libraries

- **PDF**: `pdf-lib`
- **DOCX**: `docx-parser`
- **TXT**: Plain text handling
- **Others**: Use appropriate parsers as needed

### Styling

- **CSS Framework**: Tailwind CSS
- **Icons**: Lucid Icons
- **Responsive Design**: Ensure compatibility across devices