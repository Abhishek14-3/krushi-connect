import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, User, DollarSign, Award } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LaborerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("labor_profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setProfile(data);
      setIsAvailable(data.is_available);
    }
  };

  const toggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    
    const { error } = await supabase
      .from("labor_profiles")
      .update({ is_available: checked })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
      setIsAvailable(!checked);
    } else {
      toast({
        title: "Availability Updated",
        description: checked ? "You are now available for work" : "You are now unavailable for work",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Laborer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and find work</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Availability Toggle */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Work Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="availability" className="text-base font-medium">
                  Available for Work
                </Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to let farmers know you're available
                </p>
              </div>
              <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Daily Wage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {profile?.daily_wage ? `₹${profile.daily_wage}` : "Not set"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {profile?.experience_years || 0} years
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={profile?.is_verified ? "default" : "secondary"}>
                {profile?.is_verified ? "Verified" : "Not Verified"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Skills Card */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle>My Skills</CardTitle>
            <CardDescription>Skills you can offer to farmers</CardDescription>
          </CardHeader>
          <CardContent>
            {!profile?.skills || profile.skills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No skills added yet</p>
                <Button asChild variant="outline">
                  <a href="/profile">Add Skills</a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Profile CTA */}
        {(!profile?.daily_wage || !profile?.skills || profile.skills.length === 0) && (
          <Card className="border-primary bg-primary/5 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your skills and daily wage to attract more opportunities
                </p>
                <Button asChild>
                  <a href="/profile">Complete Profile</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Board */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Available Jobs
            </CardTitle>
            <CardDescription>Find work opportunities from farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Job board feature coming soon!
              </p>
              <p className="text-xs text-muted-foreground">
                Farmers will be able to post job requirements that match your skills
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default LaborerDashboard;
