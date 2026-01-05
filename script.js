// State Management
let notes = [];
let currentEditIndex = -1;

// API Configuration
// TODO: Replace with your Cloudflare Worker URL after deployment
const API_URL = 'YOUR_WORKER_URL_HERE'; // e.g., 'https://ncpa-notes-api.your-subdomain.workers.dev'
const USE_API = API_URL !== 'YOUR_WORKER_URL_HERE'; // Automatically enable API when configured

// Load notes from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    initializeTabs();
    initializeSearch();
    initializeTheme();
    initializeKeyboardShortcuts();
    detectIframeErrors();
});

// Popup window references
const popupWindows = {};

// Open external link in popup window
function openExternal(url) {
    // Determine site name from URL for popup management
    let siteName = 'external';
    if (url.includes('ncpa-sound')) siteName = 'ncpa-sound';
    else if (url.includes('outlook')) siteName = 'outlook';
    else if (url.includes('staggered-offs')) siteName = 'staggered-offs';
    else if (url.includes('soundhire')) siteName = 'soundhire';

    // Check if popup already exists and is open
    if (popupWindows[siteName] && !popupWindows[siteName].closed) {
        popupWindows[siteName].focus();
        return;
    }

    // Calculate popup dimensions and position
    const width = 1200;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    // Popup window features
    const features = [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=yes',
        'scrollbars=yes',
        'status=yes',
        'toolbar=no',
        'menubar=no',
        'location=yes'
    ].join(',');

    // Open popup window
    const popup = window.open(url, siteName, features);

    if (popup) {
        popupWindows[siteName] = popup;
        popup.focus();

        // Add visual feedback
        showPopupNotification(siteName);
    } else {
        alert('Popup blocked! Please allow popups for this site.');
    }
}

// Show notification when popup opens
function showPopupNotification(siteName) {
    const notification = document.createElement('div');
    notification.className = 'popup-notification';
    notification.textContent = `✓ ${formatSiteName(siteName)} opened in popup window`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatSiteName(name) {
    const names = {
        'ncpa-sound': 'NCPA Sound',
        'outlook': 'Outlook Mail',
        'staggered-offs': 'Staggered Offs',
        'soundhire': 'SoundHire Quotes'
    };
    return names[name] || name;
}

// Detect iframe loading errors
function detectIframeErrors() {
    // Check NCPA Sound iframe
    const ncpaIframe = document.getElementById('ncpa-sound-iframe');
    const ncpaError = document.getElementById('ncpa-sound-error');

    if (ncpaIframe) {
        ncpaIframe.addEventListener('error', () => {
            ncpaIframe.style.display = 'none';
            ncpaError.style.display = 'flex';
        });

        setTimeout(() => {
            try {
                const iframeDoc = ncpaIframe.contentDocument || ncpaIframe.contentWindow.document;
                if (!iframeDoc) {
                    ncpaIframe.style.display = 'none';
                    ncpaError.style.display = 'flex';
                }
            } catch (e) {
                console.log('Cross-origin iframe detected for NCPA Sound');
            }
        }, 3000);
    }

    // Check Staggered Offs iframe
    const staggeredIframe = document.getElementById('staggered-iframe');
    const staggeredError = document.getElementById('staggered-error');

    if (staggeredIframe) {
        staggeredIframe.addEventListener('error', () => {
            staggeredIframe.style.display = 'none';
            staggeredError.style.display = 'flex';
        });

        // Check if iframe is blocked by X-Frame-Options
        setTimeout(() => {
            try {
                const iframeDoc = staggeredIframe.contentDocument || staggeredIframe.contentWindow.document;
                if (!iframeDoc) {
                    staggeredIframe.style.display = 'none';
                    staggeredError.style.display = 'flex';
                }
            } catch (e) {
                // Cross-origin error - iframe might still work, so don't hide it
                console.log('Cross-origin iframe detected for Staggered Offs');
            }
        }, 3000);
    }

    // Check SoundHire Quotes iframe
    const soundhireIframe = document.getElementById('soundhire-iframe');
    const soundhireError = document.getElementById('soundhire-error');

    if (soundhireIframe) {
        soundhireIframe.addEventListener('error', () => {
            soundhireIframe.style.display = 'none';
            soundhireError.style.display = 'flex';
        });

        setTimeout(() => {
            try {
                const iframeDoc = soundhireIframe.contentDocument || soundhireIframe.contentWindow.document;
                if (!iframeDoc) {
                    soundhireIframe.style.display = 'none';
                    soundhireError.style.display = 'flex';
                }
            } catch (e) {
                console.log('Cross-origin iframe detected for SoundHire Quotes');
            }
        }, 3000);
    }
}

// Tab Functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const tabButtons = document.querySelectorAll('.tab-button');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        if (searchTerm === '') {
            // Show all tabs if search is empty
            tabButtons.forEach(btn => btn.classList.remove('hidden'));
            return;
        }

        tabButtons.forEach(button => {
            const tabText = button.textContent.toLowerCase();
            const keywords = button.getAttribute('data-keywords').toLowerCase();

            if (tabText.includes(searchTerm) || keywords.includes(searchTerm)) {
                button.classList.remove('hidden');
            } else {
                button.classList.add('hidden');
            }
        });
    });

    // Auto-switch to first matching tab on Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const visibleTab = document.querySelector('.tab-button:not(.hidden)');
            if (visibleTab) {
                visibleTab.click();
                searchInput.value = '';
                tabButtons.forEach(btn => btn.classList.remove('hidden'));
            }
        }
    });
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }

        // Ctrl+1 through Ctrl+5 for quick tab switching
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const tabButtons = document.querySelectorAll('.tab-button');
            const index = parseInt(e.key) - 1;
            if (tabButtons[index]) {
                tabButtons[index].click();
            }
        }
    });
}

