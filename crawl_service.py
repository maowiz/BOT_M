"""
BOT_M Crawl4AI Service - Universal Website Crawler
Supports: Static sites, SPAs, JS-heavy pages, protected sites, PDFs
"""
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
import hashlib
import re
import asyncio
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

app = FastAPI(title="BOT_M Crawler Service", version="2.0")

# ==========================
# URL FILTERING RULES
# ==========================
EXCLUDED_PATH_PATTERNS = [
    r'/login', r'/signin', r'/signup', r'/register',
    r'/cart', r'/checkout', r'/basket', r'/buy',
    r'/privacy', r'/terms', r'/cookie', r'/gdpr', r'/legal',
    r'/pricing', r'/plans', r'/subscribe',
    r'/account', r'/settings', r'/profile', r'/dashboard',
    r'/admin', r'/cms', r'/wp-admin',
    r'/sitemap\.xml', r'/robots\.txt',
]
EXCLUDED_QUERY_PARAMS = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'sessionid', 'token']

def should_exclude_url(url: str) -> bool:
    """Check if URL matches exclusion patterns."""
    parsed = urlparse(url)
    path = parsed.path.lower()
    for pattern in EXCLUDED_PATH_PATTERNS:
        if re.search(pattern, path):
            return True
    return False

def normalize_url(url: str) -> str:
    """Strip tracking params, fragments, and normalize trailing slashes."""
    parsed = urlparse(url)
    path = parsed.path.rstrip('/')
    query_params = parse_qs(parsed.query)
    filtered_params = {k: v for k, v in query_params.items() if k.lower() not in EXCLUDED_QUERY_PARAMS}
    new_query = urlencode(filtered_params, doseq=True)
    return urlunparse((parsed.scheme, parsed.netloc, path or '/', '', new_query, ''))

# ==========================
# CONTENT CLEANUP
# ==========================
BOILERPLATE_PATTERNS = [
    r'All rights reserved\.?',
    r'©\s*\d{4}',
    r'Cookie\s*Settings?',
    r'Accept\s*Cookies?',
    r'Privacy\s*Policy',
    r'Terms\s*(of|&)\s*(Service|Use)',
    r'Sign\s*up\s*for\s*our\s*newsletter',
    r'Follow\s*us\s*on',
    r'Connect\s*with\s*us',
    r'Share\s*(this|on)\s*(Facebook|Twitter|LinkedIn)',
    r'Loading\.\.\.',
    r'Please\s*wait',
    r'\[Skip to.*?\]',
    r'Back to top',
]

def clean_markdown(markdown: str) -> str:
    """Remove common boilerplate and navigation elements."""
    if not markdown:
        return ""
    
    lines = markdown.split('\n')
    cleaned_lines = []
    skip_section = False
    
    for line in lines:
        # Skip empty lines in mass
        if not line.strip():
            if cleaned_lines and cleaned_lines[-1].strip():
                cleaned_lines.append(line)
            continue
            
        # Check boilerplate patterns
        skip = False
        for pattern in BOILERPLATE_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                skip = True
                break
        
        # Skip navigation-heavy sections
        if re.match(r'^#+\s*(Navigation|Menu|Footer|Sidebar|Header)', line, re.IGNORECASE):
            skip_section = True
        elif re.match(r'^#+\s', line):
            skip_section = False
            
        if not skip and not skip_section:
            cleaned_lines.append(line)
    
    # Remove excessive newlines
    result = '\n'.join(cleaned_lines)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()

