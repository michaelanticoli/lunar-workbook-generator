# Lunar Workbook Generator

A minimal web app that reads a CSV list of workbook titles and requests cover images from OpenAI's image generation API.

## Prerequisites
- Node.js 18+
- An OpenAI API key set in the environment as `OPENAI_API_KEY`

## Install and run
```
npm install
OPENAI_API_KEY=your_key npm start
```
The app serves `index.html` and an `/api/generate` endpoint at `http://localhost:3000`.

## Using the app
1. Prepare a CSV file with a header row and at least one column named `title`.
2. Upload the CSV in the UI and click **Generate Covers**.
3. Generated images (or errors) will appear under the button as the rows are processed.
