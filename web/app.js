const datasetConfig = [
  {
    id: "events",
    label: "Events",
    description: "Live event schedule with bonuses and spawns",
    searchableFields: ["name", "eventType", "heading", "bonuses", "pokemon"],
  },
  {
    id: "raids",
    label: "Raids",
    description: "Raid bosses by tier",
    searchableFields: ["name", "tier", "form"],
  },
  {
    id: "research",
    label: "Research",
    description: "Research tasks and rewards",
    searchableFields: ["task", "reward", "pokemon"],
  },
  {
    id: "eggs",
    label: "Eggs",
    description: "Egg hatch pool",
    searchableFields: ["name", "eggType"],
  },
  {
    id: "shinies",
    label: "Shinies",
    description: "Shiny availability",
    searchableFields: ["name", "family", "source"],
  },
];

const state = {
  active: "events",
  data: {},
  loading: {},
  error: {},
  query: "",
  sort: "start-asc",
  filters: new Set(),
  view: "list",
  calendarDate: new Date(),
};

const elements = {
  tabs: document.getElementById("tabs"),
  grid: document.getElementById("grid"),
  calendar: document.getElementById("calendar"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarMonth: document.getElementById("calendarMonth"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth"),
  viewToggle: document.getElementById("viewToggle"),
  status: document.getElementById("status"),
  filters: document.getElementById("filters"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  detailPanel: document.getElementById("detailPanel"),
  detailTitle: document.getElementById("detailTitle"),
  detailBody: document.getElementById("detailBody"),
  detailClose: document.getElementById("detailClose"),
  configBtn: document.getElementById("configBtn"),
  configDialog: document.getElementById("configDialog"),
  apiInput: document.getElementById("apiInput"),
  apiSave: document.getElementById("apiSave"),
};

const apiMeta = document.querySelector("meta[name='api-base']");
const storedApiBase = window.localStorage.getItem("pogoApiBase");
let apiBaseUrl = storedApiBase || (apiMeta ? apiMeta.content : "");

function getApiUrl(datasetId) {
  return `${apiBaseUrl.replace(/\/$/, "")}/${datasetId}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatValue(value) {
  if (Array.isArray(value)) return `${value.length} items`;
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return "Object";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function getImage(record) {
  return record.image || record.icon || record.sprite || "";
}

function getTitle(record) {
  return record.name || record.title || record.task || record.pokemon || "Untitled";
}

function getSubtitle(record) {
  if (record.eventType) return record.eventType;
  if (record.eggType) return record.eggType;
  if (record.tier) return `Tier ${record.tier}`;
  return record.category || record.type || "";
}

function getMetaLines(record, datasetId) {
  if (datasetId === "events") {
    return [
      `Start: ${formatDate(record.start)}`,
      `End: ${formatDate(record.end)}`,
      record.heading ? `Heading: ${record.heading}` : null,
    ].filter(Boolean);
  }
  if (datasetId === "raids") {
    return [
      record.boss ? `Boss: ${record.boss}` : null,
      record.form ? `Form: ${record.form}` : null,
    ].filter(Boolean);
  }
  if (datasetId === "research") {
    return [
      record.task ? `Task: ${record.task}` : null,
      record.reward ? `Reward: ${record.reward}` : null,
    ].filter(Boolean);
  }
  if (datasetId === "eggs") {
    return [
      record.eggType ? `Egg: ${record.eggType}` : null,
      record.rarity ? `Rarity: ${record.rarity}` : null,
    ].filter(Boolean);
  }
  if (datasetId === "shinies") {
    return [
      record.family ? `Family: ${record.family}` : null,
      record.source ? `Source: ${record.source}` : null,
    ].filter(Boolean);
  }
  return [];
}

function setLoading(datasetId, value) {
  state.loading[datasetId] = value;
  renderStatus();
}

function setError(datasetId, error) {
  state.error[datasetId] = error;
  renderStatus();
}

async function loadDataset(datasetId) {
  if (!apiBaseUrl) {
    setError(datasetId, "API base URL not set");
    return;
  }
  setLoading(datasetId, true);
  setError(datasetId, null);
  try {
    const response = await fetch(getApiUrl(datasetId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    state.data[datasetId] = Array.isArray(data) ? data : data.items || [];
  } catch (error) {
    setError(datasetId, error.message || "Failed to load data");
  } finally {
    setLoading(datasetId, false);
    render();
  }
}

function renderTabs() {
  elements.tabs.innerHTML = "";
  datasetConfig.forEach((dataset) => {
    const button = document.createElement("button");
    button.className = `tab ${state.active === dataset.id ? "active" : ""}`;
    button.textContent = dataset.label;
    button.type = "button";
    button.addEventListener("click", () => {
      state.active = dataset.id;
      state.filters.clear();
      ensureDatasetLoaded(dataset.id);
      render();
    });
    elements.tabs.appendChild(button);
  });
}

function renderStatus() {
  const dataset = datasetConfig.find((item) => item.id === state.active);
  const items = state.data[state.active] || [];
  const loading = state.loading[state.active];
  const error = state.error[state.active];
  const stats = [];

  if (dataset) {
    stats.push({ label: dataset.description, value: items.length });
  }

  if (loading) {
    stats.push({ label: "Status", value: "Loading…" });
  }

  if (error) {
    stats.push({ label: "Error", value: error });
  }

  elements.status.innerHTML = "";
  stats.forEach((stat) => {
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.innerHTML = `<strong>${stat.value}</strong> ${stat.label}`;
    elements.status.appendChild(badge);
  });
}

function renderFilters() {
  elements.filters.innerHTML = "";
  if (state.active !== "events") return;
  const items = state.data.events || [];
  const types = Array.from(
    new Set(items.map((event) => event.eventType).filter(Boolean))
  ).sort();

  types.forEach((type) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `filter-chip ${state.filters.has(type) ? "active" : ""}`;
    chip.textContent = type;
    chip.addEventListener("click", () => {
      if (state.filters.has(type)) {
        state.filters.delete(type);
      } else {
        state.filters.add(type);
      }
      render();
    });
    elements.filters.appendChild(chip);
  });
}

function filterRecords(records, dataset) {
  const query = state.query.toLowerCase().trim();
  let filtered = records;

  if (state.active === "events" && state.filters.size > 0) {
    filtered = filtered.filter((event) => state.filters.has(event.eventType));
  }

  if (query && dataset) {
    filtered = filtered.filter((record) => {
      return dataset.searchableFields.some((field) => {
        const value = record[field];
        if (!value) return false;
        if (Array.isArray(value)) {
          return value.some((item) =>
            JSON.stringify(item).toLowerCase().includes(query)
          );
        }
        return String(value).toLowerCase().includes(query);
      });
    });
  }

  return filtered;
}

function sortRecords(records) {
  const sorted = [...records];
  const { sort } = state;

  if (sort.startsWith("name")) {
    sorted.sort((a, b) => {
      const aName = getTitle(a).toLowerCase();
      const bName = getTitle(b).toLowerCase();
      return sort.endsWith("asc") ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
    return sorted;
  }

  sorted.sort((a, b) => {
    const aDate = new Date(a.start || a.date || 0).getTime();
    const bDate = new Date(b.start || b.date || 0).getTime();
    if (sort.endsWith("asc")) return aDate - bDate;
    return bDate - aDate;
  });

  return sorted;
}

function renderCalendar() {
  const date = state.calendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();

  elements.calendarMonth.textContent = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const grid = elements.calendarGrid;
  grid.innerHTML = "";

  // Day headers
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach((d) => {
    const el = document.createElement("div");
    el.className = "calendar-day-header";
    el.textContent = d;
    grid.appendChild(el);
  });

  // Empty cells for previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    const el = document.createElement("div");
    el.className = "calendar-day other-month";
    grid.appendChild(el);
  }

  // Days
  const dataset = datasetConfig.find((item) => item.id === "events");
  const records = state.data.events || [];
  const events = filterRecords(records, dataset);

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDayStart = new Date(year, month, d).getTime();
    const currentDayEnd = new Date(year, month, d, 23, 59, 59).getTime();
    const isToday =
      new Date().toDateString() === new Date(year, month, d).toDateString();

    const el = document.createElement("div");
    el.className = `calendar-day${isToday ? " today" : ""}`;

    const dateLabel = document.createElement("div");
    dateLabel.className = "calendar-date";
    dateLabel.textContent = d;
    el.appendChild(dateLabel);

    const daysEvents = events.filter((e) => {
      const eStart = new Date(e.start).getTime();
      const eEnd = new Date(e.end).getTime();
      if (!eStart || !eEnd) return false;
      return Math.max(eStart, currentDayStart) <= Math.min(eEnd, currentDayEnd);
    });

    daysEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    daysEvents.forEach(e => {
        const eventEl = document.createElement("div");
        eventEl.className = "calendar-event";
        eventEl.textContent = e.name;
        eventEl.title = `${e.name}\n${formatDate(e.start)} - ${formatDate(e.end)}`;
        eventEl.addEventListener("click", (evt) => {
            evt.stopPropagation();
            renderDetails(e);
        });
        el.appendChild(eventEl);
    });

    grid.appendChild(el);
  }
}

function renderGrid() {
  const dataset = datasetConfig.find((item) => item.id === state.active);
  const records = state.data[state.active] || [];
  const filtered = sortRecords(filterRecords(records, dataset));

  elements.grid.innerHTML = "";

  if (state.loading[state.active]) {
    elements.grid.innerHTML = `<div class="empty">Loading ${state.active}…</div>`;
    return;
  }

  if (state.error[state.active]) {
    elements.grid.innerHTML = `<div class="empty">Unable to load data. Check your API base URL.</div>`;
    return;
  }

  if (!filtered.length) {
    elements.grid.innerHTML = `<div class="empty">No results found.</div>`;
    return;
  }

  filtered.forEach((record) => {
    const card = document.createElement("article");
    card.className = "card";

    const imageUrl = getImage(record);
    const image = document.createElement("img");
    image.className = "card__image";
    image.alt = getTitle(record);
    image.loading = "lazy";
    image.src = imageUrl || "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240'%3E%3Crect width='400' height='240' fill='%23182444'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-size='20' font-family='Arial' dominant-baseline='middle' text-anchor='middle'%3ENo image%3C/text%3E%3C/svg%3E";

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = getTitle(record);

    const meta = document.createElement("div");
    meta.className = "card__meta";
    const subtitle = getSubtitle(record);
    if (subtitle) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = subtitle;
      meta.appendChild(tag);
    }

    getMetaLines(record, state.active).forEach((line) => {
      const span = document.createElement("span");
      span.textContent = line;
      meta.appendChild(span);
    });

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(meta);

    // Make card interactive for keyboard users
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const activate = () => renderDetails(record);
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });

    elements.grid.appendChild(card);
  });
}

function renderDetails(record) {
  elements.detailTitle.textContent = getTitle(record);
  elements.detailBody.innerHTML = "";

  const entries = Object.entries(record || {}).sort(([a], [b]) => a.localeCompare(b));
  entries.forEach(([key, value]) => {
    const row = document.createElement("div");
    row.className = "detail__row";
    row.innerHTML = `<span>${key}</span><div>${formatValue(value)}</div>`;
    elements.detailBody.appendChild(row);
  });
}

function ensureDatasetLoaded(datasetId) {
  if (!state.data[datasetId] && !state.loading[datasetId]) {
    loadDataset(datasetId);
  }
}

function render() {
  renderTabs();
  renderStatus();
  renderFilters();

  const showCalendar = state.active === 'events' && state.view === 'calendar';

  if (state.active === 'events') {
    elements.viewToggle.style.display = 'flex';
    Array.from(elements.viewToggle.children).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === state.view);
    });
  } else {
    elements.viewToggle.style.display = 'none';
  }

  if (showCalendar) {
    elements.grid.style.display = 'none';
    elements.calendar.style.display = 'flex';
    renderCalendar();
  } else {
    elements.grid.style.display = 'grid';
    elements.calendar.style.display = 'none';
    renderGrid();
  }
}

function openConfig() {
  elements.apiInput.value = apiBaseUrl;
  elements.configDialog.showModal();
}

function saveConfig() {
  apiBaseUrl = elements.apiInput.value.trim();
  window.localStorage.setItem("pogoApiBase", apiBaseUrl);
  loadDataset(state.active);
}

function init() {
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  elements.detailClose.addEventListener("click", () => {
    elements.detailTitle.textContent = "Select a card";
    elements.detailBody.innerHTML = "<p>Choose an item to view full details.</p>";
  });

  elements.configBtn.addEventListener("click", openConfig);
  elements.apiSave.addEventListener("click", (event) => {
    event.preventDefault();
    saveConfig();
    elements.configDialog.close();
  });

  elements.viewToggle.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        state.view = e.target.dataset.view;
        render();
    }
  });

  elements.prevMonth.addEventListener("click", () => {
    state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1);
    renderCalendar();
  });

  elements.nextMonth.addEventListener("click", () => {
    state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1);
    renderCalendar();
  });

  render();
  ensureDatasetLoaded(state.active);
}

init();
