import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold mb-6">
              <span className="gradient-text">Get in Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to protect your organization from deepfakes? Let's talk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="glass-effect border-border/50 p-8">
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Your Name" required />
                <Input type="email" placeholder="Email Address" required />
                <Input placeholder="Company" />
                <Textarea placeholder="Tell us about your needs..." rows={4} required />
                <Button type="submit" className="w-full bg-gradient-primary">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="glass-effect border-border/50 p-6">
                <Mail className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">contact@authenticitynet.ai</p>
              </Card>
              
              <Card className="glass-effect border-border/50 p-6">
                <Phone className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">1-800-DETECT-AI</p>
              </Card>
              
              <Card className="glass-effect border-border/50 p-6">
                <MapPin className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Office</h3>
                <p className="text-muted-foreground">San Francisco, CA 94105</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}