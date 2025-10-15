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
  const [copied, setCopied] = useState<string | null>(null);
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const adTypeExamples = {
    "social-media": "Perfect for Instagram, Facebook, TikTok",
    "landing-page": "Hero sections for your website",
    "email": "Email campaigns to your clients",
    "banner": "Display ads for web advertising",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl animate-fade-in">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Ad Generator
            </h1>
            <p className="text-muted-foreground">
              Create professional marketing content using AI
            </p>
          </div>
          <Badge variant="secondary" className="gap-2 animate-pulse">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>

        <Card className="brutal-border hover:brutal-shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
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
                    <span className="text-[10px] xs:text-xs opacity-70 text-left">
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
              <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                Be specific about your offer, target audience, and key benefits
              </p>
            </div>

            {/* Generate Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleGenerate(false)}
                disabled={generating}
                className="gap-2 hover-scale"
              >
                {generating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Ad Copy
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleGenerate(true)}
                disabled={generating}
                variant="outline"
                className="gap-2 hover-scale"
              >
                {generating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Ad Preview */}
        {generatedAd && (
          <Card className="border-primary/20 animate-scale-in brutal-border brutal-shadow-xl bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                Your Generated Ad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Preview */}
              {generatedAd.image && (
                <div className="animate-fade-in">
                  <Label className="mb-2 block">Generated Image</Label>
                  <img
                    src={generatedAd.image}
                    alt="Generated ad"
                    className="w-full rounded-lg border brutal-shadow-md hover-scale transition-all duration-300"
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
                      onClick={() => copyToClipboard(generatedAd.copy.headline, "headline")}
                      className={copied === "headline" ? "text-green-500" : ""}
                    >
                      {copied === "headline" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-bold text-base sm:text-lg md:text-xl">{generatedAd.copy.headline}</p>
                  </div>
                </div>

                {/* Body Copy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Body Copy</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedAd.copy.bodyCopy, "body")}
                      className={copied === "body" ? "text-green-500" : ""}
                    >
                      {copied === "body" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                      onClick={() => copyToClipboard(generatedAd.copy.cta, "cta")}
                      className={copied === "cta" ? "text-green-500" : ""}
                    >
                      {copied === "cta" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <p className="font-bold text-primary">{generatedAd.copy.cta}</p>
                  </div>
                </div>
              </div>

              {/* Copy All Button */}
              <Button
                className="w-full gap-2 hover-scale"
                onClick={() => {
                  const allText = `${generatedAd.copy.headline}\n\n${generatedAd.copy.bodyCopy}\n\n${generatedAd.copy.cta}`;
                  copyToClipboard(allText, "all");
                }}
              >
                {copied === "all" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === "all" ? "Copied!" : "Copy All Text"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ready-to-Use Templates */}
        <Card className="brutal-border hover:brutal-shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Templates
            </CardTitle>
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
                className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all hover-scale"
                onClick={() => setPrompt(template)}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-xs sm:text-sm">{template}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
