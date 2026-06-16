(function() {
  // --- CONFIGURATION ---
  const REPO_OWNER = 'ek300993';
  const REPO_NAME = 'Alice-Kim-LICSW';
  const REPO_BRANCH = 'master';
  const PASSWORD_HASH = 'e55f7e831bb7d141739e5397e92ec7bc021542eb976f740fc6ac7a4d9c63c7c7'; // sha-256 of 'alice-cms-2026'

  // --- STATE ---
  let isEditMode = false;
  let githubToken = localStorage.getItem('cms_github_token') || '';
  let activeEditable = null;

  // --- INJECTED CSS STYLES ---
  const cmsStyles = `
    /* CMS Global Reset & Helpers */
    .cms-editable-text {
      position: relative;
      cursor: pointer;
    }
    .cms-editable-text:hover {
      outline: 2px dashed #3E6B71 !important;
      outline-offset: 4px;
      border-radius: 4px;
    }
    
    /* Edit Link overlay styles */
    .cms-link-editable {
      position: relative;
    }
    .cms-link-editable:hover {
      outline: 2px dashed #8A9A80 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    
    /* Image editable wrappers */
    .cms-img-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }
    .cms-img-wrapper img {
      width: 100%;
      display: block;
    }
    .cms-img-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(36, 83, 89, 0.9);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, background 0.2s;
      z-index: 100;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      border: 1px solid rgba(253, 249, 241, 0.2);
    }
    .cms-img-wrapper:hover .cms-img-overlay {
      opacity: 1;
    }
    .cms-img-overlay:hover {
      background: #245359;
    }
    
    /* CMS Control Panel */
    #cms-control-panel {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      z-index: 999999;
      background: rgba(36, 83, 89, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(253, 249, 241, 0.15);
      border-radius: 50px;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      color: #FDF9F1;
      box-shadow: 0 12px 40px rgba(36, 83, 89, 0.25);
      font-family: 'Inter', sans-serif;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #cms-control-panel.show {
      transform: translateX(-50%) translateY(0);
    }
    .cms-brand {
      font-family: 'Newsreader', serif;
      font-weight: 500;
      font-size: 18px;
      letter-spacing: 0.5px;
      border-right: 1px solid rgba(253, 249, 241, 0.2);
      padding-right: 16px;
      margin-right: 4px;
    }
    .cms-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      opacity: 0.9;
    }
    .cms-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8A9A80;
      box-shadow: 0 0 8px #8A9A80;
    }
    .cms-panel-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cms-btn {
      background: rgba(253, 249, 241, 0.08);
      border: 1px solid rgba(253, 249, 241, 0.15);
      color: #FDF9F1;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }
    .cms-btn:hover {
      background: rgba(253, 249, 241, 0.2);
      border-color: rgba(253, 249, 241, 0.3);
    }
    .cms-btn-primary {
      background: #8A9A80;
      border-color: #8A9A80;
    }
    .cms-btn-primary:hover {
      background: #54634c;
      border-color: #54634c;
    }
    .cms-btn-danger {
      background: rgba(186, 26, 26, 0.2);
      border-color: rgba(186, 26, 26, 0.3);
    }
    .cms-btn-danger:hover {
      background: rgba(186, 26, 26, 0.4);
      border-color: rgba(186, 26, 26, 0.5);
    }

    /* Modal Backdrop */
    .cms-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(28, 28, 23, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .cms-modal-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }
    
    /* CMS Modal Content */
    .cms-modal {
      background: #FDF9F1;
      border: 1px solid #D8D6C0;
      border-radius: 16px;
      padding: 32px;
      width: 90%;
      max-width: 440px;
      box-shadow: 0 20px 50px rgba(32, 32, 32, 0.15);
      color: #202020;
      font-family: 'Inter', sans-serif;
      transform: translateY(20px) scale(0.95);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    }
    .cms-modal-backdrop.show .cms-modal {
      transform: translateY(0) scale(1);
    }
    .cms-modal h3 {
      font-family: 'Newsreader', serif;
      font-size: 26px;
      color: #245359;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .cms-modal p {
      font-size: 14px;
      color: #404849;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .cms-form-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cms-form-group label {
      font-size: 12px;
      font-weight: 600;
      color: #245359;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cms-form-group input, .cms-form-group select {
      padding: 10px 14px;
      border: 1px solid #8A9A80;
      border-radius: 8px;
      background: #ffffff;
      color: #202020;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .cms-form-group input:focus, .cms-form-group select:focus {
      outline: none;
      border-color: #245359;
      box-shadow: 0 0 0 3px rgba(36, 83, 89, 0.15);
    }
    .cms-form-group .cms-help-link {
      font-size: 11px;
      color: #3E6B71;
      text-decoration: underline;
      align-self: flex-end;
      margin-top: 2px;
    }
    .cms-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .cms-modal-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      border: 1px solid #D8D6C0;
      background: transparent;
      color: #202020;
      transition: all 0.2s;
    }
    .cms-modal-btn:hover {
      background: rgba(138, 154, 128, 0.08);
    }
    .cms-modal-btn-primary {
      background: #245359;
      border-color: #245359;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(36, 83, 89, 0.2);
    }
    .cms-modal-btn-primary:hover {
      background: #1e4d53;
      border-color: #1e4d53;
      color: #ffffff;
    }
    .cms-error {
      color: #ba1a1a;
      font-size: 12px;
      margin-top: 6px;
      display: none;
    }

    /* Popover for Links & Buttons */
    .cms-popover {
      position: absolute;
      z-index: 1000000;
      background: #FDF9F1;
      border: 1px solid #D8D6C0;
      border-radius: 10px;
      padding: 12px 16px;
      width: 280px;
      box-shadow: 0 8px 24px rgba(32,32,32,0.12);
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-family: 'Inter', sans-serif;
      color: #202020;
    }

    /* Toast Notifications */
    .cms-toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-family: 'Inter', sans-serif;
    }
    .cms-toast {
      background: #245359;
      color: #FDF9F1;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      font-size: 14px;
      font-weight: 500;
      min-width: 260px;
      max-width: 350px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .cms-toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    .cms-toast-success {
      border-left: 4px solid #8A9A80;
    }
    .cms-toast-error {
      border-left: 4px solid #ba1a1a;
      background: #ba1a1a;
    }
    .cms-toast-info {
      border-left: 4px solid #D8D6C0;
    }
    .cms-toast-close {
      cursor: pointer;
      opacity: 0.7;
      font-size: 16px;
      background: none;
      border: none;
      color: inherit;
    }
    .cms-toast-close:hover {
      opacity: 1;
    }
  `;

  // --- CRYPTO UTILS ---
  async function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // --- GENERAL UTILS ---
  function getFilename() {
    let path = window.location.pathname;
    if (path === '/' || path.endsWith('/')) {
      return 'index.html';
    }
    let lastPart = path.substring(path.lastIndexOf('/') + 1);
    if (!lastPart.includes('.')) {
      return lastPart + '.html';
    }
    return lastPart;
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success', duration = 4000) {
    let container = document.querySelector('.cms-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'cms-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `cms-toast cms-toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="cms-toast-close">&times;</button>
    `;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 50);

    const closeBtn = toast.querySelector('.cms-toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
  }

  // --- BOOTSTRAP CMS IN DOM ---
  function init() {
    // Inject the CMS Stylesheet
    const styleEl = document.createElement('style');
    styleEl.id = 'cms-styles';
    styleEl.textContent = cmsStyles;
    document.head.appendChild(styleEl);

    // Bind Footer link listener
    const footerLink = document.getElementById('editor-login');
    if (footerLink) {
      footerLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (sessionStorage.getItem('cms_logged_in') === 'true') {
          enableEditMode();
        } else {
          showLoginModal();
        }
      });
    }

    // Check if user is already logged in (persistence in session)
    if (sessionStorage.getItem('cms_logged_in') === 'true') {
      enableEditMode();
    }
  }

  // --- MODAL UTILS ---
  function createModal(id, contentHtml) {
    let backdrop = document.getElementById(id);
    if (backdrop) backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.id = id;
    backdrop.className = 'cms-modal-backdrop';
    backdrop.innerHTML = `<div class="cms-modal">${contentHtml}</div>`;
    document.body.appendChild(backdrop);

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(id);
      }
    });

    return backdrop;
  }

  function showModal(id) {
    const backdrop = document.getElementById(id);
    if (backdrop) {
      setTimeout(() => backdrop.classList.add('show'), 50);
    }
  }

  function closeModal(id) {
    const backdrop = document.getElementById(id);
    if (backdrop) {
      backdrop.classList.remove('show');
      setTimeout(() => backdrop.remove(), 300);
    }
  }

  // --- LOGIN DIALOG ---
  function showLoginModal() {
    const loginHtml = `
      <h3>Editor Login</h3>
      <p>Log in with the site administration password to edit page content in-place.</p>
      
      <div class="cms-form-group">
        <label for="cms-pass-input">Password</label>
        <input type="password" id="cms-pass-input" placeholder="••••••••" autocomplete="current-password">
        <div id="cms-login-error" class="cms-error">Incorrect password. Please try again.</div>
      </div>
      
      <div class="cms-modal-actions">
        <button class="cms-modal-btn" id="cms-login-cancel">Cancel</button>
        <button class="cms-modal-btn cms-modal-btn-primary" id="cms-login-submit">Login</button>
      </div>
    `;
    
    const backdrop = createModal('cms-login-modal', loginHtml);
    showModal('cms-login-modal');

    const passInput = backdrop.querySelector('#cms-pass-input');
    const submitBtn = backdrop.querySelector('#cms-login-submit');
    const cancelBtn = backdrop.querySelector('#cms-login-cancel');
    const errorDiv = backdrop.querySelector('#cms-login-error');

    passInput.focus();

    async function handleLogin() {
      errorDiv.style.display = 'none';
      const input = passInput.value;
      const hashed = await sha256(input);
      
      if (hashed === PASSWORD_HASH) {
        sessionStorage.setItem('cms_logged_in', 'true');
        closeModal('cms-login-modal');
        showToast('Login successful! Welcome to Editor Mode.');
        enableEditMode();
      } else {
        errorDiv.style.display = 'block';
        passInput.select();
        passInput.focus();
      }
    }

    submitBtn.addEventListener('click', handleLogin);
    passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    cancelBtn.addEventListener('click', () => closeModal('cms-login-modal'));
  }

  // --- SETTINGS DIALOG ---
  function showSettingsModal() {
    const settingsHtml = `
      <h3>CMS Settings</h3>
      <p>Configure publishing settings. Credentials are stored safely in your browser storage.</p>
      
      <div class="cms-form-group">
        <label for="cms-token-input">GitHub Access Token (PAT)</label>
        <input type="password" id="cms-token-input" value="${githubToken}" placeholder="ghp_••••••••••••••••••••••••">
        <a class="cms-help-link" href="https://github.com/settings/tokens/new?scopes=repo&description=Alice%20Kim%20CMS%20Token" target="_blank">Generate a Personal Access Token</a>
      </div>
      
      <div class="cms-form-group">
        <label for="cms-newpass-input">Change Admin Password</label>
        <input type="password" id="cms-newpass-input" placeholder="Enter new password">
      </div>
      <div id="cms-settings-info" style="font-size: 11px; color: #5a6951; display: none; margin-top: -8px; margin-bottom: 8px;"></div>
      
      <div class="cms-modal-actions">
        <button class="cms-modal-btn" id="cms-settings-cancel">Cancel</button>
        <button class="cms-modal-btn cms-modal-btn-primary" id="cms-settings-save">Save Settings</button>
      </div>
    `;

    const backdrop = createModal('cms-settings-modal', settingsHtml);
    showModal('cms-settings-modal');

    const tokenInput = backdrop.querySelector('#cms-token-input');
    const newPassInput = backdrop.querySelector('#cms-newpass-input');
    const saveBtn = backdrop.querySelector('#cms-settings-save');
    const cancelBtn = backdrop.querySelector('#cms-settings-cancel');
    const infoDiv = backdrop.querySelector('#cms-settings-info');

    newPassInput.addEventListener('input', async () => {
      const pass = newPassInput.value;
      if (pass.length > 0) {
        const hash = await sha256(pass);
        infoDiv.innerHTML = `<strong>New Password Hash:</strong><br><code style="font-size:10px; word-break: break-all;">${hash}</code><br><span style="opacity:0.8">Provide this hash to developers to update the default password.</span>`;
        infoDiv.style.display = 'block';
      } else {
        infoDiv.style.display = 'none';
      }
    });

    saveBtn.addEventListener('click', () => {
      const token = tokenInput.value.trim();
      githubToken = token;
      localStorage.setItem('cms_github_token', token);
      
      closeModal('cms-settings-modal');
      showToast('Settings saved successfully!');
    });

    cancelBtn.addEventListener('click', () => closeModal('cms-settings-modal'));
  }

  // --- CMS CONTROL PANEL ---
  function showControlPanel() {
    let panel = document.getElementById('cms-control-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'cms-control-panel';
      panel.innerHTML = `
        <div class="cms-brand">Alice Kim CMS</div>
        <div class="cms-status">
          <div class="cms-indicator"></div>
          <span>Editor Mode</span>
        </div>
        <div class="cms-panel-actions">
          <button class="cms-btn" id="cms-discard-btn">Discard Draft</button>
          <button class="cms-btn" id="cms-settings-btn">Settings</button>
          <button class="cms-btn cms-btn-primary" id="cms-publish-btn">Publish to Live</button>
          <button class="cms-btn cms-btn-danger" id="cms-logout-btn">Log Out</button>
        </div>
      `;
      document.body.appendChild(panel);

      // Event Listeners
      panel.querySelector('#cms-discard-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to discard all changes and reload the page?')) {
          window.location.reload();
        }
      });

      panel.querySelector('#cms-settings-btn').addEventListener('click', showSettingsModal);

      panel.querySelector('#cms-publish-btn').addEventListener('click', publishChanges);

      panel.querySelector('#cms-logout-btn').addEventListener('click', disableEditMode);
    }
    
    // Force browser reflow and slide up panel
    setTimeout(() => panel.classList.add('show'), 100);
  }

  function hideControlPanel() {
    const panel = document.getElementById('cms-control-panel');
    if (panel) {
      panel.classList.remove('show');
      setTimeout(() => panel.remove(), 400);
    }
  }

  // --- ENABLE / DISABLE EDIT MODE ---
  function enableEditMode() {
    if (isEditMode) return;
    isEditMode = true;
    
    showControlPanel();
    makeElementsEditable();
    makeLinksEditable();
    makeImagesEditable();
    
    // Add custom helper CSS overrides
    const styleEl = document.createElement('style');
    styleEl.id = 'cms-runtime-overrides';
    styleEl.textContent = `
      /* Temporarily disable standard transitions on hover so user edits are easier */
      .card:hover, .testimonial-card:hover, .btn:hover {
        transform: none !important;
      }
      /* Prevent link clicking navigation in editor mode */
      a:not(.cms-allowed-link) {
        cursor: default;
      }
    `;
    document.head.appendChild(styleEl);
  }

  function disableEditMode() {
    if (!isEditMode) return;
    isEditMode = false;
    
    sessionStorage.removeItem('cms_logged_in');
    hideControlPanel();
    revertEditability();
    
    // Remove injected overrides
    const overrides = document.getElementById('cms-runtime-overrides');
    if (overrides) overrides.remove();

    showToast('Logged out of Editor Mode.', 'info');
    // Refresh page to clean up the DOM fully
    setTimeout(() => window.location.reload(), 1000);
  }

  // --- MAKE ELEMENT EDITABLE ---
  function makeElementsEditable() {
    // Find all text elements to edit
    // Skip nav, footer, script tags, cms elements
    const textSelectors = 'h1, h2, h3, h4, p, li, span.testimonial-author, span.testimonial-title';
    const elements = document.querySelectorAll(textSelectors);
    
    elements.forEach(el => {
      // Don't modify elements in navigation or footer, or inside CMS structures
      if (el.closest('nav') || el.closest('footer') || el.closest('#cms-control-panel') || el.closest('.cms-modal') || el.closest('.cms-toast-container')) {
        return;
      }

      el.classList.add('cms-editable-text');
      el.setAttribute('data-cms-original', el.innerHTML.trim());

      // On Double click, make it editable
      el.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        startEditingText(el);
      });

      // Simple click warning (optional - or click edit)
      el.addEventListener('click', function(e) {
        if (!el.getAttribute('contenteditable')) {
          // If they click on editable text, prevent navigation if it's wrapped in a link
          e.preventDefault();
        }
      });
    });
  }

  function startEditingText(el) {
    if (activeEditable && activeEditable !== el) {
      stopEditingText(activeEditable);
    }

    activeEditable = el;
    el.contentEditable = "true";
    el.focus();

    // Prevent enter key from creating divs in titles and short spans
    if (el.tagName.match(/^(H[1-6]|SPAN|LI|A)$/i)) {
      el.addEventListener('keydown', handleTitleEnter);
    }
  }

  function handleTitleEnter(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.blur();
    }
  }

  function stopEditingText(el) {
    el.contentEditable = "false";
    el.removeAttribute('contenteditable');
    if (el.tagName.match(/^(H[1-6]|SPAN|LI|A)$/i)) {
      el.removeEventListener('keydown', handleTitleEnter);
    }
    if (activeEditable === el) {
      activeEditable = null;
    }
  }

  // Listen to document click to stop editing when clicking outside
  document.addEventListener('click', (e) => {
    if (!isEditMode) return;
    if (activeEditable && !activeEditable.contains(e.target) && !e.target.closest('.cms-popover')) {
      stopEditingText(activeEditable);
    }
  }, { capture: true });

  function revertEditability() {
    const textElements = document.querySelectorAll('.cms-editable-text');
    textElements.forEach(el => {
      el.classList.remove('cms-editable-text');
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-cms-original');
    });
  }

  // --- MAKE LINKS EDITABLE (LINKS AND BUTTONS) ---
  function makeLinksEditable() {
    const links = document.querySelectorAll('a.btn, .hero-actions a, .grid-2 a.btn, .card a.btn');
    
    links.forEach(link => {
      // Skip nav and footer links
      if (link.closest('nav') || link.closest('footer')) return;

      link.classList.add('cms-link-editable');
      
      // Floating Edit button
      link.addEventListener('click', (e) => {
        if (!isEditMode) return;
        e.preventDefault();
        e.stopPropagation();
        
        showLinkEditorPopover(link);
      });
    });
  }

  function showLinkEditorPopover(link) {
    // Remove existing popovers
    const existing = document.querySelector('.cms-popover');
    if (existing) existing.remove();

    const popover = document.createElement('div');
    popover.className = 'cms-popover';
    
    // Position
    const rect = link.getBoundingClientRect();
    popover.style.top = `${window.scrollY + rect.bottom + 8}px`;
    popover.style.left = `${window.scrollX + rect.left}px`;
    
    popover.innerHTML = `
      <div class="cms-form-group" style="margin-bottom: 8px;">
        <label>Button Text</label>
        <input type="text" id="cms-pop-text" value="${link.innerText.trim()}">
      </div>
      <div class="cms-form-group" style="margin-bottom: 8px;">
        <label>URL / Link Destination</label>
        <input type="text" id="cms-pop-url" value="${link.getAttribute('href') || ''}">
      </div>
      <div style="display:flex; justify-content: flex-end; gap:8px;">
        <button class="cms-btn" id="cms-pop-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button>
        <button class="cms-btn cms-btn-primary" id="cms-pop-save" style="padding:4px 10px; font-size:11px;">Save</button>
      </div>
    `;
    
    document.body.appendChild(popover);

    const textInput = popover.querySelector('#cms-pop-text');
    const urlInput = popover.querySelector('#cms-pop-url');
    const saveBtn = popover.querySelector('#cms-pop-save');
    const cancelBtn = popover.querySelector('#cms-pop-cancel');

    textInput.focus();

    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newText = textInput.value.trim();
      const newUrl = urlInput.value.trim();
      
      if (newText) link.innerText = newText;
      if (newUrl) link.setAttribute('href', newUrl);
      
      popover.remove();
      showToast('Button/link details updated.');
    });

    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.remove();
    });

    // Close on clicking outside
    const clickOutsideHandler = (e) => {
      if (!popover.contains(e.target) && e.target !== link) {
        popover.remove();
        document.removeEventListener('click', clickOutsideHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', clickOutsideHandler), 10);
  }

  // --- MAKE IMAGES EDITABLE (REPLACEMENT & UPLOAD) ---
  function makeImagesEditable() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Skip nav and footer and CMS logos
      if (img.closest('nav') || img.closest('footer') || img.closest('#cms-control-panel') || img.closest('.cms-modal') || img.src.includes('AliceKimCoaching&CounselingIcon.png')) {
        return;
      }

      // Wrap image in editable wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'cms-img-wrapper';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      // Add overlay
      const overlay = document.createElement('div');
      overlay.className = 'cms-img-overlay';
      overlay.innerText = 'Change Image';
      wrapper.appendChild(overlay);

      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        showImageUploaderModal(img);
      });
    });
  }

  function showImageUploaderModal(img) {
    const uploaderHtml = `
      <h3>Update Image</h3>
      <p>Provide a new image URL or upload a file directly to the website repository.</p>
      
      <div class="cms-form-group">
        <label for="cms-img-url-input">Image URL</label>
        <input type="text" id="cms-img-url-input" value="${img.getAttribute('src') || ''}" placeholder="e.g. Assets/my-photo.jpg">
      </div>
      
      <div class="cms-form-group">
        <label>Upload File</label>
        <input type="file" id="cms-img-file-input" accept="image/*">
        <div id="cms-upload-progress" class="cms-error" style="color: #5a6951; display: none;">Reading file...</div>
        <div id="cms-upload-error" class="cms-error"></div>
      </div>
      
      <div class="cms-modal-actions">
        <button class="cms-modal-btn" id="cms-img-cancel">Cancel</button>
        <button class="cms-modal-btn cms-modal-btn-primary" id="cms-img-save">Save Image</button>
      </div>
    `;

    const backdrop = createModal('cms-image-modal', uploaderHtml);
    showModal('cms-image-modal');

    const urlInput = backdrop.querySelector('#cms-img-url-input');
    const fileInput = backdrop.querySelector('#cms-img-file-input');
    const saveBtn = backdrop.querySelector('#cms-img-save');
    const cancelBtn = backdrop.querySelector('#cms-img-cancel');
    const progressDiv = backdrop.querySelector('#cms-upload-progress');
    const errorDiv = backdrop.querySelector('#cms-upload-error');

    let uploadedPath = '';

    fileInput.addEventListener('change', async (e) => {
      const file = fileInput.files[0];
      if (!file) return;

      if (!githubToken) {
        errorDiv.innerText = 'GitHub token is missing. Please configure it in CMS settings before uploading.';
        errorDiv.style.display = 'block';
        fileInput.value = '';
        return;
      }

      errorDiv.style.display = 'none';
      progressDiv.innerText = 'Reading file content...';
      progressDiv.style.display = 'block';
      saveBtn.disabled = true;

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = reader.result.split(',')[1];
          const filename = `uploaded_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const uploadPath = `Assets/${filename}`;

          progressDiv.innerText = 'Uploading to GitHub Assets folder...';

          const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${uploadPath}`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `CMS: Upload image ${filename}`,
              content: base64Content,
              branch: REPO_BRANCH
            })
          });

          if (!res.ok) {
            const errJson = await res.json();
            throw new Error(errJson.message || 'GitHub API error');
          }

          uploadedPath = uploadPath;
          urlInput.value = uploadPath;
          progressDiv.innerText = 'File uploaded successfully!';
          saveBtn.disabled = false;
          showToast('Image uploaded to repository!');
        } catch (err) {
          errorDiv.innerText = `Upload failed: ${err.message}`;
          errorDiv.style.display = 'block';
          progressDiv.style.display = 'none';
          saveBtn.disabled = false;
          fileInput.value = '';
        }
      };

      reader.onerror = () => {
        errorDiv.innerText = 'Error reading file.';
        errorDiv.style.display = 'block';
        progressDiv.style.display = 'none';
        saveBtn.disabled = false;
      };

      reader.readAsDataURL(file);
    });

    saveBtn.addEventListener('click', () => {
      const finalUrl = urlInput.value.trim();
      if (finalUrl) {
        img.setAttribute('src', finalUrl);
        showToast('Image source updated.');
      }
      closeModal('cms-image-modal');
    });

    cancelBtn.addEventListener('click', () => closeModal('cms-image-modal'));
  }

  // --- SERIALIZE AND SAVE WORKFLOW ---
  async function publishChanges() {
    if (!githubToken) {
      showToast('GitHub token missing. Please configure it in settings.', 'error');
      showSettingsModal();
      return;
    }

    if (activeEditable) {
      stopEditingText(activeEditable);
    }

    const filename = getFilename();
    const confirmMsg = `Publishing changes will update the live file "${filename}" on GitHub. Do you wish to proceed?`;
    if (!confirm(confirmMsg)) return;

    showToast('Preparing clean HTML file...', 'info');

    // 1. Clone DOM
    const clone = document.documentElement.cloneNode(true);

    // 2. Remove CMS Modals, Panel, dynamic notifications
    const cmsSelectors = '#cms-control-panel, .cms-modal-backdrop, .cms-toast-container, #cms-styles, #cms-runtime-overrides, .cms-popover';
    clone.querySelectorAll(cmsSelectors).forEach(el => el.remove());

    // 3. Unwrap images (remove .cms-img-wrapper and keep the img)
    clone.querySelectorAll('.cms-img-wrapper').forEach(wrapper => {
      const img = wrapper.querySelector('img');
      const overlay = wrapper.querySelector('.cms-img-overlay');
      if (overlay) overlay.remove();
      if (img) {
        wrapper.parentNode.insertBefore(img, wrapper);
      }
      wrapper.remove();
    });

    // 4. Strip CMS helper classes and attributes
    clone.querySelectorAll('.cms-editable-text').forEach(el => {
      el.classList.remove('cms-editable-text');
      el.removeAttribute('data-cms-original');
      el.removeAttribute('contenteditable');
    });
    clone.querySelectorAll('.cms-link-editable').forEach(el => {
      el.classList.remove('cms-link-editable');
    });

    // 5. Clean up Carousel duplicates (on index.html)
    // In index.html, the carousel copies the first 5 cards twice at runtime.
    // We should keep only the first 5 cards and remove the rest.
    const clonedCarousel = clone.querySelector('#testimonial-carousel');
    if (clonedCarousel) {
      const cards = Array.from(clonedCarousel.children);
      // RD, SS, CH, CB, RB are the 5 original cards.
      // Remove all others beyond index 4.
      for (let i = 5; i < cards.length; i++) {
        cards[i].remove();
      }
    }

    // 6. Clean up dynamic animation classes injected by script.js at runtime
    // remove "reveal-up" and "is-visible" classes
    clone.querySelectorAll('.reveal-up, .is-visible').forEach(el => {
      el.classList.remove('reveal-up', 'is-visible');
    });

    // 7. Clean up nav links and toggle active states
    const navLinks = clone.querySelector('.nav-links');
    const menuToggle = clone.querySelector('.menu-toggle');
    if (navLinks) navLinks.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');

    // Serialize to standard HTML
    const outputHtml = '<!DOCTYPE html>\n' + clone.outerHTML;

    // 8. Commit via GitHub API
    showToast('Connecting to GitHub API...', 'info', 0);

    try {
      const filepath = filename;
      
      // Fetch file SHA
      const getFileRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}?ref=${REPO_BRANCH}`, {
        headers: {
          'Authorization': `token ${githubToken}`
        }
      });

      if (!getFileRes.ok) {
        const errJson = await getFileRes.json();
        throw new Error(`Failed to fetch file details: ${errJson.message}`);
      }

      const fileData = await getFileRes.json();
      const currentSha = fileData.sha;

      // Base64 encode the new clean content
      // Note: Use btoa(unescape(encodeURIComponent(str))) to safely handle non-ASCII characters
      const encodedContent = btoa(unescape(encodeURIComponent(outputHtml)));

      showToast('Pushing commit to master branch...', 'info', 0);

      const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `CMS: Visual edit update for ${filename}`,
          content: encodedContent,
          sha: currentSha,
          branch: REPO_BRANCH
        })
      });

      // Clear the permanent loading toast
      const loadingToasts = document.querySelectorAll('.cms-toast-info');
      loadingToasts.forEach(t => t.remove());

      if (!putRes.ok) {
        const putErr = await putRes.json();
        throw new Error(`Upload failed: ${putErr.message}`);
      }

      showToast('Page published successfully! Rebuilding live site...', 'success');
      
      // Prompt user to reload page in 2 seconds to view changes
      setTimeout(() => {
        if (confirm('Deploy complete! The page has been updated. Reload the browser now?')) {
          window.location.reload();
        }
      }, 1500);

    } catch (error) {
      // Clear loading toasts
      const loadingToasts = document.querySelectorAll('.cms-toast-info');
      loadingToasts.forEach(t => t.remove());
      
      showToast(`Error publishing changes: ${error.message}`, 'error', 6000);
    }
  }

  // --- INITIALIZE ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
