import SwiftUI
import AVFoundation

struct JobStatusView: View {
    let job: TTSJob
    @Binding var audioPlayer: AVPlayer?

    var body: some View {
        Section(header: Text("Job Status")) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Job ID:")
                        .fontWeight(.semibold)
                    Text(job.id)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                HStack {
                    Text("Status:")
                        .fontWeight(.semibold)
                    Text(job.status)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(statusColor)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }

                if let duration = job.durationSeconds {
                    HStack {
                        Text("Duration:")
                            .fontWeight(.semibold)
                        Text(String(format: "%.2f seconds", duration))
                    }
                }

                if let credits = job.creditsUsed {
                    HStack {
                        Text("Credits Used:")
                            .fontWeight(.semibold)
                        Text("\(credits)")
                    }
                }

                if let error = job.errorMessage {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                }

                if let audioUrl = job.audioUrl, let player = audioPlayer {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Generated Audio")
                            .fontWeight(.semibold)
                            .padding(.top, 8)

                        HStack(spacing: 16) {
                            Button(action: {
                                player.play()
                            }) {
                                Image(systemName: "play.circle.fill")
                                    .font(.largeTitle)
                                    .foregroundColor(.blue)
                            }

                            Button(action: {
                                player.pause()
                            }) {
                                Image(systemName: "pause.circle.fill")
                                    .font(.largeTitle)
                                    .foregroundColor(.blue)
                            }

                            Spacer()

                            Link(destination: URL(string: audioUrl)!) {
                                HStack {
                                    Image(systemName: "arrow.down.circle.fill")
                                    Text("Download")
                                }
                                .foregroundColor(.blue)
                            }
                        }
                    }
                    .padding(.top, 4)
                }
            }
        }
    }

    private var statusColor: Color {
        switch job.status {
        case "queued":
            return .blue
        case "processing":
            return .orange
        case "synthesized", "uploaded", "delivered":
            return .green
        case "failed":
            return .red
        case "cancelled":
            return .gray
        default:
            return .secondary
        }
    }
}
