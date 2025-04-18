import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { Linkedin, Github } from "lucide-react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    topic: "",
    tone: "professional",
    length: "medium",
    hashtagOption: "include",
    targetAudience: "professionals",
    contentType: "thought-leadership",
    additionalInfo: "",
  });

  const [generatedPost, setGeneratedPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const generatePost = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key is missing. Please add it to your .env file as REACT_APP_GEMINI_API_KEY"
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Generate a LinkedIn post about ${formData.topic}. 
        Tone: ${formData.tone}. 
        Length: ${formData.length}.
        Target Audience: ${formData.targetAudience}.
        Content Type: ${formData.contentType}.
        ${
          formData.hashtagOption === "include"
            ? "Include relevant hashtags."
            : formData.hashtagOption === "minimal"
            ? "Include only 3-5 most relevant hashtags."
            : "Do not include hashtags."
        } 
        Additional information: ${formData.additionalInfo}
        
        Format the post in markdown with proper spacing for better readability.
        Use line breaks between paragraphs.
        If including hashtags, separate them from the main content with a line break.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setGeneratedPost(text);
    } catch (err) {
      console.error("Error generating post:", err);
      setError(err.message || "Failed to generate post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedPost)
      .then(() => alert("Post copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const regeneratePost = () => {
    generatePost();
  };

  return (
    <div className="App">
      <div className="header">
        <h1>ElevatePost AI</h1>
        <p>
          Create engaging LinkedIn posts tailored to your professional voice
        </p>
      </div>

      <div className="form-container">
        <form onSubmit={generatePost}>
          <div className="form-group">
            <label htmlFor="topic">What would you like to post about?</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="E.g., Recent achievements, industry trends, career advice"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tone">Tone</label>
              <select
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
              >
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="inspirational">Inspirational</option>
                <option value="educational">Educational</option>
                <option value="humorous">Humorous</option>
                <option value="authoritative">Authoritative</option>
                <option value="empathetic">Empathetic</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="length">Post Length</label>
              <select
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
              >
                <option value="short">Short (1-2 paragraphs)</option>
                <option value="medium">Medium (3-4 paragraphs)</option>
                <option value="long">Long (5+ paragraphs)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
              >
                <option value="professionals">General Professionals</option>
                <option value="executives">Executives & Leaders</option>
                <option value="recruiters">Recruiters & HR</option>
                <option value="developers">Developers & Engineers</option>
                <option value="marketers">Marketers</option>
                <option value="entrepreneurs">Entrepreneurs</option>
                <option value="students">Students & Graduates</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contentType">Content Type</label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
              >
                <option value="thought-leadership">Thought Leadership</option>
                <option value="industry-news">Industry News</option>
                <option value="career-advice">Career Advice</option>
                <option value="personal-story">Personal Story</option>
                <option value="company-update">Company Update</option>
                <option value="how-to">How-To Guide</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hashtagOption">Hashtags</label>
            <select
              id="hashtagOption"
              name="hashtagOption"
              value={formData.hashtagOption}
              onChange={handleChange}
            >
              <option value="include">Include hashtags</option>
              <option value="minimal">Minimal hashtags (3-5)</option>
              <option value="none">No hashtags</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">
              Additional Information (optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Any specific points you'd like to include in your post"
            />
          </div>

          <button type="submit" disabled={isLoading} className="generate-btn">
            {isLoading ? "Generating..." : "Generate Post"}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {generatedPost && !isLoading && (
        <div className="result-container">
          <h2>Your Generated Post</h2>
          <div className="post-preview">
            <ReactMarkdown>{generatedPost}</ReactMarkdown>
          </div>
          <div className="post-actions">
            <button onClick={regeneratePost}>Regenerate</button>
            <button onClick={copyToClipboard}>Copy to Clipboard</button>
          </div>
        </div>
      )}

      <footer className="developer-info">
        <p>Developed by Ashutosh Swamy</p>
        <div className="social-links">
          <a
            href="https://www.linkedin.com/in/ashutoshswamy/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="social-icon" size={20} /> LinkedIn
          </a>
          <a
            href="https://github.com/ashutoshswamy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
          >
            <Github className="social-icon" size={20} /> GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
