/**
 * Taxified.ng - Main JavaScript
 * Handles navigation, smooth scrolling, and analytics tracking
 */

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu.querySelectorAll('a[href^="#"]');

    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    function toggleMobileNav() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    navToggle.addEventListener('click', toggleMobileNav);

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
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

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // FAQ Accordion Behavior
    // ============================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            if (this.open) {
                // Close other open items (optional - uncomment for single-open behavior)
                // faqItems.forEach(other => {
                //     if (other !== this && other.open) {
                //         other.open = false;
                //     }
                // });
            }
        });
    });

    // ============================================
    // Click Tracking for Analytics
    // ============================================
    function trackClick(category, action, label) {
        // Google Analytics 4
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }

        // Console log for debugging (remove in production)
        console.log('Track:', category, action, label);
    }

    // Track all elements with data-track attribute
    document.querySelectorAll('[data-track]').forEach(element => {
        element.addEventListener('click', function() {
            const trackId = this.getAttribute('data-track');
            const parts = trackId.split('-');
            const category = parts[0]; // e.g., 'whatsapp' or 'email'
            const location = parts[1] || 'unknown'; // e.g., 'hero', 'nav', 'contact'

            trackClick(category, 'click', location);
        });
    });

    // ============================================
    // Intersection Observer for Animations
    // ============================================
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe service blocks, testimonials, etc.
        document.querySelectorAll('.service-block, .testimonial, .stat').forEach(el => {
            observer.observe(el);
        });
    }

    // ============================================
    // Performance: Defer non-critical operations
    // ============================================
    window.addEventListener('load', function() {
        // Any post-load operations
    });

    // ============================================
    // Google Analytics Setup (placeholder)
    // ============================================
    // Replace 'G-XXXXXXXXXX' with your actual GA4 measurement ID
    /*
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
    */

})();
