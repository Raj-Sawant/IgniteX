import React from 'react';
import { Layout } from '../components/Layout';
import { GraphCard } from '../components/GraphCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { FailureCase } from '../components/FailureCase';
import { FileWarning, ScanSearch } from 'lucide-react';

const lossData = [
  { epoch: '0', value: 0.85 },
  { epoch: '10', value: 0.65 },
  { epoch: '20', value: 0.45 },
  { epoch: '30', value: 0.32 },
  { epoch: '40', value: 0.25 },
  { epoch: '50', value: 0.21 },
  { epoch: '60', value: 0.18 },
  { epoch: '70', value: 0.15 },
  { epoch: '80', value: 0.13 },
  { epoch: '90', value: 0.11 },
  { epoch: '100', value: 0.10 }
];

const accuracyData = [
  { epoch: '0', value: 0.72 },
  { epoch: '10', value: 0.78 },
  { epoch: '20', value: 0.83 },
  { epoch: '30', value: 0.86 },
  { epoch: '40', value: 0.89 },
  { epoch: '50', value: 0.90 },
  { epoch: '60', value: 0.91 },
  { epoch: '70', value: 0.915 },
  { epoch: '80', value: 0.92 },
  { epoch: '90', value: 0.922 },
  { epoch: '100', value: 0.924 }
];

export const Analysis: React.FC = () => {
  return (
    <Layout>
      <div className="mb-8 px-2 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-2 tracking-tight flex items-center gap-3">
          <ScanSearch className="w-8 h-8 text-blue-400" />
          Model Analysis & Inference
        </h1>
        <p className="text-zinc-400">Detailed comparison and failure cases of the current DeepLabV3+ model.</p>
      </div>

      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GraphCard title="Validation Loss" type="loss" data={lossData} />
              <GraphCard title="Mean IoU (Accuracy)" type="accuracy" data={accuracyData} />
            </div>
            <PerformanceChart />
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 w-full h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-1.5 bg-zinc-800 rounded-lg">
                <FileWarning className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Failure Case Analysis</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <FailureCase 
                id="FC-091" 
                title="Shadow Confusion" 
                description="Model misclassifies deep vehicle shadows as rocky obstacles during extreme sun angles."
                impact="Medium"
                issue="Insufficient shadow augmentation"
                suggestion="Add simulated hard shadows to training data"
              />
              <FailureCase 
                id="FC-112" 
                title="Dust Occlusion" 
                description="Total breakdown of horizon line prediction during heavy dust storm simulation."
                impact="High"
                issue="Loss of spatial context"
                suggestion="Introduce temporal/video sequence context"
              />
              <FailureCase 
                id="FC-105" 
                title="Mud Reflection" 
                description="Water reflection on muddy trail predicted as sky/background."
                impact="Moderate"
                issue="Specular highlights confusion"
                suggestion="Add polarization/glare filters in pre-processing"
              />
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};
