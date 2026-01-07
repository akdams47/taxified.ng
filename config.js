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

    // Social Links (add as needed)
    social: {
        // twitter: 'https://twitter.com/taxified_ng',
        // instagram: 'https://instagram.com/taxified_ng',
        // linkedin: 'https://linkedin.com/company/taxified-ng'
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
