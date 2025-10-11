import Foundation

// MARK: - Type Definitions

struct HealthResponse: Codable {
    let status: String
    let service: String
    let database: String
    let version: String
}

struct CreditBalance: Codable {
    let totalCredits: Int
    let subscriptionCredits: Int
    let purchasedCredits: Int
    let subscriptionPlan: String?

    enum CodingKeys: String, CodingKey {
        case totalCredits = "total_credits"
        case subscriptionCredits = "subscription_credits"
        case purchasedCredits = "purchased_credits"
        case subscriptionPlan = "subscription_plan"
    }
}

struct Voice: Codable {
    let id: String
    let voiceId: String
    let name: String
    let description: String
    let gender: String
    let region: String
    let regionCode: String?
    let accent: String?
    let style: String?
    let qualityLevel: String?
    let ageGroup: String?
    let languageCode: String
    let isActive: Bool
    let isDefault: Bool
    let isFeatured: Bool
    let isPremium: Bool
    let previewUrl: String?
    let previewText: String?
    let tags: [String]?
    let defaultStability: Double?
    let defaultSimilarityBoost: Double?

    enum CodingKeys: String, CodingKey {
        case id, name, description, gender, region, accent, style, tags
        case voiceId = "voice_id"
        case regionCode = "region_code"
        case qualityLevel = "quality_level"
        case ageGroup = "age_group"
        case languageCode = "language_code"
        case isActive = "is_active"
        case isDefault = "is_default"
        case isFeatured = "is_featured"
        case isPremium = "is_premium"
        case previewUrl = "preview_url"
        case previewText = "preview_text"
        case defaultStability = "default_stability"
        case defaultSimilarityBoost = "default_similarity_boost"
    }
}

struct VoicesResponse: Codable {
    let success: Bool
    let voices: [Voice]
    let count: Int
    let source: String
}

struct Model: Codable {
    let id: String
    let name: String
    let displayName: String?
    let description: String
    let version: String?
    let qualityScore: Double?
    let isDefault: Bool?
    let isPremium: Bool?
    let supportedLanguages: [String]?

    enum CodingKeys: String, CodingKey {
        case id, name, description, version
        case displayName = "display_name"
        case qualityScore = "quality_score"
        case isDefault = "is_default"
        case isPremium = "is_premium"
        case supportedLanguages = "supported_languages"
    }
}

struct ModelsResponse: Codable {
    let success: Bool
    let models: [Model]
    let count: Int
}

struct TTSJob: Codable {
    let id: String
    let text: String
    let voiceId: String
    let voiceName: String?
    let modelId: String
    let status: String
    let createdAt: String
    let startedAt: String?
    let completedAt: String?
    let audioFileUrl: String?
    let durationSeconds: Double?
    let durationFormatted: String?
    let creditsUsed: Int
    let charactersProcessed: Int?
    let errorMessage: String?

    enum CodingKeys: String, CodingKey {
        case id, text, status
        case voiceId = "voice_id"
        case voiceName = "voice_name"
        case modelId = "model_id"
        case createdAt = "created_at"
        case startedAt = "started_at"
        case completedAt = "completed_at"
        case audioFileUrl = "audio_file_url"
        case durationSeconds = "duration_seconds"
        case durationFormatted = "duration_formatted"
        case creditsUsed = "credits_used"
        case charactersProcessed = "characters_processed"
        case errorMessage = "error_message"
    }
}

struct JobStatusResponse: Codable {
    let status: String
    let audioUrl: String?
    let durationSeconds: Double?
    let errorMessage: String?

    enum CodingKeys: String, CodingKey {
        case status
        case audioUrl = "audio_url"
        case durationSeconds = "duration_seconds"
        case errorMessage = "error_message"
    }
}

struct JobListResponse: Codable {
    let results: [TTSJob]
    let count: Int
    let next: String?
    let previous: String?
}

