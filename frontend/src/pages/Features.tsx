import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Brain,
  Cpu,
  Database,
  Shield,
  Zap,
  BarChart3,
  Lock,
  Globe,
  Code,
  Layers,
  GitBranch,
  Monitor
} from "lucide-react";
import { Card } from "@/components/ui/card";

const modelFeatures = [
  {
    name: "EfficientNetB0",
    accuracy: "98.5%",
    speed: "45ms",
    description: "Lightweight architecture optimized for edge deployment with exceptional accuracy.",
    strengths: ["Low latency", "Mobile-ready", "Resource efficient"],
  },
  {
    name: "VGG16",
    accuracy: "97.2%",
    speed: "67ms",
    description: "Deep convolutional network with proven track record in image classification.",
    strengths: ["High precision", "Robust features", "Well-validated"],
  },
  {
    name: "Custom CNN",
    accuracy: "99.1%",
    speed: "52ms",
    description: "Proprietary architecture specifically trained on deepfake datasets.",
    strengths: ["Specialized detection", "Adaptive learning", "Continuous improvement"],
  },
];

const technicalFeatures = [
  {
    icon: Layers,
    title: "Ensemble Architecture",
    description: "Combines multiple AI models using weighted voting for maximum accuracy and reliability.",
  },
  {
    icon: BarChart3,
    title: "Grad-CAM Visualization",
    description: "Provides visual explanations showing which regions influenced the detection decision.",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Track model versions and rollback capabilities for consistent performance.",
  },
  {
    icon: Database,
    title: "Batch Processing",
    description: "Process thousands of images simultaneously with optimized GPU utilization.",
  },
  {
    icon: Code,
    title: "RESTful API",
    description: "Simple integration with comprehensive documentation and client libraries.",
  },
  {
    icon: Monitor,
    title: "Real-time Monitoring",
    description: "Dashboard with analytics, performance metrics, and detection statistics.",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 mesh-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold mb-6">
              <span className="gradient-text">Enterprise-Grade</span>
              <br />
              <span className="text-foreground">Detection Technology</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Powered by state-of-the-art AI ensemble models with explainable results
            </p>
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full mb-4">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Models</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
              Ensemble Detection Models
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three specialized models working in harmony for unmatched accuracy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modelFeatures.map((model, index) => (
              <Card key={index} className="glass-effect border-border/50 p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Cpu className="h-8 w-8 text-primary" />
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{model.accuracy}</div>
                    <div className="text-xs text-muted-foreground">accuracy</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{model.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Processing: {model.speed}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {model.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">{strength}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Technical Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
              Built for Scale & Security
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise infrastructure designed for mission-critical deployments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="glass-effect rounded-lg p-6 hover:border-primary/50 transition-colors">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="gradient-border rounded-2xl">
            <div className="bg-card rounded-[calc(1rem-1px)] p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full mb-4">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Security</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
                    Enterprise Security Standards
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Built with security-first architecture meeting the highest compliance standards
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">SOC 2 Type II Certified</h4>
                        <p className="text-sm text-muted-foreground">
                          Audited security controls and operational procedures
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">End-to-End Encryption</h4>
                        <p className="text-sm text-muted-foreground">
                          AES-256 encryption for data at rest and in transit
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">GDPR Compliant</h4>
                        <p className="text-sm text-muted-foreground">
                          Full compliance with global data protection regulations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl" />
                  <Card className="glass-effect border-primary/50 p-8 relative">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Encryption</span>
                        <span className="text-sm font-semibold">AES-256</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Compliance</span>
                        <span className="text-sm font-semibold">SOC 2, GDPR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uptime SLA</span>
                        <span className="text-sm font-semibold">99.99%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data Retention</span>
                        <span className="text-sm font-semibold">Zero-retention</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Authentication</span>
                        <span className="text-sm font-semibold">SSO, MFA</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}