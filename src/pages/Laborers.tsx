import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Award, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const Laborers = () => {
  const [laborers, setLaborers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaborers();
  }, []);

  const fetchLaborers = async () => {
    const { data } = await supabase
      .from("labor_profiles")
      .select("*, profiles(name, phone)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    setLaborers(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Hire Labor
          </h1>
          <p className="text-sm text-muted-foreground">Find skilled workers for your farm</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {laborers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No laborers available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {laborers.map((laborer) => (
              <Card key={laborer.id} className="border-border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{laborer.profiles?.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        {laborer.is_verified && (
                          <Badge variant="default" className="gap-1">
                            <Award className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Daily Wage</span>
                      <span className="text-lg font-bold text-primary">
                        {laborer.daily_wage ? `₹${laborer.daily_wage}` : "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Experience</span>
                      <span className="text-sm font-medium">
                        {laborer.experience_years ? `${laborer.experience_years} years` : "Not specified"}
                      </span>
                    </div>
                  </div>

                  {laborer.skills && laborer.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {laborer.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full gap-2" variant="default">
                    <Phone className="h-4 w-4" />
                    Contact: {laborer.profiles?.phone}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Laborers;
