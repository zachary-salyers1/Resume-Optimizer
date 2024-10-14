"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Edit3, Download, Save, Eye, CheckCircle } from 'lucide-react'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production. Use server-side API calls instead.
})

export function ResumePlatform() {
  // Updated state variables
  const [resumeContent, setResumeContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [compatibilityScore, setCompatibilityScore] = useState(0)
  const [feedback, setFeedback] = useState<{ section: string; feedback: string }[]>([])
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([])
  const [resumeVersions, setResumeVersions] = useState<{ id: number; name: string; content: string }[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to parse resume')
        }

        const data = await response.json()
        setResumeContent(data.text)
        setUploadSuccess(true)
        setUploadedFileName(file.name)
        // Automatically analyze the resume after upload
        await analyzeResume(data.text)
      } catch (error) {
        console.error("Error parsing file:", error)
        // Handle error (e.g., show error message to user)
      }
    }
  }

  const analyzeJobDescription = async () => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that extracts key skills and requirements from job descriptions." },
          { role: "user", content: `Extract the key skills and requirements from this job description: ${jobDescription}` }
        ],
        max_tokens: 150
      })
      const extractedSkillsText = response.choices[0].message.content
      if (extractedSkillsText) {
        const skillsArray = extractedSkillsText.split(',').map(skill => skill.trim())
        setExtractedSkills(skillsArray)
      } else {
        console.error("No content received from OpenAI")
      }
    } catch (error) {
      console.error("Error analyzing job description:", error)
      // Handle error (e.g., show error message to user)
    }
  }

  const analyzeResume = async (content: string = resumeContent) => {
    if (!content || !jobDescription) {
      console.error("Resume content or job description is missing")
      return
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Updated to GPT-4
        messages: [
          { role: "system", content: `You are an AI assistant that analyzes resumes and provides feedback to make them optimized for Applicant Tracking Systems (ATS). Identify areas of improvement and suggest specific changes to enhance resume compatibility with ATS.

Steps:
1. Analyze Resume Content
2. Assess ATS Compatibility
3. Provide Feedback
4. Suggest Improvements

Output Format:
- Specific section needing improvement: Description of the issue and suggested correction or enhancement.
- General advice: Overall recommendations for improving the resume's ATS compatibility and effectiveness.` },
          { role: "user", content: `Analyze this resume content for ATS optimization and provide feedback: ${content}. Compare it with this job description: ${jobDescription}. Provide a compatibility score as a percentage at the beginning of your response.` }
        ],
        max_tokens: 1000 // Increased token limit for more detailed feedback
      })

      const analysisResult = response.choices[0].message.content
      if (analysisResult) {
        const lines = analysisResult.split('\n')
        const scoreMatch = lines[0].match(/(\d+)%/)
        setCompatibilityScore(scoreMatch ? parseInt(scoreMatch[1]) : 0)

        const feedbackItems: { section: string; feedback: string }[] = []
        let generalAdvice: string[] = []
        let currentSection = ""

        lines.slice(1).forEach(line => {
          if (line.includes(":")) {
            const [section, feedback] = line.split(":")
            if (section.trim() === "General advice") {
              currentSection = "General advice"
            } else {
              currentSection = section.trim()
              feedbackItems.push({ section: currentSection, feedback: feedback.trim() })
            }
          } else if (currentSection === "General advice") {
            generalAdvice.push(line.trim())
          } else if (currentSection && feedbackItems.length > 0) {
            feedbackItems[feedbackItems.length - 1].feedback += " " + line.trim()
          }
        })

        setFeedback(feedbackItems)
        setImprovementSuggestions(generalAdvice)
      }
    } catch (error) {
      console.error("Error analyzing resume:", error)
      // Handle error (e.g., show error message to user)
    }
  }

  const saveResumeVersion = () => {
    const newVersion = {
      id: Date.now(),
      name: `Version ${resumeVersions.length + 1}`,
      content: resumeContent
    }
    setResumeVersions([...resumeVersions, newVersion])
    setCurrentVersionId(newVersion.id)
  }

  const loadResumeVersion = (id: number) => {
    const version = resumeVersions.find(v => v.id === id)
    if (version) {
      setResumeContent(version.content)
      setCurrentVersionId(id)
    }
  }

  const exportResume = (format: 'pdf' | 'docx') => {
    // TODO: Implement export logic
    console.log(`Exporting resume as ${format}`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ATS-Friendly Resume Platform</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="edit">Edit Resume</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Job Description</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>Supported formats: DOCX, PDF, TXT</CardDescription>
            </CardHeader>
            <CardContent>
              <Input type="file" onChange={handleFileUpload} accept=".docx,.pdf,.txt" />
              {uploadSuccess && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <p className="font-semibold">Upload Successful!</p>
                  </div>
                  <p className="mt-1">
                    Your file "{uploadedFileName}" has been successfully uploaded.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={(e) => analyzeResume()}>Analyze Resume</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Resume</CardTitle>
              <CardDescription>Make changes based on ATS feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={resumeContent} 
                onChange={(e) => setResumeContent(e.target.value)}
                placeholder="Your resume content..."
                rows={10}
              />
              <Button onClick={() => analyzeResume()} className="mt-4">Re-analyze Resume</Button>
            </CardContent>
          </Card>
          
          {compatibilityScore > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Resume Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Compatibility Score</h3>
                  <div className="flex items-center">
                    <Progress value={compatibilityScore} className="w-full mr-4" />
                    <span className="text-xl font-bold">{compatibilityScore}%</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    This score indicates how well your resume matches the job description.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                  {feedback.map((item, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-semibold">{item.section}</h4>
                      <p className="text-sm">{item.feedback}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">General Advice</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Job Description</CardTitle>
              <CardDescription>Paste a job description to extract key skills and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                rows={5}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={analyzeJobDescription}>Analyze</Button>
            </CardFooter>
          </Card>
          
          {extractedSkills.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Extracted Skills and Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5">
                  {extractedSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Resume Versions</CardTitle>
              <CardDescription>Manage multiple versions of your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={saveResumeVersion}>Save Current Version</Button>
              <div className="mt-4">
                {resumeVersions.map(version => (
                  <Button
                    key={version.id}
                    variant={currentVersionId === version.id ? "default" : "outline"}
                    className="mr-2 mb-2"
                    onClick={() => loadResumeVersion(version.id)}
                  >
                    {version.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customize">
          <Card>
            <CardHeader>
              <CardTitle>Customize Resume</CardTitle>
              <CardDescription>Choose a template and customize your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-2">Select Template:</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              {/* Add more customization options here */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => exportResume('pdf')}>
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
              <Button onClick={() => exportResume('docx')}>
                <Download className="mr-2 h-4 w-4" /> Download as DOCX
              </Button>
              <Button><Save className="mr-2 h-4 w-4" /> Save to Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}