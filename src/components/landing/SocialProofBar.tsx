import { Star, Users, Award } from "lucide-react";

export const SocialProofBar = () => {
  return (
    <div className="bg-secondary py-6 xs:py-8 border-y-4 border-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 xs:gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="font-pixel text-2xl xs:text-3xl text-black mb-1">4.9/5</div>
            <div className="font-sans text-xs xs:text-sm text-black/80">1,247 reviews</div>
          </div>
          
          <div className="text-center border-x-0 xs:border-x-4 border-black px-4">
            <Users className="h-8 w-8 xs:h-10 xs:w-10 mx-auto mb-2 text-black" />
            <div className="font-pixel text-2xl xs:text-3xl text-black mb-1">5,284</div>
            <div className="font-sans text-xs xs:text-sm text-black/80">Active stylists</div>
          </div>
          
          <div className="text-center">
            <Award className="h-8 w-8 xs:h-10 xs:w-10 mx-auto mb-2 text-black" />
            <div className="font-pixel text-2xl xs:text-3xl text-black mb-1">#1</div>
            <div className="font-sans text-xs xs:text-sm text-black/80">Rated salon app 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
};