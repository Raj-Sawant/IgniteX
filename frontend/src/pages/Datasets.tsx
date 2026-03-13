import React from 'react';
import { Layout } from '../components/Layout';
import { Database, Link as LinkIcon, Download, FolderGit2 } from 'lucide-react';

const syntheticDataCards = [
  {
    title: 'CARLA Desert Simulator',
    description: 'High-fidelity desert and off-road driving scenarios with semantic annotations.',
    link: 'https://carla.org/',
    size: '45 GB',
    color: 'bg-orange-500/10 border-orange-500/30'
  },
  {
    title: 'AirSim Offroad Environments',
    description: 'Forest and rocky trails simulation data generated via Unreal Engine.',
    link: 'https://microsoft.github.io/AirSim/',
    size: '32 GB',
    color: 'bg-emerald-500/10 border-emerald-500/30'
  },
  {
    title: 'SYNTHIA Terrain Set',
    description: 'Procedurally generated diverse weather off-road conditions.',
    link: 'https://synthia-dataset.net/',
    size: '28 GB',
    color: 'bg-blue-500/10 border-blue-500/30'
  }
];

export const Datasets: React.FC = () => {
  return (
    <Layout>
      <div className="mb-10 px-2 mt-4 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-full border border-purple-500/20 mb-4">
          <Database className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-100 mb-3 tracking-tight">
          Training Datasets
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Explore the synthetic data generated for extreme condition training and the local off-road dataset active in your workspace.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Local Dataset Section */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-4">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            Local Workspace Dataset
          </h2>
          <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 font-mono text-sm text-zinc-300 break-all mb-4">
            C:\Users\RAJ SAWANT\Downloads\semantic-segmentation-master\dataset
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-800/30 rounded border border-zinc-700/50 flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Training Images</span>
              <span className="text-zinc-200">Offroad_Segmentation_Training_Dataset</span>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded border border-zinc-700/50 flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Test Images</span>
              <span className="text-zinc-200">Offroad_Segmentation_testImages</span>
            </div>
          </div>
        </div>

        {/* Synthetic Datasets Section */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-5">
            <Download className="w-5 h-5 text-purple-400" />
            Synthetic Data Sources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {syntheticDataCards.map((card, idx) => (
              <div key={idx} className={`rounded-xl border p-5 transition-transform hover:-translate-y-1 ${card.color} flex flex-col h-full`}>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">{card.title}</h3>
                <p className="text-sm text-zinc-400 mb-6 flex-1">{card.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded">{card.size}</span>
                  <a 
                    href={card.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" /> Visit
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};
