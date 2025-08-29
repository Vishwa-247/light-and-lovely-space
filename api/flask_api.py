
from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from flask_cors import CORS
import base64
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the Gemini API with your API key
# In production, use environment variables for API keys
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "your-api-key-here"))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        action = data.get('action')
        request_data = data.get('data', {})
        
        # Handle direct prompts for flexibility
        custom_prompt = data.get('prompt')

        if not action and not custom_prompt:
            return jsonify({"success": False, "error": "No action or prompt specified"}), 400

        prompt = ""

        if custom_prompt:
            # Use the provided prompt directly
            prompt = custom_prompt
        elif action == 'generate_course':
            prompt = (f"Create a complete course on {request_data['topic']} for {request_data['purpose']} at {request_data['difficulty']} level.\n\n"
                     f"Follow this exact structure:\n\n"
                     f"# SUMMARY\nProvide a concise overview of what the course covers and its objectives.\n\n"
                     f"# CHAPTERS\nCreate 5-8 logically structured chapters. For each chapter:\n"
                     f"## [Chapter Title]\n"
                     f"[Chapter Content with detailed and comprehensive content including examples, explanations, and relevant concepts]\n\n"
                     f"# FLASHCARDS\nCreate at least 15 flashcards in this format:\n"
                     f"- Question: [question text]\n"
                     f"- Answer: [answer text]\n\n"
                     f"# MCQs (Multiple Choice Questions)\nCreate at least 10 multiple choice questions in this format:\n"
                     f"- Question: [question text]\n"
                     f"- Options: \na) [option text] \nb) [option text] \nc) [option text] \nd) [option text]\n"
                     f"- Correct Answer: [correct letter]\n\n"
                     f"# Q&A PAIRS\nCreate at least 10 question and answer pairs for deeper understanding:\n"
                     f"- Question: [detailed question]\n"
                     f"- Answer: [comprehensive answer]\n\n"
                     f"Ensure the course is educational, accurate, and tailored to {request_data['purpose']} at {request_data['difficulty']} level.")

        elif action == 'generate_study_notes':
            prompt = (f"You are an AI tutor. Generate detailed study notes on the topic: \"{request_data['topic']}\"\n"
                     f"with the following difficulty level: {request_data['difficulty']}. Keep it beginner-friendly if easy, or deep and advanced if hard.\n"
                     f"Return in clean markdown format with headings, bullet points, and examples.")

        elif action == 'generate_flashcards':
            prompt = (f"Generate 10 flashcards for the topic \"{request_data['topic']}\".\n"
                     f"Each flashcard should be in the format:\n"
                     f"Q: Question here?\n"
                     f"A: Answer here.\n"
                     f"Target difficulty: {request_data['difficulty']}.")

        elif action == 'generate_mcqs':
            prompt = (f"Generate 10 multiple choice questions for \"{request_data['topic']}\" with difficulty level \"{request_data['difficulty']}\".\n"
                     f"Each question should have 4 options and clearly indicate the correct answer.\n"
                     f"Return in JSON format:\n"
                     f"[\n"
                     f"  {{\n"
                     f"    \"question\": \"...\",\n"
                     f"    \"options\": [\"A\", \"B\", \"C\", \"D\"],\n"
                     f"    \"answer\": \"A\"\n"
                     f"  }},\n"
                     f"  ...\n"
                     f"]")
        
        elif action == 'generate_qna':
            prompt = (f"Generate a list of 10 potential questions and answers on the topic \"{request_data['topic']}\".\n"
                     f"The questions should reflect real-world use cases and interview-style questions.\n"
                     f"Output format:\n"
                     f"Q: ...\n"
                     f"A: ...")
        
        elif action == 'generate_interview_questions':
            prompt = (f"Generate {request_data.get('questionCount', 5)} interview questions for a {request_data['experience']} years experienced {request_data['jobRole']} "
                     f"with expertise in {request_data['techStack']}. The questions should be challenging and relevant to the role.\n"
                     f"For each question:\n"
                     f"1. Focus on technical knowledge and practical application\n"
                     f"2. Test problem-solving abilities\n"
                     f"3. Include scenario-based questions\n"
                     f"4. Assess teamwork and collaboration skills\n"
                     f"Format as a numbered list.")
        
        elif action == 'analyze_interview':
            prompt = (f"You are a communication skill evaluator. Analyze the following response from a user during a mock interview:\n\n"
                     f"\"{request_data['answer']}\"\n\n"
                     f"Question they were answering: \"{request_data['question']}\"\n"
                     f"Job role: {request_data['jobRole']}\n\n"
                     f"Evaluate it based on:\n"
                     f"1. Clarity of thought\n"
                     f"2. Speaking structure\n"
                     f"3. Use of filler words\n"
                     f"4. Grammar\n"
                     f"5. Confidence\n\n"
                     f"Give feedback and suggestions for improvement. Return a communication score out of 10.")
        
        elif action == 'custom_content':
            prompt = data.get('prompt', '')
            if not prompt:
                return jsonify({"success": False, "error": "No prompt provided for custom_content action"}), 400
        
        else:
            return jsonify({"success": False, "error": f"Unsupported action: {action}"}), 400
        
        try:
            # Generate content using the Gemini model
            response = model.generate_content(prompt)
            
            # Format the response to match the expected format
            response_text = response.text

            return jsonify({
                "success": True, 
                "text": response_text
            }), 200
            
        except Exception as e:
            print(f"Error in Gemini API call: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500
    
    except Exception as e:
        print(f"Error in generate endpoint: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/analyze_facial', methods=['POST'])
def analyze_facial():
    """
    Analyze facial expressions from an image
    
    This endpoint accepts a multipart form data with an 'image' field containing the image file.
    It returns a JSON object with confidence scores for different facial expressions.
    
    In a real implementation, this would use a proper computer vision model.
    For now, we'll return simulated values.
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image provided"
            }), 400
            
        # Get the image file
        image_file = request.files['image']
        
        # Normally, we would process the image with a CV model here
        # For this demo, we'll return simulated values
        # These would be percentages representing confidence in different expressions
        
        # Generate simulated facial expression analysis
        # In reality, this would be the output of a computer vision model
        analysis_result = {
            "confident": min(max(50 + (datetime.now().timestamp() % 30) - 15, 0), 100),
            "stressed": min(max(30 + (datetime.now().timestamp() % 40) - 20, 0), 100),
            "hesitant": min(max(40 + (datetime.now().timestamp() % 20) - 10, 0), 100),
            "nervous": min(max(20 + (datetime.now().timestamp() % 50) - 25, 0), 100),
            "excited": min(max(60 + (datetime.now().timestamp() % 25) - 12, 0), 100)
        }
        
        return jsonify({
            "success": True,
            "data": analysis_result
        }), 200
        
    except Exception as e:
        print(f"Error in analyze_facial endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Default port is 5000, but can be configured with an environment variable
    port = int(os.environ.get("PORT", 5000))
    
    # In production, set debug=False
    debug_mode = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
