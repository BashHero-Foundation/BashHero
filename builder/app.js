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
  if (chapters.length === 0) {
    return setStatus("No chapters to export.", "error");
  }
  if (!fsaSupported) {
    return setStatus(
      "Downloading the full app needs folder access (Chrome/Edge/Brave).",
      "error"
    );
  }
  if (typeof JSZip === "undefined") {
    return setStatus("ZIP export unavailable: JSZip failed to load.", "error");
  }

  // Validate everything before touching the filesystem.
  try {
    for (const c of chapters) validateChapter(getExportData(c));
  } catch (e) {
    return setStatus(e.message, "error");
  }

  try {
    const projectDir = await ensureProjectDir();

    setStatus("Building app.zip…");
    const zip = new JSZip();

    // Single walk: copies the project, swaps app/levels/*.json
    // for the current chapters, skips builder/ and build junk.
    await addDirectoryToZipWithLevels(projectDir, zip);

    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app.zip";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setStatus(
      `Packaged ${chapters.length} chapter(s) into app.zip ` +
      `(${(blob.size / 1024).toFixed(1)} KB).`,
      "success"
    );
  } catch (e) {
    setStatus(`Download failed: ${e.message}`, "error");
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
// File System Access — project root
// --------------------------------------------------

let projectDirHandle = null;

const IDB_NAME = "chapter-builder";
const IDB_STORE = "handles";
const PROJECT_DIR_KEY = "project-root";

const fsaSupported =
  typeof window.showDirectoryPicker === "function";

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(key) {
  return openIdb().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readonly")
                  .objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  }));
}

function idbSet(key, value) {
  return openIdb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
}

async function ensureProjectDir() {
  if (projectDirHandle) return projectDirHandle;
  if (!fsaSupported) {
    throw new Error(
      "Folder access is not supported in this browser. " +
      "Use Chrome, Edge, or Brave."
    );
  }

  const stored = await idbGet(PROJECT_DIR_KEY);
  if (stored) {
    const state = await stored.queryPermission({ mode: "readwrite" });
    if (state === "granted") { projectDirHandle = stored; return stored; }
    if (state === "prompt") {
      const r = await stored.requestPermission({ mode: "readwrite" });
      if (r === "granted") { projectDirHandle = stored; return stored; }
    }
  }

  const picked = await window.showDirectoryPicker({
    id: "project-root",
    mode: "readwrite",
    startIn: "documents"
  });

  // Sanity check — the folder must contain both app/ and builder/.
  try {
    await picked.getDirectoryHandle("app");
    await picked.getDirectoryHandle("builder");
  } catch {
    throw new Error(
      "Selected folder does not look like the project root. " +
      "It should contain both 'app/' and 'builder/' subfolders."
    );
  }

  projectDirHandle = picked;
  await idbSet(PROJECT_DIR_KEY, picked);
  return picked;
}

// --------------------------------------------------
// Templates
// --------------------------------------------------

async function getTemplatesDir() {
  const project = await ensureProjectDir();
  const builderDir = await project.getDirectoryHandle("builder");
  return builderDir.getDirectoryHandle("templates");
}

async function loadTemplates() {
  const list = $("templateList");
  list.replaceChildren();

  try {
    const templatesDir = await getTemplatesDir();
    const subdirs = [];
    for await (const [name, handle] of templatesDir.entries()) {
      if (handle.kind === "directory") subdirs.push({ name, handle });
    }
    subdirs.sort((a, b) => a.name.localeCompare(b.name));

    if (subdirs.length === 0) {
      list.append(makeElement(
        "p", "",
        "No template subfolders found in builder/templates/."
      ));
      return;
    }

    for (const { name, handle } of subdirs) {
      const item = makeElement("div", "chapter-item");

      const info = makeElement("div", "chapter-select");
      info.append(
        makeElement("strong", "", name),
        makeElement("small", "", "template")
      );

      const addBtn = makeElement(
        "button", "primary small-button", "Add all chapters"
      );
      addBtn.type = "button";
      addBtn.addEventListener("click", () => addTemplateChapters(name, handle));

      const actions = makeElement("div", "chapter-actions");
      actions.append(addBtn);

      item.append(info, actions);
      list.append(item);
    }
  } catch (e) {
    if (e.name !== "AbortError") {
      setStatus(`Could not read templates: ${e.message}`, "error");
    }
  }
}

