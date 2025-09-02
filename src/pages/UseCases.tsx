import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Users,
  FileCheck,
  AlertTriangle,
  Building2,
  GraduationCap,
  Heart,
  Briefcase,
  Shield,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const useCases = [
  {
    icon: Users,
    industry: "Media & Journalism",
    title: "Verify News Authenticity",
    description: "Combat misinformation by instantly verifying user-generated content, news footage, and social media posts.",
    challenges: [
      "Viral deepfake videos spreading misinformation",
      "Manipulated political content",
      "Fake celebrity scandals"
    ],
    benefits: [
      "Real-time content verification",
      "Maintain editorial integrity",
      "Protect brand reputation"
    ]
  },
  {
    icon: FileCheck,
    industry: "Legal & Compliance",
    title: "Authenticate Digital Evidence",
    description: "Ensure the integrity of digital evidence for legal proceedings and maintain proper chain of custody.",
    challenges: [
      "Fabricated evidence in court cases",
      "Insurance fraud with manipulated images",
      "Identity verification challenges"
    ],
    benefits: [
      "Court-admissible verification reports",
      "Tamper-proof audit trails",
      "Expert witness support"
    ]
  },
  {
    icon: AlertTriangle,
    industry: "Financial Services",
    title: "Prevent Identity Fraud",
    description: "Protect against synthetic identity attacks and deepfake-based financial fraud attempts.",
    challenges: [
      "Account takeover attempts",
      "KYC bypass with fake documents",
      "Video call impersonation"
    ],
    benefits: [
      "Enhanced KYC/AML compliance",
      "Reduced fraud losses",
      "Improved customer trust"
    ]
  },
  {
    icon: Building2,
    industry: "Corporate Security",
    title: "Protect Executive Communications",
    description: "Safeguard against deepfake impersonation of executives and corporate espionage attempts.",
    challenges: [
      "CEO fraud and BEC attacks",
      "Fake executive announcements",
      "Corporate reputation attacks"
    ],
    benefits: [
      "Secure communication verification",
      "Crisis prevention",
      "Stakeholder confidence"
    ]
  },
  {
    icon: GraduationCap,
    industry: "Education",
    title: "Academic Integrity",
    description: "Maintain authenticity in remote learning environments and online examinations.",
    challenges: [
      "Identity fraud in online exams",
      "Fake credentials and certificates",
      "Impersonation in video submissions"
    ],
    benefits: [
      "Secure remote proctoring",
      "Credential verification",
      "Academic standard maintenance"
    ]
  },
  {
    icon: Heart,
    industry: "Healthcare",
    title: "Telehealth Security",
    description: "Verify patient and provider identities in telehealth consultations and medical records.",
    challenges: [
      "Medical identity theft",
      "Prescription fraud",
      "False medical records"
    ],
    benefits: [
      "HIPAA-compliant verification",
      "Patient safety assurance",
      "Reduced liability risks"
    ]
  }
];

const caseStudies = [
  {
    company: "Global News Network",
    industry: "Media",
    result: "Prevented 12 major misinformation campaigns",
    metric: "99.9% accuracy in live broadcasts"
  },
  {
    company: "Fortune 500 Bank",
    industry: "Finance",
    result: "Saved $45M in prevented fraud",
    metric: "87% reduction in identity fraud"
  },
  {
    company: "International Law Firm",
    industry: "Legal",
    result: "100+ cases with verified evidence",
    metric: "Zero false positives in court"
  }
];

export default function UseCases() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 mesh-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold mb-6">
              <span className="gradient-text">Industry Solutions</span>
              <br />
              <span className="text-foreground">For Every Sector</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Protecting organizations across industries from the growing threat of synthetic media
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="glass-effect border-border/50 p-6 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <useCase.icon className="h-8 w-8 text-primary" />
                    <div className="absolute inset-0 h-8 w-8 bg-primary/30 blur-lg" />
                  </div>
                  <div>
                    <div className="text-xs text-primary font-medium mb-1">
                      {useCase.industry}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {useCase.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {useCase.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">CHALLENGES</h4>
                    <ul className="space-y-1">
                      {useCase.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-destructive mt-1">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">BENEFITS</h4>
                    <ul className="space-y-1">
                      {useCase.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-primary mt-1">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/contact">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full mb-4">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
              Proven Results Across Industries
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real organizations achieving real protection against deepfake threats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {caseStudies.map((study, index) => (
              <div key={index} className="gradient-border rounded-lg">
                <div className="bg-card rounded-[calc(0.5rem-1px)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">{study.industry}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{study.company}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{study.result}</p>
                  <div className="text-2xl font-bold gradient-text">{study.metric}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-primary" asChild>
              <Link to="/contact">
                Get Your Custom Solution
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Custom Solutions CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="glass-effect border-primary/50 p-12 text-center">
            <h2 className="text-3xl font-space font-bold mb-4">
              Don't See Your Industry?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              We provide custom solutions tailored to your specific industry needs and compliance requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  Try Demo
                </Link>
              </Button>
              <Button size="lg" className="bg-gradient-primary" asChild>
                <Link to="/contact">
                  Contact Our Experts
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}