const directory = {
  Maya7C4nQ2: { id: "maya", name: "Maya Chen", location: "Toronto, Canada", status: "Active now", about: "Building thoughtful things, one small step at a time.", accent: ["#38675c", "#18382f"] },
  NoahF8kL31: { id: "noah", name: "Noah Williams", location: "London, UK", status: "Active 12m ago", about: "Designer, cyclist, and chronic note-taker.", accent: ["#64547b", "#34294a"] },
  Sofia8R2pX5: { id: "sofia", name: "Sofia Rossi", location: "Milan, Italy", status: "Active 1h ago", about: "Finding good food and better stories.", accent: ["#74593e", "#382719"] },
  hdw98Wfdha9AWH: { id: "ari", name: "Ari Morgan", location: "Perth, Australia", status: "Active now", about: "Here for clear ideas and good conversations.", accent: ["#45616e", "#213842"] }
};

const seedContacts = [
  { ...directory.Maya7C4nQ2, code: "Maya7C4nQ2", preview: "That sounds perfect — see you then!", time: "9:42", unread: true },
  { ...directory.NoahF8kL31, code: "NoahF8kL31", preview: "Sent you the final version.", time: "Tue", unread: false },
  { ...directory.Sofia8R2pX5, code: "Sofia8R2pX5", preview: "The view from here is unreal.", time: "Sun", unread: false }
];

const seedMessages = {
  maya: [
    { text: "Hey! Are we still on for Saturday?", mine: false, time: "9:36" },
    { text: "Absolutely. How does 11 near the old bookshop sound?", mine: true, time: "9:39" },
    { text: "That sounds perfect — see you then!", mine: false, time: "9:42" }
  ],
  noah: [
    { text: "I cleaned up the spacing and exported everything.", mine: false, time: "Tuesday" },
    { text: "Sent you the final version.", mine: false, time: "Tuesday" }
  ],
  sofia: [
    { text: "Made it to the top just before sunset.", mine: false, time: "Sunday" },
    { text: "The view from here is unreal.", mine: false, time: "Sunday" }
  ]
};

const $ = (selector) => document.querySelector(selector);
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* The prototype still works when storage is unavailable. */ }
  }
};

let profile = storage.get("relay-profile", { name: "Levi", code: "Levi4R7pQ9" });
let contacts = storage.get("relay-contacts", seedContacts);
let chats = storage.get("relay-chats", seedMessages);
let activeId = contacts[0]?.id || null;
let toastTimer;

function initials(name) {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

function avatarStyle(contact) {
  const colors = contact.accent || ["#365e56", "#18342e"];
  return `background:linear-gradient(145deg, ${colors[0]}, ${colors[1]})`;
}

function save() {
  storage.set("relay-profile", profile);
  storage.set("relay-contacts", contacts);
  storage.set("relay-chats", chats);
}

function renderContacts(filter = "") {
  const query = filter.trim().toLowerCase();
  const visible = contacts.filter((contact) => contact.name.toLowerCase().includes(query) || contact.code.toLowerCase().includes(query));
  const list = $("#contactList");
  list.replaceChildren(...visible.map((contact) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `contact-item${contact.id === activeId ? " active" : ""}`;
    button.dataset.id = contact.id;
    button.innerHTML = `
      <span class="avatar" style="${avatarStyle(contact)}">${initials(contact.name)}</span>
      <span class="contact-main">
        <span class="contact-topline"><strong></strong><time></time></span>
        <span class="contact-preview"></span>
      </span>
      ${contact.unread ? '<span class="unread" aria-label="Unread message"></span>' : ""}`;
    button.querySelector("strong").textContent = contact.name;
    button.querySelector("time").textContent = contact.time || "Now";
    button.querySelector(".contact-preview").textContent = contact.preview || "Start a conversation";
    return button;
  }));
  $("#emptyList").hidden = visible.length > 0;
  $("#contactCount").textContent = contacts.length;
}

function activeContact() {
  return contacts.find((contact) => contact.id === activeId);
}

function renderConversation() {
  const contact = activeContact();
  if (!contact) return;
  contact.unread = false;
  $("#activeAvatar").textContent = initials(contact.name);
