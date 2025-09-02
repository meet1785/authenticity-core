import { ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="container relative mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-effect rounded-full">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              99.8% Detection Accuracy with AI Ensemble
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-space font-bold mb-6 tracking-tight">
            <span className="gradient-text">Detect Deepfakes</span>
            <br />
            <span className="text-foreground">Protect Truth</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Enterprise-grade deepfake detection powered by advanced AI ensemble models. 
            Safeguard your organization from synthetic media threats with real-time analysis 
            and explainable AI insights.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90" asChild>
              <Link to="/demo">
                Try Live Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border/50" asChild>
              <Link to="/contact">
                Schedule Enterprise Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Real-time Detection</span>
            </div>
          </div>

          {/* Visual Demo Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl" />
            <div className="relative glass-effect rounded-lg p-1">
              <div className="bg-card rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">EfficientNetB0</div>
                    <div className="text-sm text-muted-foreground">98.5% Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">VGG16</div>
                    <div className="text-sm text-muted-foreground">97.2% Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">Custom CNN</div>
                    <div className="text-sm text-muted-foreground">99.1% Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}