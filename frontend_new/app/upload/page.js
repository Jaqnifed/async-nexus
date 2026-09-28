"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

const API_URL = "/api";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Set when the chosen PDF is already in memory, so we can ask first
  const [existingDoc, setExistingDoc] = useState(null);

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setMessage("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setExistingDoc(null);
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

  // Step 1: check whether this PDF was uploaded before
  const handleUpload = async () => {
    if (!file || uploading) return;

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/documents`);
      const data = await response.json().catch(() => ({}));
      const match = (data.documents || []).find(
        (doc) => doc.source === file.name
      );

      if (match) {
        setExistingDoc(match);   // show the "replace it?" box
        return;
      }
    } catch {
      // If the check fails, just try the upload; it will show its own error
    }

    uploadFile();
  };

  // Step 2: actually upload and analyze
  const uploadFile = async () => {
    setExistingDoc(null);
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      // If the backend is off, the reply is not JSON
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message || "Could not reach the backend. Is it running on port 8000?"
        );
      }

      // Go to the Notes page and highlight the new document
      router.push(`/notes?new=${encodeURIComponent(file.name)}`);
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-page text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <Navbar />

      {/* MAIN */}
      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 py-12 sm:px-6 sm:py-16">

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
            reasons, owners, alternatives, assumptions and risks
            automatically, using a local AI model.
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

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/15 text-3xl">
              ↑
            </div>

            <h3 className="text-xl font-semibold">
              Drop your PDF here
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              or choose a file from your computer
            </p>

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
                  setExistingDoc(null);
                }}
                disabled={uploading}
                className="ml-4 text-xs text-gray-500"
              >
                Remove
              </button>

            </div>
          )}

          {/* REPLACE CONFIRMATION */}
          {existingDoc && (
            <div className="mt-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-200">
                “{existingDoc.source}” is already in memory
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-100/70">
                It has {existingDoc.decision_count}{" "}
                {existingDoc.decision_count === 1 ? "decision" : "decisions"} saved.
                Uploading it again will replace those notes with a fresh analysis.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={uploadFile}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-[#111318] hover:bg-amber-400"
                >
                  Replace
                </button>

                <button
                  type="button"
                  onClick={() => setExistingDoc(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          {!existingDoc && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`mt-2 w-full rounded-2xl px-6 py-4 text-sm font-semibold ${
                !file || uploading
                  ? "cursor-not-allowed bg-white/5 text-gray-600"
                  : "bg-violet-600 text-on-accent shadow-lg shadow-violet-600/20 hover:bg-violet-500"
              }`}
            >
              {uploading
                ? "Analyzing with local AI… this can take a minute or two"
                : "Upload & Analyze PDF"}
            </button>
          )}

          {/* ERROR */}
          {message && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
              {message}
            </div>
          )}

        </div>

        {/* PROCESS */}
        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">01</p>
            <h4 className="mt-2 text-sm font-semibold">Upload</h4>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add your meeting or project PDF.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">02</p>
            <h4 className="mt-2 text-sm font-semibold">Extract</h4>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              AI identifies important decisions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">03</p>
            <h4 className="mt-2 text-sm font-semibold">Remember</h4>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Store the knowledge for future questions.
            </p>
          </div>

        </div>

      </section>
    </main>
  );
}
