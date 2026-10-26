"use strict";

// --------------------------------------------------
// State
// --------------------------------------------------

let chapters = [];
let activeChapterId = null;

const $ = id => document.getElementById(id);

// --------------------------------------------------
// ID helpers
// --------------------------------------------------

function allocateChapterId() {
  return String(chapters.length + 1);
}

function renumberLevels() {
  let next = 1;
  for (const chapter of chapters) {
    for (const level of chapter.levels) {
      level.id = String(next++);
    }
  }
}


// --------------------------------------------------
// Chapter operations
// --------------------------------------------------

function getActiveChapter() {
  return chapters.find(c => c.chapterId === activeChapterId) ?? null;
}

function createChapter() {
  const chapter = {
    chapterId: allocateChapterId(),
    chapterTitle: "",
    levels: []
  };

  chapters.push(chapter);
  activeChapterId = chapter.chapterId;
  render();
  setStatus(`Created chapter ${chapter.chapterId}.`, "success");
}

function selectChapter(id) {
  if (!chapters.some(c => c.chapterId === id)) return;
  activeChapterId = id;
  render();
}

function deleteChapter(id) {
  const index = chapters.findIndex(c => c.chapterId === id);
  if (index === -1) return;

  const chapter = chapters[index];
  const label = chapter.chapterTitle || "(untitled)";

  if (!confirm(
    `Delete chapter ${id}: ${label}?\n\n` +
    `Remaining chapters will be renumbered to stay consecutive.`
  )) return;

  const activeChapter = getActiveChapter();

  chapters.splice(index, 1);

  chapters.forEach((c, i) => {
    c.chapterId = String(i + 1);
  });

  renumberLevels();   // ← new

  activeChapterId =
    activeChapter && chapters.includes(activeChapter)
      ? activeChapter.chapterId
      : chapters[0]?.chapterId ?? null;

  render();
  setStatus(`Deleted chapter ${id}. Chapters renumbered.`, "success");
}

// --------------------------------------------------
// Level helpers
// --------------------------------------------------

function newLevel(id) {
  return {
    id, title: "", description: "",
    difficulty: "", category: "",
    points: 0, min_wpm: 0, min_accuracy: 0,
    commands: []
  };
}

// --------------------------------------------------
// Status
// --------------------------------------------------

function setStatus(message, type = "") {
  const el = $("status");
  el.textContent = message;
  el.className = `status ${type}`;
}

// --------------------------------------------------
// DOM helpers
// --------------------------------------------------

function makeElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function makeInput({ label, value, type = "text", min, max, onChange, readOnly = false }) {
  const wrapper = makeElement("label");
  wrapper.append(document.createTextNode(label));

  const input = document.createElement("input");
  input.type = type;
  input.value = value ?? "";
  input.readOnly = readOnly;
  if (min !== undefined) input.min = min;
  if (max !== undefined) input.max = max;
  input.addEventListener("input", () => onChange(input.value));

  wrapper.append(input);
  return wrapper;
}

// --------------------------------------------------
// Render
// --------------------------------------------------

function render() {
  renderChapterList();
  renderActiveChapter();
}

function renderChapterList() {
  const list = $("chapterList");
  list.replaceChildren();

  const count = chapters.length;
  $("chapterCount").textContent = `${count} chapter${count === 1 ? "" : "s"}`;

  for (const chapter of chapters) {
    const item = makeElement("div", "chapter-item");
    if (chapter.chapterId === activeChapterId) item.classList.add("active");

    const selectBtn = makeElement("button", "chapter-select");
    selectBtn.type = "button";
    selectBtn.append(
      makeElement("strong", "", chapter.chapterTitle || "(untitled)"),
      makeElement("small", "", `ID ${chapter.chapterId} · ${chapter.levels.length} levels`)
    );
    selectBtn.addEventListener("click", () => selectChapter(chapter.chapterId));

    const actions = makeElement("div", "chapter-actions");
    const delBtn = makeElement("button", "danger small-button", "Delete");
    delBtn.type = "button";
    delBtn.addEventListener("click", () => deleteChapter(chapter.chapterId));
    actions.append(delBtn);

    item.append(selectBtn, actions);
    list.append(item);
  }
}

function renderActiveChapter() {
  const chapter = getActiveChapter();

  $("editor").hidden = !chapter;
  $("emptyState").hidden = !!chapter;
  if (!chapter) return;

  $("chapterId").value = chapter.chapterId;
  $("chapterTitle").value = chapter.chapterTitle;

  const container = $("levelsContainer");
  container.replaceChildren();
  chapter.levels.forEach((level, index) => {
    container.append(renderLevel(chapter, level, index));
  });

  updatePreview();
}

