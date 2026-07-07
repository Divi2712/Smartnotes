import {
  Plus,
  Paperclip,
  Pin,
  PinOff,
  Trash2,
  Save,
  Sparkles,
  Loader2,
  Search,
  FileText,
  NotebookPen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import React, { useState, useEffect } from "react";
import "../css/workspace.css";

interface WorkspaceProps {
  userName: string;
  onLogout: () => void;
}

interface Note {
  id: string;
  title: string;
  original_content: string;
  summary: string;
  created_at: string;
  is_favorite?: boolean;
}

const Workspace: React.FC<WorkspaceProps> = ({
  userName,
  onLogout,
}) => {
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [viewingNote, setViewingNote] =
  useState(false);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [showPreview, setShowPreview] =
    useState(false);
  const [imageExpanded, setImageExpanded] =
    useState(false);
  const [previewUrl, setPreviewUrl] =
    useState("");
  const [saveEnabled, setSaveEnabled] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [summaryMode, setSummaryMode] =
    useState("detailed");
  const [showProfileMenu,
      setShowProfileMenu] =
      useState(false);
  const [editingNote, setEditingNote] =
    useState(false);

  const [currentNoteId, setCurrentNoteId] =
    useState("");
  const [noteTitle, setNoteTitle] =
    useState("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const email =
    localStorage.getItem("userEmail");

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem(
        `darkMode_${email}`
      ) === "true"
    );

  const [menuNoteId, setMenuNoteId] =
    useState<number | null>(null);


  useEffect(() => {
  loadNotes();
  }, []);

  async function loadNotes() {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          "http://localhost:8000/api/v1/notes",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();
      
      console.log("NOTES RESPONSE:", data);

      setNotes(data.notes || []);

    } catch (error) {

      console.error(
        "Error loading notes:",
        error
      );

    }
  }

  async function handleSummarize() {

    console.log("SUMMARIZE CLICKED");
    console.log("Selected File:", selectedFile);
    console.log("Message:", message);

    try {

      setLoading(true);

      // TEXT SUMMARY
      if (
        message.trim() &&
        !selectedFile
      ) {
        console.log(
          "Selected Mode:",
          summaryMode
        );
        const response =
          await fetch(
            "http://localhost:8000/api/v1/ai/summarize-text",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                text: message,
                mode: summaryMode
              })
            }
          );

        const data =
          await response.json();

        setSummary(
          data.summary
        );

      }
      // FILE SUMMARY
      if (selectedFile) {

        const formData =
          new FormData();

        formData.append(
          "file",
          selectedFile
        );
        formData.append(
          "mode",
          summaryMode
        );

        let endpoint = "";

        if (
          selectedFile.type.startsWith(
            "image/"
          )
        ) {

          endpoint =
            "http://localhost:8000/api/v1/ai/summarize-image";

        }

        else if (
          selectedFile.type.startsWith(
            "audio/"
          )
        ) {

          endpoint =
            "http://localhost:8000/api/v1/ai/summarize-audio";

        }

        else if (
          selectedFile.type.startsWith(
            "video/"
          )
        ) {

          endpoint =
            "http://localhost:8000/api/v1/ai/summarize-video";

        }
        else if (
          selectedFile.type ===
          "application/pdf"
        ) {

          endpoint =
            "http://localhost:8000/api/v1/ai/summarize-pdf";

        }

        else if (
          selectedFile.name
            .toLowerCase()
            .endsWith(".ppt") ||

          selectedFile.name
            .toLowerCase()
            .endsWith(".pptx")
        ) {

          endpoint =
            "http://localhost:8000/api/v1/ai/summarize-ppt";

        }
        else if (
          selectedFile.name
            .toLowerCase()
            .endsWith(".docx")
        ) {

          endpoint =
            "http://localhost:8000/api/v1/ai/summarize-docx";

        }

        else {

          alert(
            "Unsupported file type"
          );

          return;

        }

        const response =
          await fetch(
            endpoint,
            {
              method: "POST",
              body: formData
            }
          );

        const data =
          await response.json();

        setSummary(
          data.summary
        );

        setSaveEnabled(true);

      }

    } catch (error) {

      console.error(
        "SUMMARIZE ERROR:",
        error
      );

      alert(
        "Failed to generate summary"
      );

    } finally {

      setLoading(false);

    }
  }
  function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url =
        URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowPreview(false);
    setSaveEnabled(false);
    }

  function removeSelectedFile() {
    setSelectedFile(null);
    setPreviewUrl("");
    setShowPreview(false);
    setSummary("");
    setSaveEnabled(false);
    }

  async function handleSave() {

        const title = window.prompt(
      "Enter Note Title"
    );

    if (!title) return;

    try {

      const token =
        localStorage.getItem("token");
      console.log({
        title,
        original_content: message,
        summary
      });

      const payload = {
        title,
        original_content: message,
        summary
      };

      console.log(payload);

      const response =
        await fetch(
          "http://localhost:8000/api/v1/notes/",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
            title: title,
            original_content:
              message.trim()
                ? message
                : summary,

            summary: summary
          })
          }
        );

      const data =
        await response.json();

      console.log(
        "SAVE RESPONSE:",
        data
      );

      if (!response.ok) {

        alert(
          "Save Failed\n" +
          JSON.stringify(data)
        );
        return;
      }
      alert("Note Saved");
      await loadNotes();
      handleNewNote();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to save note"
      );

    }
  }

