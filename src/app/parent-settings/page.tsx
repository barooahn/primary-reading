"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  User,
  BookOpen,
  Target,
  Save,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

function ParentSettingsContent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Form state - in production this would come from user metadata
  const [childSettings, setChildSettings] = useState({
    displayName: user?.user_metadata?.display_name || "",
    age: "7",
    grade: "2",
    readingLevel: "intermediate",
    dailyGoal: "15",
    pin: "1234",
    allowedTopics: "all",
    difficultyMode: "adaptive",
    notes: "",
  });

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate saving
    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setChildSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check for message from URL params
  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
      // Clear message after 10 seconds
      const timer = setTimeout(() => setMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <>
      {/* Custom styling for parent theme on this page */}
      <style jsx global>{`
        /* Target all select dropdown options specifically */
        .parent-settings-container [role="option"] {
          transition: all 0.2s ease !important;
        }

        /* Override hover and focus states for select options */
        .parent-settings-container [role="option"]:hover,
        .parent-settings-container [role="option"][data-highlighted],
        .parent-settings-container [role="option"].focus\\:bg-accent:focus {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }

        /* Additional specificity to override any accent colors */
        .parent-settings-container [data-radix-select-item]:hover,
        .parent-settings-container [data-radix-select-item][data-highlighted=""],
        .parent-settings-container [data-radix-collection-item][data-highlighted=""],
        .parent-settings-container [data-radix-collection-item][data-highlighted] {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }

        /* Override checked/selected state */
        .parent-settings-container [role="option"][data-state="checked"],
        .parent-settings-container [role="option"][aria-selected="true"] {
          background-color: rgb(11 166 223 / 0.15) !important;
          color: rgb(11 166 223) !important;
        }

        /* Override checked + hover combination */
        .parent-settings-container [role="option"][data-state="checked"]:hover,
        .parent-settings-container [role="option"][data-state="checked"][data-highlighted] {
          background-color: rgb(11 166 223 / 0.2) !important;
          color: rgb(11 166 223) !important;
        }

        /* Override specific Tailwind classes that might be causing orange */
        .parent-settings-container .focus\\:bg-accent:focus {
          background-color: rgb(11 166 223 / 0.1) !important;
        }

        .parent-settings-container .focus\\:text-accent-foreground:focus {
          color: rgb(11 166 223) !important;
        }

        /* Target select triggers */
        .parent-settings-container [data-radix-select-trigger] {
          border-color: rgb(11 166 223 / 0.2) !important;
        }
        .parent-settings-container [data-radix-select-trigger]:focus {
          border-color: rgb(11 166 223) !important;
          box-shadow: 0 0 0 3px rgb(11 166 223 / 0.2) !important;
        }

        /* Target select content */
        .parent-settings-container [data-radix-select-content] {
          border-color: rgb(11 166 223 / 0.2) !important;
        }

        /* Target input and textarea focus states */
        .parent-settings-container input:focus {
          border-color: rgb(11 166 223) !important;
          box-shadow: 0 0 0 3px rgb(11 166 223 / 0.2) !important;
        }
        .parent-settings-container textarea:focus {
          border-color: rgb(11 166 223) !important;
          box-shadow: 0 0 0 3px rgb(11 166 223 / 0.2) !important;
        }

        /* Nuclear option - override any potential orange colors */
        .parent-settings-container [class*="text-student"],
        .parent-settings-container [style*="239, 119, 34"] {
          color: rgb(11 166 223) !important;
        }
        .parent-settings-container [class*="bg-student"],
        .parent-settings-container [style*="background-color: rgb(239, 119, 34)"],
        .parent-settings-container [style*="background: rgb(239, 119, 34)"] {
          background-color: rgb(11 166 223 / 0.1) !important;
        }
        .parent-settings-container [class*="border-student"] {
          border-color: rgb(11 166 223 / 0.2) !important;
        }

        /* Override accent/orange from global CSS variables */
        .parent-settings-container * {
          --color-accent: rgb(11 166 223) !important;
          --accent: rgb(11 166 223) !important;
        }

        /* Catch all Radix Select variants and states */
        .parent-settings-container [data-radix-collection-item]:hover,
        .parent-settings-container [data-radix-collection-item][data-highlighted],
        .parent-settings-container .bg-accent,
        .parent-settings-container .hover\\:bg-accent:hover,
        .parent-settings-container .focus\\:bg-accent:focus {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }

        /* Override any orange (#EF7722) colors specifically */
        .parent-settings-container [style*="#EF7722"],
        .parent-settings-container [style*="rgb(239, 119, 34)"] {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }

        /* Most specific fix for the exact data-highlighted pattern found */
        .parent-settings-container [role="option"][data-highlighted=""],
        .parent-settings-container [role="option"][data-highlighted],
        .parent-settings-container div[role="option"][data-highlighted=""],
        .parent-settings-container div[role="option"][data-highlighted] {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }

        /* Ultra-specific override for Tailwind's focus:bg-accent class */
        .parent-settings-container div[role="option"].focus\\:bg-accent[data-highlighted],
        .parent-settings-container div[role="option"].focus\\:bg-accent[data-highlighted=""],
        .parent-settings-container .relative.flex.focus\\:bg-accent[data-highlighted],
        .parent-settings-container .relative.flex.focus\\:bg-accent[data-highlighted=""] {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }

        /* Force override with data-state and more specific targeting */
        .parent-settings-container div[role="option"][data-state="unchecked"][data-highlighted],
        .parent-settings-container div[role="option"][data-state="unchecked"][data-highlighted=""] {
          background-color: rgb(11 166 223 / 0.1) !important;
          color: rgb(11 166 223) !important;
        }
      `}</style>
      <div className="parent-settings-container min-h-screen bg-gradient-to-br from-parent-light to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      <div className="mx-auto px-4 py-8 max-w-4xl" style={{ width: '100%', maxWidth: 'min(1024px, calc(100vw - 2rem))' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-parent-light rounded-lg">
              <Shield className="h-6 w-6 text-parent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-parent dark:text-white">
                Parent Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your child&apos;s reading experience
              </p>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-500 rounded-full flex-shrink-0" />
              <p className="text-blue-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Child Information */}
          <Card className="dashboard-card border-parent-border bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-parent" />
                Child Information
              </CardTitle>
              <CardDescription>
                Basic information about your child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Child&apos;s Name</Label>
                <Input
                  id="displayName"
                  value={childSettings.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  placeholder="Enter your child&apos;s name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Select
                    value={childSettings.age}
                    onValueChange={(value) => handleInputChange("age", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 years old</SelectItem>
                      <SelectItem value="6">6 years old</SelectItem>
                      <SelectItem value="7">7 years old</SelectItem>
                      <SelectItem value="8">8 years old</SelectItem>
                      <SelectItem value="9">9 years old</SelectItem>
                      <SelectItem value="10">10 years old</SelectItem>
                      <SelectItem value="11">11 years old</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select
                    value={childSettings.grade}
                    onValueChange={(value) => handleInputChange("grade", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K">Kindergarten</SelectItem>
                      <SelectItem value="1">1st Grade</SelectItem>
                      <SelectItem value="2">2nd Grade</SelectItem>
                      <SelectItem value="3">3rd Grade</SelectItem>
                      <SelectItem value="4">4th Grade</SelectItem>
                      <SelectItem value="5">5th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Settings */}
          <Card className="dashboard-card border-parent-border bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-parent" />
                Reading Settings
              </CardTitle>
              <CardDescription>
                Customize the reading experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="readingLevel">Reading Level</Label>
                <Select
                  value={childSettings.readingLevel}
                  onValueChange={(value) => handleInputChange("readingLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyGoal">Daily Reading Goal (minutes)</Label>
                <Select
                  value={childSettings.dailyGoal}
                  onValueChange={(value) => handleInputChange("dailyGoal", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyMode">Difficulty Mode</Label>
                <Select
                  value={childSettings.difficultyMode}
                  onValueChange={(value) => handleInputChange("difficultyMode", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Build Confidence</SelectItem>
                    <SelectItem value="adaptive">Adaptive - Balanced Growth</SelectItem>
                    <SelectItem value="challenge">Challenge - Push Limits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="dashboard-card border-parent-border bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-parent" />
                Security & Access
              </CardTitle>
              <CardDescription>
                Manage access and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder="parent@email.com"
                />
                <p className="text-xs text-gray-500">
                  This is the email you used to sign in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">Parent PIN (4-6 digits)</Label>
                <Input
                  id="pin"
                  type="password"
                  value={childSettings.pin}
                  onChange={(e) => handleInputChange("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="1234"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">
                  Used to access parent settings and child data
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="dashboard-card border-parent-border bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-parent" />
                Additional Notes
              </CardTitle>
              <CardDescription>
                Special considerations or goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for Teachers/Tutors</Label>
                <Textarea
                  id="notes"
                  value={childSettings.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special learning needs, interests, or goals..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-parent hover:bg-parent-hover text-white px-8 py-2 text-lg font-medium min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : isSaved ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-parent rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full" />
                </div>
                Settings Saved!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </div>
            )}
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}

export default function ParentSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-parent-light to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-parent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ParentSettingsContent />
    </Suspense>
  );
}