struct CreateJobRequest: Codable {
    let text: String
    let voiceId: String
    let modelId: String
    let webhookUrl: String?
    let speed: Double?
    let stability: Double?
    let similarityBoost: Double?
    let style: Double?
    let useSpeakerBoost: Bool?

    enum CodingKeys: String, CodingKey {
        case text
        case voiceId = "voice_id"
        case modelId = "model_id"
        case webhookUrl = "webhook_url"
        case speed, stability, style
        case similarityBoost = "similarity_boost"
        case useSpeakerBoost = "use_speaker_boost"
    }
}

// MARK: - API Client

enum CreoleCentricError: Error {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int, message: String)
    case decodingError(Error)
    case networkError(Error)
    case timeout

    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode, let message):
            return "HTTP \(statusCode): \(message)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .timeout:
            return "Request timed out"
        }
    }
}

class CreoleCentricAPI {
    private let apiKey: String
    private let baseURL: String
    private let session: URLSession

    init(apiKey: String, baseURL: String = "https://creolecentric.com/api/v1") {
        self.apiKey = apiKey
        self.baseURL = baseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }

    // MARK: - Private Methods

    private func makeRequest<T: Decodable>(
        method: String,
        endpoint: String,
        body: Encodable? = nil
    ) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw CreoleCentricError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("ApiKey \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let body = body {
            let encoder = JSONEncoder()
            encoder.keyEncodingStrategy = .convertToSnakeCase
            request.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw CreoleCentricError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw CreoleCentricError.httpError(statusCode: httpResponse.statusCode, message: message)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw CreoleCentricError.decodingError(error)
        }
    }

    // MARK: - Health Check

    func checkHealth() async throws -> HealthResponse {
        return try await makeRequest(method: "GET", endpoint: "/health/")
    }

    // MARK: - User & Credits

    func getCreditBalance() async throws -> CreditBalance {
        return try await makeRequest(method: "GET", endpoint: "/credits/balance/")
    }

    // MARK: - Voices & Models

    func getVoices() async throws -> VoicesResponse {
        return try await makeRequest(method: "GET", endpoint: "/tts/voices/")
    }

    func getModels() async throws -> ModelsResponse {
        return try await makeRequest(method: "GET", endpoint: "/tts/models/")
    }

    // MARK: - TTS Jobs

    func createTTSJob(
        text: String,
        voiceId: String,
        modelId: String,
        speed: Double? = nil,
        stability: Double? = nil,
        similarityBoost: Double? = nil
    ) async throws -> TTSJob {
        let request = CreateJobRequest(
            text: text,
            voiceId: voiceId,
            modelId: modelId,
            webhookUrl: nil,
            speed: speed,
            stability: stability,
            similarityBoost: similarityBoost,
            style: nil,
            useSpeakerBoost: nil
        )

        return try await makeRequest(method: "POST", endpoint: "/tts/jobs/", body: request)
    }

    func getJobStatus(jobId: String) async throws -> JobStatusResponse {
        return try await makeRequest(method: "GET", endpoint: "/tts/jobs/\(jobId)/status/")
    }

    func getJobDetails(jobId: String) async throws -> TTSJob {
        return try await makeRequest(method: "GET", endpoint: "/tts/jobs/\(jobId)/")
    }

    func listJobs(limit: Int = 10, offset: Int = 0) async throws -> JobListResponse {
        return try await makeRequest(method: "GET", endpoint: "/tts/jobs/list/?limit=\(limit)&offset=\(offset)")
    }

    func cancelJob(jobId: String) async throws {
        let _: [String: String] = try await makeRequest(method: "POST", endpoint: "/tts/jobs/\(jobId)/cancel/")
    }

    // MARK: - Express TTS

    func expressTTS(text: String, voiceId: String) async throws -> Data {
        guard let url = URL(string: baseURL + "/tts/express/") else {
            throw CreoleCentricError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("ApiKey \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["text": text, "voice_id": voiceId]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw CreoleCentricError.invalidResponse
        }

        return data
    }
}

// MARK: - Example Usage (Command Line)