# ==========================
# HEADING-BASED CHUNKING
# ==========================
def chunk_by_headings(markdown: str, source_url: str, page_title: str, 
                       target_tokens: int = 900, max_tokens: int = 1200, 
                       overlap_tokens: int = 100) -> List[dict]:
    """Split markdown by headings into chunks with metadata."""
    sections = re.split(r'(?=^#{1,3}\s)', markdown, flags=re.MULTILINE)
    
    chunks = []
    current_heading = page_title
    
    for section in sections:
        if not section.strip():
            continue
        
        heading_match = re.match(r'^(#{1,3})\s*(.+?)$', section, re.MULTILINE)
        if heading_match:
            current_heading = heading_match.group(2).strip()
        
        estimated_tokens = len(section) // 4
        
        if estimated_tokens <= max_tokens:
            chunks.append({
                "text": section.strip(),
                "source_url": source_url,
                "page_title": page_title,
                "section_heading": current_heading,
                "token_estimate": estimated_tokens
            })
        else:
            paragraphs = section.split('\n\n')
            current_chunk = ""
            current_tokens = 0
            for para in paragraphs:
                para_tokens = len(para) // 4
                if current_tokens + para_tokens > target_tokens and current_chunk:
                    chunks.append({
                        "text": current_chunk.strip(),
                        "source_url": source_url,
                        "page_title": page_title,
                        "section_heading": current_heading,
                        "token_estimate": current_tokens
                    })
                    overlap_chars = overlap_tokens * 4
                    current_chunk = current_chunk[-overlap_chars:] + "\n\n" + para
                    current_tokens = len(current_chunk) // 4
                else:
                    current_chunk += "\n\n" + para
                    current_tokens += para_tokens
            if current_chunk.strip():
                chunks.append({
                    "text": current_chunk.strip(),
                    "source_url": source_url,
                    "page_title": page_title,
                    "section_heading": current_heading,
                    "token_estimate": len(current_chunk) // 4
                })
    
    return chunks

# ==========================
# WEBSITE TYPE DETECTION
# ==========================
def detect_website_type(url: str, html: str = "") -> str:
    """Detect website type to optimize crawling strategy."""
    url_lower = url.lower()
    html_lower = html.lower() if html else ""
    
    # SPA Frameworks
    if any(x in html_lower for x in ['react', 'vue', 'angular', '__next', 'nuxt', 'gatsby']):
        return "spa"
    
    # WordPress / CMS
    if any(x in html_lower for x in ['wp-content', 'wordpress', 'drupal', 'joomla']):
        return "cms"
    
    # E-commerce
    if any(x in html_lower for x in ['shopify', 'woocommerce', 'magento', 'add-to-cart']):
        return "ecommerce"
    
    # Documentation sites
    if any(x in url_lower for x in ['docs.', '/docs/', 'documentation', 'readme', 'wiki']):
        return "documentation"
    
    # PDF
    if url_lower.endswith('.pdf'):
        return "pdf"
    
    # News/Blog
    if any(x in html_lower for x in ['article', 'blog-post', 'news-item', 'byline']):
        return "article"
    
    return "standard"

# ==========================
# MODELS
# ==========================
class CrawlRequest(BaseModel):
    url: str
    depth: int = 1
    max_pages: int = 20
    include_patterns: Optional[List[str]] = None
    exclude_patterns: Optional[List[str]] = None
    bypass_cache: bool = True
    enable_chunking: bool = True
    wait_for_js: bool = True  # NEW: Wait for JavaScript to render
    timeout: int = 60  # NEW: Configurable timeout in seconds

class CrawlResponsePage(BaseModel):
    url: str
    markdown: str
    title: str
    html: Optional[str] = None
    content_hash: Optional[str] = None
    chunks: Optional[List[dict]] = None
    website_type: Optional[str] = None  # NEW: Detected website type

class CrawlResponse(BaseModel):
    pages: List[CrawlResponsePage]
    total_count: int = 0
    success_count: int = 0

