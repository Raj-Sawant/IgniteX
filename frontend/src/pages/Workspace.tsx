import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { UploadArea } from '../components/UploadArea';
import { ChallengeCard } from '../components/ChallengeCard';
import { TerrainStats } from '../components/TerrainStats';
import { PredictionSummary } from '../components/PredictionSummary';
import { EnvironmentCard } from '../components/EnvironmentCard';
import { LiveWeatherCard } from '../components/LiveWeatherCard';
import { ImageComparison } from '../components/ImageComparison';

export const Workspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const handleRunAnalysis = async () => {
      if (!selectedFile) {
        alert("Please upload an image first.");
        return;
      }
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          setResultImage(URL.createObjectURL(blob));
        } else {
          alert('Analysis failed.');
        }
      } catch (error) {
        console.error("Analysis failed", error);
        alert('An error occurred during analysis.');
      }
      setIsAnalyzing(false);
    };

    window.addEventListener('runAnalysis', handleRunAnalysis);
    return () => window.removeEventListener('runAnalysis', handleRunAnalysis);
  }, [selectedFile]);

  return (
    <Layout>
      {/* Centered Hero Section */}
      <div className="mb-10 px-2 mt-4 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-700 to-white mb-4 tracking-tight flex items-center justify-center gap-4">
          {/* Custom SVG icon for off-road/terrain/mountain */}
          <div className="p-2 bg-gradient-to-br from-rose-900/40 to-white/10 rounded-xl border border-rose-500/30 shadow-[0_0_15px_rgba(190,18,60,0.3)]">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-8 h-8 text-rose-400"
            >
              <path d="M8 3l4 8 5-5 5 15H2L8 3z"></path>
              <path d="M12 11l-4 3-2-2"></path>
            </svg>
          </div>
          Off-Road Semantic Segmentation
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mt-2 mx-auto">
          Advanced AI-powered terrain analysis and scene understanding for autonomous off-road navigation.
        </p>
      </div>

      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* Row 1: Workspace & Problem Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-full">
            <WorkspaceCard />
          </div>
          <div className="lg:col-span-2 h-full">
            <ChallengeCard />
          </div>
        </div>
        
        {/* Row 2: Upload Area & Inference Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col h-full relative">
            <UploadArea selectedFile={selectedFile} setSelectedFile={setSelectedFile} preview={preview} setPreview={setPreview} />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-20 backdrop-blur-sm">
                <div className="text-purple-400 font-semibold animate-pulse">Running Analysis...</div>
              </div>
            )}
          </div>
          <div className="md:col-span-2 min-h-[450px]">
            <ImageComparison original={preview} result={resultImage} />
          </div>
        </div>

        {/* Row 3: Terrain Distribution & Prediction Quality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-full">
             <TerrainStats />
          </div>
          <div className="h-full">
             <PredictionSummary />
          </div>
        </div>

        {/* Row 4: Environment Features & Live Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-full">
            <EnvironmentCard />
          </div>
          <div className="h-full">
            <LiveWeatherCard />
          </div>
        </div>

      </div>
    </Layout>
  );
};
