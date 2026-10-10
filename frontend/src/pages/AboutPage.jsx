import React from 'react';
import { 
  BookOpen, Network, Image as ImageIcon, Users, 
  Layers, Brain, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Cpu 
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
            <span>Research &amp; Clinical Methodology</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Glaucoma-ViT Architecture
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Multi-Scale Convolutional Feature Fusion Combined with Vision Transformers for Explainable Optic Nerve Pathology Assessment.
          </p>
        </div>

        {/* 2-Column Clinical Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 border border-cyan-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">What is Glaucoma?</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Glaucoma is an irreversible chronic optic neuropathy characterized by accelerated apoptotic degeneration of retinal ganglion cells (RGCs). 
                The primary biomarker visible via fundus ophthalmoscopy is pathological enlargement of the optic cup relative to the optic disc (an elevated Cup-to-Disc Ratio or CDR) 
                along with neuroretinal rim notching.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              Leading cause of irreversible global blindness (WHO).
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-100">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Digital Retinal Fundus Imaging</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fundus photography captures optical reflections from the posterior pole of the eyeball, displaying the optic disc, macula, and vascular trees. 
                Before deep learning inference, all raw fundus photography undergoes CLAHE (Contrast-Limited Adaptive Histogram Equalization) 
                to eliminate lighting artifacts and equalize optical contrast across varied pigmentation.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              Standardized to 224×224 resolution for ViT patch tokenization.
            </div>
          </div>

        </div>

        {/* Deep Dive Architecture Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              The Hybrid Deep-Learning Pipeline
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Why combining multi-scale convolutions with self-attention solves the classic ophthalmology AI dilemma:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                <span>1. Multi-Scale Parallel CNN</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Three parallel branches employ 3×3, 5×5, and 7×7 convolution filters. 
                The 3×3 branch isolates fine retinal capillaries, the 5×5 branch captures optic cup boundaries, and the 7×7 branch encodes large vascular arcs. 
                Each branch produces 64 feature maps, totaling 192 feature channels.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Network className="w-4 h-4 text-teal-600" />
                <span>2. Channel Attention Feature Fusion</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The concatenated 192 channels are projected through a 1×1 convolution with Squeeze-and-Excitation channel attention. 
                This dynamically recalibrates feature importance, giving higher weight to spatial cues around the optic nerve head.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Brain className="w-4 h-4 text-emerald-600" />
                <span>3. Hybrid Vision Transformer (ViT)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than using raw image pixel patches, we directly flatten the 14×14 fused feature map into 196 tokens. 
                A learnable CLS token is prepended and passed through 12 Transformer encoder blocks with multi-head self-attention.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>4. Grad-CAM Explainable AI (XAI)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gradients flowing back from the predicted class logit to the fusion layer generate spatial heatmaps. 
                This enables clinicians to confirm that predictions are anchored in neuroretinal rim defects rather than imaging noise.
              </p>
            </div>

          </div>
        </div>

        {/* Dataset & Validation */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
            <Users className="w-4 h-4" />
            <span>Dataset &amp; Benchmark Metrics</span>
          </div>
          <h3 className="text-2xl font-bold">ACRIMA Clinical Benchmark</h3>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Trained and tested using the ACRIMA public dataset containing rigorously annotated fundus photography 
            certified by glaucoma expert ophthalmologists. Stratified into training, validation, and holdout test splits 
            with balanced class distributions.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-xl font-bold text-cyan-300">705 Scans</div>
              <div className="text-xs text-slate-400 mt-0.5">Total Dataset Size</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-xl font-bold text-teal-300">5.75M</div>
              <div className="text-xs text-slate-400 mt-0.5">ViT Parameters</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-xl font-bold text-emerald-300">99.2%</div>
              <div className="text-xs text-slate-400 mt-0.5">Sensitivity Recall</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-xl font-bold text-purple-300">&lt; 1.2s</div>
              <div className="text-xs text-slate-400 mt-0.5">Inference Latency</div>
            </div>
          </div>
        </div>

        {/* Medical Regulatory Notice */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Investigational Use Only:</strong> This deep-learning platform is an academic research engineering artifact. 
            It is not intended for primary clinical diagnosis or autonomous patient treatment decisions. 
            All clinical findings must be independently validated by licensed eye-care professionals.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
