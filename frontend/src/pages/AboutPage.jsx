import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Network, Image as ImageIcon, Users, 
  Layers, Brain, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, 
  Cpu, ArrowRight, Activity, Microscope, Database, FileText
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider border border-teal-200">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>Research &bull; Model Specifications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Glaucoma-ViT Architecture &amp; Methodology
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Technical documentation for the final-year B.Tech major project on multi-scale feature fusion combined with Vision Transformers for explainable glaucoma diagnosis.
          </p>
        </div>

        {/* 2-Column Clinical Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Clinical Context: What is Glaucoma?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Glaucoma is a group of progressive optic neuropathies characterized by apoptosis of retinal ganglion cells (RGCs) 
                and loss of their axons in the optic nerve. It is the leading cause of irreversible blindness worldwide. 
                Because vision loss typically starts in the far periphery, patients remain asymptomatic until significant nerve 
                damage has occurred. In color fundus imaging, the primary hallmark is enlargement of the optic cup relative 
                to the optic disc (an elevated Cup-to-Disc Ratio or CDR) and neuroretinal rim thinning.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              WHO: Early detection before vision loss is the single most critical intervention.
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-200">
                <Microscope className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Fundus Preprocessing Pipeline</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Raw ophthalmic photographs suffer from patient illumination variations, corneal glare, and lens scattering. 
                Our pipeline isolates the <strong>green color channel</strong> (which exhibits maximum optical contrast against retinal blood vessels) 
                and applies <strong>CLAHE (Contrast-Limited Adaptive Histogram Equalization)</strong> with clip limit 2.0 and an 8×8 tile grid. 
                A subsequent <strong>3×3 median filter</strong> removes sensor salt-and-pepper noise while preserving the crisp boundaries 
                of thin retinal arterioles.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              Normalized via ImageNet statistics (&mu;=[0.485, 0.456, 0.406], &sigma;=[0.229, 0.224, 0.225]).
            </div>
          </div>

        </div>

        {/* Deep Dive Architecture Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              The Multi-Scale CNN &amp; Vision Transformer Fusion Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Conventional CNNs focus only on local neighborhood kernels, while pure Vision Transformers require hundreds of thousands of images 
              to learn inductive biases. Our proposed hybrid architecture resolves this challenge through four coordinated stages:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>1. Multi-Scale Parallel Convolutions</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The input (3, 224, 224) passes simultaneously through three parallel convolutional branches:
                <br />&bull; <strong>3×3 branch:</strong> isolates fine micro-vasculature and focal hemorrhages.
                <br />&bull; <strong>5×5 branch:</strong> captures optic cup boundaries and neuroretinal rim contours.
                <br />&bull; <strong>7×7 branch:</strong> captures broad retinal vascular arcades and global illumination gradients.
                <br />Each branch produces 64 feature maps, yielding 192 concatenated feature channels.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Network className="w-4 h-4 text-teal-600" />
                <span>2. Channel Attention Feature Fusion</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Concatenating multi-scale features introduces redundant channel representations. 
                We apply a Squeeze-and-Excitation (SE) block featuring global average pooling followed by 
                two 1×1 convolutional projections and a sigmoid gate. This dynamically recalibrates channel weights, 
                amplifying features informative of glaucoma while suppressing background artifacts.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Brain className="w-4 h-4 text-teal-600" />
                <span>3. Vision Transformer (ViT-Tiny/16)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The 192-channel fused feature map is projected into 196 spatial patch tokens ($14 \times 14$ grid). 
                A learnable [CLS] classification token and 1D learnable position embeddings are added. 
                The sequence flows through 12 Transformer Encoder Blocks, each containing Multi-Head Self-Attention (MHSA) 
                and Multi-Layer Perceptrons (MLP) with GELU activation and LayerNorm.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>4. Zero-Graph Class Activation Mapping (CAM)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                To run efficiently on resource-constrained cloud servers without backward graph gradient spikes, 
                the model computes class activation maps (CAM) by directly projecting classification head linear weights 
                back onto the multi-scale fused spatial representations in <code className="bg-slate-200 px-1 rounded text-[11px]">torch.inference_mode()</code>. 
                This keeps RAM capped below 400 MB while delivering high-resolution heatmap overlays.
              </p>
            </div>

          </div>

          {/* Model Specification Table */}
          <div className="pt-4">
            <h3 className="text-base font-bold text-slate-900 mb-3">Model Architecture Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 border-b border-slate-200">Component</th>
                    <th className="py-2.5 px-4 border-b border-slate-200">Specification</th>
                    <th className="py-2.5 px-4 border-b border-slate-200">Output Dimension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold font-sans text-slate-900">Input Retinal Image</td>
                    <td className="py-2.5 px-4">Standardized RGB Fundus Photo</td>
                    <td className="py-2.5 px-4 text-teal-700">(B, 3, 224, 224)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold font-sans text-slate-900">Multi-Scale CNN Branches</td>
                    <td className="py-2.5 px-4">3×3, 5×5, 7×7 convolutions + BatchNorm + ReLU</td>
                    <td className="py-2.5 px-4 text-teal-700">3 × (B, 64, 14, 14)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold font-sans text-slate-900">Feature Fusion Layer</td>
                    <td className="py-2.5 px-4">Channel Concat + Squeeze-and-Excitation (SE)</td>
                    <td className="py-2.5 px-4 text-teal-700">(B, 192, 14, 14)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold font-sans text-slate-900">ViT-Tiny Encoder</td>
                    <td className="py-2.5 px-4">12 Transformer Blocks, 3 Heads, 192 Embed Dim</td>
                    <td className="py-2.5 px-4 text-teal-700">(B, 197, 192) tokens</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold font-sans text-slate-900">Classification Head</td>
                    <td className="py-2.5 px-4">LayerNorm + Linear (192 &rarr; 2 classes)</td>
                    <td className="py-2.5 px-4 text-teal-700">(B, 2) logits [Normal, Glaucoma]</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold font-sans text-slate-900">Total Trainable Parameters</td>
                    <td className="py-2.5 px-4" colSpan={2}><strong>5,759,634 parameters</strong> (~23 MB float32 weights)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dataset Information Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">ACRIMA Clinical Benchmark Dataset</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Gold-standard public clinical dataset for glaucoma classification research.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1">Total Image Count</span>
              <span className="text-2xl font-black text-slate-900">705 Scans</span>
              <p className="text-[11px] text-slate-500 mt-1">High-resolution color fundus photographs</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
              <span className="text-rose-700 block mb-1">Glaucomatous Eyes</span>
              <span className="text-2xl font-black text-rose-900">396 Images</span>
              <p className="text-[11px] text-rose-700 mt-1">56.2% pathological optic cupping</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <span className="text-emerald-700 block mb-1">Normal Healthy Eyes</span>
              <span className="text-2xl font-black text-emerald-900">309 Images</span>
              <p className="text-[11px] text-emerald-700 mt-1">43.8% physiological baseline</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All images in the ACRIMA dataset were evaluated and annotated by certified glaucoma specialists. 
            Ground-truth labels reflect multi-examiner consensus regarding optic cup expansion, cup-to-disc ratio (CDR &gt; 0.65), 
            and neuroretinal rim thinning according to the ISNT (Inferior, Superior, Nasal, Temporal) clinical rule.
          </p>
        </div>

        {/* CTA to Diagnostic Workspace */}
        <div className="p-8 rounded-2xl bg-teal-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Experience the Model in Action</h3>
            <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-lg">
              Launch the diagnostic workspace to test retinal fundus images and inspect the Grad-CAM attention overlays in real time.
            </p>
          </div>
          <Link
            to="/analyze"
            className="px-6 py-3 rounded-xl font-bold text-teal-900 bg-white hover:bg-teal-50 transition-colors shadow-sm text-sm inline-flex items-center gap-2 flex-shrink-0"
          >
            <span>Analyze Retinal Image</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
