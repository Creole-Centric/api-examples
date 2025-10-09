from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.tts import tts_bp
from routes.webhooks import webhook_bp

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(tts_bp, url_prefix='/api')
app.register_blueprint(webhook_bp, url_prefix='/api')  # Webhook endpoints (RECOMMENDED)


@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'CreoleCentric TTS API - Flask Example',
        'version': '1.0.0',
        'endpoints': {
            'createJob': 'POST /api/tts/jobs',
            'getJobStatus': 'GET /api/tts/jobs/<job_id>',
            'getVoices': 'GET /api/tts/voices',
            'getModels': 'GET /api/tts/models',
            'getCreditBalance': 'GET /api/credits/balance',
            'webhookReceiver': 'POST /api/webhooks/tts (RECOMMENDED)',
            'webhookTest': 'GET /api/webhooks/test'
        },
        'documentation': 'https://creolecentric.com/developer'
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    app.run(debug=True)
