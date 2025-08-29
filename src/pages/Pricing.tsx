import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Developer",
    price: "$299",
    period: "/month",
    description: "Perfect for testing and small-scale deployments",
    features: [
      "1,000 API calls/month",
      "Basic detection models",
      "Email support",
      "API documentation",
      "SSL encryption",
    ],
    notIncluded: [
      "Grad-CAM heatmaps",
      "Custom model training",
      "Priority support",
      "On-premise deployment",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Business",
    price: "$999",
    period: "/month",
    description: "For growing organizations with moderate detection needs",
    features: [
      "10,000 API calls/month",
      "All detection models",
      "Grad-CAM heatmaps",
      "Priority email support",
      "99.9% uptime SLA",
      "Advanced analytics",
      "Batch processing",
    ],
    notIncluded: [
      "Custom model training",
      "On-premise deployment",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for large-scale deployments",
    features: [
      "Unlimited API calls",
      "All detection models",
      "Grad-CAM heatmaps",
      "24/7 phone support",
      "99.99% uptime SLA",
      "Custom model training",
      "On-premise deployment",
      "Dedicated account manager",
      "Custom integrations",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold mb-6">
              <span className="gradient-text">Simple, Transparent</span>
              <br />
              <span className="text-foreground">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your detection needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative p-8 ${
                  plan.highlighted
                    ? "gradient-border scale-105"
                    : "glass-effect border-border/50"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-xs font-semibold text-primary-foreground">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={plan.highlighted ? "bg-card rounded-[calc(var(--radius)-1px)]" : ""}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-4">
                      <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 opacity-50">
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      plan.highlighted ? "bg-gradient-primary" : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/contact">{plan.cta}</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}