async function addTemplateChapters(name, dirHandle) {
  try {
    const files = [];
    for await (const [fileName, handle] of dirHandle.entries()) {
      if (handle.kind === "file" && fileName.toLowerCase().endsWith(".json")) {
        files.push({ fileName, handle });
      }
    }
    files.sort((a, b) => a.fileName.localeCompare(b.fileName));

    if (files.length === 0) {
      setStatus(`Template "${name}" has no .json files.`, "error");
      return;
    }

    const imported = [];
    const errors = [];

    for (const { fileName, handle } of files) {
      try {
        const text = await (await handle.getFile()).text();
        imported.push(normalizeImportedChapter(JSON.parse(text)));
      } catch (e) {
        errors.push(`${fileName}: ${e.message}`);
      }
    }

    // Append all successfully-normalized chapters. Each gets a fresh
    // chapter ID (per the previous turn's rule), then levels are
    // renumbered globally so they stay consecutive.
    for (const normalized of imported) {
      chapters.push({
        chapterId: allocateChapterId(),
        ...normalized
      });
    }

    if (imported.length > 0) {
      renumberLevels();
      activeChapterId = chapters[chapters.length - 1].chapterId;
      render();
    }

    const tail = errors.length ? ` — ${errors.length} failed` : "";
    setStatus(
      `Added ${imported.length} chapter(s) from template "${name}"${tail}`,
      errors.length && imported.length === 0 ? "error" : "success"
    );
  } catch (e) {
    setStatus(`Failed to load template "${name}": ${e.message}`, "error");
  }
}

$("loadTemplatesBtn").addEventListener("click", loadTemplates);

// --------------------------------------------------
// Export helpers
// --------------------------------------------------

const EXCLUDED_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "out", "build",
  ".turbo", ".cache", "builder", ".vercel"
]);

const EXCLUDED_FILES = new Set([
  ".DS_Store", "Thumbs.db", ".env.local"
]);

// Instead of writeLevelsToDisk(projectDir):
// Build the zip normally, but when encountering app/levels/*.json,
// skip them and add the current chapters instead.

async function addDirectoryToZipWithLevels(projectDir, zip) {
  const appDir = await projectDir.getDirectoryHandle("app");
  const levelsDir = await appDir.getDirectoryHandle("levels", { create: false })
    .catch(() => null);

  async function walk(dirHandle, prefix, isLevels) {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "file" && isLevels && name.endsWith(".json")) continue;
      if (handle.kind === "directory" && EXCLUDED_DIRS.has(name)) continue;
      if (handle.kind === "file" && EXCLUDED_FILES.has(name)) continue;

      const path = prefix ? `${prefix}/${name}` : name;
      if (handle.kind === "directory") {
        await walk(handle, path, name === "levels" && prefix === "app");
      } else {
        zip.file(path, await handle.getFile());
      }
    }
  }

  await walk(projectDir, "", false);

  // Now add the current chapters under app/levels/.
  for (const c of chapters) {
    const data = getExportData(c);
    const name = `chapter-${safeFilename(data.chapterId)}.json`;
    zip.file(`app/levels/${name}`, JSON.stringify(data, null, 2) + "\n");
  }
}

async function addDirectoryToZip(dirHandle, prefix, zip) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "directory" && EXCLUDED_DIRS.has(name)) continue;
    if (handle.kind === "file" && EXCLUDED_FILES.has(name)) continue;

    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === "directory") {
      await addDirectoryToZip(handle, path, zip);
    } else {
      zip.file(path, await handle.getFile());
    }
  }
}


// --------------------------------------------------
// Initial state
// --------------------------------------------------

createChapter();