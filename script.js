/**
 * Cups & Chapters: site interactions
 * Vanilla JS, no dependencies.
 */

// Paste the deployed Google Apps Script Web App URL here to send waitlist
// signups to the private Google Sheet. Leave empty to keep using Formspree.
// Setup: waitlist/README.md
const COFFEE_WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/AKfycbybLTc0dJvgZL5pyVlMZBjCHNbs7jKFKQArijdRlWbTmjt6WpzP_lAfxYObM7G9fhWo/exec';

document.addEventListener('DOMContentLoaded', () => {

    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const backToTopBtn = document.getElementById('back-to-top');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Send the coffee waitlist to the Google Sheet once its Web App URL is set
    const coffeeWaitlistForm = document.querySelector('#coffee-waitlist form');
    if (coffeeWaitlistForm && COFFEE_WAITLIST_ENDPOINT.trim()) {
        coffeeWaitlistForm.setAttribute('action', COFFEE_WAITLIST_ENDPOINT.trim());
    }

    // ==========================================
    // THEME (light / dark)
    // ==========================================

    let currentTheme = 'light';
    try { currentTheme = localStorage.getItem('theme') || 'light'; } catch (error) {}
    html.setAttribute('data-theme', currentTheme);

    const syncThemeUi = () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute('content', isDark ? '#191512' : '#F7F1E4');
    };
    syncThemeUi();

    themeToggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        try { localStorage.setItem('theme', newTheme); } catch (error) {}
        syncThemeUi();
    });

    // ==========================================
    // MOBILE MENU
    // ==========================================

    const closeMobileMenu = () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Open menu');
        navMenu.classList.remove('active');
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
    };

    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
        mobileMenuToggle.setAttribute('aria-label', isExpanded ? 'Open menu' : 'Close menu');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open', !isExpanded);
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Tapping the dimmed area outside the menu closes it
    document.addEventListener('click', event => {
        if (!navMenu.classList.contains('active')) return;
        if (navMenu.contains(event.target) || mobileMenuToggle.contains(event.target)) return;
        closeMobileMenu();
    });

    // Close the menu if the viewport grows past the mobile breakpoint
    window.matchMedia('(min-width: 981px)').addEventListener('change', event => {
        if (event.matches) closeMobileMenu();
    });

    // ==========================================
    // NAVBAR + ACTIVE SECTION
    // ==========================================

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const highlightNav = () => {
        const marker = 130;
        let activeId = '';

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= marker && rect.bottom > marker) {
                activeId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === activeId);
        });
    };

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        backToTopBtn.classList.toggle('visible', window.scrollY > 500);
        highlightNav();
    }, { passive: true });

    // Initial state on load / refresh mid-page
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    backToTopBtn.classList.toggle('visible', window.scrollY > 500);
    highlightNav();

    // ==========================================
    // SCROLL REVEAL
    // ==========================================

    const revealElements = document.querySelectorAll('.fade-in-up');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // ==========================================
    // BACK TO TOP
    // ==========================================

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    // ==========================================
    // SMOOTH SCROLL FOR IN-PAGE LINKS
    // ==========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            // Let the skip link move focus the way browsers expect
            if (this.classList.contains('skip-link')) return;

            const href = this.getAttribute('href');

            // Placeholder links should not jump the page to the top
            if (!href || href === '#') {
                event.preventDefault();
                return;
            }

            const target = document.getElementById(href.slice(1));
            if (!target) return;

            event.preventDefault();
            const navHeight = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10
            ) || 78;
            const headerOffset = navHeight + 14;
            const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    // ==========================================
    // KEYBOARD NAVIGATION
    // ==========================================

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
            mobileMenuToggle.focus();
        }
    });

    // ==========================================
    // FOOTER YEAR
    // ==========================================

    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
