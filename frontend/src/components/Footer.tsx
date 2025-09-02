import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", path: "/features" },
    { name: "Use Cases", path: "/use-cases" },
    { name: "Demo", path: "/demo" },
    { name: "Pricing", path: "/pricing" },
  ],
  company: [
    { name: "Contact", path: "/contact" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ],
  resources: [
    { name: "Documentation", path: "/docs" },
    { name: "API Reference", path: "/api" },
    { name: "Blog", path: "/blog" },
    { name: "Support", path: "/support" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/50">
      <div className="absolute inset-0 mesh-gradient opacity-10" />
      <div className="container relative mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-space text-xl font-bold gradient-text">
                AuthenticityNet
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Enterprise-grade deepfake detection powered by advanced AI ensemble models. 
              Protecting truth in the age of synthetic media.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <a
                href="mailto:contact@authenticitynet.ai"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>contact@authenticitynet.ai</span>
              </a>
              <a
                href="tel:+1-800-DETECT-AI"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>1-800-DETECT-AI</span>
              </a>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 AuthenticityNet. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}