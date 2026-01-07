/**
 * Taxified.ng - Main JavaScript
 * Loads sections dynamically and handles interactivity
 */

(function() {
    'use strict';

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
        initNavigation();
        initScrollEffects();
        initSmoothScroll();
        initClickTracking();
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
                el.textContent = value;
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
            if (typeof gtag === 'function') {
                gtag('event', action, {
                    'event_category': category,
                    'event_label': label
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

    // Start loading sections
    loadSections();

})();
