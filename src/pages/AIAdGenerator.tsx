import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Copy, Wand2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const AIAdGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [adType, setAdType] = useState("social-media");
  const [generateImage, setGenerateImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your ad");
      return;
    }

    setIsGenerating(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ad", {
        body: { prompt, adType, generateImage }
      });

      if (error) throw error;

      setResults(data);
      toast.success("Ad generated successfully!");
    } catch (error: any) {
      console.error("Error generating ad:", error);
      toast.error(error.message || "Failed to generate ad");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadImage = () => {
    if (!results?.image) return;
    
    const link = document.createElement("a");
    link.href = results.image;
    link.download = "ad-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Ad Generator</h1>
          <p className="text-muted-foreground">
            Create professional ad copy and visuals for your hair salon app
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
              <CardDescription>
                Describe what you want to advertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Ad Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., Summer hair transformation package, new client special offer, balayage service..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adType">Ad Type</Label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger id="adType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="banner">Banner Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="generateImage">Generate Image</Label>
                <Switch
                  id="generateImage"
                  checked={generateImage}
                  onCheckedChange={setGenerateImage}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Ad
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {results?.copy && (
              <Card>
                <CardHeader>
                  <CardTitle>Ad Copy</CardTitle>
                  <CardDescription>Your generated content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Headline</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(results.copy.headline)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-lg font-semibold">{results.copy.headline}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Body Copy</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(results.copy.bodyCopy)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground">{results.copy.bodyCopy}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Call-to-Action</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(results.copy.cta)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="default" className="w-full">
                      {results.copy.cta}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {results?.image && (
              <Card>
                <CardHeader>
                  <CardTitle>Ad Visual</CardTitle>
                  <CardDescription>Your generated image</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img
                      src={results.image}
                      alt="Generated ad"
                      className="w-full rounded-lg shadow-lg"
                    />
                    <Button onClick={downloadImage} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!results && !isGenerating && (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground text-center">
                    Your generated ad will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAdGenerator;