async function handleUpdateNote() {
  try {
    const token =
      localStorage.getItem("token");
    const response =
      await fetch(
        `http://localhost:8000/api/v1/notes/${currentNoteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            title: noteTitle,
            original_content:
              message,
            summary:
              summary
          })
        }
      );
    const data =
      await response.json();
    console.log(
      "UPDATE RESPONSE:",
      data
    );
    alert("Note Updated");
    setEditingNote(false);
    await loadNotes();
  }
  catch (error) {
    console.error(error);
  }
}

  async function deleteNote(id: string) {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `http://localhost:8000/api/v1/notes/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      console.log(
        "DELETE RESPONSE:",
        data
      );

      await loadNotes();

    } catch (error) {

      console.error(
        "DELETE ERROR:",
        error
      );

      alert(
        "Failed to delete note"
      );

    }
  }
  function handleNewNote() {
    setViewingNote(false);
    setMessage("");
    setSummary("");
    setSelectedFile(null);
    setSaveEnabled(false);
    setShowPreview(false);
    setPreviewUrl("");
    setSaveEnabled(false);
  } 

  
const filteredNotes = notes
  .filter(
    (note) =>
      note.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  )
  .sort((a, b) => {

    if (
      a.is_favorite &&
      !b.is_favorite
    )
      return -1;

    if (
      !a.is_favorite &&
      b.is_favorite
    )
      return 1;

    return 0;

  });

  const toggleFavorite = (
    noteId: string
  ) => {

    const updatedNotes =
      notes.map((note) =>

        note.id === noteId
          ? {
              ...note,
              is_favorite:
                !note.is_favorite
            }
          : note

      );

    setNotes(updatedNotes);

  };

  return (
    <div
      className={
        darkMode
          ? "workspace-page dark"
          : "workspace-page"
      }
    >

      <aside
        className={
            sidebarOpen
            ? "sidebar"
            : "sidebar collapsed"
        }
      >
      
      <button
        className="sidebar-toggle"
        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
      >
        {sidebarOpen
          ? <ChevronLeft size={18} />
          : <ChevronRight size={18} />
        }
      </button>

        {sidebarOpen && (
        <>

        <div className="logo">
        <div className="logo-circle">
            <NotebookPen size={30} />
        </div>
        <div className="logo-text">
            SmartNotes Hub
        </div>
        </div>

        <button
          className="new-note-btn"
          onClick={handleNewNote}
        >
          <>
            <Plus size={18} />
            <span>New Note</span>
          </>
        </button>

        <div className="search-wrapper">

            <Search size={18} />

             <input
                className="history-search"
                placeholder="Search notes..."
                value={search}
                onChange={(e) =>
                setSearch(e.target.value)
                }
            />

        </div>

        <div className="history-title">
          Saved Notes
        </div>

        <div className="history-list">

          {filteredNotes.map((note) => (

            <div
              className={
                note.is_favorite
                  ? "history-item pinned"
                  : "history-item"
              }
              key={note.id}
              onClick={() => {

                setCurrentNoteId(note.id);
                setSelectedFile(null);
                setPreviewUrl("");

                setNoteTitle(note.title);
                setMessage(note.original_content);
                setSummary(note.summary);

                setViewingNote(true);

              }}
            >

              <div className="history-title-row">

                <div className="history-name">
                  <FileText size={20} />
                  <span>{note.title}</span>
                </div>

                <div className="history-actions">

                  <button
                    className="pin-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(note.id);
                    }}
                  >
                    {note.is_favorite ? (
                      <PinOff size={18} />
                    ) : (
                      <Pin size={18} />
                    )}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();

                      const confirmDelete =
                        window.confirm(
                          "Delete this note?"
                        );

                      if (confirmDelete) {
                        deleteNote(note.id);
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      </>

      )}
      </aside>

      <main className="main-area">
        <div className="top-bar">

          <div
            className="user-profile"
            onClick={() =>
              setShowProfileMenu(
                !showProfileMenu
              )
            }
          >

            <span>Welcome, {userName}</span>
            <div className="profile-badge">
              {userName.charAt(0)}
            </div>

          </div>


            {showProfileMenu && (
                <div className="profile-menu">

                  <div className="profile-name">
                    {userName}
                  </div>

                  <div className="theme-toggle-row">

                    <span>Dark Theme</span>

                    <label className="switch">

                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => {

                          const next = !darkMode;

                          setDarkMode(next);

                          const email =
                            localStorage.getItem("userEmail");

                          localStorage.setItem(
                            `darkMode_${email}`,
                            String(next)
                          );

                        }}
                      />

                      <span className="slider"></span>

                    </label>

                  </div>

                  <button
                    className="logout-btn"
                    onClick={onLogout}
                  >
                    Logout
                  </button>

                </div>
              )}

        </div>

        {!message &&
        !summary &&
        !selectedFile &&
        !viewingNote && (

        <div className="hero-section">

        <h1>SmartNotes Hub</h1>

        <h3>
            AI-Powered Note Summarization
        </h3>

        <p>
            Supports Text, Images,
            Audio and Video Files
        </p>

        

        </div>

        )}

        <div className="chat-messages">

            {viewingNote ? (
              <>
              <button
                className="back-btn"
                onClick={() => {
                  setViewingNote(false);
                  setMessage("");
                  setSummary("");
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setShowPreview(false);
                  setSaveEnabled(false);
                }}
              >
                ← Back to Workspace
              </button>
              <div className="summary-card">
                {editingNote ? (

                  <input
                    className="edit-title"
                    type="text"
                    value={noteTitle}
                    onChange={(e) =>
                      setNoteTitle(e.target.value)
                    }
                  />

                ) : (

                  <div className="note-title-section">
                    <h1>{noteTitle}</h1>
                  </div>

                )}
                {editingNote ? (
              <>
                <textarea
                  className="edit-textarea"
                  value={summary}
                  onChange={(e) =>
                    setSummary(e.target.value)
                  }
                />
                <div className="edit-actions">

                  <button
                    className="cancel-btn"
                    onClick={() =>
                      setEditingNote(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="save-btn"
                    onClick={handleUpdateNote}
                  >
                    Save Changes
                  </button>

                </div>
                
              </>
                ) : (
                <div className="summary-body">

                {summary
                  .split("\n")
                  .map((line, index) => {

                    const headings = [
                      "Topic:",
                      "Definition and Functions",
                      "Types of Operating Systems",
                      "Process Management",
                      "Conclusion:"
                    ];

                    const isHeading =
                      line.startsWith("Topic:") ||
                      line.startsWith("Subtopic:") ||
                      line === "Conclusion";
                    if (line.startsWith("Conclusion:")) {
                      return (
                        <div key={index}>
                          <p>
                            <strong>Conclusion</strong>
                          </p>

                          <p>
                            {line.replace("Conclusion:", "").trim()}
                          </p>
                        </div>
                      );
                    }
                    if (line.startsWith("Subtopic:")) {
                    return (
                      <p key={index}>
                        <strong>
                          {line.replace("Subtopic:", "").trim()}
                        </strong>
                      </p>
                    );
                  }
                  if (line.startsWith("Topic:")) {
                    return (
                      <p key={index}>
                        <strong style={{ color: "#333" }}>
                          {line.replace("Topic:", "").trim()}
                        </strong>
                      </p>
                    );
                  }
                  if (line === "Conclusion") {
                    return (
                      <p key={index}>
                        <strong>Conclusion</strong>
                      </p>
                    );
                  }
                    return (
                      
                      <p key={index}>
                        {isHeading ? (
                          <strong>
                            {line}
                          </strong>
                        ) : (
                          line
                        )}
                      </p>
                    );
                  })
                }
              <div className="view-actions">

                <button
                  className="edit-btn"
                  onClick={() =>
                    setEditingNote(true)
                  }
                >
                  Edit Note
                </button>

              </div>
              
              </div>
              )}
              </div>
                </>
            ) : (
                <>
                {summary && (
                    <div className="assistant-message">

                      {summary.split("\n").map((line, index) => {

                        if (line.startsWith("Topic:")) {
                          return (
                            <p key={index}>
                              <strong>{line}</strong>
                            </p>
                          );
                        }

                        if (line.startsWith("Subtopic:")) {
                          return (
                            <p key={index}>
                              <strong>
                                {line.replace("Subtopic:", "").trim()}
                              </strong>
                            </p>
                          );
                        }

                        if (line === "Conclusion") {
                          return (
                            <p key={index}>
                              <strong>Conclusion</strong>
                            </p>
                          );
                        }

                        return (
                          <p key={index}>
                            {line}
                          </p>
                        );

                      })}

                    </div>
                )}
                </>

                )}

        </div>
        {!viewingNote && selectedFile && (

            <div className="uploaded-file-card">

               <div className="file-details">

                <span className="file-name">
                  {selectedFile?.name}
                </span>

                <div className="thumbnail-row">

                  {selectedFile?.type.startsWith("image/") && (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="image-thumbnail"
                      onClick={() =>
                        setImageExpanded(true)
                      }
                    />
                  )}

                  {selectedFile?.type.startsWith("audio/") && (
                    <audio
                      controls
                      className="audio-preview"
                    >
                      <source src={previewUrl} />
                    </audio>
                  )}

                  {selectedFile?.type.startsWith("video/") && (
                    <video
                      controls
                      className="video-preview"
                    >
                      <source src={previewUrl} />
                    </video>
                  )}

                  <button
                    className="remove-file-btn"
                    onClick={removeSelectedFile}
                  >
                    ×
                  </button>

                </div>
                {showPreview && (
                <div className="file-preview">
                    {previewUrl &&
                      selectedFile?.type.startsWith("image/") && (

                      <img
                        src={previewUrl}
                        alt="preview"
                        className="image-thumbnail"
                        onClick={() =>
                          setImageExpanded(true)
                        }
                      />

                    )}

                    {previewUrl &&
                    selectedFile?.type.startsWith("audio/") && (

                      <audio
                        controls
                        className="audio-preview"
                      >
                        <source
                          src={previewUrl}
                        />
                      </audio>

                    )}

                    {previewUrl &&
                      selectedFile?.type.startsWith("video/") && (

                        <video
                          controls
                          className="video-preview"
                        >
                          <source
                            src={previewUrl}
                          />
                        </video>

                      )}

                </div>

                )}

            </div>
          </div>

        )}

        {!viewingNote && (

        <div className="chat-input-area">

          <div className="chat-box">

            <textarea
                value={message}
                rows={1}
                onChange={(e) => {
                    setMessage(e.target.value);

                    e.target.style.height = "auto";
                    e.target.style.height =
                    e.target.scrollHeight + "px";
                }}
                placeholder="Enter text here..."
            />

            <div className="summary-modes">

              <button
                className={
                  summaryMode === "short"
                    ? "mode-btn active"
                    : "mode-btn"
                }
                onClick={() =>
                  setSummaryMode("short")
                }
              >
                Short
              </button>

              <button
                className={
                  summaryMode === "detailed"
                    ? "mode-btn active"
                    : "mode-btn"
                }
                onClick={() =>
                  setSummaryMode("detailed")
                }
              >
                Detailed
              </button>

              <button
                className={
                  summaryMode === "bullet"
                    ? "mode-btn active"
                    : "mode-btn"
                }
                onClick={() =>
                  setSummaryMode("bullet")
                }
              >
                Bullet Points
              </button>

              <button
                className={
                  summaryMode === "exam"
                    ? "mode-btn active"
                    : "mode-btn"
                }
                onClick={() =>
                  setSummaryMode("exam")
                }
              >
                Exam Notes
              </button>

            </div>
            <div className="chat-actions">

              <div className="left-actions">

                <label
                  className={
                    loading
                      ? "upload-btn disabled-upload"
                      : "upload-btn"
                  }
                >
                  <Paperclip size={18} />

                  <span>
                    Attach
                  </span>

                  <input
                    type="file"
                    accept="
                    image/*,
                    audio/*,
                    video/*,
                    .pdf,
                    .ppt,
                    .pptx,
                    .docx
                    "
                    hidden
                    disabled={loading}
                    onChange={handleFileUpload}
                  />
                </label>

                {loading && (

                  <div className="loading-inline">

                    <div className="spinner"></div>

                    <span>
                      Generating AI Summary...
                    </span>

                  </div>

                )}

              </div>

              <div className="right-actions">

                <button
                  className="action-btn"
                  onClick={handleSummarize}
                  disabled={loading}
                >
                  {
                    loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="spin"
                        />
                      </>
                    ) : (
                      <Sparkles size={20} />
                    )

                  }
                </button>

                <button
                  className="action-btn"
                  disabled={
                    !message.trim() &&
                    !saveEnabled
                  }
                  onClick={handleSave}
                >
                  <Save size={22} />
                </button>

              </div>

            </div>

          </div>

        </div>
    )}

      </main>
      {imageExpanded && (

        <div className="image-modal">

          <div className="image-wrapper">

            <button
              className="minimize-btn"
              onClick={() =>
                setImageExpanded(false)
              }
            >
              −
            </button>

            <img
              src={previewUrl}
              alt="full"
              className="expanded-image"
            />

          </div>

        </div>

      )}
    </div>
    
  );
};

export default Workspace;