from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Load OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/submit-tax-info', methods=['POST'])
def submit_tax_info():
    try:
        # Check if data and files exist
        if not request.form.get('income') or not request.form.get('expenses'):
            return jsonify({'error': 'Income and expenses are required'}), 400

        income = request.form['income']
        expenses = request.form['expenses']
        tax_type = request.form.get('taxType')  # Optional field
        receipts = request.files.get('receipts')  # Optional file

        # Handle uploaded file
        if receipts:
            upload_path = os.path.join("uploads", receipts.filename)
            receipts.save(upload_path)

        # Generate AI response
        prompt = (
            f"Provide tax advice based on the following details:\n"
            f"Income: {income}\nExpenses: {expenses}\nTax Type: {tax_type}"
        )
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=100
        )

        advice = response.choices[0].text.strip()
        return jsonify({'advice': advice}), 200

    except Exception as e:
        return jsonify({'error': f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    # Ensure "uploads" directory exists
    os.makedirs("uploads", exist_ok=True)
    app.run(host='0.0.0.0', port=5000)
