import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HairInspirationGenerator } from "@/components/HairInspirationGenerator";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";

export default function StyleInspiration() {
  return (
    <>
      <MetaTags 
        title="Hair Style Inspiration - AI Image Generator"
        description="Generate beautiful hair style inspiration images with AI"
        keywords="hair inspiration, ai hair images, style generator"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Style Inspiration</h1>
              <p className="text-muted-foreground">Generate AI-powered hair style images</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Generator */}
            <div>
              <HairInspirationGenerator />
            </div>

            {/* Tips & Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">✨ AI-Powered Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI generates professional-quality hair style images based on your text descriptions.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">💡 Example Prompts</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "Balayage blonde on brown hair with beach waves"</li>
                    <li>• "Curly pixie cut with honey highlights"</li>
                    <li>• "Long layered hair with ombre from dark to silver"</li>
                    <li>• "Bob haircut with platinum blonde and dark roots"</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🎨 Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific about colors and techniques</li>
                    <li>• Mention hair length and texture</li>
                    <li>• Include styling preferences (wavy, straight, etc.)</li>
                    <li>• Use professional terms for better results</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Powered by Nano Banana AI • Images generated in ~10 seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
