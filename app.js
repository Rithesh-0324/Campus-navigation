// Client-side navigation: clicking a block card sets a hash and reloads the page
// On load we check the hash and show the block detail section in the same tab.

(function () {
	/**
	 * Find a block card in the DOM by name (matches heading or image alt).
	 * Returns {name, description, imgSrc, imgAlt} or null.
	 */
	function getBlockDataByName(name) {
		const cards = document.querySelectorAll('.block-card');
		for (const card of cards) {
			const h = card.querySelector('h4');
			const cardName = h ? h.innerText.trim() : (card.querySelector('img')?.alt || '').trim();
			if (cardName && cardName.toLowerCase() === name.toLowerCase()) {
				return {
					name: cardName,
					description: card.querySelector('.block-card-content p')?.innerText.trim() || '',
					imgSrc: card.querySelector('img')?.getAttribute('src') || '',
					imgAlt: card.querySelector('img')?.alt || cardName
				};
			}
		}
		return null;
	}

	document.addEventListener('DOMContentLoaded', function () {
		// Attach click handlers to block cards so they open in the same tab.
		const blockCards = document.querySelectorAll('.block-card');
		blockCards.forEach(card => {
			card.style.cursor = 'pointer';
			card.addEventListener('click', () => {
				const name = card.querySelector('h4')?.innerText?.trim() || card.querySelector('img')?.alt || '';
				if (!name) return;
				// Use hash to indicate which block to show, then reload the page so the
				// home page is refreshed and the detail view can be rendered on load.
				location.hash = 'block=' + encodeURIComponent(name);
				location.reload();
			});
		});

		// If a block hash is present, show the block detail page on load.
		const hash = location.hash || '';
		if (hash.startsWith('#block=')) {
			const blockName = decodeURIComponent(hash.replace('#block=', ''));
			const data = getBlockDataByName(blockName);
			if (data) {
				// hide the home section and reveal the block-page
				const homePage = document.getElementById('home-page');
				if (homePage) homePage.classList.add('hidden');

				const blockPage = document.getElementById('block-page');
				if (blockPage) blockPage.classList.remove('hidden');

				const nameEl = document.getElementById('block-name');
				const descEl = document.getElementById('block-description');
				const imgEl = document.getElementById('block-image');

				if (nameEl) nameEl.innerText = data.name;
				if (descEl) descEl.innerText = data.description || 'Description not available.';
				if (imgEl) {
					imgEl.src = data.imgSrc || '';
					imgEl.alt = data.imgAlt || data.name;
					imgEl.classList.add('block-image');
				}
			}
		}

		// Back button clears the hash and reloads so the home page is visible again.
		const backBtn = document.getElementById('back-btn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				history.replaceState(null, '', location.pathname + location.search);
				location.reload();
			});
		}

		// Simple floor button handling to populate some sample rooms (optional UX)
		document.querySelectorAll('.floor-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const floor = btn.dataset.floor || btn.innerText;
				const roomsGrid = document.getElementById('rooms-grid');
				const floorTitle = document.getElementById('floor-title');
				if (floorTitle) floorTitle.innerText = 'Rooms on ' + btn.innerText;
				if (!roomsGrid) return;
				roomsGrid.innerHTML = '';
				for (let i = 1; i <= 6; i++) {
					const d = document.createElement('div');
					d.className = 'room-card';
					d.innerHTML = `<div class="room-card-inner"><h4>${btn.innerText} - Room ${i}</h4><p>Sample room info</p></div>`;
					roomsGrid.appendChild(d);
				}
			});
		});

				// --- Login popup ---
				const loginBtn = document.getElementById('login-btn');
				const loginModal = document.getElementById('login-modal');
				const loginClose = document.getElementById('login-close');
				const loginCancel = document.getElementById('login-cancel');
				const loginForm = document.getElementById('login-form');

				function showLogin() {
					if (!loginModal) return;
					loginModal.classList.remove('hidden');
					const first = document.getElementById('login-username');
					if (first) first.focus();
				}

				function hideLogin() {
					if (!loginModal) return;
					loginModal.classList.add('hidden');
					if (loginBtn) loginBtn.focus();
				}

				if (loginBtn) {
					loginBtn.addEventListener('click', showLogin);
				}
				if (loginClose) loginClose.addEventListener('click', hideLogin);
				if (loginCancel) loginCancel.addEventListener('click', hideLogin);

				// Close modal when clicking outside content
				if (loginModal) {
					loginModal.addEventListener('click', (e) => {
						if (e.target === loginModal) hideLogin();
					});
				}

				// Handle submit (placeholder - no real auth)
				if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ ' + data.message);
        hideLogin();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('⚠️ Server error. Please try again later.');
    }
  });
}
	});
})();
