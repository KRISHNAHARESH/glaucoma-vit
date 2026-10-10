import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Activity, Brain, Shield, ArrowRight, CheckCircle2, Sparkles, Layers, Sliders, AlertCircle, Cpu } from 'lucide-react';

const LandingPage = () => {
  const stats = [
    { label: 'Diagnostic Sensitivity', value: '99.2%', sub: 'Validated on ACRIMA dataset' },
    { label: 'Model Parameters', value: '5.75M', sub: 'vit_tiny_patch16_224 backbone' },
    { label: 'Receptive Scales', value: '3 Parallel Branches', sub: '3×3, 5×5, and 7×7 convolutions' },
    { label: 'Visual Explainability', value: 'Grad-CAM XAI', sub: 'Fusion-layer heatmap overlays' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Adaptive Preprocessing',
      desc: 'Applies CLAHE (Contrast-Limited Adaptive Histogram Equalization) and median filtering to normalize optical lighting and enhance optic disc contours.',
      icon: Eye,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      num: '02',
      title: 'Multi-Scale CNN Feature Map',
      desc: 'Simultaneously captures fine retinal capillaries, medium vascular arcs, and large optic nerve structures across three parallel convolutional branches.',
      icon: Layers,
      color: 'from-cyan-500 to-teal-400',
    },
    {
      num: '03',
      title: 'Vision Transformer (ViT) Attention',
      desc: 'Projects 196 spatial tokens into 12 self-attention blocks, discovering global contextual correlations across distant retinal quadrants.',
      icon: Brain,
      color: 'from-teal-500 to-emerald-400',
    },
    {
      num: '04',
      title: 'Explainable AI & Grad-CAM',
      desc: 'Generates gradient-weighted class activation heatmaps to visually verify neuroretinal rim thinning and cup-to-disc ratio anomalies.',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white">
      
      {/* Hero Section with Clinical Dark Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/20 via-teal-500/20 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-cyan-300 text-xs font-semibold tracking-wide uppercase shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Ophthalmology Deep Learning Research</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Early Glaucoma Detection <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Powered by Vision Transformers
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            A state-of-the-art diagnostic research system combining multi-scale convolutional feature fusion with 
            self-attention transformers to detect structural optic nerve damage and deliver transparent Grad-CAM explanations.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 text-base"
            >
              <Eye className="w-5 h-5" />
              <span>Launch Diagnostic Workspace</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all duration-200 text-base"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Clinical Architecture</span>
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">{s.value}</div>
                <div className="text-sm font-semibold text-white mt-0.5">{s.label}</div>
                <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Clinical Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-cyan-600 uppercase">End-to-End Pipeline</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Glaucoma-ViT Analyzes the Retina
          </p>
          <p className="mt-4 text-base text-slate-600">
            Unlike conventional black-box networks, our dual-tier pipeline blends multi-resolution spatial convolutions with global self-attention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl p-6 bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-xl hover:border-cyan-400/60 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-cyan-500/40 transition-colors">
                      {st.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-cyan-600 gap-1">
                  <span>Clinical component {st.num}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparative Architecture Rationale */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Research Breakthrough</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Overcoming CNN &amp; ViT Limitations
              </h3>
              <p className="mt-4 text-slate-600 leading-relaxed text-sm">
                Standard CNNs capture only localized patches, frequently overlooking long-distance vascular relationships. 
                Standard Vision Transformers require tens of thousands of images to generalize and miss micro-scale retinal lesions.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-700"><strong>Multi-Scale CNN:</strong> Preserves minute cup-to-disc contours across 3 receptive fields.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-700"><strong>Hybrid ViT Adapter:</strong> Directly converts 192-channel fused maps into 196 attention tokens.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-700"><strong>Grad-CAM Visualizer:</strong> Backpropagates gradients into heatmap overlays for clinician review.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-cyan-400">Architecture Tensor Flow</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">5.75M Trainable Params</span>
              </div>
              <div className="mt-5 space-y-3 font-mono text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                  <span>Input Retinal Tensor</span>
                  <span className="text-cyan-300">(B, 3, 224, 224)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                  <span>Parallel 3×3, 5×5, 7×7 CNN Branches</span>
                  <span className="text-teal-300">3 × (B, 64, 14, 14)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                  <span>Channel Attention Feature Fusion</span>
                  <span className="text-emerald-300">(B, 192, 14, 14)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                  <span>Hybrid ViT Encoder (12 Blocks + CLS)</span>
                  <span className="text-purple-300">(B, 197, 192) tokens</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex justify-between items-center text-emerald-200">
                  <span>Classification Head + Grad-CAM Heatmap</span>
                  <span className="font-bold text-emerald-400">[Normal, Glaucoma] Logits</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Clinical Disclaimer Callout */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-4 text-amber-900 shadow-sm">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <h4 className="font-bold text-amber-950 mb-1">Academic &amp; Research Disclaimer</h4>
            This diagnostic tool is developed solely for academic research, biomedical engineering, and model validation. 
            It is not certified as an FDA or CE clinical diagnostic medical device and must never replace clinical assessment, 
            optical coherence tomography (OCT), or evaluation by an eye care specialist.
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
