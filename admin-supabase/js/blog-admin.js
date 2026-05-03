/**
 * Blog Admin Module
 * Handles blog post CRUD operations
 */

import { supabase } from '../../js/supabase-config.js';
import { showToast, showScreen, showSpinner, confirmDialog } from './ui-utils.js';
import { getCurrentUser } from './auth.js';

// State
let currentPostId = null;

/**
 * Get current post ID
 */
export function getCurrentPostId() {
    return currentPostId;
}

/**
 * Set current post ID
 */
export function setCurrentPostId(id) {
    currentPostId = id;
}

/**
 * Load all blog posts
 */
export async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;

    showSpinner('posts-list');

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        postsList.innerHTML = `<div class="error-msg">Error loading posts: ${error.message}</div>`;
        return;
    }

    if (posts.length === 0) {
        postsList.innerHTML = '<div class="no-posts">No posts found. Create one!</div>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="status-badge ${post.is_published ? 'status-published' : 'status-draft'}">
                        ${post.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span>${new Date(post.created_at).toLocaleDateString()}</span>
                    <span>${post.genre || 'Uncategorized'}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn-icon edit-post-btn" data-id="${post.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete delete-post-btn" data-id="${post.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    setupPostEventListeners();
}

/**
 * Setup event listeners for post list
 */
function setupPostEventListeners() {
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', () => editPost(btn.dataset.id));
    });

    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', () => deletePost(btn.dataset.id));
    });
}

/**
 * Edit a blog post
 */
export async function editPost(id) {
    currentPostId = id;
    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        showToast('Error loading post', 'error');
        return;
    }

    fillEditor(post);
    showScreen('editor');
    const editorTitle = document.getElementById('editor-title');
    if (editorTitle) {
        editorTitle.textContent = 'Edit Post';
    }
}

/**
 * Fill editor with post data
 */
export function fillEditor(post) {
    const fields = [
        { id: 'post-title', value: post.title || '' },
        { id: 'post-slug', value: post.slug || '' },
        { id: 'post-genre', value: post.genre || 'tech' },
        { id: 'post-date', value: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '' },
        { id: 'post-readtime', value: post.read_time || '' },
        { id: 'post-image', value: post.image_url || '' },
        { id: 'post-excerpt', value: post.excerpt || '' },
        { id: 'post-content', value: post.content || '' }
    ];

    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) el.value = field.value;
    });

    const publishedCheckbox = document.getElementById('post-published');
    if (publishedCheckbox) {
        publishedCheckbox.checked = post.is_published || false;
    }

    updatePreview();
}

/**
 * Save blog post
 */
export async function savePost() {
    const saveBtn = document.getElementById('save-btn');
    const statusSpan = document.getElementById('save-status');

    if (saveBtn) saveBtn.disabled = true;
    if (statusSpan) statusSpan.textContent = 'Saving...';

    const postData = {
        title: document.getElementById('post-title').value,
        slug: document.getElementById('post-slug').value,
        genre: document.getElementById('post-genre').value,
        published_at: document.getElementById('post-date').value
            ? new Date(document.getElementById('post-date').value).toISOString()
            : null,
        read_time: document.getElementById('post-readtime').value,
        image_url: document.getElementById('post-image').value,
        excerpt: document.getElementById('post-excerpt').value,
        is_published: document.getElementById('post-published').checked,
        content: document.getElementById('post-content').value,
        author_id: getCurrentUser()?.id
    };

    let error;
    if (currentPostId) {
        const result = await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', currentPostId);
        error = result.error;
    } else {
        const result = await supabase
            .from('blog_posts')
            .insert(postData);
        error = result.error;
    }

    if (saveBtn) saveBtn.disabled = false;
    if (statusSpan) statusSpan.textContent = '';

    if (error) {
        showToast('Error saving post: ' + error.message, 'error');
        console.error(error);
    } else {
        showToast('Post saved successfully!', 'success');
        if (!currentPostId) {
            showScreen('dashboard');
            loadPosts();
        }
    }
}

/**
 * Delete blog post
 */
export async function deletePost(id) {
    if (!confirmDialog('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Error deleting post: ' + error.message, 'error');
    } else {
        showToast('Post deleted', 'success');
        loadPosts();
    }
}

/**
 * Update markdown preview
 */
export function updatePreview() {
    const content = document.getElementById('post-content')?.value || '';
    const preview = document.getElementById('markdown-preview');
    if (preview && typeof marked !== 'undefined') {
        preview.innerHTML = marked.parse(content);
    }
}

/**
 * Create new post
 */
export function createNewPost() {
    currentPostId = null;
    fillEditor({});
    showScreen('editor');
    const editorTitle = document.getElementById('editor-title');
    if (editorTitle) {
        editorTitle.textContent = 'New Post';
    }
}

/**
 * Setup blog editor event listeners
 */
export function setupBlogEditorListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showScreen('dashboard');
            loadPosts();
        });
    }

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', savePost);
    }

    const contentTextarea = document.getElementById('post-content');
    if (contentTextarea) {
        contentTextarea.addEventListener('input', updatePreview);
    }
}
