import React from 'react';
import { BookOpen, Network, Image as ImageIcon, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">About the Project</h1>
          <p className="mt-4 text-xl text-gray-500">AI-Based Glaucoma Detection from Retinal Fundus Images</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-teal-600" />
            What is Glaucoma?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Glaucoma is a complex disease characterized by progressive damage to the optic nerve. It is often associated with elevated intraocular pressure, although it can occur with normal pressure. Early detection is crucial, as the vision loss caused by glaucoma is irreversible.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="mr-2 h-6 w-6 text-teal-600" />
            What is a Retinal Fundus Image?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            A retinal fundus image is a photograph of the back of the eye (the retina). It shows structures like the optic disc, macula, and blood vessels. In glaucoma diagnosis, doctors look for structural changes in the optic disc, such as an increased cup-to-disc ratio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Network className="mr-2 h-6 w-6 text-teal-600" />
            Our Approach
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-gray-600 leading-relaxed space-y-4">
            <p><strong>Multi-Scale CNN:</strong> Our model extracts local structural features from the image at different resolutions, helping to identify minute details around the optic disc.</p>
            <p><strong>Vision Transformer (ViT):</strong> We incorporate ViT to capture long-range dependencies and global context across the entire image.</p>
            <p><strong>Feature Fusion:</strong> By combining the local features from the CNN with the global features from the ViT, we achieve a robust and highly accurate representation.</p>
            <p><strong>Explainability (Grad-CAM):</strong> We use Gradient-weighted Class Activation Mapping to generate heatmaps, showing which regions of the image most influenced the model's prediction.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 h-6 w-6 text-teal-600" />
            Team & Dataset
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            This project was developed using the ACRIMA dataset, which consists of publicly available annotated fundus images for glaucoma analysis.
          </p>
        </section>

        <div className="bg-gray-100 p-6 rounded-md text-sm text-gray-700 border border-gray-300 text-center">
          <strong>Medical Disclaimer:</strong> This system is developed for academic and research purposes only. It is not a medical diagnostic tool and should not replace evaluation by a qualified eye-care professional.
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
