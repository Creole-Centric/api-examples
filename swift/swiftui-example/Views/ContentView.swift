import SwiftUI
import AVFoundation

struct ContentView: View {
    @State private var text: String = ""
    @State private var voiceId: String = "i4mRPwKM2yHwXhbmkN514"
    @State private var modelId: String = "ccl_ht_v100"
    @State private var speed: Double = 1.0
    @State private var pitch: Double = 1.0

    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var currentJob: TTSJob?

    @State private var audioPlayer: AVPlayer?

    private let client = CreoleCentricClient()

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Text Input")) {
                    TextEditor(text: $text)
                        .frame(minHeight: 100)
                        .disabled(isLoading)
                    Text("Enter Haitian Creole text to convert to speech")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Section(header: Text("Voice Settings")) {
                    TextField("Voice ID", text: $voiceId)
                        .disabled(isLoading)
                    Text("Default: Xavier Bruneau (i4mRPwKM2yHwXhbmkN514)")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Picker("Model", selection: $modelId) {
                        Text("Haitian Creole v100").tag("ccl_ht_v100")
                    }
                    .disabled(isLoading)
                }

                Section(header: Text("Audio Settings")) {
                    VStack(alignment: .leading) {
                        Text("Speed: \(speed, specifier: "%.1f")")
                        Slider(value: $speed, in: 0.5...2.0, step: 0.1)
                            .disabled(isLoading)
                    }

                    VStack(alignment: .leading) {
                        Text("Pitch: \(pitch, specifier: "%.1f")")
                        Slider(value: $pitch, in: 0.5...2.0, step: 0.1)
                            .disabled(isLoading)
                    }
                }

                Section {
                    Button(action: generateSpeech) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                            }
                            Text(isLoading ? "Processing..." : "Generate Speech")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
                }

                if let error = errorMessage {
                    Section(header: Text("Error")) {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }

                if let job = currentJob {
                    JobStatusView(job: job, audioPlayer: $audioPlayer)
                }
            }
            .navigationTitle("CreoleCentric TTS")
        }
    }

    private func generateSpeech() {
        guard !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }

        isLoading = true
        errorMessage = nil
        currentJob = nil

        Task {
            do {
                let request = TTSJobRequest(
                    text: text,
                    voiceId: voiceId,
                    modelId: modelId,
                    speed: speed,
                    pitch: pitch
                )

                let job = try await client.createTTSJob(request: request)
                await MainActor.run {
                    currentJob = job
                }

                // Wait for completion
                let completedJob = try await client.waitForJob(jobId: job.id)
                await MainActor.run {
                    currentJob = completedJob
                    isLoading = false

                    // Setup audio player if available
                    if let audioUrlString = completedJob.audioUrl,
                       let audioUrl = URL(string: audioUrlString) {
                        audioPlayer = AVPlayer(url: audioUrl)
                    }
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
