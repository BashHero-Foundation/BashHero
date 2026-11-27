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
    `Delete chapter ${id}: ${label}?`
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

async function buildAppZipFromOPFS() {
  await ensureSourceStaged();

  const zip = new JSZip();
  const sourceDir = await getSourceDir();

  async function walk(dirHandle, prefix) {
    for await (const [name, handle] of dirHandle.entries()) {
      if (name.startsWith(".")) continue;

      const path = prefix ? `${prefix}/${name}` : name;

      if (handle.kind === "file") {
        if (path.startsWith("public/levels/") && name.endsWith(".json")) {
          continue;
        }
        if (path === "public/levels_manifest.json") {
          continue;
        }
        if (path === "app/levelsUtils.ts") continue;
        zip.file(path, await handle.getFile());
      } else if (handle.kind === "directory") {
        await walk(handle, path);
      }
    }
  }

  await walk(sourceDir, "");

  // Write this session's chapters into public/levels/ and build the manifest.
  const manifest = [];
  const idents = [];

  for (const c of chapters) {
    const data = getExportData(c);
    const ident = `chapter${safeFilename(data.chapterId)}`;
    const fileName = `${ident}.json`;

    zip.file(
      `public/levels/${fileName}`,
      JSON.stringify(data, null, 2) + "\n"
    );

    manifest.push(`./levels/${fileName}`);
    idents.push(ident);
  }

  zip.file(
    "public/levels_manifest.json",
    JSON.stringify(manifest, null, 2) + "\n"
  );

  const utilsContent =
    "// AUTO-GENERATED by builder — do not edit.\n" +
    "// Chapters are driven by public/levels_manifest.json.\n" +
    idents
      .map(id => `import ${id} from "../public/levels/${id}.json";`)
      .join("\n") +
    "\n\n" +
    `export const chapters = [${idents.join(", ")}];\n` +
    "export const allLevels = chapters.flatMap(chapter => chapter.levels);\n";

  zip.file("app/levelsUtils.ts", utilsContent);

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("exportAllBtn").addEventListener("click", async () => {
  if (chapters.length === 0) {
    return setStatus("No chapters to export.", "error");
  }
  if (typeof JSZip === "undefined") {
    return setStatus("ZIP export unavailable: JSZip failed to load.", "error");
  }
  if (typeof window.__SOURCE__ !== "object") {
    return setStatus(
      "Source bundle missing. Ensure build-templates.mjs and build-source.mjs was ran.",
      "error"
    );
  }

  try {
    for (const c of chapters) validateChapter(getExportData(c));
  } catch (e) {
    return setStatus(e.message, "error");
  }

  try {
    setStatus("Staging source in OPFS…");
    const blob = await buildAppZipFromOPFS();

    triggerDownload(blob, "BashHeroPack.zip");

    setStatus(
      `Packaged ${chapters.length} chapter(s) into BashHeroPack.zip ` +
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
// Templates
// --------------------------------------------------

// --------------------------------------------------
// OPFS — template staging
// --------------------------------------------------

// --------------------------------------------------
// OPFS — availability + self-test
// --------------------------------------------------

let opfsSelfTestPromise = null;

function opfsSelfTest() {
  if (opfsSelfTestPromise) return opfsSelfTestPromise;

  opfsSelfTestPromise = (async () => {
    const root = await navigator.storage.getDirectory();
    const dirName = ".selftest";

    try { await root.removeEntry(dirName, { recursive: true }); } catch { /* */ }

    try {
      const dir = await root.getDirectoryHandle(dirName, { create: true });
      const fh = await dir.getFileHandle("probe.txt", { create: true });
      const w = await fh.createWritable();
      await w.write("ok");
      await w.close();
      const read = await (await fh.getFile()).text();
      if (read !== "ok") throw new Error("OPFS read-back mismatch.");
    } finally {
      try { await root.removeEntry(dirName, { recursive: true }); } catch { /* */ }
    }
  })();

  return opfsSelfTestPromise;
}

async function assertOPFSAvailable() {
  if (!navigator.storage?.getDirectory) {
    throw new Error(
      "OPFS is not supported in this browser. " +
      "Use a recent version of Firefox, Chrome, or Edge."
    );
  }
  if (!window.isSecureContext) {
    throw new Error(
      "OPFS requires a secure context. Open the builder via " +
      "http://localhost or https:// instead of file://."
    );
  }
  if (window.top !== window.self) {
    throw new Error(
      "OPFS is blocked inside an iframe without " +
      'sandbox="allow-same-origin". Open the builder in a top-level tab.'
    );
  }

  try {
    await opfsSelfTest();
  } catch (e) {
    throw new Error(
      `OPFS write test failed (${e.name}): ${e.message}. ` +
      "If you're using Edge, check Enhanced Security Mode " +
      "(edge://settings/privacy → Exceptions)."
    );
  }
}

async function getOPFSRoot() {
  await assertOPFSAvailable();
  return navigator.storage.getDirectory();
}

async function getOPFSBuilderDir() {
  const root = await getOPFSRoot();
  return root.getDirectoryHandle("builder", { create: true });
}

async function getTemplatesDir() {
  const builderDir = await getOPFSBuilderDir();
  return builderDir.getDirectoryHandle("templates", { create: true });
}

async function clearOPFSTemplates() {
  const templatesDir = await getTemplatesDir();
  const toRemove = [];
  for await (const [name] of templatesDir.entries()) toRemove.push(name);
  for (const name of toRemove) {
    await templatesDir.removeEntry(name, { recursive: true });
  }
}

async function loadTemplates() {
  const list = $("templateList");
  list.replaceChildren();

  try {
    const templatesDir = await getTemplatesDir();
    const subdirs = [];
    for await (const [name, handle] of templatesDir.entries()) {
      if (name.startsWith(".")) continue;              // skip .version
      if (handle.kind === "directory") subdirs.push({ name, handle });
    }
    subdirs.sort((a, b) => a.name.localeCompare(b.name));

    if (subdirs.length === 0) {
      list.append(makeElement(
        "p", "", "No templates staged in OPFS. Ensure build-templates.mjs and build-source.mjs was ran."
      ));
      return;
    }

    for (const { name, handle } of subdirs) {
      const item = makeElement("div", "chapter-item");

      const info = makeElement("div", "chapter-select");
      info.append(
        makeElement("strong", "", name),
      );

      const addBtn = makeElement("button", "primary small-button", "Add all chapters");
      addBtn.type = "button";
      addBtn.addEventListener("click", () => addTemplateChapters(name, handle));

      const actions = makeElement("div", "chapter-actions");
      actions.append(addBtn);

      item.append(info, actions);
      list.append(item);
    }
  } catch (e) {
    setStatus(`Could not read templates: ${e.message}`, "error");
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

    for (const normalized of imported) {
      chapters.push({ chapterId: allocateChapterId(), ...normalized });
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

// --------------------------------------------------
// Source — bundle → OPFS staging
// --------------------------------------------------

async function getSourceDir() {
  const root = await getOPFSRoot();
  return root.getDirectoryHandle("source", { create: true });
}

async function clearOPFSSource() {
  const sourceDir = await getSourceDir();
  const toRemove = [];
  for await (const [name] of sourceDir.entries()) toRemove.push(name);
  for (const name of toRemove) {
    await sourceDir.removeEntry(name, { recursive: true });
  }
}

async function ensureSourceStaged() {
  if (typeof window.__SOURCE__ !== "object" || window.__SOURCE__ === null) {
    return { staged: false, reason: "no bundle loaded" };
  }

  const sourceDir = await getSourceDir();
  const want = String(window.__SOURCE_VERSION__ ?? "0");

  try {
    const marker = await sourceDir.getFileHandle(".version");
    const have = (await (await marker.getFile()).text()).trim();
    if (have === want) return { staged: false, reason: "up to date", version: want };
  } catch { /* no marker */ }

  await clearOPFSSource();

  let fileCount = 0;
  for (const [relPath, entry] of Object.entries(window.__SOURCE__)) {
    const parts = relPath.split("/");
    const fileName = parts.pop();

    let dir = sourceDir;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }

    const fh = await dir.getFileHandle(fileName, { create: true });
    const w = await fh.createWritable();

    if (entry.type === "text") {
      await w.write(entry.content);
    } else {
      const bin = atob(entry.content);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      await w.write(bytes);
    }
    await w.close();
    fileCount++;
  }

  const marker = await sourceDir.getFileHandle(".version", { create: true });
  const mw = await marker.createWritable();
  await mw.write(want);
  await mw.close();

  return { staged: true, count: fileCount, version: want };
}

$("importTemplatesBtn").addEventListener("click", () => {
  $("templatesInput").click();
});

$("templatesInput").addEventListener("change", async event => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  try {
    setStatus("Staging templates in OPFS…");
    const { templateCount, fileCount } = await importTemplatesFromFileList(files);
    await loadTemplates();
    setStatus(
      `Staged ${templateCount} template(s) (${fileCount} file(s)) in OPFS.`,
      "success"
    );
  } catch (e) {
    setStatus(`Template import failed: ${e.message}`, "error");
  } finally {
    event.target.value = "";  // allow re-picking the same folder
  }
});


// --------------------------------------------------
// Templates — bundle → OPFS staging
// --------------------------------------------------

async function ensureTemplatesStaged() {
  if (typeof window.__TEMPLATES__ !== "object" || window.__TEMPLATES__ === null) {
    return { staged: false, reason: "no bundle loaded" };
  }

  const templatesDir = await getTemplatesDir();
  const want = String(window.__TEMPLATES_VERSION__ ?? "0");

  // Fast path: bundle version matches what OPFS already holds.
  try {
    const marker = await templatesDir.getFileHandle(".version");
    const have = (await (await marker.getFile()).text()).trim();
    if (have === want) return { staged: false, reason: "up to date", version: want };
  } catch { /* no marker yet — stage */ }

  // Wipe and rewrite so removed templates don't linger.
  const existing = [];
  for await (const [name] of templatesDir.entries()) existing.push(name);
  for (const name of existing) {
    await templatesDir.removeEntry(name, { recursive: true });
  }

  let fileCount = 0;
  const templateNames = Object.keys(window.__TEMPLATES__);
  templateNames.sort((a, b) => a.localeCompare(b));

  for (const tmplName of templateNames) {
    const safeDir = tmplName.replace(/[^a-zA-Z0-9._-]/g, "_") || "template";
    const tmplDir = await templatesDir.getDirectoryHandle(safeDir, { create: true });

    const files = window.__TEMPLATES__[tmplName];
    for (const [fileName, data] of Object.entries(files)) {
      const safeFile = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fh = await tmplDir.getFileHandle(safeFile, { create: true });
      const w = await fh.createWritable();
      await w.write(JSON.stringify(data, null, 2) + "\n");
      await w.close();
      fileCount++;
    }
  }

  // Marker file that gates re-staging on the next load.
  const marker = await templatesDir.getFileHandle(".version", { create: true });
  const mw = await marker.createWritable();
  await mw.write(want);
  await mw.close();

  return {
    staged: true,
    count: fileCount,
    templates: templateNames.length,
    version: want
  };
}

// --------------------------------------------------

function parseTemplatePath(relativePath) {
  const parts = relativePath.split("/").filter(Boolean);
  const tIdx = parts.indexOf("templates");

  // Preferred form: ".../templates/<name>/<file>"
  if (tIdx >= 0 && parts[tIdx + 1]) {
    const templateName = parts[tIdx + 1];
    const fileName = parts.slice(tIdx + 2).join("/");
    return fileName ? { templateName, fileName } : null;
  }

  // Fallback: user picked a folder whose direct subfolders are templates,
  // e.g. picking `templates/` itself, or an arbitrary parent.
  if (parts.length >= 2) {
    return {
      templateName: parts[0],
      fileName: parts.slice(1).join("/")
    };
  }

  return null; // a .json sitting loose at the picked root — ignore
}

async function importTemplatesFromFileList(fileList) {
  const jsonFiles = Array.from(fileList).filter(f =>
    f.name.toLowerCase().endsWith(".json")
  );

  if (jsonFiles.length === 0) {
    throw new Error(
      "No .json files found. Pick a folder whose subfolders are templates " +
      "(for example, builder/templates/ or builder/)."
    );
  }

  // Group by template name first, so we can fail early if nothing parsed.
  const grouped = new Map();
  for (const file of jsonFiles) {
    const parsed = parseTemplatePath(file.webkitRelativePath || file.name);
    if (!parsed) continue;
    if (!grouped.has(parsed.templateName)) grouped.set(parsed.templateName, []);
    grouped.get(parsed.templateName).push({ name: parsed.fileName, file });
  }

  if (grouped.size === 0) {
    throw new Error(
      "No template subfolders detected. Pick the folder that contains " +
      "template subfolders (e.g. builder/templates/)."
    );
  }

  // Wipe old staged templates before rewriting.
  await clearOPFSTemplates();
  const templatesDir = await getTemplatesDir();

  let fileCount = 0;
  for (const [templateName, files] of grouped) {
    const safeDir = templateName.replace(/[^a-zA-Z0-9._-]/g, "_") || "template";
    const tmplDir = await templatesDir.getDirectoryHandle(safeDir, { create: true });

    for (const { name, file } of files) {
      const safeFile = name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fh = await tmplDir.getFileHandle(safeFile, { create: true });
      const w = await fh.createWritable();
      await w.write(await file.text());
      await w.close();
      fileCount++;
    }
  }

  return { templateCount: grouped.size, fileCount };
}

// --------------------------------------------------
// Initial state
// --------------------------------------------------

(async () => {
  const list = $("templateList");
  try {
    const result = await ensureTemplatesStaged();
    if (result.staged) {
      console.log(
        `Staged ${result.templates} template(s) ` +
        `(${result.count} file(s)) from bundle v${result.version}.`
      );
    }

    await loadTemplates();

    // If loadTemplates rendered nothing, the panel is empty — explain why.
    if (list.children.length === 0) {
      list.append(makeElement(
        "p", "",
        "No templates staged. Ensure build-templates.mjs and build-source.mjs was ran."
      ));
    }
  } catch (e) {
    list.replaceChildren();
    list.append(makeElement("p", "", `Templates unavailable: ${e.message}`));
    console.warn("Template staging failed:", e);
  }
})();

createChapter();