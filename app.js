/* final app.js - for Campus Connect
   Works with the provided HTML/CSS structure.
*/
(function () {
  // -------------------------
  // Helper fetch functions
  // -------------------------
  // Fetch the list of floors for a selected block
  async function loadFloors(blockId) {
    try {
      const res = await fetch(`http://localhost:3000/floors/${blockId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("loadFloors error:", err);
      return [];
    }
  }

  // Fetch faculty assigned to the chosen block/floor pair
  async function loadFaculty(blockId, floorId) {
    try {
      const res = await fetch(`http://localhost:3000/faculty/${blockId}/${floorId}`);
      if (!res.ok) {
        console.error(`loadFaculty failed: ${res.status} ${res.statusText}`);
        return [];
      }
      const data = await res.json();
      console.log(`Loaded ${data.length} faculty for block ${blockId}, floor ${floorId}:`, data);
      return data;
    } catch (err) {
      console.error("loadFaculty error:", err);
      return [];
    }
  }

  // Fetch rooms/labs for the same block/floor pair
  async function loadRooms(blockId, floorId) {
    try {
      const res = await fetch(`http://localhost:3000/rooms/${blockId}/${floorId}`);
      if (!res.ok) {
        console.error(`loadRooms failed: ${res.status} ${res.statusText}`);
        return [];
      }
      const data = await res.json();
      console.log(`Loaded ${data.length} rooms for block ${blockId}, floor ${floorId}:`, data);
      return data;
    } catch (err) {
      console.error("loadRooms error:", err);
      return [];
    }
  }

  // -------------------------
  // Render functions
  // -------------------------
  // Draw clickable floor buttons under the block banner
  function renderFloorButtons(floors, blockId) {
    const container = document.getElementById("floor-buttons");
    container.innerHTML = "";
    if (!floors || floors.length === 0) {
      container.innerHTML = "<p>No floors available for this block.</p>";
      return;
    }
    console.log(`Rendering ${floors.length} floor buttons for block ${blockId}:`, floors);
    floors.forEach(floor => {
      const btn = document.createElement("button");
      btn.className = "floor-btn";
      btn.innerText = floor.floor_name;
      btn.addEventListener("click", () => {
        console.log(`Floor button clicked: ${floor.floor_name}, blockId=${blockId}, floorId=${floor.id}`);
        document.querySelectorAll(".floor-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        // Ensure blockId is a number
        loadFloorData(Number(blockId), Number(floor.id), floor.floor_name);
      });
      container.appendChild(btn);
    });
  }

  // Show the faculty cards grid; optionally highlight a search hit
  function renderFacultyCards(list, searchMatchName = null) {
    const container = document.getElementById("faculty-container");
    container.innerHTML = "";
    if (!list || list.length === 0) {
      container.innerHTML = "<p>No faculty on this floor.</p>";
      return;
    }
    list.forEach(f => {
      const card = document.createElement("div");
      card.className = "faculty-card";
      // Use photo path served from /images/<photo>
      const photoSrc = f.photo ? `http://localhost:3000/images/${f.photo}` : "http://localhost:3000/images/faculty/avatar-placeholder.png";
      card.innerHTML = `
        <img src="${photoSrc}" class="faculty-photo" alt="${escapeHtml(f.name)}">
        <div class="faculty-details">
          <h4>${escapeHtml(f.name)}</h4>
          <p><b>Role:</b> ${escapeHtml(f.role || "-")}</p>
          <p><b>Email:</b> ${escapeHtml(f.email || "-")}</p>
          <p><b>Phone:</b> ${escapeHtml(f.phone || "-")}</p>
          <p><b>Room:</b> ${escapeHtml(f.room || "-")}</p>
        </div>
      `;
      container.appendChild(card);
      // if this is a match from search, highlight it
      if (searchMatchName && searchMatchName.toLowerCase() === (f.name || "").toLowerCase()) {
        scrollAndHighlight(card);
      }
    });
  }

  // Show the rooms grid; optionally highlight a search hit
  function renderRoomCards(list, searchMatchRoom = null) {
    const container = document.getElementById("rooms-container");
    container.innerHTML = "";
    if (!list || list.length === 0) {
      container.innerHTML = "<p>No rooms on this floor.</p>";
      return;
    }
    list.forEach(r => {
      const card = document.createElement("div");
      card.className = "room-card";
      card.innerHTML = `
        <h4>${escapeHtml(r.name)} ${r.room_number ? `(${escapeHtml(r.room_number)})` : ""}</h4>
        <p>${escapeHtml(r.details || "")}</p>
      `;
      container.appendChild(card);
      if (searchMatchRoom && (r.room_number || "").toLowerCase() === searchMatchRoom.toLowerCase()) {
        scrollAndHighlight(card);
      }
    });
  }

  // -------------------------
  // Utilities
  // -------------------------
  // Basic HTML escape to avoid XSS in templated strings
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  // Scroll matching card into view and flash it briefly
  function scrollAndHighlight(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight-card");
    setTimeout(() => el.classList.remove("highlight-card"), 2200);
  }

  // -------------------------
  // Load data for selected floor
  // -------------------------
  // Load all content for a floor and render faculty/rooms
  async function loadFloorData(blockId, floorId, floorName, searchContext = null) {
    console.log(`loadFloorData called: blockId=${blockId}, floorId=${floorId}, floorName=${floorName}`);
    document.getElementById("floor-title").innerText = `${floorName} Floor`;
    
    // Ensure blockId and floorId are numbers
    blockId = Number(blockId);
    floorId = Number(floorId);
    
    const [faculty, rooms] = await Promise.all([
      loadFaculty(blockId, floorId),
      loadRooms(blockId, floorId)
    ]);
    
    console.log(`Rendering: ${faculty.length} faculty, ${rooms.length} rooms`);
    
    // If searchContext provided, indicate which item to highlight
    if (searchContext && searchContext.type === "faculty") {
      renderFacultyCards(faculty, searchContext.name);
      renderRoomCards(rooms);
    } else if (searchContext && searchContext.type === "room") {
      renderFacultyCards(faculty);
      renderRoomCards(rooms, searchContext.room_number);
    } else {
      renderFacultyCards(faculty);
      renderRoomCards(rooms);
    }
  }

  // -------------------------
  // Open block page & optionally highlight a searched item
  // -------------------------
  // searchItem is an object returned from server (must include type, block_id, floor_id, name, room_number, floor_name)
  // Switch from home view to block view and bootstrap floors
  async function openBlockPageById(blockId, searchItem = null) {
    // Show block page
    document.getElementById("home-page").classList.add("hidden");
    document.getElementById("block-page").classList.remove("hidden");

    // Find block card in DOM to get name and image
    const card = document.querySelector(`.block-card[data-block-id="${blockId}"]`);
    if (card) {
      const blockName = card.querySelector("h4")?.innerText || "";
      const blockImage = card.querySelector("img")?.getAttribute("src") || "";
      document.getElementById("block-name").innerText = blockName;
      const bi = document.getElementById("block-image");
      if (bi && blockImage) bi.src = blockImage;
    } else {
      // fallback: display id
      document.getElementById("block-name").innerText = "Block";
    }

    // Load floors, render buttons
    const floors = await loadFloors(blockId);
    renderFloorButtons(floors, blockId);

    // If searchItem present, auto-click corresponding floor button when available
    if (searchItem && searchItem.floor_id) {
      // Wait a short time for buttons to be added
      setTimeout(() => {
        const floorBtn = [...document.querySelectorAll(".floor-btn")]
          .find(btn => btn.innerText.toLowerCase() === (searchItem.floor_name || "").toLowerCase());
        if (floorBtn) {
          floorBtn.click();
          // after loadFloorData renders, highlight occurs inside loadFloorData via searchContext
          // we pass searchContext to loadFloorData above by temporarily calling it:
          // but since click triggers loadFloorData without context, we manually call loadFloorData here
          setTimeout(() => {
            loadFloorData(blockId, searchItem.floor_id, searchItem.floor_name || "", searchItem);
          }, 400);
        } else {
          // if no matching floor button by name, try to find a button with same floor id (if we stored)
          // otherwise fallback: load first floor
          const firstFloor = floors[0];
          if (firstFloor) {
            loadFloorData(blockId, firstFloor.id, firstFloor.floor_name);
          }
        }
      }, 250);
    } else {
      // no search context: nothing selected automatically
      // optionally, clear faculty/rooms or show message
      document.getElementById("faculty-container").innerHTML = "";
      document.getElementById("rooms-container").innerHTML = "";
      document.getElementById("floor-title").innerText = "Select a floor to view details";
    }
  }

  // -------------------------
  // Search: performSearch (search button / Enter)
  // -------------------------
  // Search button: fetch best match and navigate to it
  async function performSearch() {
    const searchInput = document.getElementById("search-input");
    const q = (searchInput?.value || "").trim();
    if (!q) {
      alert("Enter a search term");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) { alert("Search failed"); return; }
      const data = await res.json();
      const facultyResults = data.faculty || [];
      const roomResults = data.rooms || [];
      if (facultyResults.length === 0 && roomResults.length === 0) {
        alert("No results found.");
        return;
      }
      const selected = facultyResults.length > 0 ? facultyResults[0] : roomResults[0];
      // navigate
      await openBlockPageById(selected.block_id, selected);
      // clear suggestions if any
      const sb = document.getElementById("search-suggestions");
      if (sb) { sb.innerHTML = ""; sb.classList.add("hidden"); }
      document.getElementById("search-input").value = "";
    } catch (err) {
      console.error("performSearch error:", err);
      alert("Search error. See console.");
    }
  }

  // -------------------------
  // Live suggestions and selection handlers
  // -------------------------
  // suggestion click handler
  // Delegate click events in the suggestion dropdown
  function attachSuggestionHandlers() {
    const suggestionBox = document.getElementById("search-suggestions");
    if (!suggestionBox) return;

    suggestionBox.addEventListener("click", (e) => {
      const item = e.target.closest(".suggestion-item");
      if (!item) return;
      const type = item.dataset.type;
      const block = item.dataset.block;
      const floor = item.dataset.floor;
      const name = item.dataset.name;
      const room = item.dataset.room || null;
      const floorName = item.dataset.floorname || "";

      const searchData = {
        type: type,
        block_id: Number(block),
        floor_id: Number(floor),
        name: name,
        room_number: room,
        floor_name: floorName
      };

      openBlockPageById(Number(block), searchData);
      suggestionBox.classList.add("hidden");
      document.getElementById("search-input").value = "";
    });
  }

  // Live-search helper for suggestions dropdown
  async function fetchSuggestions(q) {
    try {
      const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return { faculty: [], rooms: [] };
      return await res.json();
    } catch (err) {
      console.error("fetchSuggestions error:", err);
      return { faculty: [], rooms: [] };
    }
  }

  // -------------------------
  // Login modal handlers (same IDs as in HTML)
  // -------------------------
  // Modal open/close + fake auth submit handler
  function setupLoginHandlers() {
    const loginBtn = document.getElementById("login-btn");
    const loginModal = document.getElementById("login-modal");
    const loginClose = document.getElementById("login-close");
    const loginCancel = document.getElementById("login-cancel");
    const loginForm = document.getElementById("login-form");

    function showLogin() {
      if (!loginModal) return;
      loginModal.classList.remove("hidden");
      const first = document.getElementById("login-username");
      if (first) first.focus();
    }
    function hideLogin() {
      if (!loginModal) return;
      loginModal.classList.add("hidden");
      if (loginBtn) loginBtn.focus();
    }

    if (loginBtn) loginBtn.addEventListener("click", showLogin);
    if (loginClose) loginClose.addEventListener("click", hideLogin);
    if (loginCancel) loginCancel.addEventListener("click", hideLogin);
    if (loginModal) {
      loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) hideLogin();
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();
        try {
          const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (data.success) {
            alert("Login successful");
            hideLogin();
          } else {
            alert("Invalid credentials");
          }
        } catch (err) {
          console.error("login error:", err);
          alert("Server error during login");
        }
      });
    }
  }

  // -------------------------
  // DOMContentLoaded: wire up everything
  // -------------------------
  // Kick everything off once the DOM is available
  document.addEventListener("DOMContentLoaded", function () {
    // block cards click handler
    document.querySelectorAll(".block-card").forEach(card => {
      card.style.cursor = "pointer";
      card.addEventListener("click", async () => {
        const blockId = card.dataset.blockId;
        if (!blockId) return;
        await openBlockPageById(Number(blockId));
      });
    });

    // back button
    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.addEventListener("click", () => {
      document.getElementById("block-page").classList.add("hidden");
      document.getElementById("home-page").classList.remove("hidden");
    });

    // search references
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const suggestionBox = document.getElementById("search-suggestions");

    // live suggestions
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener("input", (e) => {
        const q = (e.target.value || "").trim();
        clearTimeout(debounceTimer);
        if (!q) {
          if (suggestionBox) { suggestionBox.innerHTML = ""; suggestionBox.classList.add("hidden"); }
          return;
        }
        debounceTimer = setTimeout(async () => {
          const data = await fetchSuggestions(q);
          const faculty = data.faculty || [];
          const rooms = data.rooms || [];
          let html = "";
          // faculty
          faculty.forEach(f => {
            html += `<div class="suggestion-item" data-type="faculty" data-id="${f.id}" data-block="${f.block_id}" data-floor="${f.floor_id}" data-name="${escapeHtml(f.name)}" data-floorname="${escapeHtml(f.floor_name)}">
                      <div class="suggestion-title">${escapeHtml(f.name)}</div>
                      <div class="suggestion-sub">${escapeHtml(f.role || '')} — ${escapeHtml(f.floor_name || '')}</div>
                    </div>`;
          });
          // rooms
          rooms.forEach(r => {
            html += `<div class="suggestion-item" data-type="room" data-id="${r.id}" data-block="${r.block_id}" data-floor="${r.floor_id}" data-name="${escapeHtml(r.name)}" data-room="${escapeHtml(r.room_number)}" data-floorname="${escapeHtml(r.floor_name)}">
                      <div class="suggestion-title">${escapeHtml(r.name)}</div>
                      <div class="suggestion-sub">${escapeHtml(r.room_number || '')} — ${escapeHtml(r.floor_name || '')}</div>
                    </div>`;
          });
          if (suggestionBox) {
            suggestionBox.innerHTML = html || "<div class='suggestion-item'>No suggestions</div>";
            suggestionBox.classList.remove("hidden");
          }
        }, 220); // debounce 220ms
      });

      // Enter on input should trigger full search
      searchInput.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          performSearch();
        }
      });
    }

    // click search button
    if (searchButton) searchButton.addEventListener("click", performSearch);

    // suggestion click
    attachSuggestionHandlers();

    // hide suggestions on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        const sb = document.getElementById("search-suggestions");
        if (sb) sb.classList.add("hidden");
      }
    });

    // login handlers
    setupLoginHandlers();
  });

})(); 