function renderLevel(chapter, level, index) {
  const card = makeElement("article", "level-card");

  const heading = makeElement("div", "card-heading");
  const titleGroup = document.createElement("div");
  titleGroup.append(
    makeElement("h3", "", `Level ${index + 1}`),
    makeElement("div", "level-id", `ID: ${level.id}`)
  );

  const actions = makeElement("div", "actions");

  const duplicateBtn = makeElement("button", "secondary small-button", "Duplicate");
  duplicateBtn.type = "button";
  duplicateBtn.addEventListener("click", () => {
  const copy = structuredClone(level);
  copy.id = "";
  chapter.levels.splice(index + 1, 0, copy);
  renumberLevels();
  render();
  setStatus(`Duplicated level with new ID ${copy.id}.`, "success");
  });

  const deleteBtn = makeElement("button", "danger small-button", "Delete");
  deleteBtn.type = "button";
  deleteBtn.addEventListener("click", () => {
  if (!confirm(`Delete level ${level.id}?`)) return;
  chapter.levels.splice(index, 1);
  renumberLevels();
  render();
  setStatus(`Deleted level ${level.id}.`, "success");
  });

  actions.append(duplicateBtn, deleteBtn);
  heading.append(titleGroup, actions);
  card.append(heading);

  const fields = makeElement("div", "level-fields");

  fields.append(makeInput({ label: "Title", value: level.title,
    onChange: v => { level.title = v; updatePreview(); } }));
  fields.append(makeInput({ label: "Difficulty", value: level.difficulty,
    onChange: v => { level.difficulty = v; updatePreview(); } }));
  fields.append(makeInput({ label: "Category", value: level.category,
    onChange: v => { level.category = v; updatePreview(); } }));

  const description = makeElement("label", "full-width");
  description.append(document.createTextNode("Description"));
  const descriptionInput = document.createElement("textarea");
  descriptionInput.rows = 3;
  descriptionInput.value = level.description;
  descriptionInput.addEventListener("input", () => {
    level.description = descriptionInput.value;
    updatePreview();
  });
  description.append(descriptionInput);
  fields.append(description);

  fields.append(makeInput({ label: "Points", value: level.points, type: "number", min: 0,
    onChange: v => { level.points = v === "" ? "" : Number(v); updatePreview(); } }));
  fields.append(makeInput({ label: "Minimum WPM", value: level.min_wpm, type: "number", min: 0,
    onChange: v => { level.min_wpm = v === "" ? "" : Number(v); updatePreview(); } }));
  fields.append(makeInput({ label: "Minimum accuracy (%)", value: level.min_accuracy,
    type: "number", min: 0, max: 100,
    onChange: v => { level.min_accuracy = v === "" ? "" : Number(v); updatePreview(); } }));

  card.append(fields);

  const commandsSection = makeElement("section", "commands-section");
  const commandsHeading = makeElement("div", "command-heading");
  commandsHeading.append(
    makeElement("h3", "", "Commands"),
    makeElement("span", "level-id", `${level.commands.length} commands`)
  );
  commandsSection.append(commandsHeading);

  level.commands.forEach((command, i) => {
    commandsSection.append(renderCommand(level, command, i));
  });

  const addCommandBtn = makeElement("button", "secondary add-command", "+ Add command");
  addCommandBtn.type = "button";
  addCommandBtn.addEventListener("click", () => {
    level.commands.push({ text: "" });
    render();
  });
  commandsSection.append(addCommandBtn);
  card.append(commandsSection);

  return card;
}

function renderCommand(level, command, index) {
  const row = makeElement("div", "command-row");
  row.append(makeElement("span", "command-number", String(index + 1)));

  const input = document.createElement("input");
  input.type = "text";
  input.value = command.text;
  input.setAttribute("aria-label", `Command ${index + 1}`);
  input.addEventListener("input", () => {
    command.text = input.value;
    updatePreview();
  });
  row.append(input);

  const actions = makeElement("div", "command-actions");

  const upBtn = makeElement("button", "small-button", "↑");
  upBtn.type = "button";
  upBtn.disabled = index === 0;
  upBtn.setAttribute("aria-label", "Move command up");
  upBtn.addEventListener("click", () => {
    [level.commands[index - 1], level.commands[index]] =
      [level.commands[index], level.commands[index - 1]];
    render();
  });

  const downBtn = makeElement("button", "small-button", "↓");
  downBtn.type = "button";
  downBtn.disabled = index === level.commands.length - 1;
  downBtn.setAttribute("aria-label", "Move command down");
  downBtn.addEventListener("click", () => {
    [level.commands[index + 1], level.commands[index]] =
      [level.commands[index], level.commands[index + 1]];
    render();
  });

  const deleteBtn = makeElement("button", "danger small-button", "×");
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", "Delete command");
  deleteBtn.addEventListener("click", () => {
    level.commands.splice(index, 1);
    render();
  });

  actions.append(upBtn, downBtn, deleteBtn);
  row.append(actions);
  return row;
}

