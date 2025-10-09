from flask import Blueprint, request, jsonify
from services.creolecentric import CreoleCentricClient
import requests as http_requests

tts_bp = Blueprint('tts', __name__)
client = CreoleCentricClient()


@tts_bp.route('/tts/jobs', methods=['POST'])
def create_tts_job():
    """
    Create a new TTS job

    Accepts optional callback_url parameter for webhook notifications.
    Using webhooks is RECOMMENDED over polling for production applications.
    """
    try:
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400

        # Get callback URL from request if provided
        callback_url = data.get('callback_url')

        job = client.create_tts_job(
            text=data['text'],
            voice_id=data.get('voice_id', 'i4mRPwKM2yHwXhbmkN514'),
            model_id=data.get('model_id', 'ccl_ht_v100'),
            callback_url=callback_url,
            speed=data.get('speed'),
            pitch=data.get('pitch')
        )

        return jsonify(job), 201

    except http_requests.HTTPError as e:
        return jsonify({
            'error': str(e),
            'details': e.response.text if e.response else None
        }), e.response.status_code if e.response else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tts_bp.route('/tts/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status"""
    try:
        status = client.get_job_status(job_id)
        return jsonify(status)

    except http_requests.HTTPError as e:
        return jsonify({
            'error': str(e),
            'details': e.response.text if e.response else None
        }), e.response.status_code if e.response else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tts_bp.route('/tts/voices', methods=['GET'])
def get_voices():
    """Get available voices"""
    try:
        voices = client.get_voices()
        return jsonify(voices)

    except http_requests.HTTPError as e:
        return jsonify({'error': str(e)}), e.response.status_code if e.response else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tts_bp.route('/tts/models', methods=['GET'])
def get_models():
    """Get available models"""
    try:
        models = client.get_models()
        return jsonify(models)

    except http_requests.HTTPError as e:
        return jsonify({'error': str(e)}), e.response.status_code if e.response else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tts_bp.route('/credits/balance', methods=['GET'])
def get_credit_balance():
    """Get credit balance"""
    try:
        balance = client.get_credit_balance()
        return jsonify(balance)

    except http_requests.HTTPError as e:
        return jsonify({'error': str(e)}), e.response.status_code if e.response else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500
