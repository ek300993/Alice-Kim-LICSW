/* Metadata for the existing query-string article URLs. */
(function (root) {
  const origin = 'https://alicekimlicsw.com';

  function findPost(posts, id) {
    return posts.find(post => post.id === id) ||
      posts.find(post => Array.isArray(post.aliases) && post.aliases.includes(id));
  }

  function setMeta(key, value, attribute = 'name') {
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.setAttribute('content', value);
  }

  function renderMetadata(post) {
    const url = `${origin}/post.html?id=${encodeURIComponent(post.id)}`;
    const content = document.createElement('div');
    content.innerHTML = post.content;
    content.querySelectorAll('script, style').forEach(node => node.remove());
    const firstParagraph = content.querySelector('p');
    const plainText = (firstParagraph ? firstParagraph.textContent : content.textContent).replace(/\s+/g, ' ').trim();
    const description = plainText.length > 160 ? plainText.slice(0, 157).replace(/\s+\S*$/, '') + '…' : plainText;
    const author = post.author || 'Alice Kim, LICSW';
    document.title = `${post.title} | Alice Kim, LICSW`;
    setMeta('description', description);
    setMeta('author', author);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    for (const [key, value] of Object.entries({
      'og:type': 'article', 'og:title': post.title, 'og:description': description,
      'og:url': url, 'og:site_name': 'Alice Kim, LICSW Counseling',
      'og:image': new URL(post.image || '/Assets/Headshot.jpg', origin + '/').href,
      'og:image:alt': post.image ? post.title : 'Alice Kim, LICSW',
      'article:published_time': post.date
    })) setMeta(key, value, 'property');
    setMeta('twitter:card', 'summary_large_image');
    document.head.querySelector('meta[name="robots"]')?.remove();

    let schema = document.getElementById('article-schema');
    if (!schema) {
      schema = document.createElement('script');
      schema.id = 'article-schema';
      schema.type = 'application/ld+json';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article',
      'headline': post.title, 'description': description, 'datePublished': post.date,
      'mainEntityOfPage': url,
      'image': new URL(post.image || '/Assets/Headshot.jpg', origin + '/').href,
      'author': { '@type': 'Person', 'name': author, 'url': origin + '/about' },
      'publisher': { '@id': origin + '/#practice' }
    });
  }

  function markUnavailable(title) {
    document.title = `${title} | Alice Kim, LICSW`;
    setMeta('robots', 'noindex');
    document.getElementById('article-schema')?.remove();
    document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  const api = { findPost, renderMetadata, markUnavailable };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.articleSEO = api;
})(typeof window !== 'undefined' ? window : globalThis);
