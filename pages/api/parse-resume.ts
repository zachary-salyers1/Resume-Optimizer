import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = new IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      let text: string
      if (file.mimetype === 'application/pdf') {
        const pdfBuffer = fs.readFileSync(file.filepath)
        const pdfData = await pdfParse(pdfBuffer)
        text = pdfData.text
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // TODO: Implement DOCX parsing
        text = 'DOCX parsing not implemented yet'
      } else {
        // Assume it's a text file
        text = fs.readFileSync(file.filepath, 'utf-8')
      }

      res.status(200).json({ text })
    } catch (error) {
      console.error('Error parsing file:', error)
      res.status(500).json({ error: 'Error parsing file' })
    }
  })
}
