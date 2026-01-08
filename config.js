/**
 * Taxified.ng - Site Configuration
 * Update contact info and site details here
 */

const CONFIG = {
    // Company Info
    company: {
        name: 'Taxified.ng',
        tagline: 'Expert tax filing and LLC registration services in Nigeria.',
        parent: 'DHUBs',
        year: 2025
    },

    // Hero Section
    hero: {
        headline: 'Get Expert Help. File Your Taxes. Start Your Business.',
        subtitle: 'We simplify tax compliance and business registration in Nigeria. Whether you\'re filing returns or launching your LLC, our team handles the paperwork so you can focus on what matters.'
    },

    // Contact Info
    contact: {
        phone: '+234 800 000 0000',
        phoneRaw: '2348000000000',
        email: 'info@taxified.ng',
        whatsappMessage: 'Hello, I have a question about your services'
    },

    // Stats (displayed on hero)
    stats: {
        years: '5+',
        clients: '500+',
        compliance: '100%'
    },

    // Operating Hours
    hours: {
        weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
        saturday: 'Saturday: 10:00 AM - 2:00 PM',
        sunday: 'Sunday: Closed'
    },

    // =============================================
    // PRICING PACKAGES
    // =============================================
    // Each package has these options:
    //
    //   show: true/false
    //      - true = package is visible (default)
    //      - false = package is completely hidden
    //
    //   showPrice: true/false
    //      - true = shows the actual price (e.g., ₦25,000)
    //      - false = shows "Contact for pricing" instead
    //
    //   featured: true/false
    //      - true = highlighted with "Popular" badge + blue styling
    //      - false = normal card styling
    //
    // =============================================
    pricing: {
        contactText: 'Contact for pricing',  // Text shown when showPrice: false

        taxFiling: {
            individual: {
                name: 'Individual',
                description: 'Personal tax filing',
                price: '₦25,000',
                priceNote: 'per filing',
                show: true,       // Set to false to hide this package
                showPrice: true,  // Set to false to hide price
                featured: false
            },
            starterBusiness: {
                name: 'Starter Business',
                description: 'Basic compliance',
                price: '₦75,000',
                priceNote: 'per year',
                show: true,
                showPrice: true,
                featured: true
            },
            growthBusiness: {
                name: 'Growth Business',
                description: 'Full compliance + advisory',
                price: '₦150,000',
                priceNote: 'per year',
                show: false,
                showPrice: true,
                featured: false
            }
        },
        llcRegistration: {
            basic: {
                name: 'Basic',
                description: 'Name reservation + incorporation',
                price: '₦85,000',
                priceNote: 'one-time',
                show: true,
                showPrice: true,
                featured: false
            },
            standard: {
                name: 'Standard',
                description: 'Incorporation + Full setup',
                price: '₦120,000',
                priceNote: 'one-time',
                show: true,
                showPrice: true,
                featured: true
            },
            premium: {
                name: 'Premium',
                description: 'Full setup + compliance support',
                price: '₦200,000',
                priceNote: 'one-time',
                show: false,
                showPrice: true,
                featured: false
            }
        }
    },

    // Social Links (uncomment and fill in to show icons in footer)
    social: {
         twitter: 'https://twitter.com/taxified_ng',
         instagram: 'https://instagram.com/taxified_ng',
         linkedin: 'https://linkedin.com/company/taxified-ng',
        // facebook: 'https://facebook.com/taxified.ng'
    },

    // Helper functions
    getWhatsAppLink(message) {
        const msg = message || this.contact.whatsappMessage;
        return `https://wa.me/${this.contact.phoneRaw}?text=${encodeURIComponent(msg)}`;
    },

    getEmailLink(subject) {
        const subj = subject || 'Inquiry - General';
        return `mailto:${this.contact.email}?subject=${encodeURIComponent(subj)}`;
    }
};
