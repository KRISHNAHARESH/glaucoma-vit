import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Eye, Activity, Brain, Shield, ArrowRight, CheckCircle2, Sparkles, 
  Layers, Sliders, AlertCircle, Cpu, Network, FileCheck, ExternalLink, 
  ChevronRight, Database, Stethoscope, Microscope
} from 'lucide-react';

const LandingPage = ({ defaultSection }) => {
  const location = useLocation();

  useEffect(() => {
    if (defaultSection) {
      const el = document.getElementById(defaultSection);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [defaultSection, location]);

  const stats = [
    { label: 'Validation Benchmark', value: 'ACRIMA Dataset', sub: '705 expert-annotated fundus scans' },
    { label: 'Model Parameters', value: '5.76M Params', sub: 'vit_tiny_patch16_224 backbone' },
    { label: 'Multi-Scale Convolutions', value: '3 Parallel Scales', sub: '3×3, 5×5, and 7×7 receptive fields' },
    { label: 'Explainable AI', value: 'Grad-CAM / CAM', sub: 'Zero-graph activation heatmaps' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Digital Fundus Acquisition',
      desc: 'The clinician or researcher uploads a standard color retinal fundus image centered on the optic nerve head. The system validates image formats and dimensions.',
      icon: Eye,
      tag: 'Input Phase',
    },
    {
      num: '02',
      title: 'Adaptive Preprocessing',
      desc: 'The green channel is isolated for optimal vessel contrast, followed by CLAHE (Contrast-Limited Adaptive Histogram Equalization) and 3×3 median noise filtration to sharpen optic disc contours.',
      icon: Microscope,
      tag: 'Signal Enhancement',
    },
    {
      num: '03',
      title: 'Multi-Scale CNN Feature Extraction',
      desc: 'Three parallel convolutional branches (3×3, 5×5, 7×7 filters) simultaneously capture fine capillaries, intermediate cup margins, and major retinal vascular arcades into 192 feature channels.',
      icon: Layers,
      tag: 'Spatial Features',
    },
    {
      num: '04',
      title: 'Vision Transformer Attention',
      desc: 'Channel-attention fused features are tokenized into 196 spatial patch tokens and processed through 12 self-attention blocks, capturing global structural correlations across distant retinal quadrants.',
      icon: Brain,
      tag: 'Transformer Encoder',
    },
    {
      num: '05',
      title: 'Prediction & Grad-CAM Localization',
      desc: 'The classification head computes calibrated probabilities for Glaucoma vs. Normal, generating a high-resolution class activation map (CAM) overlay pointing directly to regions of structural pathology.',
      icon: Sparkles,
      tag: 'Diagnostic Decision',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-600 selection:text-white">
      
      {/* Hero Section — Clean Medical Research Header */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-medical opacity-60 pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-50/80 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          
          {/* Project & Academic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Final-Year B.Tech Major Project &bull; Conference Demonstration</span>
          </div>

          {/* Exact Project Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Multi-Scale Feature Fusion with Vision Transformers for Robust Glaucoma Detection from Retinal Fundus Images
          </h1>

          {/* Clinical Research Description */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            An explainable ophthalmic AI research framework combining parallel multi-resolution convolutional neural networks 
            with self-attention Vision Transformers to detect glaucomatous optic neuropathy with transparent Grad-CAM localization.
          </p>

          {/* Primary Action Controls */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-150 text-base"
            >
              <Activity className="w-5 h-5" />
              <span>Analyze Retinal Image</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all duration-150 text-base"
            >
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>How It Works</span>
            </a>
          </div>

          {/* Research Metrics Cards */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {stats.map((s, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all duration-150"
              >
                <div className="text-xl sm:text-2xl font-black text-teal-700">{s.value}</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Section 1: How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Glaucoma-ViT Works
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            The system resolves the trade-off between localized spatial precision and long-range contextual correlation 
            through a modular 5-stage medical AI pipeline:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="medical-card p-6 flex flex-col justify-between hover:border-teal-400 hover:shadow-md transition-all duration-150"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-2xl font-black text-slate-300">
                      {st.num}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 px-2 py-0.5 rounded bg-teal-50 border border-teal-100">
                    {st.tag}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2.5 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-teal-700 gap-1">
                  <span>Step {st.num} Verified</span>
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Model Information & Technical Architecture */}
      <section id="about-model" className="py-20 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span>Technical Specification</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Model Architecture &amp; Dataset
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Detailed technical specifications of the proposed deep learning model and clinical benchmark dataset.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Architecture Card */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Network className="w-5 h-5 text-teal-600" />
                    Proposed Glaucoma-ViT Architecture
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    PyTorch &bull; Timm
                  </span>
                </div>

                <div className="mt-5 space-y-3.5 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Backbone Vision Transformer</span>
                      <span className="text-slate-500 text-[11px]">Patch size 16×16, 12 transformer encoder blocks</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">vit_tiny_patch16_224</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Parallel Multi-Scale CNN</span>
                      <span className="text-slate-500 text-[11px]">3 parallel branches (3×3, 5×5, 7×7 convolutions)</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">3 × 64 = 192 channels</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Channel Attention Fusion</span>
                      <span className="text-slate-500 text-[11px]">Squeeze-and-Excitation adaptive pooling &amp; sigmoid</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">192-dim fused grid</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Trainable Parameter Count</span>
                      <span className="text-slate-500 text-[11px]">Full end-to-end model without heavyweight overhead</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">5,759,634 parameters</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Input Tensor Standard</span>
                      <span className="text-slate-500 text-[11px]">Normalized using ImageNet mean &amp; std</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">(B, 3, 224, 224)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Inference mode: zero-graph CAM projection</span>
                <span className="font-semibold text-teal-700">CPU RAM &lt; 400 MB</span>
              </div>
            </div>

            {/* Dataset & Preprocessing Card */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-teal-600" />
                    ACRIMA Clinical Dataset &amp; Pipeline
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Clinical Benchmark
                  </span>
                </div>

                <div className="mt-5 space-y-3.5 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Total Clinical Samples</span>
                      <span className="text-slate-500 text-[11px]">High-resolution fundus images from clinical practice</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">705 Scans</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Glaucomatous Eyes</span>
                      <span className="text-slate-500 text-[11px]">Pathological optic cupping &amp; neuroretinal rim loss</span>
                    </div>
                    <span className="font-mono font-semibold text-rose-700">396 Glaucoma (56.2%)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Healthy Normal Eyes</span>
                      <span className="text-slate-500 text-[11px]">Intact ISNT rule vasculature &amp; normal CDR</span>
                    </div>
                    <span className="font-mono font-semibold text-emerald-700">309 Normal (43.8%)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">CLAHE Contrast Equalization</span>
                      <span className="text-slate-500 text-[11px]">Green channel enhancement with local grid</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">Clip 2.0 &bull; Tile 8×8</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">Noise Filtering Kernel</span>
                      <span className="text-slate-500 text-[11px]">Preserves sharp vessel edges over Gaussian blur</span>
                    </div>
                    <span className="font-mono font-semibold text-teal-700">3×3 Median Filter</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Gold standard: Certified glaucoma specialists</span>
                <span className="font-semibold text-teal-700">Binary Cross-Entropy</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Section 3: About Project & Academic Demonstration */}
      <section id="about-project" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Academic Engineering Research</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Final-Year B.Tech Major Project &amp; Conference Demonstration
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Glaucoma is clinically known as the <em>"silent thief of sight"</em> because asymptomatic vision loss typically progresses 
              without pain until significant optic nerve fibers have permanently died. Conventional deep learning CNN models either 
              lack visual transparency or fail to scale efficiently on modest clinical hardware.
            </p>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              This project bridges that gap by demonstrating how a hybrid <strong>Multi-Scale CNN + Vision Transformer</strong> can run 
              robust inference on modest CPU environments (under 400 MB RAM) while generating explainable 
              <strong>Grad-CAM class activation maps</strong> to justify its predictions before ophthalmologists.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors text-sm"
              >
                <span>Launch Diagnostic Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
              >
                <span>Read Full Methodology</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
              Conference Highlights
            </span>
            <h3 className="text-xl font-bold text-white">
              Key Contributions &amp; Novelty
            </h3>
            
            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong>Multi-Resolution Convolutions:</strong> Resolves fine micro-lesions and vascular trees via 3×3, 5×5, 7×7 receptive fields.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong>Global Self-Attention:</strong> Transformer tokens discover non-local correlations across the optic cup and neuroretinal rim.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong>Clinical Explainability:</strong> Visual Grad-CAM localization ensures clinicians can audit AI decisions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong>Resource-Constrained Deployment:</strong> Memory-mapped PyTorch weights running seamlessly on cloud instances with 512MB RAM.</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Department of Computer Science &amp; Engg.</span>
              <span className="font-mono text-teal-300">Final Year Project</span>
            </div>
          </div>

        </div>
      </section>

      {/* Direct Interactive Callout Banner */}
      <section className="py-12 bg-teal-50 border-t border-teal-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-950">
            Ready to Test a Retinal Fundus Scan?
          </h2>
          <p className="text-sm text-teal-800 max-w-xl mx-auto">
            Upload your own ophthalmic image or test our 4 pre-loaded clinical benchmark samples with instant one-click analysis.
          </p>
          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-md transition-colors text-sm"
            >
              <Activity className="w-4 h-4" />
              <span>Open Diagnostic Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
