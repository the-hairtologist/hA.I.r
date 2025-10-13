/**
 * AI Ad Generator
 * Create professional ads for hA.I.r using AI
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Copy, Download, Share2, Wand2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AdType = "social-media" | "landing-page" | "email" | "banner";

export default function AdGenerator() {
  const [prompt, setPrompt] = useState("");
  const [adType, setAdType] = useState<AdType>("social-media");
  const [generating, setGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<{
    copy: { headline: string; bodyCopy: string; cta: string };
    image?: string;
  } | null>(null);

  const handleGenerate = async (includeImage: boolean = false) => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to promote");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ad", {
        body: { 
          prompt: prompt.trim(), 
          adType,
          generateImage: includeImage 
        },
      });

      if (error) throw error;

      setGeneratedAd(data);
      toast.success(includeImage ? "Ad with image generated!" : "Ad copy generated!");
    } catch (error: any) {
      console.error("Ad generation error:", error);
      toast.error(error.message || "Failed to generate ad");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const adTypeExamples = {
    "social-media": "Perfect for Instagram, Facebook, TikTok",
    "landing-page": "Hero sections for your website",
    "email": "Email campaigns to your clients",
    "banner": "Display ads for web advertising",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Ad Generator</h1>
          <p className="text-muted-foreground">
            Create professional marketing content using AI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Generate Ad Content
            </CardTitle>
            <CardDescription>
              Describe what you want to promote and let AI create compelling ad copy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ad Type Selection */}
            <div className="space-y-2">
              <Label>Ad Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(adTypeExamples) as AdType[]).map((type) => (
                  <Button
                    key={type}
                    variant={adType === type ? "default" : "outline"}
                    onClick={() => setAdType(type)}
                    className="h-auto py-3 flex flex-col items-start"
                  >
                    <span className="font-semibold capitalize">
                      {type.replace("-", " ")}
                    </span>
                    <span className="text-xs opacity-70 text-left">
                      {adTypeExamples[type]}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">What do you want to promote?</Label>
              <Textarea
                id="prompt"
                placeholder="Example: A special offer for new clients - 20% off their first color service. Highlight that we use premium products and have experienced stylists."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about your offer, target audience, and key benefits
              </p>
            </div>

            {/* Generate Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleGenerate(false)}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? "Generating..." : "Generate Ad Copy"}
              </Button>
              <Button
                onClick={() => handleGenerate(true)}
                disabled={generating}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? "Generating..." : "Generate with Image"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Ad Preview */}
        {generatedAd && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Your Generated Ad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Preview */}
              {generatedAd.image && (
                <div>
                  <Label className="mb-2 block">Generated Image</Label>
                  <img
                    src={generatedAd.image}
                    alt="Generated ad"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              {/* Ad Copy */}
              <div className="space-y-4">
                {/* Headline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Headline</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedAd.copy.headline)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-bold text-lg">{generatedAd.copy.headline}</p>
                  </div>
                </div>

                {/* Body Copy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Body Copy</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedAd.copy.bodyCopy)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p>{generatedAd.copy.bodyCopy}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Call to Action</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedAd.copy.cta)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <p className="font-bold text-primary">{generatedAd.copy.cta}</p>
                  </div>
                </div>
              </div>

              {/* Copy All Button */}
              <Button
                className="w-full gap-2"
                onClick={() => {
                  const allText = `${generatedAd.copy.headline}\n\n${generatedAd.copy.bodyCopy}\n\n${generatedAd.copy.cta}`;
                  copyToClipboard(allText);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy All Text
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ready-to-Use Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
            <CardDescription>
              Use these prompts to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "New client special: 20% off first visit. Premium salon experience with expert stylists.",
              "Holiday promotion: Book now and get a free deep conditioning treatment. Limited spots available.",
              "Referral program: Bring a friend and both get $25 off your next service.",
              "Spring refresh: Transform your look with our color specialists. Free consultation included.",
            ].map((template, i) => (
              <div
                key={i}
                className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setPrompt(template)}
              >
                <p className="text-sm">{template}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
