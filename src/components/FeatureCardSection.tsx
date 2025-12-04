import React from "react";

const FeatureCardSection = () => {
  return (
    <div className="
      relative w-full h-auto min-h-[250px] md:h-[300px] rounded-xl md:rounded-2xl 
      bg-transparent 
      border border-white/10
      backdrop-blur-md
      shadow-[0_0_40px_-25px_hsl(217_91%_60%/0.5)]
      overflow-hidden
      mt-1
      mb-10 md:mb-20 
    ">
      {/* Grid Overlay */}
      <div className="
        absolute inset-0 opacity-[0.04] 
        bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
        bg-[size:20px_20px] md:bg-[size:24px_24px]
      "></div>

      {/* Neon Border */}
      <div className="
        absolute inset-0 rounded-xl md:rounded-2xl pointer-events-none
        border border-[hsl(217_91%_60%/0.4)]
        shadow-[0_0_20px_hsl(217_91%_60%/0.4)] md:shadow-[0_0_30px_hsl(217_91%_60%/0.4)]
      "></div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col justify-center h-full">

        {/* Badge */}
        <div className="
          inline-flex items-center gap-2 px-3 py-1 rounded-full 
          bg-[hsl(217_91%_60%/0.15)] 
          border border-[hsl(217_91%_60%/0.3)]
          text-[hsl(217_91%_60%)] text-xs sm:text-sm font-medium 
          w-fit mb-3 md:mb-4
        ">
          ⚡ 100% Client-Side Processing
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight md:leading-snug">
          Your Files <span className="text-[hsl(262_83%_58%)]">Never</span> Touch Our Servers
        </h2>

        {/* Subtitle */}
        <p className="text-white/70 text-xs sm:text-sm md:text-base mt-2 max-w-2xl">
          Everything happens in your browser. No uploads, no cloud storage, no tracking.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 mt-4 md:mt-6">

          {/* Uploads */}
          <div className="flex items-center gap-2">
            <span className="text-[hsl(217_91%_60%)] text-2xl sm:text-3xl md:text-4xl font-extrabold">0</span>
            <span className="text-white/70 text-xs sm:text-sm">Uploads</span>
          </div>

          {/* Tracking */}
          <div className="flex items-center gap-2">
            <span className="text-[hsl(217_91%_60%)] text-2xl sm:text-3xl md:text-4xl font-extrabold">0</span>
            <span className="text-white/70 text-xs sm:text-sm">Tracking</span>
          </div>

          {/* Private */}
          <div className="flex items-center gap-2">
            <span className="text-[hsl(217_91%_60%)] text-2xl sm:text-3xl md:text-4xl font-extrabold">100%</span>
            <span className="text-white/70 text-xs sm:text-sm">Private</span>
          </div>

          {/* Unlimited */}
          <div className="flex items-center gap-2">
            <span className="text-[hsl(217_91%_60%)] text-2xl sm:text-3xl md:text-4xl font-extrabold">∞</span>
            <span className="text-white/70 text-xs sm:text-sm">Unlimited</span>
          </div>

          {/* Free */}
          <div className="flex items-center gap-2">
            <span className="text-[hsl(262_83%_58%)] text-2xl sm:text-3xl md:text-4xl font-extrabold">100%</span>
            <span className="text-white/70 text-xs sm:text-sm">Free</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeatureCardSection;