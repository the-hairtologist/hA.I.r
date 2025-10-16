import { Card } from "@/components/ui/card";

export const SingleTestimonial = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <div className="border-4 border-black bg-white p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-2 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-8 h-8 border-2 border-black bg-secondary flex items-center justify-center">
                <span className="font-pixel text-secondary-foreground text-xs">★</span>
              </div>
            ))}
          </div>
          
          <p className="text-base sm:text-lg font-sans text-foreground mb-8 leading-relaxed">
            "I get reolevisly."
          </p>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-4 border-black bg-accent flex items-center justify-center">
              <span className="font-pixel text-accent-foreground text-sm">AM</span>
            </div>
            <div>
              <div className="font-pixel text-sm text-foreground">Ashley M.</div>
            </div>
          </div>
        </div>
        
        {/* Press logos section */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
          <div className="font-pixel text-xs sm:text-sm text-accent-foreground border-2 border-black bg-white px-4 py-2">
            TC
          </div>
          <div className="font-pixel text-xs sm:text-sm text-accent-foreground border-2 border-black bg-white px-4 py-2">
            TechCrunch
          </div>
          <div className="font-pixel text-xs sm:text-sm text-accent-foreground border-2 border-black bg-white px-4 py-2">
            VOGUE
          </div>
          <div className="font-pixel text-xs sm:text-sm text-accent-foreground border-2 border-black bg-white px-4 py-2">
            allure
          </div>
        </div>
      </div>
    </div>
  );
};
