import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";
import { 
  Brain, 
  Shield, 
  Zap, 
  BarChart3, 
  Lock, 
  Globe,
  Users,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI Ensemble Models",
    description: "Leverages EfficientNetB0, VGG16, and Custom CNN with majority voting for 99.8% accuracy.",
  },
  {
    icon: Zap,
    title: "Real-time Detection",
    description: "Process images and videos in milliseconds with our optimized inference pipeline.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption and on-premise deployment options.",
  },
  {
    icon: BarChart3,
    title: "Explainable AI",
    description: "Grad-CAM heatmaps provide visual explanations of detection decisions.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Zero data retention policy with complete data sovereignty for your organization.",
  },
  {
    icon: Globe,
    title: "API Integration",
    description: "RESTful API with SDKs for Python, JavaScript, and major frameworks.",
  },
];

const stats = [
  { value: "99.8%", label: "Detection Accuracy" },
  { value: "<100ms", label: "Response Time" },
  { value: "500M+", label: "Images Analyzed" },
  { value: "Enterprise", label: "Grade Security" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
              <span className="gradient-text">Advanced Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology designed for enterprise-scale deepfake detection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="gradient-border rounded-2xl">
            <div className="bg-card rounded-[calc(1rem-1px)] p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
              <span className="gradient-text">Industry Applications</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Protecting organizations across sectors from synthetic media threats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-lg p-6 hover:border-primary/50 transition-colors">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Media & Journalism</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Verify authenticity of user-generated content and news footage in real-time.
              </p>
              <Link to="/use-cases" className="text-primary text-sm hover:underline">
                Learn more →
              </Link>
            </div>

            <div className="glass-effect rounded-lg p-6 hover:border-primary/50 transition-colors">
              <FileCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Legal & Compliance</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Authenticate digital evidence and maintain chain of custody for legal proceedings.
              </p>
              <Link to="/use-cases" className="text-primary text-sm hover:underline">
                Learn more →
              </Link>
            </div>

            <div className="glass-effect rounded-lg p-6 hover:border-primary/50 transition-colors">
              <AlertTriangle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Financial Services</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Prevent identity fraud and protect against synthetic identity attacks.
              </p>
              <Link to="/use-cases" className="text-primary text-sm hover:underline">
                Learn more →
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/use-cases">
                Explore All Use Cases
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="glass-effect rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
                Ready to Protect Your Organization?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join leading enterprises using AuthenticityNet to combat deepfakes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-primary" asChild>
                  <Link to="/demo">
                    Try Live Demo
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}