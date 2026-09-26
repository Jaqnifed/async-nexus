"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setMessage("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    selectFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message || "Upload failed"
        );
      }

      setMessage("success");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080b12] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-5">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold text-lg">
            D
          </div>

          <div>
            <h1 className="font-semibold tracking-tight">
              DecisionVault
            </h1>

            <p className="text-xs text-gray-500">
              Organizational Memory
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden items-center gap-2 md:flex">

          <button
            type="button"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          >
            Documents
          </button>

          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm text-gray-500"
            title="Question engine coming soon"
          >
            Ask DecisionVault
          </button>

          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm text-gray-500"
            title="Decision dashboard coming soon"
          >
            Decisions
          </button>

        </div>
      </nav>

      {/* MAIN */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl flex-col items-center px-6 py-16">

        {/* Heading */}
        <div className="mb-10 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            KNOWLEDGE INGESTION
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Upload a decision document
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-400">
            Turn meeting notes and project documents into structured
            organizational memory. DecisionVault extracts decisions,
            reasons, owners and alternatives automatically.
          </p>

        </div>

        {/* UPLOAD CARD */}
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">

          {/* DROP AREA */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-[22px] border-2 border-dashed p-10 text-center ${
              dragging
                ? "border-violet-400 bg-violet-500/10"
                : "border-white/10 bg-black/10"
            }`}
          >

            {/* Upload icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/15 text-3xl">
              ↑
            </div>

            <h3 className="text-xl font-semibold">
              Drop your PDF here
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              or choose a file from your computer
            </p>

            {/* Choose PDF */}
            <label className="mt-7 inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium">
              Choose PDF

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="mt-4 text-xs text-gray-600">
              PDF files only
            </p>

          </div>

          {/* SELECTED FILE */}
          {file && (
            <div className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-sm text-red-400">
                  PDF
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setMessage("");
                }}
                className="ml-4 text-xs text-gray-500"
              >
                Remove
              </button>

            </div>
          )}

          {/* UPLOAD BUTTON */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`mt-2 w-full rounded-2xl px-6 py-4 text-sm font-semibold ${
              !file || uploading
                ? "cursor-not-allowed bg-white/5 text-gray-600"
                : "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
            }`}
          >
            {uploading
              ? "Processing document..."
              : "Upload & Analyze PDF"}
          </button>

          {/* SUCCESS */}
          {message === "success" && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
              ✓ PDF uploaded and processed successfully.
            </div>
          )}

          {/* ERROR */}
          {message && message !== "success" && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
              {message}
            </div>
          )}

        </div>

        {/* PROCESS */}
        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">01</p>

            <h4 className="mt-2 text-sm font-semibold">
              Upload
            </h4>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add your meeting or project PDF.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">02</p>

            <h4 className="mt-2 text-sm font-semibold">
              Extract
            </h4>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              AI identifies important decisions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">03</p>

            <h4 className="mt-2 text-sm font-semibold">
              Remember
            </h4>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Store the knowledge for future questions.
            </p>
          </div>

        </div>

      </section>
    </main>
  );
}