# ==========================
# CRAWL STRATEGIES
# ==========================
def get_browser_config(website_type: str) -> BrowserConfig:
    """Get optimized browser config based on website type."""
    base_config = {
        "browser_type": "chromium",
        "headless": True,
        "verbose": False,
        "user_agent_mode": "random",
        "viewport": {"width": 1920, "height": 1080},
        "headers": {
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
    }
    
    if website_type == "spa":
        # SPAs need more time and anti-detection
        base_config["extra_args"] = ["--disable-blink-features=AutomationControlled"]
    
    return BrowserConfig(**base_config)

def get_run_config(website_type: str, request: CrawlRequest) -> CrawlerRunConfig:
    """Get optimized run config based on website type."""
    config = {
        "cache_mode": CacheMode.BYPASS if request.bypass_cache else CacheMode.ENABLED,
        "word_count_threshold": 10,
        "magic": True,  # Built-in anti-bot protections
        "page_timeout": request.timeout * 1000,
        "remove_overlay_elements": True,  # Remove popups
    }
    
    if website_type == "spa":
        # Wait longer for SPAs to render
        config["wait_for"] = "networkidle"
        config["delay_before_return_html"] = 3.0
    elif website_type == "documentation":
        config["wait_for"] = "domcontentloaded"
    elif website_type == "article":
        config["wait_for"] = "domcontentloaded"
        config["wait_for_selector"] = "article, .article, .post, main"
    else:
        config["wait_for"] = "body"
        config["delay_before_return_html"] = 1.0
    
    return CrawlerRunConfig(**config)

# ==========================
# MAIN ENDPOINTS
# ==========================
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Crawl4AI", "version": "2.0"}

@app.post("/crawl", response_model=CrawlResponse)
async def crawl_website(request: CrawlRequest):
    print(f"📥 Crawl request for: {request.url}")
    
    normalized_url = normalize_url(request.url)
    
    if should_exclude_url(normalized_url):
        print(f"⛔ URL excluded by filter: {normalized_url}")
        return CrawlResponse(pages=[], total_count=0, success_count=0)
    
    pages = []
    website_type = "standard"
    
    # First, detect website type with a quick fetch
    try:
        browser_cfg = get_browser_config("standard")
        quick_cfg = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=15000,
            wait_for="domcontentloaded"
        )
        
        async with AsyncWebCrawler(config=browser_cfg) as crawler:
            quick_result = await crawler.arun(normalized_url, config=quick_cfg)
            if quick_result.success:
                website_type = detect_website_type(normalized_url, quick_result.html)
                print(f"🔍 Detected website type: {website_type}")
    except Exception as e:
        print(f"⚠️ Quick detection failed, using standard config: {e}")
    
    # Now crawl with optimized config
    browser_cfg = get_browser_config(website_type)
    run_cfg = get_run_config(website_type, request)
    
    try:
        async with AsyncWebCrawler(config=browser_cfg) as crawler:
            result = await crawler.arun(normalized_url, config=run_cfg)
            
            if result.success:
                cleaned_markdown = clean_markdown(result.markdown)
                
                # Skip if too little content
                if len(cleaned_markdown) < 100:
                    print(f"⚠️ Page has too little content: {normalized_url}")
                    return CrawlResponse(pages=[], total_count=1, success_count=0)
                
                content_hash = hashlib.sha256(cleaned_markdown.encode('utf-8')).hexdigest()
                
                chunks = None
                if request.enable_chunking:
                    chunks = chunk_by_headings(
                        cleaned_markdown, 
                        result.url, 
                        result.metadata.get("title", "Untitled")
                    )
                    print(f"📦 Created {len(chunks)} chunks for {result.url}")
                
                pages.append(CrawlResponsePage(
                    url=result.url,
                    markdown=cleaned_markdown,
                    title=result.metadata.get("title", "No Title"),
                    html=None,  # Don't send HTML to reduce payload
                    content_hash=content_hash,
                    chunks=chunks,
                    website_type=website_type
                ))
                print(f"✅ Successfully crawled: {result.url}")
            else:
                print(f"❌ Failed: {result.error_message}")
                raise HTTPException(status_code=500, detail=f"Failed to crawl: {result.error_message}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Crawl error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Crawl failed: {str(e)}")

    return CrawlResponse(pages=pages, total_count=1, success_count=len(pages))

@app.post("/crawl/batch")
async def crawl_batch(urls: List[str], depth: int = 1, max_pages: int = 20):
    """Crawl multiple URLs concurrently."""
    results = []
    tasks = []
    
    for url in urls[:10]:  # Limit to 10 URLs per batch
        request = CrawlRequest(url=url, depth=depth, max_pages=max_pages)
        tasks.append(crawl_website(request))
    
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    for response in responses:
        if isinstance(response, CrawlResponse):
            results.extend(response.pages)
    
    return CrawlResponse(
        pages=results, 
        total_count=len(urls), 
        success_count=len(results)
    )

if __name__ == "__main__":
    print("🕷️ Starting BOT_M Crawl4AI Service v2.0 on port 11235...")
    uvicorn.run(app, host="0.0.0.0", port=11235)
