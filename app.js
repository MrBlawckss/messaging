  $("#contactList").replaceChildren(...nodes);
  $("#emptyList").hidden = visible.length > 0;
  $("#contactCount").textContent = contacts.length;
}

function renderConversation() {
  const contact = activeContact();
  if (!contact) return;
  contact.unread = false;
  $("#activeAvatar").textContent = initials(contact.name); $("#activeAvatar").style.cssText = avatarStyle(contact);
  $("#activeName").textContent = contact.name; $("#activeStatus").textContent = contact.status;
  $("#detailsAvatar").textContent = initials(contact.name); $("#detailsAvatar").style.cssText = avatarStyle(contact);
  $("#detailsName").textContent = contact.name; $("#detailsStatus").textContent = contact.location;
  $("#detailsPresence").textContent = contact.status; $("#detailsCode").textContent = contact.code; $("#detailsAbout").textContent = contact.about;

  const history = chats[contact.id] || [];
  const nodes = [];
  const divider = document.createElement("div"); divider.className = "day-divider"; divider.textContent = "Conversation"; nodes.push(divider);
  if (!history.length) {
    const empty = document.createElement("div"); empty.className = "empty-chat";
    const avatar = document.createElement("span"); avatar.className = "avatar avatar-xl"; avatar.textContent = initials(contact.name); avatar.style.cssText = avatarStyle(contact);
    const title = document.createElement("h2"); title.textContent = `Start a conversation with ${contact.name}`;
    const copy = document.createElement("p"); copy.textContent = `Connected securely via ${contact.location}. Say hello when you're ready.`;
    empty.append(avatar, title, copy); nodes.push(empty);
  } else {
    history.forEach((message) => {
      const row = document.createElement("div"); row.className = `message-row${message.mine ? " mine" : ""}`;
      if (!message.mine) { const avatar = document.createElement("span"); avatar.className = "avatar"; avatar.textContent = initials(contact.name); avatar.style.cssText = avatarStyle(contact); row.append(avatar); }
      const wrap = document.createElement("div"); wrap.className = "bubble-wrap";
      const bubble = document.createElement("p"); bubble.className = "bubble"; bubble.textContent = message.text;
      const time = document.createElement("span"); time.className = "message-time"; time.textContent = message.mine ? `${message.time} · Sent` : message.time;
      wrap.append(bubble, time); row.append(wrap); nodes.push(row);
    });
  }
  $("#messages").replaceChildren(...nodes);
  requestAnimationFrame(() => { $("#messages").scrollTop = $("#messages").scrollHeight; });
  renderContacts($("#contactSearch").value); save();
}

function renderProfile() {
  $("#sidebarDisplayName").textContent = profile.name; $("#selfAvatar").textContent = initials(profile.name);
  $("#profileNameInput").value = profile.name; $("#profileCodeInput").value = profile.code;
  $(".profile-icon").textContent = initials(profile.name);
}

function showToast(message) {
  clearTimeout(toastTimer); $("#toast").textContent = message; $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2200);
}

async function copyText(text, successMessage) {
  try { await navigator.clipboard.writeText(text); showToast(successMessage); }
  catch { const area = document.createElement("textarea"); area.value = text; area.style.position = "fixed"; area.style.opacity = "0"; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); showToast(successMessage); }
}

function closePanels() {
  $("#sidebar").classList.remove("open"); $("#detailsPanel").classList.remove("open");
  $("#conversationInfo").setAttribute("aria-expanded", "false"); $("#scrim").hidden = true;
}

function openPanel(panel) {
  closePanels(); panel.classList.add("open"); $("#scrim").hidden = false;
  if (panel === $("#detailsPanel")) $("#conversationInfo").setAttribute("aria-expanded", "true");
}

function openDialog(dialog) { $("#contactError").textContent = ""; dialog.showModal(); }

$("#contactList").addEventListener("click", (event) => {
  const button = event.target.closest(".contact-item"); if (!button) return;
  activeId = button.dataset.id; renderConversation(); closePanels(); $("#messageInput").focus();
});
$("#contactSearch").addEventListener("input", (event) => renderContacts(event.target.value));
$("#openAddContact").addEventListener("click", () => { openDialog($("#addContactDialog")); setTimeout(() => $("#contactCodeInput").focus(), 0); });
$("#openProfile").addEventListener("click", () => { renderProfile(); openDialog($("#profileDialog")); });
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }));

$("#useDemoCode").addEventListener("click", () => { $("#contactCodeInput").value = "hdw98Wfdha9AWH"; $("#contactCodeInput").focus(); });
$("#addContactForm").addEventListener("submit", (event) => {
  event.preventDefault(); const code = $("#contactCodeInput").value.trim(); const found = directory[code];
  if (!found) { $("#contactError").textContent = "No Relay contact matches that code."; return; }
  const existing = contacts.find((contact) => contact.code === code);
  if (existing) { activeId = existing.id; $("#addContactDialog").close(); renderConversation(); showToast(`${existing.name} is already in your contacts`); return; }
  const contact = { ...found, code, preview: "Start a conversation", time: "Now", unread: false };
  contacts.unshift(contact); chats[contact.id] = []; activeId = contact.id; $("#contactSearch").value = "";
  $("#addContactDialog").close(); $("#addContactForm").reset(); renderConversation(); save(); showToast(`${contact.name} added`);
});

$("#profileForm").addEventListener("submit", (event) => {
  event.preventDefault(); const name = $("#profileNameInput").value.trim(); if (!name) return;
  profile.name = name; save(); renderProfile(); $("#profileDialog").close(); showToast("Profile updated");
});
$("#copyContactCode").addEventListener("click", () => { const contact = activeContact(); if (contact) copyText(contact.code, "Contact code copied"); });
$("#copyProfileCode").addEventListener("click", () => copyText(profile.code, "Your code copied"));

$("#messageForm").addEventListener("submit", (event) => {
  event.preventDefault(); const input = $("#messageInput"); const text = input.value.trim(); const contact = activeContact(); if (!text || !contact) return;
  const sentAt = now(); chats[contact.id] ||= []; chats[contact.id].push({ text, mine: true, time: sentAt });
  contact.preview = text; contact.time = sentAt; contacts = [contact, ...contacts.filter((item) => item.id !== contact.id)];
  input.value = ""; input.style.height = "auto"; save(); renderConversation(); input.focus();
});
$("#messageInput").addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); $("#messageForm").requestSubmit(); } });
$("#messageInput").addEventListener("input", (event) => { event.target.style.height = "auto"; event.target.style.height = `${Math.min(event.target.scrollHeight, 128)}px`; });

$("#conversationInfo").addEventListener("click", () => { if (matchMedia("(max-width: 1050px)").matches) openPanel($("#detailsPanel")); });
$("#closeDetails").addEventListener("click", closePanels); $("#openSidebar").addEventListener("click", () => openPanel($("#sidebar"))); $("#closeSidebar").addEventListener("click", closePanels); $("#scrim").addEventListener("click", closePanels);
window.addEventListener("resize", () => { if (innerWidth > 1050) closePanels(); });
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); closePanels(); if (innerWidth <= 700) openPanel($("#sidebar")); $("#contactSearch").focus(); }
  if (event.key === "Escape") closePanels();
});

renderProfile(); renderContacts(); if (activeId) renderConversation();
