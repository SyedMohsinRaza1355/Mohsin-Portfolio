document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearElem = document.getElementById('year');
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }

    // Render portfolio data using the global portfolioData object
    if (typeof portfolioData !== 'undefined') {
        renderPortfolio(portfolioData);
    } else {
        console.error('portfolioData not defined');
    }
});

// Helper SVG generators for LinkedIn & GitHub to ensure instant, reliable logo rendering without text
function getLinkedInSvg(size = 20) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
}

function getGitHubSvg(size = 20) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`;
}

function renderPortfolio(data) {
    try {
        renderNavSocials(data.basics);
        renderHero(data.basics);
        renderAbout(data.basics, data.about);
        setupSkillsSystem(data.skills);
        renderEducation(data.education);
        renderCertificates(data.certificates);
        renderContactAndSocials(data.basics);
        
        // Initialize Lucide icons
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.error('Error rendering portfolio data:', error);
    }
}

// 1. Navigation Socials: LinkedIn and GitHub logos only (no text)
function renderNavSocials(basics) {
    const navSocials = document.getElementById('nav-socials');
    if (!navSocials) return;

    const linkedin = basics.profiles.find(p => p.network.toLowerCase() === 'linkedin');
    const github = basics.profiles.find(p => p.network.toLowerCase() === 'github');

    navSocials.innerHTML = `
        ${linkedin ? `
        <a href="${linkedin.url}" target="_blank" rel="noopener noreferrer" class="nav-social-btn linkedin-btn" title="Syed Mohsin Raza on LinkedIn" aria-label="LinkedIn">
            ${getLinkedInSvg(18)}
        </a>` : ''}
        ${github ? `
        <a href="${github.url}" target="_blank" rel="noopener noreferrer" class="nav-social-btn github-btn" title="Syed Mohsin Raza on GitHub" aria-label="GitHub">
            ${getGitHubSvg(18)}
        </a>` : ''}
    `;
}

// 2. Hero Section: LinkedIn and GitHub logos linked alongside primary actions (no text)
function renderHero(basics) {
    const heroContent = document.getElementById('hero-content');
    if (!heroContent) return;

    const linkedin = basics.profiles.find(p => p.network.toLowerCase() === 'linkedin');
    const github = basics.profiles.find(p => p.network.toLowerCase() === 'github');

    heroContent.innerHTML = `
        <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            <span>${basics.availability}</span>
        </div>
        <h1 class="hero-headline">${basics.name} <span class="shortname">(${basics.shortName})</span></h1>
        <p class="hero-tagline">${basics.label} & Aspiring Solution Architect</p>
        <p class="hero-bio">${basics.headline}</p>
        
        <div class="hero-cta-wrapper">
            <div class="cta-buttons">
                <a href="#contact" class="btn btn-primary">
                    <i data-lucide="mail"></i> Get In Touch
                </a>
                <a href="#skills" class="btn btn-secondary">
                    <i data-lucide="code-2"></i> View Skills
                </a>
            </div>
            <div class="hero-social-divider" aria-hidden="true"></div>
            <div class="hero-social-logos" aria-label="Professional Profiles">
                ${linkedin ? `
                <a href="${linkedin.url}" target="_blank" rel="noopener noreferrer" class="social-logo-btn linkedin-btn" title="LinkedIn Profile" aria-label="LinkedIn">
                    ${getLinkedInSvg(22)}
                </a>` : ''}
                ${github ? `
                <a href="${github.url}" target="_blank" rel="noopener noreferrer" class="social-logo-btn github-btn" title="GitHub Profile" aria-label="GitHub">
                    ${getGitHubSvg(22)}
                </a>` : ''}
            </div>
        </div>
    `;
}

// 3. About Section
function renderAbout(basics, about) {
    const aboutContent = document.getElementById('about-content');
    if (!aboutContent) return;

    aboutContent.innerHTML = '';
    
    // Academic Foundation Card
    const introCard = document.createElement('div');
    introCard.className = 'card glass';
    introCard.innerHTML = `
        <h3 style="color: var(--accent-emerald); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="graduation-cap"></i> Academic Foundation
        </h3>
        <p style="color: var(--text-secondary); line-height: 1.7;">${about.intro[0]}</p>
    `;
    
    // Core Strengths Card
    const strengthsCard = document.createElement('div');
    strengthsCard.className = 'card glass';
    strengthsCard.innerHTML = `
        <h3 style="color: var(--accent-emerald); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="zap"></i> Core Strengths
        </h3>
        <ul style="list-style: none; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.75rem;">
            ${about.strengths.map(s => `<li style="display: flex; align-items: flex-start; gap: 0.6rem;">
                <i data-lucide="check-circle" style="width: 18px; height: 18px; color: var(--accent-emerald); flex-shrink: 0; margin-top: 2px;"></i>
                <span>${s}</span>
            </li>`).join('')}
            <li style="display: flex; align-items: flex-start; gap: 0.6rem;">
                <i data-lucide="check-circle" style="width: 18px; height: 18px; color: var(--accent-emerald); flex-shrink: 0; margin-top: 2px;"></i>
                <span>Low-Level Memory Systems & Pointer Logic (C/C++)</span>
            </li>
        </ul>
    `;
    
    // Leadership Spotlight Card
    const leadershipCard = document.createElement('div');
    leadershipCard.className = 'card glass';
    leadershipCard.innerHTML = `
        <h3 style="color: var(--accent-emerald); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="award"></i> Leadership Spotlight
        </h3>
        <p style="color: var(--text-secondary); line-height: 1.7;">${basics.leadershipNote}</p>
    `;

    aboutContent.appendChild(introCard);
    aboutContent.appendChild(strengthsCard);
    aboutContent.appendChild(leadershipCard);
}

// 4. Skills System: Smooth, Sleek, Sorted & Interactive
let allSkillsData = [];
let currentFilter = 'all';
let currentSort = 'default';

function setupSkillsSystem(skillsCategories) {
    allSkillsData = skillsCategories;
    
    // Setup Filter Tabs
    renderSkillsFilterTabs(skillsCategories);
    
    // Setup Sort Controls
    setupSortEventListeners();
    
    // Render the initial skill cards
    renderSkillsDisplay();
}

function renderSkillsFilterTabs(categories) {
    const tabsContainer = document.getElementById('skills-filter-tabs');
    if (!tabsContainer) return;

    const totalCount = categories.reduce((acc, cat) => acc + cat.items.length, 0);

    let tabsHtml = `
        <button class="filter-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
            All <span class="tab-count">${totalCount}</span>
        </button>
    `;

    categories.forEach(cat => {
        tabsHtml += `
            <button class="filter-tab ${currentFilter === cat.slug ? 'active' : ''}" data-filter="${cat.slug}">
                ${cat.category} <span class="tab-count">${cat.items.length}</span>
            </button>
        `;
    });

    tabsContainer.innerHTML = tabsHtml;

    // Attach click events
    tabsContainer.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            currentFilter = target.getAttribute('data-filter');
            
            tabsContainer.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            target.classList.add('active');

            renderSkillsDisplay();
        });
    });
}

function setupSortEventListeners() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            currentSort = target.getAttribute('data-sort');

            sortButtons.forEach(b => b.classList.remove('active'));
            target.classList.add('active');

            renderSkillsDisplay();
        });
    });
}

function renderSkillsDisplay() {
    const displayContainer = document.getElementById('skills-content');
    if (!displayContainer) return;

    // Filter categories or items based on currentFilter
    let targetCategories = [];
    if (currentFilter === 'all') {
        targetCategories = allSkillsData;
    } else {
        targetCategories = allSkillsData.filter(cat => cat.slug === currentFilter);
    }

    let outputHtml = '';

    targetCategories.forEach(category => {
        // Clone items array to safely sort
        let sortedItems = [...category.items];

        if (currentSort === 'name') {
            sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'proficiency') {
            sortedItems.sort((a, b) => b.proficiency - a.proficiency);
        }
        // 'default' keeps original curated order

        outputHtml += `
            <div class="skills-category-block" data-category="${category.slug}">
                <div class="category-block-header">
                    <div class="category-title-wrap">
                        <span class="category-accent-dot"></span>
                        <h3 class="category-title">${category.category}</h3>
                    </div>
                    <p class="category-desc">${category.description || ''}</p>
                </div>
                
                <div class="skill-cards-grid">
                    ${sortedItems.map(item => createSkillCardHtml(item, category.slug)).join('')}
                </div>
            </div>
        `;
    });

    displayContainer.innerHTML = outputHtml;

    // Re-initialize Lucide icons for new cards
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

function createSkillCardHtml(item, categorySlug) {
    const iconName = item.icon || (categorySlug === 'languages' ? 'code-2' : 'cpu');

    return `
        <div class="skill-card glass" data-skill="${item.name.toLowerCase()}">
            <div class="skill-card-top">
                <div class="skill-title-cluster">
                    <div class="skill-icon-wrapper">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div>
                        <h4 class="skill-name">${item.name}</h4>
                        <p class="skill-tagline">${item.tagline}</p>
                    </div>
                </div>
                <span class="skill-badge-origin">${item.origin}</span>
            </div>

            <!-- Detailed core programming breakdown -->
            <div class="skill-details-block">
                <div class="skill-detail-pills">
                    ${item.details.map(d => `<span class="skill-pill"><i data-lucide="check" style="width: 12px; height: 12px; margin-right: 4px; color: var(--accent-emerald);"></i>${d}</span>`).join('')}
                </div>
            </div>

            <!-- Sleek progress meter -->
            <div class="skill-meter-area">
                <div class="skill-meter-meta">
                    <span class="skill-level-label">${item.level}</span>
                    <span class="skill-proficiency-val">${item.proficiency}%</span>
                </div>
                <div class="skill-meter-track">
                    <div class="skill-meter-fill" style="width: ${item.proficiency}%;"></div>
                </div>
            </div>
        </div>
    `;
}

// 5. Education Timeline
function renderEducation(education) {
    const educationTimeline = document.getElementById('education-timeline');
    if (!educationTimeline) return;

    educationTimeline.innerHTML = '';
    const sortedEducation = [...education].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    sortedEducation.forEach(item => {
        const eduItem = document.createElement('div');
        eduItem.className = 'timeline-item';
        
        const startYear = new Date(item.startDate).getFullYear();
        const endYear = item.endDate ? new Date(item.endDate).getFullYear() : 'Present';
        
        eduItem.innerHTML = `
            <div class="timeline-content card glass">
                <h3>${item.studyType} in ${item.area}</h3>
                <p class="institution">${item.institution}</p>
                <p class="date">${startYear} — ${endYear}</p>
                ${item.details ? `
                <div style="margin-top: 0.75rem;">
                    <span style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent-emerald);">${item.detailsLabel || 'Core Coursework'}:</span>
                    <ul style="list-style: none; color: var(--text-secondary); margin-top: 0.4rem; display: flex; flex-direction: column; gap: 0.25rem;">
                        ${item.details.map(d => `<li style="font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="chevron-right" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i> ${d}</li>`).join('')}
                    </ul>
                </div>` : ''}
            </div>
        `;
        educationTimeline.appendChild(eduItem);
    });
}