// --------------------------------------------------
// Preview
// --------------------------------------------------

function getExportData(chapter = getActiveChapter()) {
  if (!chapter) return null;
  return {
    chapterId: chapter.chapterId,
    chapterTitle: chapter.chapterTitle,
    levels: chapter.levels.map(level => ({
      id: level.id, title: level.title, description: level.description,
      difficulty: level.difficulty, category: level.category,
      points: level.points, min_wpm: level.min_wpm, min_accuracy: level.min_accuracy,
      commands: level.commands.map(c => ({ text: c.text }))
    }))
  };
}

function updatePreview() {
  const data = getExportData();
  $("jsonPreview").textContent = data ? JSON.stringify(data, null, 2) : "";
}

// --------------------------------------------------
// Validation
// --------------------------------------------------

function coerceId(value, label) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error(`${label} must be a non-empty string.`);
    }
    return trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  throw new Error(`${label} must be a string or number.`);
}

function validateChapter(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Chapter data must be an object.");
  }

  if (typeof data.chapterId !== "string" || !data.chapterId.trim()) {
    throw new Error("Chapter ID is required.");
  }

  if (typeof data.chapterTitle !== "string" || !data.chapterTitle.trim()) {
    throw new Error("Chapter title is required.");
  }

  if (!Array.isArray(data.levels)) {
    throw new Error("Levels must be an array.");
  }

  const ids = new Set();

  for (const level of data.levels) {
    if (!level || typeof level !== "object" || Array.isArray(level)) {
      throw new Error("Every level must be an object.");
    }

    if (typeof level.id !== "string" || !level.id.trim()) {
      throw new Error("Every level must have a non-empty ID.");
    }

    if (ids.has(level.id)) {
      throw new Error(`Duplicate level ID: ${level.id}`);
    }
    ids.add(level.id);

    if (typeof level.title !== "string" || !level.title.trim()) {
      throw new Error(`Level ${level.id}: title is required.`);
    }

    for (const key of ["points", "min_wpm", "min_accuracy"]) {
      if (!Number.isInteger(level[key]) || level[key] < 0) {
        throw new Error(
          `Level ${level.id}: ${key} must be a non-negative integer.`
        );
      }
    }

    if (level.min_accuracy > 100) {
      throw new Error(
        `Level ${level.id}: accuracy must not exceed 100.`
      );
    }

    if (
      !Array.isArray(level.commands) ||
      !level.commands.every(c => c && typeof c.text === "string")
    ) {
      throw new Error(
        `Level ${level.id}: every command must contain text.`
      );
    }
  }
}

// --------------------------------------------------
// Import / normalize
// --------------------------------------------------

function safeFilename(id) {
  return String(id).replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 80) || "chapter";
}

function normalizeImportedChapter(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The JSON root must be an object.");
  }

  if (typeof data.chapterTitle !== "string") {
    throw new Error("chapterTitle must be a string.");
  }

  if (!Array.isArray(data.levels)) {
    throw new Error("levels must be an array.");
  }

  const levelIds = new Set();

  const levels = data.levels.map((level, index) => {
    if (!level || typeof level !== "object" || Array.isArray(level)) {
      throw new Error(`Level ${index + 1} must be an object.`);
    }

    const levelId = coerceId(level.id, `Level ${index + 1} id`);

    if (levelIds.has(levelId)) {
      throw new Error(`Duplicate level ID: ${levelId}`);
    }
    levelIds.add(levelId);

    for (const key of ["title", "description", "difficulty", "category"]) {
      if (typeof level[key] !== "string") {
        throw new Error(`Level ${levelId}: ${key} must be a string.`);
      }
    }

    for (const key of ["points", "min_wpm", "min_accuracy"]) {
      if (!Number.isInteger(level[key]) || level[key] < 0) {
        throw new Error(
          `Level ${levelId}: ${key} must be a non-negative integer.`
        );
      }
    }

    if (level.min_accuracy > 100) {
      throw new Error(
        `Level ${levelId}: min_accuracy cannot exceed 100.`
      );
    }

    if (!Array.isArray(level.commands)) {
      throw new Error(`Level ${levelId}: commands must be an array.`);
    }

    const commands = level.commands.map((command, i) => {
      if (
        !command ||
        typeof command !== "object" ||
        Array.isArray(command) ||
        typeof command.text !== "string"
      ) {
        throw new Error(
          `Level ${levelId}, command ${i + 1}: ` +
          "expected an object with a text string."
        );
      }
      return { text: command.text };
    });

    return {
      id: levelId,   // provisional; the handler above overwrites it.
      title: level.title,
      description: level.description,
      difficulty: level.difficulty,
      category: level.category,
      points: level.points,
      min_wpm: level.min_wpm,
      min_accuracy: level.min_accuracy,
      commands
    };
  });

  return { chapterTitle: data.chapterTitle, levels };
}