@main
struct CreoleCentricExample {
    static func main() async {
        guard let apiKey = ProcessInfo.processInfo.environment["CREOLECENTRIC_API_KEY"] else {
            print("Error: CREOLECENTRIC_API_KEY environment variable not set")
            print("Please set it with your API key: export CREOLECENTRIC_API_KEY='cc_your_key_here'")
            return
        }

        let client = CreoleCentricAPI(apiKey: apiKey)

        do {
            // 1. Check API health
            print(String(repeating: "=", count: 50))
            print("1. Checking API Health")
            print(String(repeating: "=", count: 50))
            let health = try await client.checkHealth()
            print("API Status: \(health.status)")
            print("Version: \(health.version)\n")

            // 2. Get credit balance
            print(String(repeating: "=", count: 50))
            print("2. Credit Balance")
            print(String(repeating: "=", count: 50))
            let balance = try await client.getCreditBalance()
            print("Total Credits: \(balance.totalCredits)")
            print("Subscription Credits: \(balance.subscriptionCredits)")
            print("Purchased Credits: \(balance.purchasedCredits)\n")

            // 3. Get available voices
            print(String(repeating: "=", count: 50))
            print("3. Available Voices")
            print(String(repeating: "=", count: 50))
            let voicesResponse = try await client.getVoices()
            let voices = voicesResponse.voices
            print("Found \(voicesResponse.count) voices (source: \(voicesResponse.source)):")
            for voice in voices.prefix(5) {
                print("  - \(voice.name) (ID: \(voice.voiceId))")
                print("    Region: \(voice.region), Gender: \(voice.gender)")
            }
            print()

            // 4. Get available models
            print(String(repeating: "=", count: 50))
            print("4. Available Models")
            print(String(repeating: "=", count: 50))
            let modelsResponse = try await client.getModels()
            let models = modelsResponse.models
            print("Found \(modelsResponse.count) models:")
            for model in models {
                let displayName = model.displayName ?? model.name
                print("  - \(displayName) (ID: \(model.id))")
                print("    Description: \(model.description)")
            }
            print()

            // 5. Create a TTS job
            print(String(repeating: "=", count: 50))
            print("5. Creating TTS Job")
            print(String(repeating: "=", count: 50))

            let text = "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen."
            print("Text: \(text)")

            var voiceId = "i4mRPwKM2yHwXhbmkN514"  // Xavier Bruneau
            var modelId = "ccl_ht_v100"

            // Use first voice if not a placeholder
            if let firstVoice = voices.first,
               !["voice_1", "voice_2"].contains(firstVoice.voiceId) {
                voiceId = firstVoice.voiceId
            }
            if let firstModel = models.first {
                modelId = firstModel.id
            }

            let job = try await client.createTTSJob(
                text: text,
                voiceId: voiceId,
                modelId: modelId
            )

            print("Job created successfully!")
            print("Job ID: \(job.id)")
            print("Status: \(job.status)")
            print("Credits used: \(job.creditsUsed)\n")
            print("📢 To receive webhook notifications, pass webhookUrl parameter to createTTSJob:")
            print("   Events: tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered")
            print("   See examples/webhook_server.swift for webhook handling example\n")

            // 6. List recent jobs
            print(String(repeating: "=", count: 50))
            print("6. Recent Jobs")
            print(String(repeating: "=", count: 50))

            let jobList = try await client.listJobs(limit: 5)
            print("Recent \(jobList.results.count) jobs:")

            for job in jobList.results {
                let jobIdDisplay = String(job.id.prefix(8)) + "..."
                print("  - Job \(jobIdDisplay)")
                print("    Created: \(job.createdAt)")
                print("    Status: \(job.status)")
                if !job.text.isEmpty {
                    let textPreview = String(job.text.prefix(50))
                    print("    Text: \(textPreview)\(job.text.count > 50 ? "..." : "")")
                }
            }

        } catch {
            print("Error: \(error.localizedDescription)")
        }
    }
}
