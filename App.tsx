
import React, { useState, useEffect, useRef } from 'react';
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
  Move
} from 'lucide-react';
import { ViewMode, ContractTemplate, Coordinate } from './types';
import { processContract } from './services/pdfService';

// Standard A4 dimensions in PDF points (72 DPI)
const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PREVIEW_SCALE = 0.5; // Scale for the visual editor

const INITIAL_TEMPLATES: ContractTemplate[] = [
  {
    id: '1',
    companyName: 'Global Corp Inc.',
    description: 'Standard HR Recruitment Agreement',
    employeeSignaturePos: { x: 50, y: 50, width: 120, height: 40, page: 1 },
    clientHighlightPos: { x: 350, y: 50, width: 200, height: 60, page: 1 },
    createdAt: Date.now()
  },
  {
    id: '2',
    companyName: 'Star Tech Solutions',
    description: 'B2B Services Master Contract',
    employeeSignaturePos: { x: 45, y: 120, width: 150, height: 50, page: 12 },
    clientHighlightPos: { x: 45, y: 60, width: 250, height: 40, page: 12 },
    createdAt: Date.now() - 86400000
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('contract_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });
  const [employeeSignature, setEmployeeSignature] = useState<string | null>(() => {
    return localStorage.getItem('employee_signature');
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('contract_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (employeeSignature) {
      localStorage.setItem('employee_signature', employeeSignature);
    }
  }, [employeeSignature]);

  const handleProcess = async () => {
    if (!selectedFile || !selectedTemplate || !employeeSignature) {
      alert("Please ensure a file is selected, a template is chosen, and your signature is set.");
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsProcessing(true);
    try {
      const result = await processContract(selectedFile, employeeSignature, template);
      const blob = new Blob([result], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error(error);
      alert("Failed to process PDF. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEmployeeSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTemplate = (newTemplate: Omit<ContractTemplate, 'id' | 'createdAt'>) => {
    const template: ContractTemplate = {
      ...newTemplate,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setTemplates(prev => [...prev, template]);
    setEditingTemplate(template);
  };

  const saveEditedTemplate = () => {
    if (!editingTemplate) return;
    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // Helper to convert PDF Y (bottom-up) to CSS Top (top-down) for the visual editor
  const pdfYToCssTop = (pdfY: number, height: number) => {
    return (A4_HEIGHT - pdfY - height) * PREVIEW_SCALE;
  };

  // Helper to convert CSS Top back to PDF Y
  const cssTopToPdfY = (cssTop: number, height: number) => {
    return A4_HEIGHT - (cssTop / PREVIEW_SCALE) - height;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl mb-8">
            <ShieldCheck className="w-8 h-8" />
            <span>ContractSigner</span>
          </div>
          
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setView(ViewMode.DASHBOARD)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewMode.DASHBOARD ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
              >
                <Layout className="w-5 h-5" /> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setView(ViewMode.PROCESS)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewMode.PROCESS ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
              >
                <FileText className="w-5 h-5" /> Sign Document
              </button>
            </li>
            <li>
              <button 
                onClick={() => setView(ViewMode.TEMPLATES)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewMode.TEMPLATES ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
              >
                <Building2 className="w-5 h-5" /> Company Templates
              </button>
            </li>
            <li>
              <button 
                onClick={() => setView(ViewMode.SETTINGS)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewMode.SETTINGS ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
              >
                <Settings className="w-5 h-5" /> My Signature
              </button>
            </li>
          </ul>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800 text-xs text-slate-400">
          <p>Local Offline Mode Active</p>
          <p className="mt-1">© 2024 SecureSign Systems</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            {view === ViewMode.DASHBOARD && "Welcome Back"}
            {view === ViewMode.PROCESS && "Apply Template to Contract"}
            {view === ViewMode.TEMPLATES && "Manage Templates"}
            {view === ViewMode.SETTINGS && "Account Settings"}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" /> System: Online (Local)
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {view === ViewMode.DASHBOARD && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">{templates.length}</span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Active Templates</h3>
              <p className="text-xs text-slate-400 mt-2">Ready for use across companies.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded flex items-center justify-center">
                  {employeeSignature ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Your Signature</h3>
              <p className="text-xs text-slate-400 mt-2">{employeeSignature ? "Configured and secured." : "Not uploaded yet."}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Privacy Status</h3>
              <p className="text-xs text-slate-400 mt-2">All data remains in your browser storage.</p>
            </div>

            <div className="md:col-span-3">
               <h2 className="text-lg font-semibold mb-4">Recent Companies</h2>
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                       <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {templates.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-800">{t.companyName}</div>
                           <div className="text-xs text-slate-500">{t.description}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                           {new Date(t.createdAt).toLocaleDateString()}
                         </td>
                         <td className="px-6 py-4 text-right">
                           <button 
                            onClick={() => {
                              setSelectedTemplate(t.id);
                              setView(ViewMode.PROCESS);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                           >
                             Use Template
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* Process View */}
        {view === ViewMode.PROCESS && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">1. Select Contract PDF</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="pdf-upload" 
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">
                        {selectedFile ? selectedFile.name : "Click to upload contract or drag here"}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Only .pdf files are supported</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">2. Choose Company Template</label>
                  <select 
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.companyName}</option>
                    ))}
                  </select>
                </div>

                {!employeeSignature && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Signature Required</p>
                      <p className="text-xs text-amber-700">Go to Settings to upload your employee signature before processing.</p>
                      <button onClick={() => setView(ViewMode.SETTINGS)} className="mt-2 text-xs font-bold text-amber-900 underline">Set Signature Now</button>
                    </div>
                  </div>
                )}

                <button
                  disabled={!selectedFile || !selectedTemplate || !employeeSignature || isProcessing}
                  onClick={handleProcess}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-5 h-5" />
                      Sign and Highlight Contract
                    </>
                  )}
                </button>

                {processedPdfUrl && (
                  <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Processing Complete!</h3>
                    <p className="text-sm text-slate-600 mb-6">Your contract is ready with the employee signature and client highlight applied.</p>
                    <a 
                      href={processedPdfUrl} 
                      download={`Signed_${selectedFile?.name}`}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      <Download className="w-5 h-5" />
                      Download Result
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates View */}
        {view === ViewMode.TEMPLATES && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Company Signature Presets</h2>
              <button 
                onClick={() => {
                  const name = prompt("Enter Company Name:");
                  if (name) {
                    addTemplate({
                      companyName: name,
                      description: "Custom contract template",
                      employeeSignaturePos: { x: 50, y: 50, width: 120, height: 40, page: 1 },
                      clientHighlightPos: { x: 350, y: 50, width: 200, height: 60, page: 1 },
                    });
                  }
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group hover:border-indigo-200 transition-all">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => setEditingTemplate(t)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                      title="Edit template"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteTemplate(t.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Delete template"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="pr-12">
                      <h3 className="font-bold text-slate-800">{t.companyName}</h3>
                      <p className="text-xs text-slate-500">{t.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px] md:text-xs">
                    <div className="space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="font-bold text-slate-700 uppercase mb-1">Employee Sig</p>
                      <p>Page: {t.employeeSignaturePos.page}</p>
                      <p>X: {t.employeeSignaturePos.x} | Y: {t.employeeSignaturePos.y}</p>
                      <p>Size: {t.employeeSignaturePos.width}x{t.employeeSignaturePos.height}</p>
                    </div>
                    <div className="space-y-1 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="font-bold text-indigo-700 uppercase mb-1">Client Area</p>
                      <p>Page: {t.clientHighlightPos.page}</p>
                      <p>X: {t.clientHighlightPos.x} | Y: {t.clientHighlightPos.y}</p>
                      <p>Size: {t.clientHighlightPos.width}x{t.clientHighlightPos.height}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Template Editor Modal */}
            {editingTemplate && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Visual Template Configurator</h2>
                      <p className="text-xs text-slate-500 mt-1">Adjust positions for {editingTemplate.companyName}</p>
                    </div>
                    <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Visual Area */}
                    <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center items-start">
                      <div 
                        className="bg-white shadow-xl relative flex-shrink-0"
                        style={{ width: A4_WIDTH * PREVIEW_SCALE, height: A4_HEIGHT * PREVIEW_SCALE }}
                      >
                        {/* Page Marker */}
                        <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">
                          Page {editingTemplate.employeeSignaturePos.page} Representation
                        </div>

                        {/* Employee Signature Box */}
                        <div 
                          className="absolute border-2 border-indigo-600 bg-indigo-100/40 flex items-center justify-center cursor-move shadow-sm group"
                          style={{
                            left: editingTemplate.employeeSignaturePos.x * PREVIEW_SCALE,
                            top: pdfYToCssTop(editingTemplate.employeeSignaturePos.y, editingTemplate.employeeSignaturePos.height),
                            width: editingTemplate.employeeSignaturePos.width * PREVIEW_SCALE,
                            height: editingTemplate.employeeSignaturePos.height * PREVIEW_SCALE
                          }}
                          onMouseDown={(e) => {
                            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                            if (!rect) return;
                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const newX = Math.round((moveEvent.clientX - rect.left) / PREVIEW_SCALE);
                              const newTop = moveEvent.clientY - rect.top;
                              const newPdfY = Math.round(cssTopToPdfY(newTop, editingTemplate.employeeSignaturePos.height));
                              setEditingTemplate(prev => prev ? {
                                ...prev,
                                employeeSignaturePos: { ...prev.employeeSignaturePos, x: Math.max(0, newX), y: Math.max(0, newPdfY) }
                              } : null);
                            };
                            const onMouseUp = () => {
                              window.removeEventListener('mousemove', onMouseMove);
                              window.removeEventListener('mouseup', onMouseUp);
                            };
                            window.addEventListener('mousemove', onMouseMove);
                            window.addEventListener('mouseup', onMouseUp);
                          }}
                        >
                          <span className="text-[10px] font-bold text-indigo-800 text-center pointer-events-none">Employee Sig</span>
                        </div>

                        {/* Client Highlight Box */}
                        <div 
                          className="absolute border-2 border-amber-500 bg-amber-200/40 flex items-center justify-center cursor-move shadow-sm"
                          style={{
                            left: editingTemplate.clientHighlightPos.x * PREVIEW_SCALE,
                            top: pdfYToCssTop(editingTemplate.clientHighlightPos.y, editingTemplate.clientHighlightPos.height),
                            width: editingTemplate.clientHighlightPos.width * PREVIEW_SCALE,
                            height: editingTemplate.clientHighlightPos.height * PREVIEW_SCALE
                          }}
                          onMouseDown={(e) => {
                            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                            if (!rect) return;
                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const newX = Math.round((moveEvent.clientX - rect.left) / PREVIEW_SCALE);
                              const newTop = moveEvent.clientY - rect.top;
                              const newPdfY = Math.round(cssTopToPdfY(newTop, editingTemplate.clientHighlightPos.height));
                              setEditingTemplate(prev => prev ? {
                                ...prev,
                                clientHighlightPos: { ...prev.clientHighlightPos, x: Math.max(0, newX), y: Math.max(0, newPdfY) }
                              } : null);
                            };
                            const onMouseUp = () => {
                              window.removeEventListener('mousemove', onMouseMove);
                              window.removeEventListener('mouseup', onMouseUp);
                            };
                            window.addEventListener('mousemove', onMouseMove);
                            window.addEventListener('mouseup', onMouseUp);
                          }}
                        >
                          <span className="text-[10px] font-bold text-amber-800 text-center pointer-events-none">Client Highlight</span>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                          <input 
                            type="text" 
                            value={editingTemplate.companyName}
                            onChange={(e) => setEditingTemplate({...editingTemplate, companyName: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                            <PenTool className="w-4 h-4" /> Employee Signature
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Page</label>
                              <input 
                                type="number" 
                                value={editingTemplate.employeeSignaturePos.page}
                                onChange={(e) => setEditingTemplate({...editingTemplate, employeeSignaturePos: {...editingTemplate.employeeSignaturePos, page: parseInt(e.target.value) || 1}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">X Coord</label>
                              <input 
                                type="number" 
                                value={editingTemplate.employeeSignaturePos.x}
                                onChange={(e) => setEditingTemplate({...editingTemplate, employeeSignaturePos: {...editingTemplate.employeeSignaturePos, x: parseInt(e.target.value) || 0}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Y Coord</label>
                              <input 
                                type="number" 
                                value={editingTemplate.employeeSignaturePos.y}
                                onChange={(e) => setEditingTemplate({...editingTemplate, employeeSignaturePos: {...editingTemplate.employeeSignaturePos, y: parseInt(e.target.value) || 0}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Width</label>
                              <input 
                                type="number" 
                                value={editingTemplate.employeeSignaturePos.width}
                                onChange={(e) => setEditingTemplate({...editingTemplate, employeeSignaturePos: {...editingTemplate.employeeSignaturePos, width: parseInt(e.target.value) || 0}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                            <Move className="w-4 h-4" /> Client Highlight Area
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Page</label>
                              <input 
                                type="number" 
                                value={editingTemplate.clientHighlightPos.page}
                                onChange={(e) => setEditingTemplate({...editingTemplate, clientHighlightPos: {...editingTemplate.clientHighlightPos, page: parseInt(e.target.value) || 1}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">X Coord</label>
                              <input 
                                type="number" 
                                value={editingTemplate.clientHighlightPos.x}
                                onChange={(e) => setEditingTemplate({...editingTemplate, clientHighlightPos: {...editingTemplate.clientHighlightPos, x: parseInt(e.target.value) || 0}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Y Coord</label>
                              <input 
                                type="number" 
                                value={editingTemplate.clientHighlightPos.y}
                                onChange={(e) => setEditingTemplate({...editingTemplate, clientHighlightPos: {...editingTemplate.clientHighlightPos, y: parseInt(e.target.value) || 0}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Width</label>
                              <input 
                                type="number" 
                                value={editingTemplate.clientHighlightPos.width}
                                onChange={(e) => setEditingTemplate({...editingTemplate, clientHighlightPos: {...editingTemplate.clientHighlightPos, width: parseInt(e.target.value) || 0}})}
                                className="w-full p-2 border border-slate-200 rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                          <button 
                            onClick={saveEditedTemplate}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                            <Save className="w-4 h-4" /> Save Template
                          </button>
                          <button 
                            onClick={() => setEditingTemplate(null)}
                            className="px-4 py-3 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings View */}
        {view === ViewMode.SETTINGS && (
          <div className="max-w-2xl mx-auto">
             <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
               <h3 className="text-lg font-bold text-slate-800 mb-6">Manage Your Professional Signature</h3>
               
               <div className="space-y-8">
                 <div>
                   <p className="text-sm text-slate-600 mb-4">Upload a transparent PNG of your signature. This will be automatically inserted into contracts based on company templates.</p>
                   
                   <div className="flex items-center gap-8">
                      <div className="w-48 h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                        {employeeSignature ? (
                          <img src={employeeSignature} alt="Signature Preview" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <PenTool className="w-8 h-8 text-slate-300" />
                        )}
                        <input 
                          type="file" 
                          accept="image/png" 
                          onChange={handleSignatureUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">Upload Signature</h4>
                        <p className="text-xs text-slate-500 mb-4">Recommended: PNG with transparent background. 300x150px.</p>
                        <label className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-700 transition-colors">
                          Choose File
                          <input type="file" accept="image/png" onChange={handleSignatureUpload} className="hidden" />
                        </label>
                      </div>
                   </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-4">Data Security</h4>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Your signature and templates are stored in your browser's <span className="font-bold">Local Storage</span>. 
                        They are never uploaded to our servers. Processing happens entirely within your browser's memory.
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
