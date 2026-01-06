
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Settings, 
  Plus, 
  Layout, 
  ShieldCheck, 
  Download, 
  PenTool, 
  Building2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Save,
  Move,
  GripVertical,
  ChevronRight,
  History,
  Clock
} from 'lucide-react';
import { ViewMode, ContractTemplate, Coordinate, ProcessedDocument } from './types';
import { processContract } from './services/pdfService';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PREVIEW_SCALE = 0.5;

const INITIAL_TEMPLATES: ContractTemplate[] = [
  {
    id: '1',
    companyName: 'Global Corp Inc.',
    description: 'Standard HR Recruitment Agreement',
    employeeSignatures: [{ x: 50, y: 50, width: 120, height: 40, page: 1 }],
    clientHighlights: [{ x: 350, y: 50, width: 200, height: 60, page: 1 }],
    createdAt: Date.now()
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('contract_templates');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_TEMPLATES;
  });
  
  const [processedHistory, setProcessedHistory] = useState<ProcessedDocument[]>(() => {
    const saved = localStorage.getItem('processed_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [employeeSignature, setEmployeeSignature] = useState<string | null>(() => {
    return localStorage.getItem('employee_signature');
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  useEffect(() => {
    localStorage.setItem('contract_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('processed_history', JSON.stringify(processedHistory));
  }, [processedHistory]);

  useEffect(() => {
    if (employeeSignature) {
      localStorage.setItem('employee_signature', employeeSignature);
    }
  }, [employeeSignature]);

  const handleProcess = async () => {
    if (!selectedFile || !selectedTemplate || !employeeSignature) {
      alert("Required: File, Template, and Signature.");
      return;
    }
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    setIsProcessing(true);
    try {
      const result = await processContract(selectedFile, employeeSignature, template);
      const url = URL.createObjectURL(new Blob([result], { type: 'application/pdf' }));
      setProcessedPdfUrl(url);
      
      // Save to local history metadata
      const newProcessedDoc: ProcessedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: selectedFile.name,
        templateName: template.companyName,
        processedAt: Date.now()
      };
      setProcessedHistory(prev => [newProcessedDoc, ...prev].slice(0, 20)); // Keep last 20

    } catch (error) {
      console.error(error);
      alert("Failed to process PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setEmployeeSignature(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startNewTemplate = () => {
    const newTemp: ContractTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      companyName: '',
      description: 'New custom template',
      employeeSignatures: [{ x: 50, y: 50, width: 120, height: 40, page: 1 }],
      clientHighlights: [{ x: 300, y: 50, width: 200, height: 60, page: 1 }],
      createdAt: Date.now()
    };
    setIsNewTemplate(true);
    setEditingTemplate(newTemp);
  };

  const saveEditedTemplate = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.companyName.trim()) {
      alert("Please enter a company name.");
      return;
    }
    
    if (isNewTemplate) {
      setTemplates(prev => [...prev, editingTemplate]);
    } else {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    }
    setEditingTemplate(null);
    setIsNewTemplate(false);
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm("Delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all processing history?")) {
      setProcessedHistory([]);
    }
  };

  const pdfYToCssTop = (pdfY: number, height: number) => (A4_HEIGHT - pdfY - height) * PREVIEW_SCALE;
  const cssTopToPdfY = (cssTop: number, height: number) => A4_HEIGHT - (cssTop / PREVIEW_SCALE) - height;

  const addZone = (type: 'sig' | 'highlight') => {
    if (!editingTemplate) return;
    const newZone: Coordinate = { x: 100, y: 100, width: 120, height: 40, page: 1 };
    if (type === 'sig') {
      setEditingTemplate({
        ...editingTemplate,
        employeeSignatures: [...editingTemplate.employeeSignatures, newZone]
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        clientHighlights: [...editingTemplate.clientHighlights, newZone]
      });
    }
  };

  const removeZone = (type: 'sig' | 'highlight', index: number) => {
    if (!editingTemplate) return;
    if (type === 'sig') {
      setEditingTemplate({
        ...editingTemplate,
        employeeSignatures: editingTemplate.employeeSignatures.filter((_, i) => i !== index)
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        clientHighlights: editingTemplate.clientHighlights.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl mb-8">
            <ShieldCheck className="w-8 h-8" />
            <span>ContractSigner</span>
          </div>
          <ul className="space-y-2">
            {[
              { id: ViewMode.DASHBOARD, label: 'Dashboard', icon: Layout },
              { id: ViewMode.PROCESS, label: 'Sign Document', icon: FileText },
              { id: ViewMode.TEMPLATES, label: 'Company Templates', icon: Building2 },
              { id: ViewMode.SETTINGS, label: 'My Signature', icon: Settings },
            ].map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === item.id ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            {view === ViewMode.DASHBOARD && "Welcome"}
            {view === ViewMode.PROCESS && "Process & Save"}
            {view === ViewMode.TEMPLATES && "Templates"}
            {view === ViewMode.SETTINGS && "Account"}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200 shadow-sm">
            <CheckCircle2 className="w-3 h-3" /> System: Local Only
          </div>
        </header>

        {view === ViewMode.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <span className="text-2xl font-bold">{templates.length}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Templates Ready</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <PenTool className="w-6 h-6 text-emerald-600" />
                  {employeeSignature ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-slate-500 text-sm font-medium">Professional Sig</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <History className="w-6 h-6 text-slate-400" />
                  <span className="text-2xl font-bold">{processedHistory.length}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Processed Contracts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  Recent Local Processing
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {processedHistory.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No recently processed documents found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {processedHistory.map(doc => (
                        <div key={doc.id} className="p-4 hover:bg-slate-50 flex justify-between items-center transition-colors">
                          <div className="overflow-hidden pr-4">
                            <p className="font-bold text-slate-800 truncate text-sm">{doc.fileName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Using: {doc.templateName} • {new Date(doc.processedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex-shrink-0">
                             <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide">Processed</span>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 bg-slate-50 flex justify-center">
                        <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Clear History</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setView(ViewMode.PROCESS)} className="bg-indigo-600 text-white p-6 rounded-xl font-bold flex items-center justify-between hover:bg-indigo-700 transition-all shadow-indigo-100 shadow-lg group">
                    <div className="flex items-center gap-4">
                       <div className="bg-indigo-500/30 p-2 rounded-lg"><FileText className="w-6 h-6" /></div>
                       <div className="text-left">
                          <p>Sign New Contract</p>
                          <p className="text-indigo-200 text-xs font-normal">Apply template and download PDF</p>
                       </div>
                    </div>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => setView(ViewMode.TEMPLATES)} className="bg-white text-slate-800 p-6 rounded-xl border border-slate-200 font-bold flex items-center justify-between hover:border-indigo-300 transition-all shadow-sm group">
                    <div className="flex items-center gap-4">
                       <div className="bg-slate-100 p-2 rounded-lg"><Building2 className="w-6 h-6 text-slate-600" /></div>
                       <div className="text-left">
                          <p>Manage Presets</p>
                          <p className="text-slate-400 text-xs font-normal">Define signature & highlight zones</p>
                       </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {view === ViewMode.PROCESS && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">1</div>
                   Select Document
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-all bg-slate-50 group">
                  <input type="file" accept=".pdf" onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    setProcessedPdfUrl(null);
                  }} className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload" className="cursor-pointer block">
                    <FileText className={`w-12 h-12 mx-auto mb-4 transition-colors ${selectedFile ? 'text-indigo-500' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                    <p className="text-sm font-bold text-slate-700">{selectedFile ? selectedFile.name : "Click to upload contract or drag here"}</p>
                    <p className="text-xs text-slate-400 mt-2">Only PDF files are supported for processing.</p>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">2</div>
                   Select Company Template
                </div>
                <select value={selectedTemplate} onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setProcessedPdfUrl(null);
                }} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem] shadow-sm">
                  <option value="">-- Choose Signature Preset --</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.companyName}</option>)}
                </select>
                {templates.length === 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-700 text-xs flex items-center gap-2 border border-amber-100">
                    <AlertCircle className="w-4 h-4" /> 
                    <span>No presets found. <button onClick={() => setView(ViewMode.TEMPLATES)} className="underline font-bold">Configure a company template</button> first.</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  disabled={!selectedFile || !selectedTemplate || !employeeSignature || isProcessing} 
                  onClick={handleProcess} 
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] group"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                      Process & Apply Signature
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Data stays local • Processing in browser</p>
              </div>

              {processedPdfUrl && (
                <div className="p-8 bg-emerald-50 rounded-2xl text-center border-2 border-emerald-100 shadow-inner animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-emerald-900 font-black text-xl mb-1">Processing Successful!</h3>
                  <p className="text-emerald-700 text-sm mb-8 font-medium">The contract has been signed and signatures are embedded.</p>
                  
                  <a href={processedPdfUrl} download={`Signed_${selectedFile?.name}`} className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1">
                    <Download className="w-6 h-6" /> 
                    Save PDF to Device
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {view === ViewMode.TEMPLATES && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Company Signature Presets
              </h2>
              <button onClick={startNewTemplate} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" /> Add New Preset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={startNewTemplate} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all min-h-[180px] group">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform"><Plus className="w-8 h-8" /></div>
                <span className="font-bold text-sm tracking-wide">Create New Company Preset</span>
              </button>

              {templates.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 hover:shadow-lg transition-all">
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setIsNewTemplate(false); setEditingTemplate(t); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"><Settings className="w-4 h-4" /></button>
                    <button onClick={() => deleteTemplate(t.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 font-bold text-xl">
                    {t.companyName.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-800 truncate pr-16">{t.companyName}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[2rem]">{t.description}</p>
                  
                  <div className="mt-6 flex gap-3 text-[10px]">
                    <div className="flex-1 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                      <p className="font-bold mb-0.5 text-indigo-700 uppercase tracking-tighter">Signatures</p>
                      <span className="text-indigo-900 font-bold text-sm">{t.employeeSignatures.length}</span>
                    </div>
                    <div className="flex-1 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50">
                      <p className="font-bold mb-0.5 text-amber-700 uppercase tracking-tighter">Highlights</p>
                      <span className="text-amber-900 font-bold text-sm">{t.clientHighlights.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {editingTemplate && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                          <Building2 className="w-6 h-6" />
                       </div>
                       <div>
                         <h2 className="text-xl font-black text-slate-900 leading-none">{isNewTemplate ? "New Preset" : "Edit Preset"}</h2>
                         <p className="text-xs text-slate-400 mt-1.5 font-medium">{isNewTemplate ? "Configure visual placement markers" : `Refining ${editingTemplate.companyName}`}</p>
                       </div>
                    </div>
                    <button onClick={() => setEditingTemplate(null)} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <div className="flex-1 bg-slate-100 p-8 overflow-auto flex justify-center items-start">
                      <div className="bg-white shadow-2xl relative flex-shrink-0 rounded-sm overflow-hidden" style={{ width: A4_WIDTH * PREVIEW_SCALE, height: A4_HEIGHT * PREVIEW_SCALE }}>
                        <div className="absolute inset-0 border border-slate-200 pointer-events-none opacity-30 grid grid-cols-4 grid-rows-6">
                           {[...Array(24)].map((_, i) => <div key={i} className="border border-slate-100"></div>)}
                        </div>
                        {editingTemplate.employeeSignatures.map((pos, idx) => (
                          <div key={`sig-${idx}`} className="absolute border-2 border-indigo-600 bg-indigo-100/70 flex items-center justify-center cursor-move shadow-md group ring-2 ring-indigo-600/20"
                            style={{ left: pos.x * PREVIEW_SCALE, top: pdfYToCssTop(pos.y, pos.height), width: pos.width * PREVIEW_SCALE, height: pos.height * PREVIEW_SCALE }}
                            onMouseDown={(e) => {
                              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                              if (!rect) return;
                              const onMouseMove = (moveEvent: MouseEvent) => {
                                const newX = Math.round((moveEvent.clientX - rect.left) / PREVIEW_SCALE);
                                const newTop = moveEvent.clientY - rect.top;
                                const newPdfY = Math.round(cssTopToPdfY(newTop, pos.height));
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.employeeSignatures];
                                  updated[idx] = { ...updated[idx], x: Math.max(0, newX), y: Math.max(0, newPdfY) };
                                  return { ...prev, employeeSignatures: updated };
                                });
                              };
                              const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                              window.addEventListener('mousemove', onMouseMove);
                              window.addEventListener('mouseup', onMouseUp);
                            }}
                          ><span className="text-[10px] font-black text-indigo-900 drop-shadow-sm select-none">SIG {idx+1}</span></div>
                        ))}
                        {editingTemplate.clientHighlights.map((pos, idx) => (
                          <div key={`high-${idx}`} className="absolute border-2 border-amber-500 bg-amber-200/70 flex items-center justify-center cursor-move shadow-md group ring-2 ring-amber-500/20"
                            style={{ left: pos.x * PREVIEW_SCALE, top: pdfYToCssTop(pos.y, pos.height), width: pos.width * PREVIEW_SCALE, height: pos.height * PREVIEW_SCALE }}
                            onMouseDown={(e) => {
                              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                              if (!rect) return;
                              const onMouseMove = (moveEvent: MouseEvent) => {
                                const newX = Math.round((moveEvent.clientX - rect.left) / PREVIEW_SCALE);
                                const newTop = moveEvent.clientY - rect.top;
                                const newPdfY = Math.round(cssTopToPdfY(newTop, pos.height));
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  const updated = [...prev.clientHighlights];
                                  updated[idx] = { ...updated[idx], x: Math.max(0, newX), y: Math.max(0, newPdfY) };
                                  return { ...prev, clientHighlights: updated };
                                });
                              };
                              const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                              window.addEventListener('mousemove', onMouseMove);
                              window.addEventListener('mouseup', onMouseUp);
                            }}
                          ><span className="text-[10px] font-black text-amber-900 drop-shadow-sm select-none">HIGHLIGHT {idx+1}</span></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="w-full lg:w-[450px] bg-slate-50 border-l border-slate-100 p-8 overflow-y-auto space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Company Identity</label>
                        <div className="space-y-3">
                          <input type="text" value={editingTemplate.companyName} onChange={(e) => setEditingTemplate({...editingTemplate, companyName: e.target.value})} className="w-full p-4 border-0 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300" placeholder="e.g. Acme Corp" autoFocus />
                          <input type="text" value={editingTemplate.description} onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})} className="w-full p-4 border-0 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300" placeholder="e.g. Standard NDA Template" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Signature Markers</label>
                           <button onClick={() => addZone('sig')} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-full font-black flex items-center gap-1 hover:bg-indigo-700 transition-all shadow-md active:scale-95"><Plus className="w-3 h-3"/> Add Sig</button>
                        </div>
                        <div className="space-y-3">
                          {editingTemplate.employeeSignatures.length === 0 && <p className="text-[10px] text-slate-300 italic text-center py-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">No signature zones defined</p>}
                          {editingTemplate.employeeSignatures.map((pos, idx) => (
                            <div key={idx} className="p-5 bg-white rounded-3xl shadow-sm border border-indigo-50 flex items-start gap-4 animate-in slide-in-from-right-2 duration-200">
                              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 font-black text-[10px]">{idx+1}</div>
                              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Page</label>
                                  <input type="number" value={pos.page} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], page: Math.max(1, parseInt(e.target.value) || 1) };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Width</label>
                                  <input type="number" value={pos.width} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], width: Math.max(0, parseInt(e.target.value) || 0) };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">X-Pos</label>
                                  <input type="number" value={pos.x} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], x: Math.max(0, parseInt(e.target.value) || 0) };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Y-Pos</label>
                                  <input type="number" value={pos.y} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], y: Math.max(0, parseInt(e.target.value) || 0) };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                              </div>
                              <button onClick={() => removeZone('sig', idx)} className="text-slate-300 hover:text-red-500 transition-colors self-start p-1"><Trash2 className="w-5 h-5"/></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Client Areas</label>
                           <button onClick={() => addZone('highlight')} className="text-[10px] bg-amber-500 text-white px-3 py-1.5 rounded-full font-black flex items-center gap-1 hover:bg-amber-600 transition-all shadow-md active:scale-95"><Plus className="w-3 h-3"/> Add Area</button>
                        </div>
                        <div className="space-y-3">
                          {editingTemplate.clientHighlights.length === 0 && <p className="text-[10px] text-slate-300 italic text-center py-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">No highlight areas defined</p>}
                          {editingTemplate.clientHighlights.map((pos, idx) => (
                            <div key={idx} className="p-5 bg-white rounded-3xl shadow-sm border border-amber-50 flex items-start gap-4 animate-in slide-in-from-right-2 duration-200">
                              <div className="bg-amber-50 p-2 rounded-xl text-amber-600 font-black text-[10px]">{idx+1}</div>
                              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Page</label>
                                  <input type="number" value={pos.page} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], page: Math.max(1, parseInt(e.target.value) || 1) };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Width</label>
                                  <input type="number" value={pos.width} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], width: Math.max(0, parseInt(e.target.value) || 0) };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">X-Pos</label>
                                  <input type="number" value={pos.x} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], x: Math.max(0, parseInt(e.target.value) || 0) };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Y-Pos</label>
                                  <input type="number" value={pos.y} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], y: Math.max(0, parseInt(e.target.value) || 0) };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-2 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                              </div>
                              <button onClick={() => removeZone('highlight', idx)} className="text-slate-300 hover:text-red-500 transition-colors self-start p-1"><Trash2 className="w-5 h-5"/></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-200 flex gap-4 sticky bottom-0 bg-slate-50 z-20">
                        <button onClick={saveEditedTemplate} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all active:scale-[0.98]"><Save className="w-5 h-5" /> Save Preset</button>
                        <button onClick={() => setEditingTemplate(null)} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === ViewMode.SETTINGS && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <PenTool className="w-48 h-48" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2">Signature Master</h3>
                <p className="text-slate-400 text-sm mb-10 max-w-sm">Define your professional signature here. It is stored locally in your browser's encrypted storage.</p>
                
                <div className="space-y-10">
                   <div className="flex flex-col items-center gap-8">
                      <div className="w-full aspect-[2/1] border-4 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center bg-slate-50 relative group overflow-hidden transition-all hover:border-indigo-100">
                        {employeeSignature ? (
                          <div className="relative w-full h-full flex items-center justify-center p-8">
                            <img src={employeeSignature} className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <PenTool className="w-10 h-10 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-300">
                             <PenTool className="w-16 h-16 mx-auto mb-4 opacity-20" />
                             <p className="font-black text-xs uppercase tracking-widest">No Signature Uploaded</p>
                          </div>
                        )}
                        <input type="file" accept="image/png" onChange={handleSignatureUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      
                      <div className="w-full flex gap-4">
                        <label className="flex-1 text-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                          {employeeSignature ? "Change Signature PNG" : "Upload Signature PNG"}
                          <input type="file" accept="image/png" onChange={handleSignatureUpload} className="hidden" />
                        </label>
                        {employeeSignature && (
                          <button onClick={() => { if(confirm("Remove signature?")) setEmployeeSignature(null); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                             <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                   </div>

                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm flex-shrink-0">
                         <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                         <p className="font-black text-emerald-900 text-sm">Air-Gapped Privacy</p>
                         <p className="text-emerald-700/70 text-xs leading-relaxed">
                            Processing occurs in your browser's sandbox. No data, files, or signatures are transmitted over the network.
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
