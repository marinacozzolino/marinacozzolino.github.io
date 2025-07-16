// Homepage Blog Articles Fetcher
(function() {
  // Configuration
  const MEDIUM_USERNAME = 'jermolenko.m'; // Replace with actual Medium username
  const RSS_URL = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
  const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
  const MAX_ARTICLES = 2; // Only show latest 2 articles on homepage
  
  // Utility functions (reused from medium-articles.js)
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  function stripHtmlTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  
  function getExcerpt(content, maxLength = 120) {
    const text = stripHtmlTags(content);
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  function extractImageFromContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
  }
  
  function extractTags(categories) {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.slice(0, 3); // Limit to 3 tags
  }
  
  // Create blog card HTML for homepage
  function createHomepageBlogCard(article) {
    const publishDate = formatDate(article.pubDate);
    const excerpt = getExcerpt(article.content);
    const imageUrl = article.thumbnail || extractImageFromContent(article.content);
    const tags = extractTags(article.categories);
    
    // Use placeholder image if no image found
    const fallbackImage = 'assets/img/posts/default-post.jpg';
    const finalImageUrl = imageUrl || fallbackImage;
    
    return `
      <article class="blog-card" data-title="${article.title}" data-desc="${excerpt}" data-img="${finalImageUrl}" data-link="${article.link}">
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="blog-thumb">
          <img src="${finalImageUrl}" alt="${article.title}" loading="lazy" />
        </a>
        <div class="blog-meta">
          <span class="blog-date">${publishDate}</span>
          ${tags.length > 0 ? `
            <span class="blog-tags">
              ${tags.map(tag => `<span class="blog-tag">#${tag}</span>`).join('')}
            </span>
          ` : ''}
        </div>
        <h3><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
        <p class="blog-excerpt">${excerpt}</p>
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="blog-readmore">Read more →</a>
      </article>
    `;
  }
  
  // Fetch and display latest articles
  async function fetchLatestBlogPosts() {
    const blogGrid = document.querySelector('#blog-list .blog-grid');
    
    if (!blogGrid) return; // Exit if not on homepage
    
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        console.warn('Failed to fetch Medium articles, keeping static content');
        return;
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok' || !data.items || data.items.length === 0) {
        console.warn('No Medium articles found, keeping static content');
        return;
      }
      
      // Get latest articles (limit to MAX_ARTICLES)
      const latestArticles = data.items.slice(0, MAX_ARTICLES);
      
      // Create HTML for latest articles
      const articlesHTML = latestArticles.map(createHomepageBlogCard).join('');
      
      // Replace static content with dynamic content
      blogGrid.innerHTML = articlesHTML;
      
    } catch (error) {
      console.error('Error fetching Medium articles for homepage:', error);
      // Keep static content as fallback
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', fetchLatestBlogPosts);
})(); 