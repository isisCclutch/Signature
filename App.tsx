
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
  Clock,
  Type,
  MousePointer2
} from 'lucide-react';
import { ViewMode, ContractTemplate, Coordinate, ProcessedDocument, TextZone } from './types';
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
    printNameZones: [{ x: 50, y: 35, width: 120, height: 15, page: 1, fontSize: 10 }],
    createdAt: Date.now()
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('contract_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        printNameZones: t.printNameZones || [],
        employeeSignatures: t.employeeSignatures || [],
        clientHighlights: t.clientHighlights || []
      }));
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

  const [printName, setPrintName] = useState<string>(() => {
    return localStorage.getItem('employee_print_name') || '';
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
    localStorage.setItem('employee_print_name', printName);
  }, [printName]);

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
      const result = await processContract(selectedFile, employeeSignature, printName, template);
      const url = URL.createObjectURL(new Blob([result], { type: 'application/pdf' }));
      setProcessedPdfUrl(url);
      
      const newProcessedDoc: ProcessedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: selectedFile.name,
        templateName: template.companyName,
        processedAt: Date.now()
      };
      setProcessedHistory(prev => [newProcessedDoc, ...prev].slice(0, 20));
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
      description: 'Custom contract placement preset',
      employeeSignatures: [],
      clientHighlights: [],
      printNameZones: [],
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

  const pdfYToCssTop = (pdfY: number, height: number) => (A4_HEIGHT - pdfY - height) * PREVIEW_SCALE;
  const cssTopToPdfY = (cssTop: number, height: number) => A4_HEIGHT - (cssTop / PREVIEW_SCALE) - height;

  const addZone = (type: 'sig' | 'highlight' | 'printName') => {
    if (!editingTemplate) return;
    if (type === 'sig') {
      setEditingTemplate({
        ...editingTemplate,
        employeeSignatures: [...editingTemplate.employeeSignatures, { x: 100, y: 100, width: 120, height: 40, page: 1 }]
      });
    } else if (type === 'highlight') {
      setEditingTemplate({
        ...editingTemplate,
        clientHighlights: [...editingTemplate.clientHighlights, { x: 100, y: 100, width: 150, height: 50, page: 1 }]
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        printNameZones: [...editingTemplate.printNameZones, { x: 100, y: 80, width: 150, height: 15, page: 1, fontSize: 10 }]
      });
    }
  };

  const removeZone = (type: 'sig' | 'highlight' | 'printName', index: number) => {
    if (!editingTemplate) return;
    if (type === 'sig') {
      setEditingTemplate({
        ...editingTemplate,
        employeeSignatures: editingTemplate.employeeSignatures.filter((_, i) => i !== index)
      });
    } else if (type === 'highlight') {
      setEditingTemplate({
        ...editingTemplate,
        clientHighlights: editingTemplate.clientHighlights.filter((_, i) => i !== index)
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        printNameZones: editingTemplate.printNameZones.filter((_, i) => i !== index)
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
              { id: ViewMode.TEMPLATES, label: 'Templates', icon: Building2 },
              { id: ViewMode.SETTINGS, label: 'Identity Settings', icon: Settings },
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
            {view === ViewMode.DASHBOARD && "Welcome Back"}
            {view === ViewMode.PROCESS && "Apply Template"}
            {view === ViewMode.TEMPLATES && "Template Presets"}
            {view === ViewMode.SETTINGS && "My Professional Identity"}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200 shadow-sm">
            <CheckCircle2 className="w-3 h-3" /> Local Processing
          </div>
        </header>

        {view === ViewMode.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <span className="text-2xl font-bold">{templates.length}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Configured Templates</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <PenTool className="w-6 h-6 text-emerald-600" />
                  {employeeSignature && printName ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-slate-500 text-sm font-medium">Signature & Name Set</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <History className="w-6 h-6 text-slate-400" />
                  <span className="text-2xl font-bold">{processedHistory.length}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Processed Locally</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  Recent History
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {processedHistory.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No documents processed yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {processedHistory.map(doc => (
                        <div key={doc.id} className="p-4 hover:bg-slate-50 flex justify-between items-center transition-colors">
                          <div className="overflow-hidden pr-4">
                            <p className="font-bold text-slate-800 truncate text-sm">{doc.fileName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.templateName} • {new Date(doc.processedAt).toLocaleString()}</p>
                          </div>
                          <div className="flex-shrink-0">
                             <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide">Processed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  Ready to Sign?
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setView(ViewMode.PROCESS)} className="bg-indigo-600 text-white p-8 rounded-2xl font-bold flex items-center justify-between hover:bg-indigo-700 transition-all shadow-xl group">
                    <div className="flex items-center gap-4">
                       <div className="bg-indigo-500/30 p-3 rounded-2xl"><FileText className="w-8 h-8" /></div>
                       <div className="text-left">
                          <p className="text-xl">Upload PDF Contract</p>
                          <p className="text-indigo-200 text-sm font-normal">Apply your profile to any company template</p>
                       </div>
                    </div>
                    <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {view === ViewMode.PROCESS && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-widest">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px]">1</div>
                    Select Document
                  </div>
                  {selectedFile && <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500 font-bold hover:underline">Clear</button>}
                </div>
                <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all bg-slate-50 group ${selectedFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-400'}`}>
                  <input type="file" accept=".pdf" onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    setProcessedPdfUrl(null);
                  }} className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload" className="cursor-pointer block">
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                          <FileText className="w-10 h-10" />
                        </div>
                        <p className="text-lg font-black text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for processing</p>
                      </div>
                    ) : (
                      <>
                        <FileText className="w-16 h-16 mx-auto mb-6 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-lg font-black text-slate-900">Click to upload or drag contract PDF</p>
                        <p className="text-sm text-slate-400 mt-2 font-medium">Security focus: File never leaves this browser.</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-widest">
                   <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px]">2</div>
                   Company Layout
                </div>
                <div className="relative">
                  <select value={selectedTemplate} onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    setProcessedPdfUrl(null);
                  }} className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none bg-white font-bold text-slate-800 transition-all">
                    <option value="">-- Select Template Layout --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.companyName}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
                
                {selectedTemplate && (
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-wrap gap-4 items-center">
                    <p className="text-xs font-black text-indigo-900 uppercase tracking-wider">Plan:</p>
                    {(() => {
                      const t = templates.find(temp => temp.id === selectedTemplate);
                      return t ? (
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-full shadow-sm">
                            <PenTool className="w-3.5 h-3.5" /> {t.employeeSignatures.length} Signature{t.employeeSignatures.length !== 1 && 's'}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-full shadow-sm">
                            <Type className="w-3.5 h-3.5" /> {t.printNameZones.length} Print Name{t.printNameZones.length !== 1 && 's'}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-white px-3 py-1.5 rounded-full shadow-sm">
                            <MousePointer2 className="w-3.5 h-3.5" /> {t.clientHighlights.length} Client Highlight{t.clientHighlights.length !== 1 && 's'}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button 
                  disabled={!selectedFile || !selectedTemplate || !employeeSignature || isProcessing} 
                  onClick={handleProcess} 
                  className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-[0.98]"
                >
                  {isProcessing ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <><ShieldCheck className="w-6 h-6" /> Sign & Process Now</>}
                </button>
              </div>

              {processedPdfUrl && (
                <div className="p-10 bg-emerald-50 rounded-[2.5rem] text-center border-4 border-emerald-100 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-emerald-900 font-black text-2xl mb-2">Contract Ready!</h3>
                  <p className="text-emerald-700 text-sm mb-10 font-medium">All signatures, names, and highlights have been applied.</p>
                  <a href={processedPdfUrl} download={`Signed_${selectedFile?.name}`} className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
                    <Download className="w-6 h-6" /> Download Signed PDF
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
                <Building2 className="w-6 h-6 text-indigo-500" />
                Template Library
              </h2>
              <button onClick={startNewTemplate} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl transition-all active:scale-95">
                <Plus className="w-5 h-5" /> New Template
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={startNewTemplate} className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all min-h-[220px] group">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="font-black text-sm uppercase tracking-widest">Create Preset</span>
              </button>

              {templates.map(t => (
                <div key={t.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 hover:shadow-xl transition-all">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setIsNewTemplate(false); setEditingTemplate(t); }} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors shadow-sm"><Settings className="w-5 h-5" /></button>
                    <button onClick={() => deleteTemplate(t.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"><Trash2 className="w-5 h-5" /></button>
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 font-black text-2xl">
                    {t.companyName ? t.companyName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <h3 className="font-black text-slate-900 text-xl truncate pr-20">{t.companyName || 'Untitled Template'}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 h-8 font-medium">{t.description}</p>
                  
                  <div className="mt-8 pt-8 border-t border-slate-50 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="flex-shrink-0 text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter">{t.employeeSignatures.length} Sig</span>
                    <span className="flex-shrink-0 text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter">{t.printNameZones.length} Name</span>
                    <span className="flex-shrink-0 text-[10px] bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter">{t.clientHighlights.length} HL</span>
                  </div>
                </div>
              ))}
            </div>

            {editingTemplate && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center">
                          <Building2 className="w-8 h-8" />
                       </div>
                       <div>
                         <h2 className="text-2xl font-black text-slate-900 leading-none">{isNewTemplate ? "New Contract Preset" : "Edit Layout Markers"}</h2>
                         <p className="text-sm text-slate-400 mt-2 font-medium">Define precise coordinates for your identity application</p>
                       </div>
                    </div>
                    <button onClick={() => setEditingTemplate(null)} className="p-4 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"><X className="w-8 h-8" /></button>
                  </div>
                  
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Visual Editor Area */}
                    <div className="flex-1 bg-slate-100 p-12 overflow-auto flex justify-center items-start">
                      <div className="bg-white shadow-2xl relative flex-shrink-0 rounded-sm overflow-hidden ring-8 ring-white" style={{ width: A4_WIDTH * PREVIEW_SCALE, height: A4_HEIGHT * PREVIEW_SCALE }}>
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                           {[...Array(40)].map((_, i) => (
                             <div key={i} className="border-b border-slate-900 w-full h-[20px]"></div>
                           ))}
                        </div>
                        
                        {/* Signature Previews */}
                        {editingTemplate.employeeSignatures.map((pos, idx) => (
                          <div key={`sig-${idx}`} className="absolute border-2 border-indigo-600 bg-indigo-100/80 flex items-center justify-center cursor-move shadow-lg ring-4 ring-indigo-500/10"
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
                          ><span className="text-[10px] font-black text-indigo-900 uppercase">Sign {idx+1}</span></div>
                        ))}
                        
                        {/* Print Name Previews */}
                        {editingTemplate.printNameZones.map((pos, idx) => (
                          <div key={`name-${idx}`} className="absolute border-2 border-emerald-600 bg-emerald-100/80 flex items-center justify-center cursor-move shadow-lg ring-4 ring-emerald-500/10"
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
                                  const updated = [...prev.printNameZones];
                                  updated[idx] = { ...updated[idx], x: Math.max(0, newX), y: Math.max(0, newPdfY) };
                                  return { ...prev, printNameZones: updated };
                                });
                              };
                              const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                              window.addEventListener('mousemove', onMouseMove);
                              window.addEventListener('mouseup', onMouseUp);
                            }}
                          ><span className="text-[10px] font-black text-emerald-900 uppercase">Name {idx+1}</span></div>
                        ))}
                        
                        {/* Highlight Previews */}
                        {editingTemplate.clientHighlights.map((pos, idx) => (
                          <div key={`high-${idx}`} className="absolute border-2 border-amber-500 bg-amber-200/80 flex items-center justify-center cursor-move shadow-lg ring-4 ring-amber-500/10"
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
                          ><span className="text-[10px] font-black text-amber-900 uppercase">HL {idx+1}</span></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Controls Sidebar */}
                    <div className="w-full lg:w-[480px] bg-slate-50 border-l border-slate-200 p-10 overflow-y-auto space-y-10 shadow-2xl z-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Info</label>
                        <div className="space-y-4">
                           <input type="text" value={editingTemplate.companyName} onChange={(e) => setEditingTemplate({...editingTemplate, companyName: e.target.value})} className="w-full p-5 bg-white rounded-2xl font-black text-lg focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-sm border-0" placeholder="Company Name" autoFocus />
                           <input type="text" value={editingTemplate.description} onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})} className="w-full p-5 bg-white rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-sm border-0" placeholder="Brief Description (e.g. Sales Master Contract)" />
                        </div>
                      </div>

                      {/* Signature Controls */}
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                           <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                             <PenTool className="w-3.5 h-3.5" /> Identity Signatures
                           </label>
                           <button onClick={() => addZone('sig')} className="text-[11px] bg-indigo-600 text-white px-4 py-2 rounded-xl font-black flex items-center gap-1.5 hover:bg-indigo-700 transition-all shadow-lg active:scale-95 shadow-indigo-100">
                             <Plus className="w-3.5 h-3.5"/> Add New
                           </button>
                        </div>
                        <div className="space-y-4">
                          {editingTemplate.employeeSignatures.length === 0 && <p className="text-[10px] text-slate-300 italic py-4 text-center border-2 border-dashed rounded-2xl">No signature zones added yet</p>}
                          {editingTemplate.employeeSignatures.map((pos, idx) => (
                            <div key={idx} className="p-6 bg-white rounded-3xl shadow-sm border border-indigo-50 animate-in slide-in-from-right-4 duration-200">
                              <div className="flex justify-between items-center mb-5">
                                 <span className="text-[11px] font-black text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">Placement #{idx+1}</span>
                                 <button onClick={() => removeZone('sig', idx)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 className="w-4.5 h-4.5"/></button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Page</label>
                                  <input type="number" value={pos.page} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], page: parseInt(e.target.value) || 1 };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Width</label>
                                  <input type="number" value={pos.width} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], width: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Height</label>
                                  <input type="number" value={pos.height} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], height: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">X Coordinate</label>
                                  <input type="number" value={pos.x} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], x: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Y Coordinate</label>
                                  <input type="number" value={pos.y} onChange={(e) => {
                                    const updated = [...editingTemplate.employeeSignatures];
                                    updated[idx] = { ...updated[idx], y: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Print Name Controls */}
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                           <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                             <Type className="w-3.5 h-3.5" /> Identity Print Names
                           </label>
                           <button onClick={() => addZone('printName')} className="text-[11px] bg-emerald-600 text-white px-4 py-2 rounded-xl font-black flex items-center gap-1.5 hover:bg-emerald-700 transition-all shadow-lg active:scale-95 shadow-emerald-100">
                             <Plus className="w-3.5 h-3.5"/> Add New
                           </button>
                        </div>
                        <div className="space-y-4">
                          {editingTemplate.printNameZones.length === 0 && <p className="text-[10px] text-slate-300 italic py-4 text-center border-2 border-dashed rounded-2xl">No print name zones added yet</p>}
                          {editingTemplate.printNameZones.map((pos, idx) => (
                            <div key={idx} className="p-6 bg-white rounded-3xl shadow-sm border border-emerald-50 animate-in slide-in-from-right-4 duration-200">
                              <div className="flex justify-between items-center mb-5">
                                 <span className="text-[11px] font-black text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">Name Placement #{idx+1}</span>
                                 <button onClick={() => removeZone('printName', idx)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 className="w-4.5 h-4.5"/></button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Page</label>
                                  <input type="number" value={pos.page} onChange={(e) => {
                                    const updated = [...editingTemplate.printNameZones];
                                    updated[idx] = { ...updated[idx], page: parseInt(e.target.value) || 1 };
                                    setEditingTemplate({...editingTemplate, printNameZones: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Font Size</label>
                                  <input type="number" value={pos.fontSize} onChange={(e) => {
                                    const updated = [...editingTemplate.printNameZones];
                                    updated[idx] = { ...updated[idx], fontSize: parseInt(e.target.value) || 10 };
                                    setEditingTemplate({...editingTemplate, printNameZones: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">X Coordinate</label>
                                  <input type="number" value={pos.x} onChange={(e) => {
                                    const updated = [...editingTemplate.printNameZones];
                                    updated[idx] = { ...updated[idx], x: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, printNameZones: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Y Coordinate</label>
                                  <input type="number" value={pos.y} onChange={(e) => {
                                    const updated = [...editingTemplate.printNameZones];
                                    updated[idx] = { ...updated[idx], y: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, printNameZones: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlight Controls */}
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                           <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                             <MousePointer2 className="w-3.5 h-3.5" /> Client Signing Areas
                           </label>
                           <button onClick={() => addZone('highlight')} className="text-[11px] bg-amber-500 text-white px-4 py-2 rounded-xl font-black flex items-center gap-1.5 hover:bg-amber-600 transition-all shadow-lg active:scale-95 shadow-amber-100">
                             <Plus className="w-3.5 h-3.5"/> Add New
                           </button>
                        </div>
                        <div className="space-y-4">
                          {editingTemplate.clientHighlights.length === 0 && <p className="text-[10px] text-slate-300 italic py-4 text-center border-2 border-dashed rounded-2xl">No highlight zones added yet</p>}
                          {editingTemplate.clientHighlights.map((pos, idx) => (
                            <div key={idx} className="p-6 bg-white rounded-3xl shadow-sm border border-amber-50 animate-in slide-in-from-right-4 duration-200">
                              <div className="flex justify-between items-center mb-5">
                                 <span className="text-[11px] font-black text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">Highlight Area #{idx+1}</span>
                                 <button onClick={() => removeZone('highlight', idx)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 className="w-4.5 h-4.5"/></button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Page</label>
                                  <input type="number" value={pos.page} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], page: parseInt(e.target.value) || 1 };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Width</label>
                                  <input type="number" value={pos.width} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], width: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Height</label>
                                  <input type="number" value={pos.height} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], height: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">X Coordinate</label>
                                  <input type="number" value={pos.x} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], x: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Y Coordinate</label>
                                  <input type="number" value={pos.y} onChange={(e) => {
                                    const updated = [...editingTemplate.clientHighlights];
                                    updated[idx] = { ...updated[idx], y: parseInt(e.target.value) || 0 };
                                    setEditingTemplate({...editingTemplate, clientHighlights: updated});
                                  }} className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-10 border-t border-slate-200 flex gap-4 sticky bottom-0 bg-slate-50 z-20 pb-4">
                        <button onClick={saveEditedTemplate} className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                           <Save className="w-5 h-5" /> Save Layout
                        </button>
                        <button onClick={() => setEditingTemplate(null)} className="px-10 py-5 bg-white border-2 border-slate-200 rounded-[2rem] font-black text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
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
             <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                   <ShieldCheck className="w-64 h-64" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-8">Identity Profile</h3>
                
                <div className="space-y-12">
                   <div className="space-y-5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Type className="w-4 h-4 text-indigo-500" />
                        Professional Name
                      </label>
                      <input 
                        type="text" 
                        value={printName} 
                        onChange={(e) => setPrintName(e.target.value)} 
                        placeholder="Full name & title (e.g. Sarah J. Smith, CEO)"
                        className="w-full p-6 bg-slate-50 border-0 rounded-[2rem] font-black text-xl focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-inner text-slate-800"
                      />
                      <p className="text-xs text-slate-400 font-medium">This name will be printed as clear text in defined areas of the PDF.</p>
                   </div>

                   <div className="space-y-5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-indigo-500" />
                        Official Signature PNG
                      </label>
                      <div className="w-full aspect-[2/1] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center bg-slate-50 relative group overflow-hidden transition-all hover:border-indigo-100 shadow-inner">
                        {employeeSignature ? (
                          <div className="relative w-full h-full flex items-center justify-center p-12">
                            <img src={employeeSignature} className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <PenTool className="w-12 h-12 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-300">
                             <PenTool className="w-20 h-20 mx-auto mb-4 opacity-10" />
                             <p className="font-black text-[10px] uppercase tracking-widest">No signature data</p>
                          </div>
                        )}
                        <input type="file" accept="image/png" onChange={handleSignatureUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      
                      <label className="block w-full text-center bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-lg cursor-pointer hover:bg-black transition-all shadow-xl active:scale-[0.98]">
                        {employeeSignature ? "Change Signature PNG" : "Upload PNG Signature"}
                        <input type="file" accept="image/png" onChange={handleSignatureUpload} className="hidden" />
                      </label>
                      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports transparent PNG for best results</p>
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
