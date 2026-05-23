import React, { useState } from "react";

import {
  Upload,
  FolderOpen,
  Music,
  Volume2,
  Video,
  FileAudio,
} from "lucide-react";

type Page = "upload" | "editor";

function UploadPage({ navigate }: { navigate: (p: Page) => void }) {
  const [dragging, setDragging] = useState(false);

  const [files, setFiles] = useState<
    {
      name: string;
      size: string;
      type: string;
      progress: number;
      status: string;
    }[]
  >([]);

  const uploadFile = async (file: File) => {
    const newFile = {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.split(".").pop() || "file",
      progress: 0,
      status: "processing",
    };

    setFiles((prev) => [newFile, ...prev]);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "https://transcripto-backend.onrender.com/transcribe",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? {
                ...f,
                progress: 100,
                status: "done",
              }
            : f
        )
      );

      console.log(data);

      alert(data.text || "Transcription complete");
    } catch (error) {
      console.error(error);

      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? {
                ...f,
                status: "failed",
              }
            : f
        )
      );

      alert("Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      uploadFile(droppedFile);
    }
  };

  const formats = [
    "MP3",
    "WAV",
    "MP4",
    "MOV",
    "M4A",
    "MKV",
    "FLAC",
    "OGG",
    "WEBM",
    "AIFF",
  ];

  const formatIcons: Record<string, typeof Music> = {
    mp3: Music,
    wav: Volume2,
    mp4: Video,
    mov: Video,
    m4a: FileAudio,
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white">
      <div className="p-8 max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            Transcripto AI
          </h1>

          <p className="text-white/50">
            Upload audio or video files to transcribe.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 mb-8 cursor-pointer ${
            dragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : "border-white/[0.12] hover:border-indigo-500/40 bg-white/[0.02] hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">

            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                dragging
                  ? "bg-indigo-500/20 border-2 border-indigo-500/40 scale-110"
                  : "bg-white/[0.04] border border-white/[0.08]"
              }`}
            >
              <Upload
                className={`w-7 h-7 transition-colors ${
                  dragging ? "text-indigo-400" : "text-white/30"
                }`}
              />
            </div>

            <h3 className="text-lg font-bold mb-2">
              {dragging ? "Drop files here" : "Drag & drop files"}
            </h3>

            <p className="text-sm text-white/40 mb-6">
              or click to browse your computer
            </p>

            <input
              type="file"
              id="fileUpload"
              accept="audio/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  uploadFile(file);
                }
              }}
            />

            <label htmlFor="fileUpload">
              <button className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
                <FolderOpen className="w-4 h-4" />
                Browse files
              </button>
            </label>

            <p className="text-xs text-white/20 mt-5">
              Max 5 GB per file · {formats.slice(0, 6).join(", ")} and more
            </p>

          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
            Supported formats
          </h3>

          <div className="flex flex-wrap gap-2">
            {formats.map((fmt) => (
              <span
                key={fmt}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono font-medium text-white/50"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {files.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Upload queue
              </h3>

              <span className="text-xs text-white/30">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div>
              {files.map((file, i) => {
                const IconComp = formatIcons[file.type] || FileAudio;

                return (
                  <div
                    key={i}
                    className="px-6 py-4 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-4 mb-2">

                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-4 h-4 text-indigo-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {file.name}
                        </div>

                        <div className="text-xs text-white/30">
                          {file.size}
                        </div>
                      </div>

                      <span className="text-xs text-indigo-300 capitalize">
                        {file.status}
                      </span>

                    </div>

                    {file.status === "processing" && (
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: "70%" }}
                        />
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function App() {
  return <UploadPage navigate={() => {}} />;
}

export default App;