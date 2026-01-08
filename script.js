/**
 * Taxified.ng - Main JavaScript
 * Loads sections dynamically and handles interactivity
 */

(function() {
    'use strict';

    // ============================================
    // User Preferences (localStorage)
    // ============================================
    const UserPrefs = {
        STORAGE_KEY: 'taxified_user',

        // Get all stored preferences
        get() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEY);
                return data ? JSON.parse(data) : {};
            } catch (e) {
                console.warn('Error reading user preferences:', e);
                return {};
            }
        },

        // Save preferences
        save(data) {
            try {
                const existing = this.get();
                const updated = { ...existing, ...data, lastVisit: new Date().toISOString() };
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
                return true;
            } catch (e) {
                console.warn('Error saving user preferences:', e);
                return false;
            }
        },

        // Save user contact info (for form pre-fill)
        saveContact(name, phone, email) {
            return this.save({ name, phone, email });
        },

        // Save interested service/package
        saveInterest(service, packageName) {
            const prefs = this.get();
            const interests = prefs.interests || [];
            const interest = { service, package: packageName, date: new Date().toISOString() };

            // Keep last 5 interests
            interests.unshift(interest);
            if (interests.length > 5) interests.pop();

            return this.save({ interests });
        },

        // Get contact info for form pre-fill
        getContact() {
            const prefs = this.get();
            return {
                name: prefs.name || '',
                phone: prefs.phone || '',
                email: prefs.email || ''
            };
        },

        // Check if returning visitor
        isReturning() {
            return !!this.get().lastVisit;
        }
    };

    // ============================================
    // Lead Capture (Formspree / Google Sheets)
    // ============================================
    // NOTE: Lead capture settings are stored here (not in config.js) to prevent accidental changes
    const LeadCapture = {
        ENDPOINT: 'https://formspree.io/f/xwvpgoqk',
        PROVIDER: 'formspree',

        // Save lead to configured endpoint
        async save(leadData) {
            // Always save locally first as backup
            this.saveLocal(leadData);

            // If no endpoint configured, just use local storage
            if (!this.ENDPOINT) {
                console.log('Lead saved locally (configure endpoint in config.js to save remotely)');
                return { success: true, local: true };
            }

            try {
                const payload = {
                    ...leadData,
                    timestamp: new Date().toISOString(),
                    source: 'taxified.ng'
                };

                // Different handling for Formspree vs Google Sheets
                if (this.PROVIDER === 'formspree') {
                    // Formspree accepts regular fetch with JSON
                    await fetch(this.ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Google Apps Script requires no-cors mode
                    await fetch(this.ENDPOINT, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                }

                console.log('Lead saved to ' + this.PROVIDER);
                this.markLocalLeadSynced();
                return { success: true, local: false };
            } catch (error) {
                console.warn('Error saving lead remotely:', error);
                return { success: true, local: true, error: error.message };
            }
        },

        // Save lead to localStorage as backup
        saveLocal(leadData) {
            try {
                const leads = JSON.parse(localStorage.getItem('taxified_leads') || '[]');
                leads.push({
                    ...leadData,
                    timestamp: new Date().toISOString(),
                    synced: false
                });

                // Keep last 50 leads locally
                if (leads.length > 50) leads.shift();

                localStorage.setItem('taxified_leads', JSON.stringify(leads));
            } catch (e) {
                console.warn('Error saving lead locally:', e);
            }
        },

        // Mark the most recent local lead as synced
        markLocalLeadSynced() {
            try {
                const leads = JSON.parse(localStorage.getItem('taxified_leads') || '[]');
                if (leads.length > 0) {
                    leads[leads.length - 1].synced = true;
                    localStorage.setItem('taxified_leads', JSON.stringify(leads));
                }
            } catch (e) {
                // Ignore
            }
        },

        // Get local leads (for debugging/export)
        getLocalLeads() {
            try {
                return JSON.parse(localStorage.getItem('taxified_leads') || '[]');
            } catch (e) {
                return [];
            }
        }
    };

    // Section loader
    const sections = [
        { id: 'nav-section', file: 'sections/nav.html' },
        { id: 'hero-section', file: 'sections/hero.html' },
        { id: 'services-section', file: 'sections/services.html' },
        { id: 'about-section', file: 'sections/about.html' },
        { id: 'faq-section', file: 'sections/faq.html' },
        { id: 'contact-section', file: 'sections/contact.html' },
        { id: 'footer-section', file: 'sections/footer.html' }
    ];

    // Load all sections
    async function loadSections() {
        const promises = sections.map(async (section) => {
            try {
                const response = await fetch(section.file);
                if (!response.ok) throw new Error(`Failed to load ${section.file}`);
                const html = await response.text();
                document.getElementById(section.id).innerHTML = html;
            } catch (error) {
                console.error(`Error loading ${section.file}:`, error);
            }
        });

        await Promise.all(promises);
        initializeApp();
    }

    // Initialize after sections are loaded
    function initializeApp() {
        populateConfig();
        hidePackages();  // Hide packages with show: false
        populateFAQs();  // Populate FAQs from faqconfig.js
        populateSocials();  // Populate social links from config.js
        initNavigation();
        initScrollEffects();
        initSmoothScroll();
        initClickTracking();
        initLeadModal();
        initScrollAnimations();
        trackVisit();
    }

    // ============================================
    // Apply Package Config (show/hide, featured badge)
    // ============================================
    function hidePackages() {
        if (typeof CONFIG === 'undefined' || !CONFIG.pricing) return;

        // Check each package and apply config settings
        document.querySelectorAll('.package[data-service][data-package]').forEach(pkg => {
            const service = pkg.getAttribute('data-service');
            const packageName = pkg.getAttribute('data-package');

            // Find matching config based on service and package name
            let packageConfig = null;

            if (service === 'Tax Filing') {
                const configs = CONFIG.pricing.taxFiling;
                packageConfig = Object.values(configs).find(c => c.name === packageName);
            } else if (service === 'LLC Registration') {
                const configs = CONFIG.pricing.llcRegistration;
                packageConfig = Object.values(configs).find(c => c.name === packageName);
            }

            if (!packageConfig) return;

            // Hide if show is explicitly false
            if (packageConfig.show === false) {
                pkg.style.display = 'none';
            }

            // Apply featured styling
            const existingBadge = pkg.querySelector('.package-badge');
            if (packageConfig.featured === true) {
                // Add featured class
                pkg.classList.add('featured');
                // Add badge if not already present
                if (!existingBadge) {
                    const badge = document.createElement('span');
                    badge.className = 'package-badge';
                    badge.textContent = 'Popular';
                    pkg.insertBefore(badge, pkg.firstChild);
                }
            } else {
                // Remove featured class and badge if present
                pkg.classList.remove('featured');
                if (existingBadge) {
                    existingBadge.remove();
                }
            }
        });
    }

    // ============================================
    // Populate FAQs from faqconfig.js
    // ============================================
    function populateFAQs() {
        if (typeof FAQ_CONFIG === 'undefined' || !Array.isArray(FAQ_CONFIG)) {
            console.warn('FAQ_CONFIG not found or invalid');
            return;
        }

        const faqList = document.getElementById('faqList');
        if (!faqList) return;

        // Clear existing content
        faqList.innerHTML = '';

        // Create FAQ items from config
        FAQ_CONFIG.forEach(faq => {
            const details = document.createElement('details');
            details.className = 'faq-item';

            const summary = document.createElement('summary');
            summary.textContent = faq.question;

            const answer = document.createElement('p');
            answer.textContent = faq.answer;

            details.appendChild(summary);
            details.appendChild(answer);
            faqList.appendChild(details);
        });
    }

    // ============================================
    // Populate Social Links from config.js
    // ============================================
    function populateSocials() {
        if (typeof CONFIG === 'undefined' || !CONFIG.social) return;

        const container = document.getElementById('footerSocial');
        if (!container) return;

        // SVG icons for each platform
        const icons = {
            twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
        };

        // Clear container
        container.innerHTML = '';

        // Check each social platform
        Object.keys(icons).forEach(platform => {
            if (CONFIG.social[platform]) {
                const link = document.createElement('a');
                link.href = CONFIG.social[platform];
                link.target = '_blank';
                link.rel = 'noopener';
                link.className = 'social-link';
                link.setAttribute('aria-label', platform.charAt(0).toUpperCase() + platform.slice(1));
                link.innerHTML = icons[platform];
                container.appendChild(link);
            }
        });
    }

    // ============================================
    // Track User Visits
    // ============================================
    function trackVisit() {
        const isReturning = UserPrefs.isReturning();
        UserPrefs.save({ visitCount: (UserPrefs.get().visitCount || 0) + 1 });

        if (isReturning) {
            console.log('Welcome back! Visit #' + UserPrefs.get().visitCount);
        } else {
            console.log('First visit - welcome!');
        }
    }

    // ============================================
    // Populate content from CONFIG
    // ============================================
    function populateConfig() {
        if (typeof CONFIG === 'undefined') {
            console.warn('CONFIG not found');
            return;
        }

        // Update WhatsApp links
        document.querySelectorAll('[data-wa]').forEach(el => {
            const message = el.getAttribute('data-wa') || CONFIG.contact.whatsappMessage;
            el.href = CONFIG.getWhatsAppLink(message);
        });

        // Update email links
        document.querySelectorAll('[data-email]').forEach(el => {
            const subject = el.getAttribute('data-email') || 'Inquiry - General';
            el.href = CONFIG.getEmailLink(subject);
        });

        // Update text content
        document.querySelectorAll('[data-config]').forEach(el => {
            const key = el.getAttribute('data-config');
            const value = getConfigValue(key);
            if (value !== undefined) {
                // Check if this is a price field - handle showPrice toggle
                if (key.endsWith('.price')) {
                    // Get the parent path (e.g., "pricing.taxFiling.individual" from "pricing.taxFiling.individual.price")
                    const parentPath = key.replace('.price', '');
                    const packageConfig = getConfigValue(parentPath);

                    // If showPrice is explicitly false, show contact text instead
                    if (packageConfig && packageConfig.showPrice === false) {
                        el.textContent = CONFIG.pricing.contactText || 'Contact for pricing';
                        el.classList.add('contact-for-pricing');
                    } else {
                        el.textContent = value;
                        el.classList.remove('contact-for-pricing');
                    }
                } else {
                    el.textContent = value;
                }
            }
        });

        // Update href attributes
        document.querySelectorAll('[data-config-href]').forEach(el => {
            const key = el.getAttribute('data-config-href');
            const value = getConfigValue(key);
            if (value !== undefined) {
                el.href = value;
            }
        });
    }

    // Helper to get nested config values like "contact.phone"
    function getConfigValue(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
    }

    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (!navToggle || !navMenu) return;

        function toggleMobileNav() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        }

        navToggle.addEventListener('click', toggleMobileNav);

        // Close mobile nav when clicking a link
        navMenu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMobileNav();
                }
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                toggleMobileNav();
            }
        });
    }

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    function initScrollEffects() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        function handleScroll() {
            if (window.pageYOffset > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const navbar = document.getElementById('navbar');
                    const navHeight = navbar ? navbar.offsetHeight : 60;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Click Tracking for Analytics
    // ============================================
    function initClickTracking() {
        function trackClick(category, action, label) {
            // Google Analytics tracking
            if (typeof gtag === 'function') {
                gtag('event', action, {
                    'event_category': category,
                    'event_label': label
                });
            }

            // Save engagement to localStorage
            try {
                const engagements = JSON.parse(localStorage.getItem('taxified_engagement') || '[]');
                engagements.push({
                    type: category,
                    action: action,
                    location: label,
                    timestamp: new Date().toISOString()
                });
                // Keep last 20 engagements
                if (engagements.length > 20) engagements.shift();
                localStorage.setItem('taxified_engagement', JSON.stringify(engagements));
            } catch (e) {
                console.warn('Error saving engagement:', e);
            }

            // Send WhatsApp/Email clicks to Formspree for tracking
            if (category === 'whatsapp' || category === 'email') {
                LeadCapture.save({
                    type: category + '_click',
                    location: label,
                    page: window.location.pathname,
                    referrer: document.referrer || 'direct'
                });
            }

            console.log('Track:', category, action, label);
        }

        document.querySelectorAll('[data-track]').forEach(element => {
            element.addEventListener('click', function() {
                const trackId = this.getAttribute('data-track');
                const parts = trackId.split('-');
                const category = parts[0];
                const location = parts[1] || 'unknown';
                trackClick(category, 'click', location);
            });
        });
    }

    // ============================================
    // Lead Capture Modal
    // ============================================
    function initLeadModal() {
        const modal = document.getElementById('leadModal');
        const modalClose = document.getElementById('modalClose');
        const modalTitle = document.getElementById('modalTitle');
        const modalSubtitle = document.getElementById('modalSubtitle');
        const leadForm = document.getElementById('leadForm');
        const selectedServiceInput = document.getElementById('selectedService');
        const selectedPackageInput = document.getElementById('selectedPackage');

        if (!modal || !leadForm) return;

        // Form field references
        const nameInput = document.getElementById('leadName');
        const phoneInput = document.getElementById('leadPhone');
        const emailInput = document.getElementById('leadEmail');

        // Pre-fill form with saved contact info
        function prefillForm() {
            const contact = UserPrefs.getContact();
            if (contact.name) nameInput.value = contact.name;
            if (contact.phone) phoneInput.value = contact.phone;
            if (contact.email) emailInput.value = contact.email;
        }

        // Open modal when clicking a package
        document.querySelectorAll('.package[data-package]').forEach(pkg => {
            pkg.addEventListener('click', function() {
                const service = this.getAttribute('data-service');
                const packageName = this.getAttribute('data-package');

                // Save interest to localStorage
                UserPrefs.saveInterest(service, packageName);

                // Update hidden fields
                selectedServiceInput.value = service;
                selectedPackageInput.value = packageName;

                // Update modal title
                modalTitle.textContent = `Get Started with ${packageName}`;
                modalSubtitle.textContent = `Fill in your details for ${service} - ${packageName}`;

                // Pre-fill form with saved data
                prefillForm();

                // Show modal (uses 'active' class which CSS targets via .modal-overlay.active)
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Focus first input for accessibility
                setTimeout(() => nameInput.focus(), 100);
            });
        });

        // Close modal functions
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        modalClose.addEventListener('click', closeModal);

        // Close on overlay click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Form submission
        leadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const email = emailInput.value.trim();
            const message = document.getElementById('leadMessage').value.trim();
            const service = selectedServiceInput.value;
            const packageName = selectedPackageInput.value;

            // Save contact info for future visits
            UserPrefs.saveContact(name, phone, email);

            // Save lead to database/Google Sheets (fire and forget - don't wait)
            const leadData = {
                name,
                phone,
                email,
                message,
                service,
                package: packageName
            };
            LeadCapture.save(leadData); // No await - runs in parallel with WhatsApp

            // Build WhatsApp message
            let waMessage = `Hello! I'm interested in your services.\n\n`;
            waMessage += `*Service:* ${service}\n`;
            waMessage += `*Package:* ${packageName}\n\n`;
            waMessage += `*My Details:*\n`;
            waMessage += `Name: ${name}\n`;
            waMessage += `Phone: ${phone}\n`;
            if (email) waMessage += `Email: ${email}\n`;
            if (message) waMessage += `\n*Additional Info:*\n${message}`;

            // Open WhatsApp
            const waLink = CONFIG.getWhatsAppLink(waMessage);
            window.open(waLink, '_blank');

            // Close modal and reset form
            closeModal();
            leadForm.reset();
        });
    }

    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    function initScrollAnimations() {
        // Elements to animate on scroll
        const animatedElements = document.querySelectorAll(
            '.service-block, .service-card, .package, .step, .faq-item, ' +
            '.testimonial, .contact-card, .credential-list li, .section-title'
        );

        // Add animation classes
        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
        });

        // Create intersection observer
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animated elements
        animatedElements.forEach(el => {
            observer.observe(el);
        });

        // Add staggered delays for grid items (fast stagger)
        const packageGrids = document.querySelectorAll('.package-grid');
        packageGrids.forEach(grid => {
            const packages = grid.querySelectorAll('.package');
            packages.forEach((pkg, index) => {
                pkg.style.transitionDelay = `${index * 0.05}s`;
            });
        });

        const stepContainers = document.querySelectorAll('.process-steps');
        stepContainers.forEach(container => {
            const steps = container.querySelectorAll('.step');
            steps.forEach((step, index) => {
                step.style.transitionDelay = `${index * 0.06}s`;
            });
        });

        // Add number counting animation for stats
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const text = stat.textContent;
            const number = parseInt(text);
            if (!isNaN(number)) {
                stat.setAttribute('data-target', text);
                animateCounter(stat, number, text.includes('+'));
            }
        });
    }

    // Animate counter numbers
    function animateCounter(element, target, hasPlus) {
        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (hasPlus ? '+' : '%');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (hasPlus ? '+' : '%');
            }
        }, 16);
    }

    // Start loading sections
    loadSections();

})();
