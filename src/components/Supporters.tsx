import { motion } from "framer-motion";
import { Heart, Star, Coffee } from "lucide-react";

const testimonials = [
  {
    name: "Alex M.",
    role: "Product Designer",
    quote: "The image compression saved my project. Reduced file sizes by 80% without losing quality!",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Sofia R.",
    role: "Frontend Engineer", 
    quote: "Background removal tool is magical. Perfect results every time for my web projects.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c2eb?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Daniel K.",
    role: "Data Analyst",
    quote: "Love that everything happens in browser. No privacy concerns with sensitive data.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Maria L.",
    role: "Marketing Manager",
    quote: "Converted hundreds of images for our campaign. Fast, reliable, and completely free!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "James W.",
    role: "Software Engineer", 
    quote: "The PDF tools are incredible. Merged multiple images into professional documents easily.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Emma S.",
    role: "UX Designer",
    quote: "Color palette generator is my favorite. Perfect for maintaining brand consistency.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Carlos R.",
    role: "Project Manager",
    quote: "Used the QR generator for our event materials. Super easy and professional results.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Lisa P.",
    role: "Data Scientist",
    quote: "Image combining feature saved me hours of work. The collage maker is brilliant.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Ryan T.",
    role: "DevOps Engineer",
    quote: "Resize tool is perfect for optimizing images for different platforms and devices.",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Anna K.",
    role: "Business Analyst",
    quote: "Metadata viewer helped me organize thousands of photos efficiently. Game changer!",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Mike D.",
    role: "Full Stack Developer",
    quote: "Best free image tools online. The quality rivals expensive paid software.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
  {
    name: "Sarah M.",
    role: "Graphic Designer",
    quote: "Format conversion is seamless. Perfect for preparing assets for clients.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face&auto=format&q=80",
  },
];

// Split testimonials into 3 columns
const column1 = testimonials.slice(0, 4);
const column2 = testimonials.slice(4, 8);
const column3 = testimonials.slice(8, 12);

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <motion.figure 
    className="
      relative
      rounded-xl 
      border border-white/20
      glass
      p-6 mb-6 
      flex-shrink-0 
      backdrop-blur-md 
      shadow-lg 
      transition-all duration-300
      hover:border-purple-500/60
      overflow-hidden
      group
    "
  >
    {/* Dark blur effects - shown on card hover */}
    <div className="absolute -top-5 -right-5 w-20 h-20 bg-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10">
      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
        ))}
      </div>
      <blockquote className="text-sm text-gray-200 mb-4">"{testimonial.quote}"</blockquote>
      <figcaption className="flex items-center gap-3">
        <img 
          src={testimonial.avatar} 
          alt={`${testimonial.name} avatar`}
          className="w-10 h-10 rounded-full object-cover border-2 border-purple-400/40"
        />
        <div>
          <div className="text-sm font-medium text-white">{testimonial.name}</div>
          <div className="text-xs text-gray-300">{testimonial.role}</div>
        </div>
      </figcaption>
    </div>
  </motion.figure>
);
const ScrollingColumn = ({ 
  testimonials, 
  direction = "up",
  speed = "40s" 
}: { 
  testimonials: typeof column1;
  direction?: "up" | "down";
  speed?: string;
}) => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  
  return (
    <div className="relative h-[600px] overflow-hidden">
      <div 
        className={`flex flex-col ${direction === "up" ? "animate-scroll-up" : "animate-scroll-down"}`}
        style={{ animationDuration: speed }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
};

export default function SupportersSection() {
  return (
    <section className="relative py-20 bg-transparent overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        <motion.header 
          className="mx-auto max-w-2xl text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 gradient-text">
            Loved by Our Supporters
          </h2>

        </motion.header>

        <div className="relative">
          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none" />
          
          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - bottom to top */}
            <ScrollingColumn testimonials={column1} direction="up" speed="50s" />
            
            {/* Center column - top to bottom */}
            <ScrollingColumn testimonials={column2} direction="down" speed="40s" />
            
            {/* Right column - bottom to top */}
            <ScrollingColumn testimonials={column3} direction="up" speed="60s" />
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            >
            <p className="text-gray-300 mb-4 font-medium">
                Love what we create? Support us on Ko-fi!
            </p>

            <motion.a
                href="https://ko-fi.com/imaggee"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-amber-600 to-orange-700 text-amber-50 px-4 py-3 rounded-sm font-medium text-sm shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden border border-amber-500/40 w-full max-w-xs mx-auto"
            >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <Coffee className="w-4 h-4 text-amber-100" />
                <span>Support on Ko-fi</span>
                <Heart className="w-3 h-3 text-red-300" />
            </motion.a>
            </motion.div>

    
      </div>

      <style jsx>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-scroll-up {
          animation: scroll-up linear infinite;
        }
        
        .animate-scroll-down {
          animation: scroll-down linear infinite;
        }
      `}</style>
    </section>
  );
}