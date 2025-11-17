import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Save } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, userRole, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [laborProfile, setLaborProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    daily_wage: "",
    experience_years: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    setProfile(profileData);

    if (userRole === "laborer") {
      const { data: laborData } = await supabase
        .from("labor_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (laborData) {
        setLaborProfile(laborData);
        setFormData({
          daily_wage: laborData.daily_wage?.toString() || "",
          experience_years: laborData.experience_years?.toString() || "",
        });
      }
    }
  };

  const updateLaborProfile = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("labor_profiles")
      .update({
        daily_wage: formData.daily_wage ? parseFloat(formData.daily_wage) : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      })
      .eq("user_id", user?.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      fetchProfile();
    }
  };

  const addSkill = async () => {
    if (!skillInput.trim()) return;

    const currentSkills = laborProfile?.skills || [];
    const updatedSkills = [...currentSkills, skillInput.trim()];

    const { error } = await supabase
      .from("labor_profiles")
      .update({ skills: updatedSkills })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSkillInput("");
      fetchProfile();
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    const updatedSkills = laborProfile?.skills.filter((s: string) => s !== skillToRemove);

    const { error } = await supabase
      .from("labor_profiles")
      .update({ skills: updatedSkills })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchProfile();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Basic Info Card */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <p className="text-foreground">{profile?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-foreground">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <p className="text-foreground">{profile?.phone}</p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Badge variant="default" className="capitalize">
                {userRole}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Laborer-specific Profile */}
        {userRole === "laborer" && (
          <>
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>Update your work information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_wage">Daily Wage (₹)</Label>
                  <Input
                    id="daily_wage"
                    type="number"
                    placeholder="500"
                    value={formData.daily_wage}
                    onChange={(e) => setFormData({ ...formData, daily_wage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="5"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  />
                </div>
                <Button onClick={updateLaborProfile} disabled={loading} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Add your farming skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Harvesting, Sowing, etc."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>
                {laborProfile?.skills && laborProfile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {laborProfile.skills.map((skill: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Logout Button */}
        <Button onClick={signOut} variant="destructive" className="w-full gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
