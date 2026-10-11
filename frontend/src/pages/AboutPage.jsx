import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Network, Image as ImageIcon, 
  Layers, Brain, Sparkles, CheckCircle2, ShieldCheck, 
  Cpu, ArrowRight, Activity, Microscope, Search, Info
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#070708] pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-white font-sans selection:bg-[#B96445] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/90 hover:text-white text-xs font-semibold uppercase tracking-wider border border-white/15 hover:border-[#B96445]/50 shadow-xs hover:shadow-lg hover:shadow-[#B96445]/15 transition-all duration-300 cursor-default hover:scale-105">
            <Info className="w-3.5 h-3.5 text-[#B96445]" />
            <span>Platform Overview &amp; Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            About Glaucoma <span className="text-[#E89271] hover:text-amber-200 transition-colors">ViT</span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl mx-auto font-normal">
            An assistive clinical AI research platform integrating multi-scale feature representation, self-attention neural networks, and visual explainability for retinal fundus evaluation.
          </p>
        </div>

        {/* 2-Column Clinical Overview with Interactive Hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="group p-7 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl rounded-3xl border border-white/15 hover:border-[#B96445]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-2xl hover:shadow-[#B96445]/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#B96445]/15 text-[#B96445] group-hover:bg-[#B96445] group-hover:text-white border border-[#B96445]/30 group-hover:scale-110 flex items-center justify-center shadow-inner transition-all duration-300">
                <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <h2 className="text-lg font-bold text-white group-hover:text-[#E89271] transition-colors">
                What is Glaucoma &amp; Why Early Screening Matters
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                <strong>Glaucoma</strong> is a group of progressive eye conditions that cause irreversible damage to the optic nerve head, primarily through the apoptosis (death) of retinal ganglion cells. Because early-stage neurodegeneration typically begins silently in the peripheral visual field with no pain or noticeable symptoms, over 50% of individuals are unaware of their condition until significant visual field loss has occurred. Objective color fundus photographic screening provides a crucial window for early detection and clinical intervention.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-white/50 group-hover:text-white/70 font-medium transition-colors">
              Irreversible once vision is lost, but progression can be arrested with timely care.
            </div>
          </div>

          <div className="group p-7 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl rounded-3xl border border-white/15 hover:border-[#B96445]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-2xl hover:shadow-[#B96445]/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#B96445]/15 text-[#B96445] group-hover:bg-[#B96445] group-hover:text-white border border-[#B96445]/30 group-hover:scale-110 flex items-center justify-center shadow-inner transition-all duration-300">
                <Microscope className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <h2 className="text-lg font-bold text-white group-hover:text-[#E89271] transition-colors">
                Fundus Image Preprocessing
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                Raw ophthalmic photographs often present varying camera lighting, pigmentation, and sensor noise. Before deep learning inference, the platform isolates the green color channel (which yields the highest contrast against retinal vasculature) and applies Contrast-Limited Adaptive Histogram Equalization (CLAHE) alongside median noise filtering to highlight optic disc contours.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-white/50 group-hover:text-white/70 font-medium transition-colors">
              Standardized to 224×224 resolution for neural feature extraction.
            </div>
          </div>

        </div>

        {/* Deep Dive Architecture Section */}
        <div className="bg-white/[0.04] backdrop-blur-2xl hover:border-white/25 rounded-3xl border border-white/15 p-6 sm:p-8 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] transition-all duration-300 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Technical Architecture &amp; Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-3xl font-light">
              Glaucoma ViT addresses the trade-off between localized kernel granularity and global contextual dependencies through four coordinated stages:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#B96445]/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-2 cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#E89271] transition-colors">
                <Layers className="w-4 h-4 text-[#B96445] group-hover:scale-110 transition-transform" />
                <span>1. Multi-Scale Convolutional Extraction</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Parallel convolutional branches with multiple receptive fields (3×3, 5×5, 7×7) simultaneously extract micro-vascular features, optic cup boundaries, and broad retinal arcs, capturing spatial details at multiple scales.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#B96445]/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-2 cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#E89271] transition-colors">
                <Network className="w-4 h-4 text-[#B96445] group-hover:scale-110 transition-transform" />
                <span>2. Channel Attention Feature Fusion</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                A Squeeze-and-Excitation channel attention mechanism dynamically recalibrates feature map weights, emphasizing channels that encode optic disc morphology while dampening non-informative background regions.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#B96445]/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-2 cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#E89271] transition-colors">
                <Brain className="w-4 h-4 text-[#B96445] group-hover:scale-110 transition-transform" />
                <span>3. Vision Transformer (ViT) Self-Attention</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Fused feature maps are tokenized into a sequence of spatial patch tokens. Multiple transformer encoder blocks apply multi-head self-attention, capturing global structural relationships across the entire retinal landscape.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#B96445]/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 space-y-2 cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[#E89271] transition-colors">
                <Search className="w-4 h-4 text-[#B96445] group-hover:scale-110 transition-transform" />
                <span>4. Grad-CAM Visual Explainability</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Class Activation Mapping (CAM) projects head linear weights back onto spatial feature maps, generating a visual heatmap overlay that reveals which retinal regions influenced the classification output.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all flex items-start gap-3 text-xs text-white/70">
            <Info className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Visual Explainability Disclaimer:</strong> Grad-CAM heatmaps highlight regions that mathematically influenced the model's prediction. They are intended as a visual aid for clinical inspection and do not represent a definitive pathological boundary or diagnosis.
            </p>
          </div>
        </div>

        {/* CTA to Diagnostic Workspace */}
        <div className="group p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/15 hover:border-white/30 text-white shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] hover:shadow-[#B96445]/10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold group-hover:text-amber-100 transition-colors">
              Ready to Analyze a Retinal Image?
            </h3>
            <p className="text-xs text-white/70 max-w-lg font-light">
              Upload any digital color fundus photograph or test with preloaded clinical samples in the interactive workspace.
            </p>
          </div>
          <Link
            to="/analyze"
            className="px-8 py-3.5 rounded-full font-bold text-white bg-[#B96445] hover:bg-[#a65639] transition-all duration-300 shadow-lg shadow-[#B96445]/30 hover:shadow-2xl hover:shadow-[#B96445]/50 text-xs sm:text-sm inline-flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95 group/btn"
          >
            <span>Open Screening Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
