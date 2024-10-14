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
  const [feedback, setFeedback] = useState<string[]>([])
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([])
  const [resumeVersions, setResumeVersions] = useState<{ id: number; name: string; content: string }[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result
        if (typeof text === 'string') {
          setResumeContent(text)
          setUploadSuccess(true)
          setUploadedFileName(file.name)
          // Automatically analyze the resume after upload
          await analyzeResume(text)
        }
      }
      reader.readAsText(file)
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
      const skillsArray = extractedSkillsText.split(',').map(skill => skill.trim())
      setExtractedSkills(skillsArray)
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
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI assistant that analyzes resumes and provides feedback for ATS optimization. Provide a compatibility score as a percentage, followed by specific feedback and improvement suggestions." },
          { role: "user", content: `Analyze this resume content for ATS optimization and provide feedback: ${content}. Compare it with this job description: ${jobDescription}. Format your response as follows:
          Compatibility Score: X%
          Feedback:
          - Feedback point 1
          - Feedback point 2
          Suggestions:
          - Suggestion 1
          - Suggestion 2` }
        ],
        max_tokens: 500
      })

      const analysisResult = response.choices[0].message.content
      if (analysisResult) {
        const lines = analysisResult.split('\n')
        const scoreMatch = lines[0].match(/(\d+)%/)
        setCompatibilityScore(scoreMatch ? parseInt(scoreMatch[1]) : 0)

        const feedbackStart = lines.findIndex(line => line.toLowerCase().includes('feedback:'))
        const suggestionsStart = lines.findIndex(line => line.toLowerCase().includes('suggestions:'))

        setFeedback(lines.slice(feedbackStart + 1, suggestionsStart).filter(line => line.trim()).map(line => line.replace(/^-\s*/, '')))
        setImprovementSuggestions(lines.slice(suggestionsStart + 1).filter(line => line.trim()).map(line => line.replace(/^-\s*/, '')))
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
              <Button onClick={analyzeResume}>Analyze Resume</Button>
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
                  <ul className="list-disc pl-5 space-y-2">
                    {feedback.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Improvement Suggestions</h3>
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