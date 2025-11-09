// Client-side navigation and login handling

(function () {
	document.addEventListener('DOMContentLoaded', function () {

		// ======== SIMPLIFIED BLOCK CARD NAVIGATION ========
		const blockCards = document.querySelectorAll('.block-card');
		const homePage = document.getElementById('home-page');
		const blockPage = document.getElementById('block-page');
		const nameEl = document.getElementById('block-name');
		const descEl = document.getElementById('block-description');
		const imgEl = document.getElementById('block-image');
		const backBtn = document.getElementById('back-btn');

		// Handle click on each block card
		blockCards.forEach(card => {
			card.addEventListener('click', () => {
				const title = card.querySelector('h4')?.innerText.trim() || 'Unknown Block';
				const desc = card.querySelector('p')?.innerText.trim() || 'Description not available.';
				const img = card.querySelector('img');

				// Update block detail section
				if (nameEl) nameEl.innerText = title;
				if (descEl) descEl.innerText = desc;
				if (imgEl && img) {
					imgEl.src = img.src;
					imgEl.alt = img.alt || title;
				}

				// Show details, hide home
				if (homePage) homePage.classList.add('hidden');
				if (blockPage) blockPage.classList.remove('hidden');
			});
		});

		// Back button handler
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				if (blockPage) blockPage.classList.add('hidden');
				if (homePage) homePage.classList.remove('hidden');
			});
		}
		// ==================================================

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

		// Handle login submit
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
