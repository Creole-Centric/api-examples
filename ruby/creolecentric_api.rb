#!/usr/bin/env ruby
# frozen_string_literal: true

#
# CreoleCentric TTS API Client Example
# =====================================
# This example demonstrates how to use the CreoleCentric Text-to-Speech API.
#
# Requirements:
#     gem install http dotenv
#

require 'http'
require 'json'
require 'dotenv/load'

# Client for interacting with CreoleCentric TTS API
class CreoleCentricAPI
  attr_reader :api_key, :base_url

  # Initialize the API client
  #
  # @param api_key [String] Your API key starting with 'cc_'
  # @param base_url [String] Base URL for the API (default: production URL)
  def initialize(api_key, base_url = 'https://creolecentric.com/api/v1')
    @api_key = api_key
    @base_url = base_url.chomp('/')
    @headers = {
      'Authorization' => "ApiKey #{api_key}",
      'Content-Type' => 'application/json'
    }
  end

  # Make an HTTP request to the API
  #
  # @param method [Symbol] HTTP method (:get, :post, etc.)
  # @param endpoint [String] API endpoint (e.g., '/tts/jobs/')
  # @param data [Hash, nil] JSON data for POST requests
  # @param params [Hash, nil] Query parameters
  # @return [Hash] Response JSON data
  # @raise [HTTP::Error] If the request fails
  def make_request(method, endpoint, data: nil, params: nil)
    url = "#{@base_url}#{endpoint}"

    response = HTTP.headers(@headers).timeout(30).request(
      method,
      url,
      json: data,
      params: params
    )

    raise HTTP::Error, "HTTP #{response.code}: #{response.body}" unless response.status.success?

    response.body.empty? ? {} : JSON.parse(response.body.to_s)
  rescue HTTP::Error => e
    puts "HTTP Error: #{e}"
    raise
  rescue StandardError => e
    puts "Request Error: #{e}"
    raise
  end

  # ============== Health Check ==============

  # Check API health status
  #
  # @return [Hash] Health status information
  def check_health
    make_request(:get, '/health/')
  end

  # ============== User & Credits ==============

  # Get current user information
  #
  # @return [Hash] User profile data
  def get_user_info
    make_request(:get, '/users/profile/')
  end

  # Get current credit balance
  #
  # @return [Hash] Credit balance information
  def get_credit_balance
    make_request(:get, '/credits/balance/')
  end

  # ============== Voices & Models ==============

  # Get list of available voices
  #
  # @return [Hash] Dictionary containing:
  #   - success: bool
  #   - voices: list of voice dictionaries
  #   - count: number of voices
  #   - source: data source (infer or local)
  def get_voices
    make_request(:get, '/tts/voices/')
  end

  # Get list of available TTS models
  #
  # @return [Hash] Dictionary containing:
  #   - success: bool
  #   - models: list of model dictionaries
  #   - count: number of models
  def get_models
    make_request(:get, '/tts/models/')
  end

  # Get voice settings configuration
  #
  # @return [Hash] Voice settings data
  def get_voice_settings
    make_request(:get, '/tts/voice-settings/')
  end

  # ============== TTS Jobs ==============

  # Create a new TTS job
  #
  # @param text [String] Text to convert to speech
  # @param voice_id [String] ID of the voice to use
  # @param model_id [String] ID of the model to use
  # @param options [Hash] Additional parameters (speed, pitch, etc.)
  # @return [Hash] Job details including job_id
  def create_tts_job(text, voice_id: 'qW6MAd7f5iuYw7bAH96wC', model_id: 'ccl_ht_v100', **options)
    data = {
      text: text,
      voice_id: voice_id,
      model_id: model_id
    }.merge(options)

    make_request(:post, '/tts/jobs/', data: data)
  end

  # Get status of a TTS job
  #
  # @param job_id [String] UUID of the job
  # @return [Hash] Job status and details
  def get_job_status(job_id)
    make_request(:get, "/tts/jobs/#{job_id}/status/")
  end

  # Get full details of a TTS job
  #
  # @param job_id [String] UUID of the job
  # @return [Hash] Complete job information
  def get_job_details(job_id)
    make_request(:get, "/tts/jobs/#{job_id}/")
  end

  # List TTS jobs for the current user
  #
  # @param limit [Integer] Number of jobs to return
  # @param offset [Integer] Pagination offset
  # @return [Hash] List of jobs with pagination info
  def list_jobs(limit: 10, offset: 0)
    make_request(:get, '/tts/jobs/list/', params: { limit: limit, offset: offset })
  end

  # Cancel a pending or processing TTS job
  #
  # @param job_id [String] UUID of the job to cancel
  # @return [Hash] Cancellation status
  def cancel_job(job_id)
    make_request(:post, "/tts/jobs/#{job_id}/cancel/")
  end

  # ============== Express TTS ==============

  # Use express TTS for immediate audio generation (shorter texts)
  #
  # @param text [String] Text to convert (max 500 characters recommended)
  # @param voice_id [String] Voice to use
  # @return [String] Audio data as binary string
  def express_tts(text, voice_id: 'qW6MAd7f5iuYw7bAH96wC')
    data = {
      text: text,
      voice_id: voice_id
    }

    response = HTTP.headers(@headers).timeout(30).post(
      "#{@base_url}/tts/express/",
      json: data
    )

    raise HTTP::Error, "HTTP #{response.code}" unless response.status.success?

    response.body.to_s
  end
