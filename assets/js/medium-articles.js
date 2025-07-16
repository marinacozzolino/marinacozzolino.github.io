// Medium Articles Fetcher
(function() {
  // Configuration
  const MEDIUM_USERNAME = 'jermolenko.m'; // Replace with actual Medium username
  const RSS_URL = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
  const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
  
  // DOM elements
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const articlesContainer = document.getElementById('articles-container');
  
  // Utility functions
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function stripHtmlTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  
  function getExcerpt(content, maxLength = 150) {
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
  
  // Create article card HTML
  function createArticleCard(article) {
    const publishDate = formatDate(article.pubDate);
    const excerpt = getExcerpt(article.content);
    const imageUrl = article.thumbnail || extractImageFromContent(article.content);
    const tags = extractTags(article.categories);
    
    return `
      <article class="medium-article-card">
        ${imageUrl ? `
          <div class="article-image">
            <img src="${imageUrl}" alt="${article.title}" loading="lazy" />
          </div>
        ` : ''}
        
        <div class="article-content">
          <div class="article-meta">
            <span class="article-date">${publishDate}</span>
            ${tags.length > 0 ? `
              <div class="article-tags">
                ${tags.map(tag => `<span class="article-tag">#${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          
          <h2 class="article-title">
            <a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a>
          </h2>
          
          <p class="article-excerpt">${excerpt}</p>
          
          <div class="article-footer">
            <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="read-more-btn">
              Read on Medium →
            </a>
          </div>
        </div>
      </article>
    `;
  }
  
  // Fetch and display articles
  async function fetchMediumArticles() {
    try {
      loadingEl.style.display = 'block';
      errorEl.style.display = 'none';
      articlesContainer.style.display = 'none';
      
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error('Failed to fetch RSS feed');
      }
      
      const articles = data.items || [];
      
      if (articles.length === 0) {
        throw new Error('No articles found');
      }
      
      // Create HTML for all articles
      const articlesHTML = articles.map(createArticleCard).join('');
      articlesContainer.innerHTML = articlesHTML;
      
      // Show articles container
      loadingEl.style.display = 'none';
      articlesContainer.style.display = 'grid';
      
    } catch (error) {
      console.error('Error fetching Medium articles:', error);
      
      // Show error message
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', fetchMediumArticles);
})(); 