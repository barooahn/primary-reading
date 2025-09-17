"use client";

import { useState } from "react";
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

export default function ParentSettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Form state - in production this would come from user metadata
  const [childSettings, setChildSettings] = useState({
    displayName: user?.user_metadata?.display_name || "",
    age: "7",
    grade: "2",
    readingLevel: "intermediate",
    dailyGoal: "15",
    parentEmail: user?.email || "",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Parent Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your child&apos;s reading experience
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Child Information */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
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
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
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
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
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
                  value={childSettings.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  placeholder="parent@email.com"
                />
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
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 text-lg font-medium min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : isSaved ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
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
  );
}