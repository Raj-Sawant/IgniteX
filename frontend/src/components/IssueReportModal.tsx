import React, { useState } from 'react';
import { AlertCircle, X, Send } from 'lucide-react';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IssueReportModal: React.FC<IssueReportModalProps> = ({ isOpen, onClose }) => {
  const [issueType, setIssueType] = useState('bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDescription('');
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Report an Issue</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Issue Reported</h3>
              <p className="text-zinc-400 text-sm">Thank you for improving Sim2Terrain. Our engineers will review this shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Issue Type</label>
                <select 
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-shadow appearance-none"
                >
                  <option value="bug">Bug / Error</option>
                  <option value="ui">UI / Rendering Glitch</option>
                  <option value="model">Model Prediction Failure</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Please describe exactly what happened..."
                  className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-shadow resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-zinc-950 bg-gradient-to-r from-rose-600 to-rose-400 rounded-lg shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
