import Foundation

struct TTSJob: Codable, Identifiable {
    let id: String
    let status: String
    let text: String
    let voiceId: String
    let modelId: String
    let audioUrl: String?
    let durationSeconds: Double?
    let creditsUsed: Int?
    let createdAt: String
    let completedAt: String?
    let errorMessage: String?

    enum CodingKeys: String, CodingKey {
        case id
        case status
        case text
        case voiceId = "voice_id"
        case modelId = "model_id"
        case audioUrl = "audio_url"
        case durationSeconds = "duration_seconds"
        case creditsUsed = "credits_used"
        case createdAt = "created_at"
        case completedAt = "completed_at"
        case errorMessage = "error_message"
    }
}
