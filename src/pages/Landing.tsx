import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Package, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <img 
          src={heroImage} 
          alt="Agriculture field" 
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
        />
        
        <div className="relative px-4 py-20 text-center md:py-32">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
              Krushi Sathi
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Your Complete Agriculture Marketplace
            </p>
            <p className="mb-10 text-base text-white/80 md:text-lg">
              Connect with farmers, equipment sellers, and skilled laborers. 
              Rent farm equipment, hire workers, and buy quality agricultural products.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link to="/auth">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="gap-2 shadow-lg">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need in One Place
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden border-border shadow-md transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <Sprout className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">For Farmers</h3>
                <p className="text-muted-foreground">
                  Rent equipment, hire skilled laborers, and buy quality seeds and fertilizers.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border shadow-md transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-accent/10 p-3">
                  <Package className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">For Sellers</h3>
                <p className="text-muted-foreground">
                  List your equipment, manage bookings, and earn from your agricultural assets.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border shadow-md transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">For Laborers</h3>
                <p className="text-muted-foreground">
                  Find work opportunities, showcase your skills, and connect with farmers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of farmers, sellers, and laborers already using Krushi Sathi
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              Create Your Account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
