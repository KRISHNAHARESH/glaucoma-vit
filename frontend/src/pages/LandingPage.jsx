import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Eye, Activity, Sparkles, ArrowRight, ShieldCheck, 
  Upload, Layers, CheckCircle2, ChevronRight,
  Microscope, Search, HeartPulse, HelpCircle, LogIn
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  const workflowSteps = [
    {
      step: '01',
      title: 'Upload Retinal Fundus Scan',
      desc: 'Securely upload a standard digital color fundus photograph centered on the optic nerve head.',
      icon: Upload,
    },
    {
      step: '02',
      title: 'Multi-Scale Feature Fusion',
      desc: 'Parallel convolutional branches capture fine retinal capillaries and broad optic disc excavation.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Vision Transformer Inference',
      desc: 'Self-attention transformer blocks model global spatial correlations across retinal quadrants.',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'Explainable Grad-CAM Heatmap',
      desc: 'Spatial class activation maps project back onto the fundus photograph, validating suspect regions.',
      icon: Search,
    },
  ];

  const architectureFeatures = [
    {
      title: 'Digital Fundus Photography',
      desc: 'Evaluates the posterior pole of the eye, inspecting the neuroretinal rim contour and cup-to-disc ratio (CDR).',
      icon: Microscope,
    },
    {
      title: 'Multi-Scale CNN Feature Fusion',
      desc: 'Combines multiple receptive fields (3×3, 5×5, 7×7) to resolve microvascular features and large optic disc margins simultaneously.',
      icon: Layers,
    },
    {
      title: 'Vision Transformer Attention',
      desc: 'Processes spatial patch tokens with multi-head self-attention to capture non-local structural dependencies.',
      icon: Sparkles,
    },
    {
      title: 'Transparent Grad-CAM Overlays',
      desc: 'Provides visual explainability by highlighting anatomical regions that mathematically influenced model logits.',
      icon: Search,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-white font-sans selection:bg-[#B96445] selection:text-white overflow-x-hidden">
      
      {/* =========================================================================
          HERO SECTION — BALANCED TWO-COLUMN EDITORIAL CINEMATIC HERO
          Matches Reference Design & Layout Grid
         ========================================================================= */}
      <section className="group/hero relative min-h-[92vh] lg:min-h-screen w-full flex items-center overflow-hidden bg-[#070708] pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-0 lg:pb-0">
        
        {/* Full-Bleed Ultra-HD Cinematic Macro Eye Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/cinematic_eye_hero.jpg"
            alt="Cinematic macro photograph of human eye with golden-amber iris, detailed eyelashes, and natural skin texture"
            className="w-full h-full object-cover object-[75%_center] sm:object-[78%_center] lg:object-[82%_center] opacity-100 transition-transform duration-1000 ease-out group-hover/hero:scale-[1.01]"
            loading="eager"
          />
          
          {/* Targeted Left Gradient: Provides pristine text contrast on the left without touching or clouding the eye on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070708] from-10% via-[#070708]/95 via-32% to-transparent to-55%"></div>
          
          {/* Subtle Top & Bottom Edge Vignettes */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#070708] to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070708] to-transparent"></div>
        </div>

        {/* Main Content Layout Container — Aligned to Page Grid (max-w-7xl px-4 sm:px-6 lg:px-8) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh] lg:min-h-[82vh]">
            
            {/* Left Column: Text Hierarchy (7 columns on desktop, 100% on mobile) */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center text-left">
              
              {/* 1. Main Heading & Subtitle: Modern Sans-Serif (Weight 500, Champagne Gold Subtitle) */}
              <div>
                <h1 className="text-[34px] sm:text-[40px] md:text-[46px] lg:text-[50px] xl:text-[52px] font-medium text-white tracking-tight leading-[1.15]">
                  Early Glaucoma Detection
                </h1>
                <p className="mt-2 sm:mt-2.5 text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[38px] font-medium text-[#E5D9A5] tracking-tight leading-[1.2]">
                  Powered by Vision Transformers.
                </p>
              </div>

              {/* 2. Description: 15–16px, line-height 1.7, max-width 560px */}
              <p className="mt-5 sm:mt-6 text-[15px] sm:text-[16px] text-white/75 max-w-[560px] leading-[1.7] font-normal">
                A state-of-the-art diagnostic research system combining multi-scale convolutional feature fusion with self-attention transformers to detect structural optic nerve damage and deliver transparent Grad-CAM explanations.
              </p>

              {/* 3. Action Buttons: Equal baseline, equal heights (h-12), responsive stacking */}
              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
                {user ? (
                  <Link
                    to="/analyze"
                    className="btn-micro glass-sheen h-12 inline-flex items-center justify-center gap-3 px-7 rounded-full font-semibold text-white bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/30 hover:shadow-xl hover:shadow-[#B96445]/45 transition-all duration-300 text-xs sm:text-sm group/btn hover:ring-2 hover:ring-[#E89271]/40"
                  >
                    <span className="w-7 h-7 rounded-full bg-black/25 group-hover/btn:bg-black/35 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-105 flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 text-white" />
                    </span>
                    <span>Launch Analysis Workspace</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="btn-micro glass-sheen h-12 inline-flex items-center justify-center gap-3 px-7 rounded-full font-semibold text-white bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/30 hover:shadow-xl hover:shadow-[#B96445]/45 transition-all duration-300 text-xs sm:text-sm group/btn hover:ring-2 hover:ring-[#E89271]/40"
                  >
                    <span className="w-7 h-7 rounded-full bg-black/25 group-hover/btn:bg-black/35 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-105 flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 text-white" />
                    </span>
                    <span>Login to Analyze</span>
                  </Link>
                )}

                <a
                  href="#what-is-glaucoma"
                  className="btn-micro glass-sheen h-12 inline-flex items-center justify-center gap-2 px-6 rounded-full text-xs sm:text-sm font-semibold text-white/85 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl border border-white/20 hover:border-white/35 shadow-md shadow-black/20 hover:shadow-lg transition-all duration-300 group/learn"
                >
                  <span>What is Glaucoma?</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/learn:translate-x-0.5 text-[#E89271]" />
                </a>
              </div>

            </div>

            {/* Right Column: Kept unobstructed for the cinematic macro human eye */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5 pointer-events-none" aria-hidden="true"></div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          WHAT IS GLAUCOMA? — CLINICAL INTRODUCTION & SCREENING SIGNIFICANCE
          Centered responsive container with max-w-7xl px-4 sm:px-6 lg:px-8
         ========================================================================= */}
      <section id="what-is-glaucoma" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] text-[#E89271] text-xs font-semibold uppercase tracking-wider border border-[#B96445]/30 shadow-xs backdrop-blur-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clinical Pathology &amp; Significance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What is Glaucoma?
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">
            Often termed the <strong className="text-white font-semibold">“silent thief of sight”</strong>, glaucoma is a group of progressive neurodegenerative ocular conditions characterized by irreversible degeneration of the optic nerve.
          </p>
        </div>

        {/* 3 Core Clinical Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Optic Neuropathy */}
          <div className="interactive-card glass-sheen group p-7 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-[#B96445]/60 rounded-3xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#B96445]/15 text-[#B96445] border border-[#B96445]/30 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#B96445] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-inner backdrop-blur-sm">
                <Eye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#E89271] transition-colors">
                Optic Nerve Head Damage
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                The optic nerve acts as the vital communication cable connecting retina to brain. In glaucoma, elevated intraocular pressure (IOP) or compromised micro-vascular perfusion causes gradual apoptosis of retinal ganglion cell axons, progressively excavating the central optic cup.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-[#E89271] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E89271] animate-pulse"></span>
              <span>Causes progressive optic cup excavation</span>
            </div>
          </div>

          {/* Card 2: The Silent Progression */}
          <div className="interactive-card glass-sheen group p-7 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-[#B96445]/60 rounded-3xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 flex items-center justify-center shadow-inner backdrop-blur-sm">
                <HeartPulse className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors">
                Asymptomatic Progression
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                Vision loss begins subtly in peripheral visual fields with zero early pain or redness. The brain naturally compensates for blind spots, meaning up to <strong className="text-white font-medium">40% to 50% of nerve fibers can be destroyed</strong> before patients notice any visual deficit.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>2nd leading cause of blindness globally</span>
            </div>
          </div>

          {/* Card 3: Why AI Fundus Screening Matters */}
          <div className="interactive-card glass-sheen group p-7 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-teal-500/60 rounded-3xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-teal-500 group-hover:text-black transition-all duration-300 flex items-center justify-center shadow-inner backdrop-blur-sm">
                <Microscope className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                Early Structural Detection
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                Once lost, vision cannot be restored; however, early treatment halts further decay. Automated fundus screening allows rapid identification of subtle morphological changes—such as cup-to-disc ratio expansion—long before functional vision loss occurs.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-teal-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              <span>Early screening preserves remaining sight</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          TECHNICAL CAPABILITY ARCHITECTURE CARDS — FROSTED GLASSMORPHISM
          Centered responsive container with max-w-7xl px-4 sm:px-6 lg:px-8
         ========================================================================= */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-[#B96445] uppercase tracking-wider">
            Technical Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Multi-Scale ViT Pipeline
          </h2>
          <p className="text-sm text-white/70 font-light">
            Engineered to overcome localized receptive field limits in conventional CNNs through global self-attention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {architectureFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="interactive-card glass-sheen group p-6 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-[#B96445]/60 rounded-3xl space-y-3.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#B96445]/15 text-[#B96445] border border-[#B96445]/30 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#B96445] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-inner backdrop-blur-sm">
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E89271] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4-PHASE OPERATIONAL WORKFLOW — FROSTED GLASSMORPHISM
          Centered responsive container with max-w-7xl px-4 sm:px-6 lg:px-8
         ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-[#B96445] uppercase tracking-wider">
            End-To-End Pipeline
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How Glaucoma ViT Works
          </h2>
          <p className="text-sm text-white/70 font-light">
            From raw color retinal fundus acquisition to pixel-level Grad-CAM explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="interactive-card glass-sheen group p-6 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-white/30 rounded-3xl flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] cursor-pointer"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#B96445]/15 text-[#B96445] border border-[#B96445]/30 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#B96445] group-hover:text-white transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-5 h-5 stroke-[2.2] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="text-2xl font-black text-white/20 group-hover:text-[#B96445]/60 transition-colors font-mono">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#E89271] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-[#B96445] group-hover:text-[#E89271] transition-colors">
                  <span>Stage {step.step}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          CLINICAL DECISION SUPPORT CALLOUT — FROSTED GLASSMORPHISM
          Centered responsive container with max-w-7xl px-4 sm:px-6 lg:px-8
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="group p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-white/[0.05] via-[#241A16]/75 to-white/[0.05] backdrop-blur-2xl border border-white/20 hover:border-white/35 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-8 text-white transition-all duration-300 hover:shadow-[#B96445]/20">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B96445]/25 text-amber-200 text-xs font-bold border border-[#B96445]/40 shadow-xs backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assisted Ophthalmic Decision Support</span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-amber-100 transition-colors">
              Ready to Evaluate a Retinal Fundus Scan?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              Upload any digital retinal fundus scan or test with 1-click clinical benchmark images to evaluate predictions and activation heatmaps.
            </p>
          </div>
          {user ? (
            <Link
              to="/analyze"
              className="px-8 py-3.5 rounded-full font-bold text-white bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/30 hover:shadow-2xl hover:shadow-[#B96445]/50 transition-all duration-300 text-xs sm:text-sm inline-flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95"
            >
              <span>Open Analysis Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full font-bold text-white bg-[#B96445] hover:bg-[#a65639] shadow-lg shadow-[#B96445]/30 hover:shadow-2xl hover:shadow-[#B96445]/50 transition-all duration-300 text-xs sm:text-sm inline-flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
