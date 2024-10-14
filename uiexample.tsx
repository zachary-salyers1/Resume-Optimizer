"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Edit3, Download, Save, Eye } from 'lucide-react'

export default function Component() {
  const [resumeContent, setResumeContent] = useState("")
  const [atsScore, setAtsScore] = useState(0)
  const [feedback, setFeedback] = useState([])
  const [jobDescription, setJobDescription] = useState("")
  const [matchRate, setMatchRate] = useState(0)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    // Here you would implement the file parsing logic
    // For demonstration, we'll just set some dummy content
    setResumeContent("Sample resume content...")
    analyzeResume()
  }

  const analyzeResume = () => {
    // This is where you'd implement the ATS compliance scan
    // For now, we'll just set some dummy data
    setAtsScore(75)
    setFeedback([
      "Consider adding more industry-specific keywords",
      "Ensure all dates are in a consistent format",
      "Your skills section could be more comprehensive"
    ])
  }

  const analyzeJobDescription = () => {
    // This is where you'd implement the job description analysis
    // For now, we'll just set a dummy match rate
    setMatchRate(68)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ATS-Friendly Resume Platform</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="edit">Edit Resume</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Job Description</TabsTrigger>
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
            </CardContent>
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
                rows={10}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={analyzeResume}>Re-analyze Resume</Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>ATS Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={atsScore} className="w-full" />
              <p className="mt-2">Your resume is {atsScore}% ATS-compliant</p>
              <h3 className="font-semibold mt-4">Feedback:</h3>
              <ul className="list-disc pl-5">
                {feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Job Description</CardTitle>
              <CardDescription>Paste a job description to see how well your resume matches</CardDescription>
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
              <Button onClick={analyzeJobDescription}>Analyze Match</Button>
            </CardFooter>
          </Card>
          
          {matchRate > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Job Match Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={matchRate} className="w-full" />
                <p className="mt-2">Your resume matches {matchRate}% of the job requirements</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button><Download className="mr-2 h-4 w-4" /> Download as PDF</Button>
              <Button><Download className="mr-2 h-4 w-4" /> Download as DOCX</Button>
              <Button><Save className="mr-2 h-4 w-4" /> Save to Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}