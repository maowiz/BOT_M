import paths from "@/utils/paths";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useRedirectToHomeOnOnboardingComplete from "@/hooks/useOnboardingComplete";
import { Sparkle, ArrowRight, Brain, Cpu, Database } from "@phosphor-icons/react";

export default function OnboardingHome() {
  const navigate = useNavigate();
  useRedirectToHomeOnOnboardingComplete();
  const { t } = useTranslation();

  return (
    <>
      <div className="relative w-screen h-screen flex overflow-hidden bg-gradient-to-br from-[#0F0F23] via-[#1a1a3e] to-[#0F0F23]">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Brain className="absolute top-20 left-20 text-purple-400/30 animate-float" size={64} style={{ animationDelay: '0s' }} />
          <Cpu className="absolute top-40 right-32 text-blue-400/30 animate-float" size={56} style={{ animationDelay: '1s' }} />
          <Database className="absolute bottom-32 left-32 text-pink-400/30 animate-float" size={48} style={{ animationDelay: '2s' }} />
          <Sparkle className="absolute top-1/4 right-1/4 text-purple-300/30 animate-float" size={40} style={{ animationDelay: '1.5s' }} />
          <Brain className="absolute bottom-1/4 right-20 text-blue-300/30 animate-float" size={52} style={{ animationDelay: '2.5s' }} />
        </div>

        {/* Main Content */}
        <div className="relative flex justify-center items-center m-auto z-10">
          <div className="flex flex-col justify-center items-center px-4">
            {/* Badge */}
            <div className="mb-8 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-purple-500/20 flex items-center gap-2 animate-fade-in">
              <Sparkle className="text-purple-400" size={16} weight="fill" />
              <span className="text-purple-300 text-sm font-medium">AI-Powered Intelligence</span>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 animate-fade-in text-center" style={{ animationDelay: '0.2s' }}>
              BOT_M
            </h1>

            <p className="text-white/60 text-xl md:text-2xl font-light mb-12 text-center max-w-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Your AI Assistant powered by your data
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate(paths.onboarding.llmPreference())}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <span>Get Started</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={24} weight="bold" />
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            </button>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-12 justify-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm">
                🚀 Lightning Fast
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm">
                🔒 Secure & Private
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm">
                🎯 Context-Aware
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-600/10 to-transparent"></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}
