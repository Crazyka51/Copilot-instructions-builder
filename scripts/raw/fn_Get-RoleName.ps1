
    Function Get-RoleName([string]$domain) {
        switch -Regex ($domain) {
            'E-shop'            { return "Full Stack E-commerce Developer" }
            'Marketplace'       { return "Full Stack Marketplace Developer" }
            'SaaS'              { return "Full Stack SaaS Developer" }
            'Rezerva|Booking'   { return "Full Stack Developer pro rezervační systémy" }
            'LMS'               { return "Full Stack EdTech Developer" }
            'CRM'               { return "Full Stack Developer pro interní nástroje" }
            'Blog|Magazín'      { return "Full Stack Web Developer se zaměřením na obsah a SEO" }
            'Portfolio'         { return "Frontend Developer se zaměřením na výkon a SEO" }
            'Sociální'          { return "Full Stack Developer pro komunitní platformy" }
            default             { return "Full Stack Developer" }
        }
    }