end

# Example usage of the CreoleCentric API client
def main
  # Load API key from environment variable or .env file
  api_key = ENV['CREOLECENTRIC_API_KEY']

  unless api_key
    puts 'Error: CREOLECENTRIC_API_KEY environment variable not set'
    puts "Please set it with your API key: export CREOLECENTRIC_API_KEY='cc_your_key_here'"
    return
  end

  # Initialize client
  client = CreoleCentricAPI.new(api_key)

  # 1. Check API health
  puts '=' * 50
  puts '1. Checking API Health'
  puts '=' * 50
  health = client.check_health
  puts "API Status: #{health['status']}"
  puts "Version: #{health['version']}"
  puts

  # 2. Get credit balance
  puts '=' * 50
  puts '2. Credit Balance'
  puts '=' * 50
  balance = client.get_credit_balance
  puts "Total Credits: #{balance['total_credits'] || 0}"
  puts "Subscription Credits: #{balance['subscription_credits'] || 0}"
  puts "Purchased Credits: #{balance['purchased_credits'] || 0}"
  puts

  # 3. Get available voices
  puts '=' * 50
  puts '3. Available Voices'
  puts '=' * 50
  voices_response = client.get_voices
  voices = voices_response['voices'] || []
  count = voices_response['count'] || voices.length
  source = voices_response['source'] || 'unknown'
  puts "Found #{count} voices (source: #{source}):"
  voices.first(5).each do |voice|
    puts "  - #{voice['name']} (ID: #{voice['voice_id']})"
    puts "    Region: #{voice['region']}, Gender: #{voice['gender']}"
  end
  puts

  # 4. Get available models
  puts '=' * 50
  puts '4. Available Models'
  puts '=' * 50
  models_response = client.get_models
  models = models_response['models'] || []
  count = models_response['count'] || models.length
  puts "Found #{count} models:"
  models.each do |model|
    name = model['display_name'] || model['name']
    puts "  - #{name} (ID: #{model['id']})"
    puts "    Description: #{model['description']}"
  end
  puts

  # 5. Create a TTS job
  puts '=' * 50
  puts '5. Creating TTS Job'
  puts '=' * 50

  text = 'Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen.'
  puts "Text: #{text}"

  # Use Xavier Bruneau voice and default Haitian Creole model
  # To find voice IDs: Go to Voice Library page, click "More" (...) on any voice card
  # To find model IDs: In TTS interface, go to Speech Options tab, click Model field

  # Use a real voice ID - don't rely on voices list which may contain placeholders
  voice_id = 'i4mRPwKM2yHwXhbmkN514'  # Xavier Bruneau
  model_id = 'ccl_ht_v100'  # Default Haitian Creole model

  # If you want to use a voice from the list, make sure it's not a placeholder
  if voices.any? && !%w[voice_1 voice_2].include?(voices[0]['voice_id'])
    voice_id = voices[0]['voice_id']
  end
  model_id = models[0]['id'] if models.any?

  # To use webhooks, add webhook_url parameter:
  job = client.create_tts_job(
    text,
    voice_id: voice_id,
    model_id: model_id,
    webhook_url: 'https://your-app.com/webhooks/tts'  # Your webhook endpoint
  )

  job_id = job['id']
  puts 'Job created successfully!'
  puts "Job ID: #{job_id}"
  puts "Status: #{job['status']}"
  puts "Credits used: #{job['credits_used'] || 0}"
  puts
  puts '📢 Webhook notifications will be sent to your endpoint:'
  puts '   - tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered'
  puts '   See examples/webhook_server.rb for webhook handling example'
  puts

  # 6. List recent jobs
  puts '=' * 50
  puts '6. Recent Jobs'
  puts '=' * 50

  jobs = client.list_jobs(limit: 5)
  results = jobs['results'] || []
  puts "Recent #{results.length} jobs:"

  results.each do |job|
    created = job['created_at'] || ''
    job_id = job['id']
    job_id_display = job_id ? "#{job_id[0..7]}..." : 'N/A'
    puts "  - Job #{job_id_display}"
    puts "    Created: #{created}"
    puts "    Status: #{job['status']}"
    text_preview = job['text'] || ''
    if !text_preview.empty?
      preview = text_preview.length > 50 ? "#{text_preview[0..49]}..." : text_preview
      puts "    Text: #{preview}"
    end
  end
rescue StandardError => e
  puts "Error: #{e}"
  puts e.backtrace
end

main if __FILE__ == $PROGRAM_NAME
