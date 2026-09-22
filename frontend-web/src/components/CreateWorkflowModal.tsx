import React, { useState } from 'react';
import { X, Plus, Cpu, Code } from 'lucide-react';
import { createWorkflow } from '../services/api';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newWorkflow: any) => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('DocumentUploaded');
  const [conditionJson, setConditionJson] = useState('{"fileType": "pdf", "maxSize": 10485760}');
  const [actionType, setActionType] = useState('RunFastApiInference');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    setIsSubmitting(true);
    try {
      const res = await createWorkflow({
        name,
        description,
        triggerEvent,
        conditionJson,
        actionType
      });
      onCreated(res);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Automation Workflow</h3>
              <p className="text-xs text-slate-400">Define trigger-condition-action workflow rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Workflow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Real-Time Fraud Anomaly Trigger"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Evaluates user transaction velocity against ML anomaly model"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Trigger Event
              </label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="DocumentUploaded">DocumentUploaded</option>
                <option value="TelemetryReceived">TelemetryReceived</option>
                <option value="VectorSyncRequested">VectorSyncRequested</option>
                <option value="FraudScanTriggered">FraudScanTriggered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Action Handler
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="RunFastApiInference">RunFastApiInference</option>
                <option value="DispatchSignalRAlert">DispatchSignalRAlert</option>
                <option value="ReindexHnswVectorStore">ReindexHnswVectorStore</option>
                <option value="EnqueueRabbitMQRetry">EnqueueRabbitMQRetry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Condition JSON Rule</span>
            </label>
            <textarea
              rows={2}
              value={conditionJson}
              onChange={(e) => setConditionJson(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Workflow...' : 'Create Workflow'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