// Theme Toggle
function initializeTheme() {
    const themeToggle = document.getElementById('toggleTheme');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });
}

// Fullscreen Toggle
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Notes & Tasks Functionality
async function loadNotes() {
    if (USE_API) {
        try {
            const response = await fetch(`${API_URL}/notes`);
            if (response.ok) {
                notes = await response.json();
                // Convert completed from integer to boolean
                notes = notes.map(note => ({
                    ...note,
                    completed: Boolean(note.completed)
                }));
                renderNotes();
                return;
            }
        } catch (error) {
            console.error('Failed to load notes from API, falling back to localStorage:', error);
        }
    }

    // Fallback to localStorage
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    } else {
        renderEmptyState();
    }
}

async function saveNotes() {
    if (USE_API) {
        // API saves are handled individually in other functions
        renderNotes();
    } else {
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }
}

function renderNotes() {
    const notesList = document.getElementById('notesList');

    if (notes.length === 0) {
        renderEmptyState();
        return;
    }

    notesList.innerHTML = notes.map((note, index) => `
        <div class="note-item ${note.completed ? 'completed' : ''}">
            <div class="note-header">
                <div class="note-title">${escapeHtml(note.title)}</div>
                <div class="note-actions">
                    <button class="note-btn" onclick="toggleNoteComplete(${index})" title="Mark as ${note.completed ? 'incomplete' : 'complete'}">
                        ${note.completed ? '↩️' : '✓'}
                    </button>
                    <button class="note-btn" onclick="editNote(${index})" title="Edit">
                        ✏️
                    </button>
                    <button class="note-btn" onclick="deleteNote(${index})" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            ${note.content ? `<div class="note-content">${escapeHtml(note.content)}</div>` : ''}
            <div class="note-time">${formatDate(note.timestamp)}</div>
        </div>
    `).join('');
}

function renderEmptyState() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = `
        <div class="empty-state">
            <h3>No notes yet</h3>
            <p>Click "Add Note" to create your first note or task</p>
        </div>
    `;
}

async function toggleNoteComplete(index) {
    notes[index].completed = !notes[index].completed;

    if (USE_API && notes[index].id) {
        try {
            const response = await fetch(`${API_URL}/notes/${notes[index].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notes[index])
            });
            if (!response.ok) throw new Error('Failed to update note');
        } catch (error) {
            console.error('Failed to update note:', error);
            notes[index].completed = !notes[index].completed; // Revert on error
        }
    }

    saveNotes();
}

async function deleteNote(index) {
    if (confirm('Are you sure you want to delete this note?')) {
        const noteId = notes[index].id;

        if (USE_API && noteId) {
            try {
                const response = await fetch(`${API_URL}/notes/${noteId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete note');
            } catch (error) {
                console.error('Failed to delete note:', error);
                return; // Don't remove from local array if API call fails
            }
        }

        notes.splice(index, 1);
        saveNotes();
    }
}

function editNote(index) {
    currentEditIndex = index;
    const note = notes[index];
    showNoteModal(note.title, note.content);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Modal Functionality
document.getElementById('addNoteBtn').addEventListener('click', () => {
    currentEditIndex = -1;
    showNoteModal();
});

function showNoteModal(title = '', content = '') {
    // Create modal if it doesn't exist
    let modal = document.getElementById('noteModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'noteModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${currentEditIndex >= 0 ? 'Edit Note' : 'Add New Note'}</h3>
                    <button class="close-modal" onclick="closeNoteModal()">✕</button>
                </div>
                <form id="noteForm">
                    <div class="form-group">
                        <label for="noteTitle">Title</label>
                        <input type="text" id="noteTitle" placeholder="Enter note title" required>
                    </div>
                    <div class="form-group">
                        <label for="noteContent">Content (optional)</label>
                        <textarea id="noteContent" placeholder="Enter note details..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="closeNoteModal()">Cancel</button>
                        <button type="submit" class="btn-save">Save</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Add form submit handler
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveNote();
        });
    }

    // Set values
    document.getElementById('noteTitle').value = title;
    document.getElementById('noteContent').value = content;

    // Update modal title
    modal.querySelector('.modal-header h3').textContent =
        currentEditIndex >= 0 ? 'Edit Note' : 'Add New Note';

    modal.classList.add('active');
    document.getElementById('noteTitle').focus();

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeNoteModal();
        }
    });
}

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    if (modal) {
        modal.classList.remove('active');
        currentEditIndex = -1;
    }
}

async function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!title) {
        alert('Please enter a title');
        return;
    }

    const note = {
        title,
        content,
        timestamp: Date.now(),
        completed: false
    };

    if (currentEditIndex >= 0) {
        // Update existing note
        const existingNote = notes[currentEditIndex];
        notes[currentEditIndex] = {
            ...existingNote,
            title,
            content
        };

        if (USE_API && existingNote.id) {
            try {
                const response = await fetch(`${API_URL}/notes/${existingNote.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notes[currentEditIndex])
                });
                if (!response.ok) throw new Error('Failed to update note');
            } catch (error) {
                console.error('Failed to update note:', error);
                alert('Failed to save note. Please try again.');
                return;
            }
        }
    } else {
        // Add new note
        if (USE_API) {
            try {
                const response = await fetch(`${API_URL}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                if (!response.ok) throw new Error('Failed to create note');

                const result = await response.json();
                note.id = result.id;
            } catch (error) {
                console.error('Failed to create note:', error);
                alert('Failed to save note. Please try again.');
                return;
            }
        }
        notes.unshift(note);
    }

    saveNotes();
    closeNoteModal();
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNoteModal();
    }
});