// 6. Certifications
function renderCertificates(certificates) {
    const certificationsContent = document.getElementById('certifications-content');
    if (!certificationsContent) return;

    certificationsContent.innerHTML = '';
    certificates.forEach(cert => {
        const certCard = document.createElement('div');
        certCard.className = 'card glass';
        certCard.innerHTML = `
            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">${cert.name}</h3>
            <p style="color: var(--accent-emerald); font-weight: 600; font-size: 0.9rem; margin-bottom: 1.25rem;">${cert.issuer}</p>
            <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; width: fit-content;">
                <i data-lucide="external-link" style="width: 14px; height: 14px;"></i> View Credential
            </a>
        `;
        certificationsContent.appendChild(certCard);
    });
}

// 7. Contact Card & Footer Socials: LinkedIn and GitHub logos only (no text)
function renderContactAndSocials(basics) {
    const contactContent = document.getElementById('contact-content');
    const linkedin = basics.profiles.find(p => p.network.toLowerCase() === 'linkedin');
    const github = basics.profiles.find(p => p.network.toLowerCase() === 'github');

    if (contactContent) {
        contactContent.innerHTML = `
            <h3 class="contact-heading">Let's Build Something Together</h3>
            <p class="contact-desc">
                I'm always open to discussing system architecture, software engineering, collaborative projects, or opportunities to contribute to transformative solutions.
            </p>
            <div class="contact-actions">
                <a href="mailto:${basics.email}" class="btn btn-primary contact-email-btn">
                    <i data-lucide="mail"></i> ${basics.email}
                </a>
                <p class="contact-location">
                    <i data-lucide="map-pin" style="color: var(--accent-emerald);"></i> ${basics.location.region}, ${basics.location.country}
                </p>
            </div>
            
            <div class="contact-socials-row">
                <span class="contact-socials-label">Connect with me:</span>
                <div class="contact-logo-group">
                    ${linkedin ? `
                    <a href="${linkedin.url}" target="_blank" rel="noopener noreferrer" class="social-logo-btn linkedin-btn" title="LinkedIn Profile" aria-label="LinkedIn">
                        ${getLinkedInSvg(22)}
                    </a>` : ''}
                    ${github ? `
                    <a href="${github.url}" target="_blank" rel="noopener noreferrer" class="social-logo-btn github-btn" title="GitHub Profile" aria-label="GitHub">
                        ${getGitHubSvg(22)}
                    </a>` : ''}
                </div>
            </div>
        `;
    }

    // Footer Social Links: Logos only (no text)
    const socialLinks = document.getElementById('social-links');
    if (socialLinks) {
        socialLinks.innerHTML = `
            ${linkedin ? `
            <a href="${linkedin.url}" target="_blank" rel="noopener noreferrer" class="social-logo-btn linkedin-btn footer-social-btn" title="LinkedIn" aria-label="LinkedIn">
                ${getLinkedInSvg(20)}
            </a>` : ''}
            ${github ? `
            <a href="${github.url}" target="_blank" rel="noopener noreferrer" class="social-logo-btn github-btn footer-social-btn" title="GitHub" aria-label="GitHub">
                ${getGitHubSvg(20)}
            </a>` : ''}
        `;
    }
}
