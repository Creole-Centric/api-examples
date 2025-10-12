import Foundation

enum CreoleCentricError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case httpError(statusCode: Int, message: String)
    case decodingError(Error)
    case timeout

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .httpError(let statusCode, let message):
            return "HTTP \(statusCode): \(message)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .timeout:
            return "Request timeout"
        }
    }
}

class CreoleCentricClient {
    private let apiKey: String
    private let baseUrl: String
    private let session: URLSession

    init(apiKey: String? = nil, baseUrl: String = "https://api.creolecentric.com/v1") {
        // Get API key from environment or parameter
        self.apiKey = apiKey
            ?? ProcessInfo.processInfo.environment["CREOLECENTRIC_API_KEY"]
            ?? "cc_your_api_key_here"
        self.baseUrl = baseUrl

        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: configuration)
    }

    func createTTSJob(request: TTSJobRequest) async throws -> TTSJob {
        guard let url = URL(string: "\(baseUrl)/tts/jobs/") else {
            throw CreoleCentricError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("ApiKey \(apiKey)", forHTTPHeaderField: "Authorization")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            urlRequest.httpBody = try JSONEncoder().encode(request)
        } catch {
            throw CreoleCentricError.decodingError(error)
        }

        do {
            let (data, response) = try await session.data(for: urlRequest)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw CreoleCentricError.networkError(URLError(.badServerResponse))
            }

            guard httpResponse.statusCode == 200 || httpResponse.statusCode == 201 else {
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw CreoleCentricError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
            }

            do {
                return try JSONDecoder().decode(TTSJob.self, from: data)
            } catch {
                throw CreoleCentricError.decodingError(error)
            }
        } catch let error as CreoleCentricError {
            throw error
        } catch {
            throw CreoleCentricError.networkError(error)
        }
    }

    func getJobStatus(jobId: String) async throws -> TTSJob {
        guard let url = URL(string: "\(baseUrl)/tts/jobs/\(jobId)/status/") else {
            throw CreoleCentricError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "GET"
        urlRequest.setValue("ApiKey \(apiKey)", forHTTPHeaderField: "Authorization")

        do {
            let (data, response) = try await session.data(for: urlRequest)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw CreoleCentricError.networkError(URLError(.badServerResponse))
            }

            guard httpResponse.statusCode == 200 else {
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw CreoleCentricError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
            }

            do {
                return try JSONDecoder().decode(TTSJob.self, from: data)
            } catch {
                throw CreoleCentricError.decodingError(error)
            }
        } catch let error as CreoleCentricError {
            throw error
        } catch {
            throw CreoleCentricError.networkError(error)
        }
    }

}