// --------------------------------------------------
// Download helper
// --------------------------------------------------

function downloadJson(obj, filename) {
  const blob = new Blob(
    [JSON.stringify(obj, null, 2) + "\n"],
    { type: "application/json;charset=utf-8" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --------------------------------------------------
// Event wiring
// --------------------------------------------------

$("newChapterBtn").addEventListener("click", createChapter);

$("chapterTitle").addEventListener("input", event => {
  const chapter = getActiveChapter();
  if (!chapter) return;
  chapter.chapterTitle = event.target.value;
  renderChapterList();  // keep sidebar label in sync
  updatePreview();
});

$("addLevelBtn").addEventListener("click", () => {
  const chapter = getActiveChapter();
  if (!chapter) return;

  const level = newLevel("");   // ID placeholder; renumber fills it in
  chapter.levels.push(level);

  renumberLevels();
  render();
  setStatus(`Added level ${level.id} to chapter ${chapter.chapterId}.`, "success");
});

$("exportBtn").addEventListener("click", () => {
  const chapter = getActiveChapter();
  if (!chapter) return setStatus("No chapter selected.", "error");
  try {
    const data = getExportData(chapter);
    validateChapter(data);
    downloadJson(data, `chapter${safeFilename(data.chapterId)}.json`);
    setStatus("Chapter JSON exported.", "success");
  } catch (e) {
    setStatus(e.message, "error");
  }
});

$("exportAllBtn").addEventListener("click", async () => {
  if (typeof JSZip === "undefined") {
    setStatus("ZIP export unavailable: JSZip failed to load.", "error");
    return;
  }

  if (!Array.isArray(chapters) || chapters.length === 0) {
    setStatus("No chapters to export.", "error");
    return;
  }

  // Validate up front so we never build a partial archive.
  try {
    for (const c of chapters) validateChapter(getExportData(c));
  } catch (e) {
    return setStatus(e.message, "error");
  }

  setStatus("Building ZIP archive…");

  try {
    const zip = new JSZip();
    let added = 0;

    for (const c of chapters) {
      const data = getExportData(c);
      if (!data) continue;
      zip.file(
        `chapter${safeFilename(data.chapterId)}.json`,
        JSON.stringify(data, null, 2) + "\n"
      );
      added++;
    }

    if (added === 0) {
      setStatus("ZIP export failed: no chapter data was added.", "error");
      return;
    }

    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    if (!blob || blob.size === 0) {
      setStatus("ZIP export failed: generated archive is empty.", "error");
      return;
    }

    // Download the Blob directly. Do NOT route it through downloadJson().
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chapters.zip";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setStatus(
      `Exported ${added} chapter(s) as chapters.zip (${blob.size} bytes).`,
      "success"
    );
  } catch (e) {
    setStatus(`ZIP export failed: ${e.message}`, "error");
  }
});

$("copyJsonBtn").addEventListener("click", async () => {
  const data = getExportData();
  if (!data) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setStatus("JSON copied to clipboard.", "success");
  } catch {
    setStatus("Clipboard access unavailable — copy from the preview manually.", "error");
  }
});

$("importBtn").addEventListener("click", () => $("fileInput").click());

$("fileInput").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Validate first — a bad file never mutates state.
    const normalized = normalizeImportedChapter(parsed);

    const chapterId = allocateChapterId();
    const imported = { chapterId, ...normalized };

    chapters.push(imported);
    activeChapterId = chapterId;

    renumberLevels();   // ← replaces the per-level allocation loop
    render();

    setStatus(`Imported ${file.name} as chapter ${chapterId}.`, "success");
  } catch (e) {
    setStatus(`Import failed: ${e.message}`, "error");
  } finally {
    event.target.value = "";
  }
});

// --------------------------------------------------
// Initial state
// --------------------------------------------------

createChapter();