// Utility functions used across the application

// Escapes HTML special characters to prevent XSS attacks
function escapeHtml(text) {
    if (text == null) {
        return '';
    }
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
