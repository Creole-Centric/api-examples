import Foundation

struct TTSJobRequest: Codable {
    let text: String
    let voiceId: String
    let modelId: String
    let speed: Double
    let pitch: Double

    enum CodingKeys: String, CodingKey {
        case text
        case voiceId = "voice_id"
        case modelId = "model_id"
        case speed
        case pitch
    }

    init(text: String,
         voiceId: String = "i4mRPwKM2yHwXhbmkN514",
         modelId: String = "ccl_ht_v100",
         speed: Double = 1.0,
         pitch: Double = 1.0) {
        self.text = text
        self.voiceId = voiceId
        self.modelId = modelId
        self.speed = speed
        self.pitch = pitch
    }
}
