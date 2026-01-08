
import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  ChevronLeft,
  History,
  Clock,
  Type,
  MousePointer2,
  CloudDownload,
  Link,
  UserCheck,
  Edit3,
  Maximize2,
  Hash,
  Layers,
  RotateCcw,
  Search,
  Copy,
  ExternalLink
} from 'lucide-react';
import { ViewMode, ContractTemplate, Coordinate, ProcessedDocument, TextZone } from './types';
import { processContract } from './services/pdfService';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PREVIEW_SCALE = 0.5;

// Sorted Alphabetically by Company Name
const INITIAL_TEMPLATES: ContractTemplate[] = [
  {
    id: 'autocapital-preset',
    companyName: 'AutoCapital',
    description: 'AutoCapital Standard Layout',
    employeeSignatures: [],
    clientHighlights: [
      { x: 50, y: 530, width: 120, height: 40, page: 3 },
      { x: 330, y: 530, width: 120, height: 40, page: 3 },
      { x: 55, y: 320, width: 120, height: 40, page: 10 },
      { x: 55, y: 270, width: 120, height: 40, page: 10 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'bnc-preset',
    companyName: 'BNC',
    description: 'BNC Standard Layout',
    employeeSignatures: [
      { x: 60, y: 590, width: 120, height: 40, page: 13 },
      { x: 83, y: 270, width: 120, height: 40, page: 14 },
      { x: 87, y: 300, width: 120, height: 40, page: 17 }
    ],
    printNameZones: [{ x: 243, y: 300, width: 120, height: 40, page: 17, fontSize: 15 }],
    clientHighlights: [
      { x: 200, y: 470, width: 120, height: 40, page: 13 },
      { x: 200, y: 360, width: 120, height: 40, page: 13 },
      { x: 520, y: 694, width: 50, height: 20, page: 15 },
      { x: 520, y: 670, width: 50, height: 20, page: 15 },
      { x: 85, y: 410, width: 120, height: 40, page: 17 },
      { x: 85, y: 462, width: 120, height: 40, page: 17 },
      { x: 35, y: 480, width: 50, height: 40, page: 16 }, // Updated Hil #7
      { x: 120, y: 480, width: 50, height: 40, page: 16 } // Updated Hil #8
    ],
    createdAt: Date.now()
  },
  {
    id: 'bns-preset',
    companyName: 'BNS',
    description: 'BNS Standard Layout',
    employeeSignatures: [{ x: 396, y: 100, width: 120, height: 40, page: 4 }],
    clientHighlights: [
      { x: 210, y: 565, width: 120, height: 40, page: 5 },
      { x: 50, y: 565, width: 120, height: 40, page: 5 },
      { x: 298, y: 720, width: 120, height: 40, page: 9 },
      { x: 154, y: 720, width: 120, height: 40, page: 9 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'cibc-preset',
    companyName: 'CIBC',
    description: 'CIBC Standard Layout',
    employeeSignatures: [
      { x: 359, y: 660, width: 120, height: 40, page: 9 },
      { x: 371, y: 330, width: 120, height: 40, page: 10 }
    ],
    clientHighlights: [
      { x: 91, y: 610, width: 120, height: 40, page: 9 },
      { x: 357, y: 610, width: 120, height: 40, page: 9 },
      { x: 100, y: 260, width: 120, height: 40, page: 12 },
      { x: 359, y: 260, width: 120, height: 40, page: 12 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'eden-park-preset',
    companyName: 'Eden Park',
    description: 'Eden Park Standard Layout',
    employeeSignatures: [
      { x: 65, y: 360, width: 120, height: 40, page: 9 },
      { x: 65, y: 100, width: 120, height: 40, page: 9 }
    ],
    clientHighlights: [
      { x: 40, y: 450, width: 120, height: 40, page: 9 },
      { x: 35, y: 350, width: 120, height: 40, page: 9 },
      { x: 190, y: 350, width: 120, height: 40, page: 8 },
      { x: 190, y: 350, width: 120, height: 40, page: 8 },
      { x: 45, y: 320, width: 120, height: 40, page: 11 },
      { x: 35, y: 360, width: 120, height: 40, page: 11 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'gb-preset',
    companyName: 'GB',
    description: 'Global Business Standard Layout',
    employeeSignatures: [
      { x: 234, y: 160, width: 140, height: 45, page: 1 },
      { x: 74, y: 180, width: 140, height: 45, page: 11 },
      { x: 72, y: 110, width: 140, height: 45, page: 12 }
    ],
    clientHighlights: [
      { x: 102, y: 570, width: 150, height: 35, page: 11 },
      { x: 382, y: 570, width: 150, height: 35, page: 11 },
      { x: 70, y: 120, width: 150, height: 35, page: 14 },
      { x: 252, y: 120, width: 150, height: 35, page: 14 }
    ],
    printNameZones: [
      { x: 202, y: 145, width: 150, height: 20, page: 1, fontSize: 14 },
      { x: 388, y: 185, width: 150, height: 20, page: 11, fontSize: 14 },
      { x: 376, y: 115, width: 150, height: 20, page: 12, fontSize: 14 }
    ],
    createdAt: Date.now()
  },
  {
    id: 'ia-preset',
    companyName: 'iA',
    description: 'iA Financial Standard Layout',
    employeeSignatures: [{ x: 60, y: 180, width: 120, height: 40, page: 5 }],
    clientHighlights: [
      { x: 56, y: 540, width: 150, height: 30, page: 5 },
      { x: 334, y: 540, width: 150, height: 30, page: 5 },
      { x: 35, y: 80, width: 150, height: 30, page: 6 },
      { x: 35, y: 60, width: 150, height: 30, page: 6 }
    ],
    printNameZones: [{ x: 350, y: 190, width: 120, height: 40, page: 5, fontSize: 15 }], // Updated: Added Name Area
    createdAt: Date.now()
  },
  {
    id: 'north-lake-preset',
    companyName: 'North Lake',
    description: 'North Lake Standard Layout',
    employeeSignatures: [
      { x: 114, y: 150, width: 120, height: 40, page: 1 },
      { x: 116, y: 190, width: 120, height: 40, page: 6 }
    ],
    clientHighlights: [],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'rbc-preset',
    companyName: 'RBC',
    description: 'Royal Bank of Canada Standard Layout',
    employeeSignatures: [
      { x: 358, y: 420, width: 120, height: 40, page: 13 },
      { x: 108, y: 300, width: 120, height: 40, page: 14 }
    ],
    clientHighlights: [
      { x: 116, y: 200, width: 120, height: 40, page: 3 },
      { x: 338, y: 200, width: 120, height: 40, page: 3 },
      { x: 75, y: 350, width: 120, height: 40, page: 13 },
      { x: 75, y: 420, width: 120, height: 40, page: 13 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'santander-preset',
    companyName: 'Santander',
    description: 'Santander Consumer Standard Layout',
    employeeSignatures: [{ x: 320, y: 145, width: 100, height: 30, page: 11 }],
    printNameZones: [{ x: 320, y: 135, width: 100, height: 30, page: 11, fontSize: 15 }],
    clientHighlights: [
      { x: 140, y: 170, width: 120, height: 35, page: 6 },
      { x: 276, y: 170, width: 120, height: 35, page: 6 },
      { x: 140, y: 60, width: 120, height: 35, page: 7 },
      { x: 276, y: 60, width: 120, height: 35, page: 7 },
      { x: 130, y: 430, width: 120, height: 35, page: 8 },
      { x: 270, y: 430, width: 120, height: 35, page: 8 },
      { x: 60, y: 260, width: 120, height: 35, page: 8 },
      { x: 235, y: 260, width: 120, height: 35, page: 8 },
      { x: 70, y: 150, width: 120, height: 35, page: 9 },
      { x: 230, y: 150, width: 120, height: 35, page: 9 },
      { x: 160, y: 400, width: 120, height: 35, page: 11 },
      { x: 160, y: 250, width: 120, height: 35, page: 11 }
    ],
    createdAt: Date.now()
  },
  {
    id: 'sda-preset',
    companyName: 'SDA',
    description: 'SDA Standard Layout',
    employeeSignatures: [],
    clientHighlights: [
      { x: 200, y: 720, width: 120, height: 40, page: 3 },
      { x: 352, y: 720, width: 120, height: 40, page: 3 },
      { x: 60, y: 660, width: 120, height: 40, page: 8 },
      { x: 230, y: 660, width: 120, height: 40, page: 8 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  },
  {
    id: 'td-preset',
    companyName: 'TD',
    description: 'TD Bank Standard Layout',
    employeeSignatures: [{ x: 90, y: 50, width: 120, height: 40, page: 6 }],
    clientHighlights: [
      { x: 324, y: 290, width: 120, height: 40, page: 6 },
      { x: 200, y: 290, width: 120, height: 40, page: 6 },
      { x: 200, y: 330, width: 120, height: 40, page: 10 },
      { x: 420, y: 330, width: 120, height: 40, page: 10 }
    ],
    printNameZones: [],
    createdAt: Date.now()
  }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PROCESS);
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('contract_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      const existingIds = new Set(parsed.map((t: any) => t.id));
      const missingInitial = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
      return [...parsed, ...missingInitial].sort((a,b) => a.companyName.localeCompare(b.companyName));
    }
    return [...INITIAL_TEMPLATES].sort((a,b) => a.companyName.localeCompare(b.companyName));
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
  const [editorPage, setEditorPage] = useState<number>(1);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('contract_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('processed_history', JSON.stringify(processedHistory));
  }, [processedHistory]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [templates, searchTerm]);

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
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setEmployeeSignature(result);
        localStorage.setItem('employee_signature', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetTemplateToDefault = () => {
    if (!editingTemplate) return;
    const original = INITIAL_TEMPLATES.find(t => t.id === editingTemplate.id);
    if (original) {
      if (confirm(`Reset ${editingTemplate.companyName} to official PDF coordinates? Your manual changes will be lost.`)) {
        setEditingTemplate({ ...original });
        setEditorPage(original.employeeSignatures[0]?.page || original.clientHighlights[0]?.page || 1);
      }
    } else {
      alert("This is a custom template, no default exists.");
    }
  };

  const saveEditedTemplate = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.companyName.trim()) {
      alert("Please enter a company name.");
      return;
    }
    
    let newTemplates;
    if (isNewTemplate) {
      newTemplates = [...templates, editingTemplate];
    } else {
      newTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    }
    
    setTemplates(newTemplates.sort((a,b) => a.companyName.localeCompare(b.companyName)));
    setEditingTemplate(null);
    setIsNewTemplate(false);
  };

  const duplicateTemplate = (template: ContractTemplate) => {
    const newTemplate = {
      ...template,
      id: `copy-${Date.now()}`,
      companyName: `${template.companyName} (Copy)`,
      createdAt: Date.now()
    };
    setTemplates(prev => [...prev, newTemplate].sort((a,b) => a.companyName.localeCompare(b.companyName)));
  };

  const deleteTemplate = (id: string) => {
    if (confirm("Delete this template permanently?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate === id) setSelectedTemplate('');
    }
  };

  const pdfYToCssTop = (pdfY: number, height: number) => (A4_HEIGHT - pdfY - height) * PREVIEW_SCALE;
  const cssTopToPdfY = (cssTop: number, height: number) => A4_HEIGHT - (cssTop / PREVIEW_SCALE) - height;

  const addZone = (type: 'sig' | 'highlight' | 'printName') => {
    if (!editingTemplate) return;
    if (type === 'sig') {
      setEditingTemplate({
        ...editingTemplate,
        employeeSignatures: [...editingTemplate.employeeSignatures, { x: 50, y: 750, width: 120, height: 40, page: editorPage }]
      });
    } else if (type === 'highlight') {
      setEditingTemplate({
        ...editingTemplate,
        clientHighlights: [...editingTemplate.clientHighlights, { x: 50, y: 700, width: 120, height: 40, page: editorPage }]
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        printNameZones: [...editingTemplate.printNameZones, { x: 50, y: 650, width: 120, height: 40, page: editorPage, fontSize: 15 }]
      });
    }
  };

  const updateZone = (type: 'sig' | 'highlight' | 'printName', index: number, updates: Partial<TextZone>) => {
    if (!editingTemplate) return;
    setEditingTemplate(prev => {
      if (!prev) return null;
      if (type === 'sig') {
        const list = [...prev.employeeSignatures];
        list[index] = { ...list[index], ...updates };
        return { ...prev, employeeSignatures: list };
      } else if (type === 'highlight') {
        const list = [...prev.clientHighlights];
        list[index] = { ...list[index], ...updates };
        return { ...prev, clientHighlights: list };
      } else {
        const list = [...prev.printNameZones];
        list[index] = { ...list[index], ...updates };
        return { ...prev, printNameZones: list };
      }
    });
  };

  const removeZone = (type: 'sig' | 'highlight' | 'printName', index: number) => {
    if (!editingTemplate) return;
    if (confirm("Remove this marker?")) {
      if (type === 'sig') {
        setEditingTemplate({ ...editingTemplate, employeeSignatures: editingTemplate.employeeSignatures.filter((_, i) => i !== index) });
      } else if (type === 'highlight') {
        setEditingTemplate({ ...editingTemplate, clientHighlights: editingTemplate.clientHighlights.filter((_, i) => i !== index) });
      } else {
        setEditingTemplate({ ...editingTemplate, printNameZones: editingTemplate.printNameZones.filter((_, i) => i !== index) });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 px-4 items-center overflow-x-hidden">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-500">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">ContractSigner Pro</h1>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-center">
            <button 
              onClick={() => setViewMode(ViewMode.PROCESS)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${viewMode === ViewMode.PROCESS ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <FileText className="w-4 h-4" /> Process Contract
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.TEMPLATES)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${viewMode === ViewMode.TEMPLATES ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <Layout className="w-4 h-4" /> Manage Templates
            </button>
          </div>
        </div>

        {/* Tab Content: PROCESS */}
        {viewMode === ViewMode.PROCESS && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Identity Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <UserCheck className="w-3 h-3 text-indigo-500" /> Employee Print Name
                  </label>
                  <input 
                    type="text" 
                    value={printName} 
                    onChange={(e) => setPrintName(e.target.value)} 
                    placeholder="Enter full name for contract print areas..."
                    className="w-full p-4 bg-slate-50 border-0 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <PenTool className="w-3 h-3 text-indigo-500" /> Signature PNG
                  </label>
                  <div className="relative h-20 w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center group overflow-hidden hover:border-indigo-400 transition-all">
                    {employeeSignature ? (
                      <div className="relative h-full w-full flex items-center justify-center p-4 bg-white">
                        <img src={employeeSignature} className="max-h-full max-w-full object-contain" />
                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-lg">Change File</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <PenTool className="w-6 h-6 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400">Upload PNG</span>
                      </div>
                    )}
                    <input type="file" accept="image/png" onChange={handleSignatureUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Process Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected Layout</label>
                  <select 
                    value={selectedTemplate} 
                    onChange={(e) => setSelectedTemplate(e.target.value)} 
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-white font-black text-slate-900 focus:border-indigo-500/50 transition-all focus:outline-none"
                  >
                    <option value="">-- Choose Template --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.companyName}</option>)}
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1 px-1">
                   {selectedTemplate && (
                     <button 
                        onClick={() => { const t = templates.find(x => x.id === selectedTemplate); if(t) { setEditingTemplate({...t}); setEditorPage(t.employeeSignatures[0]?.page || t.clientHighlights[0]?.page || 1); } }} 
                        className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-2"
                      >
                       <Edit3 className="w-4 h-4" /> Quick Edit Selected Template
                     </button>
                   )}
                </div>
              </div>

              <div className="space-y-4">
                <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" id="main-upload" />
                <label htmlFor="main-upload" className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer block transition-all ${selectedFile ? 'border-emerald-400 bg-emerald-50/30 text-emerald-700' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'}`}>
                  <FileText className={`w-12 h-12 mx-auto mb-3 ${selectedFile ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <p className="font-black text-lg">{selectedFile ? selectedFile.name : "Select Contract PDF"}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Supports standard PDF formats</p>
                </label>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  disabled={!selectedFile || !selectedTemplate || !employeeSignature || isProcessing} 
                  onClick={handleProcess} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <PenTool className="w-6 h-6" /> Sign & Generate
                    </>
                  )}
                </button>

                {processedPdfUrl && (
                  <a 
                    href={processedPdfUrl} 
                    download={`signed_${selectedFile?.name || 'contract'}.pdf`} 
                    className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl text-center block shadow-xl shadow-emerald-100 animate-in zoom-in-95 hover:bg-emerald-700 transition-all"
                  >
                    <Download className="w-6 h-6 inline mr-2 mb-1" /> Download Signed PDF
                  </a>
                )}
              </div>
            </div>

            {/* History Feed */}
            {processedHistory.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                </div>
                <div className="grid gap-3">
                  {processedHistory.map(doc => (
                    <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.fileName}</p>
                          <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                             <span className="flex items-center gap-1 uppercase tracking-tight"><Building2 className="w-3 h-3" /> {doc.templateName}</span>
                             <span className="flex items-center gap-1 uppercase tracking-tight"><Clock className="w-3 h-3" /> {new Date(doc.processedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: TEMPLATES */}
        {viewMode === ViewMode.TEMPLATES && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search company templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={() => { setIsNewTemplate(true); setEditingTemplate({ id: `custom-${Date.now()}`, companyName: '', description: '', employeeSignatures: [], clientHighlights: [], printNameZones: [], createdAt: Date.now() }); setEditorPage(1); }}
                className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" /> Create New Layout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <div key={template.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between h-48">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-lg font-black text-slate-900 tracking-tight">{template.companyName}</h4>
                       {INITIAL_TEMPLATES.some(t => t.id === template.id) && (
                         <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full tracking-tighter">Official Preset</span>
                       )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{template.description || "Custom Layout Configuration"}</p>
                    
                    <div className="mt-4 flex gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
                        <PenTool className="w-3 h-3" /> {template.employeeSignatures.length} Sigs
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
                        <MousePointer2 className="w-3 h-3" /> {template.clientHighlights.length} HL
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
                        <Type className="w-3 h-3" /> {template.printNameZones.length} Print
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => duplicateTemplate(template)}
                      className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setEditingTemplate({...template}); setEditorPage(template.employeeSignatures[0]?.page || template.clientHighlights[0]?.page || 1); }}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit Layout"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="font-black text-slate-400">No templates matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual Editor Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-[95%] h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center"><Layout className="w-6 h-6" /></div>
                   <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Layout Editor</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Company: {editingTemplate.companyName || 'New'}</span>
                        {INITIAL_TEMPLATES.some(t => t.id === editingTemplate.id) && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-600 font-black px-1.5 py-0.5 rounded tracking-tighter uppercase">Preset</span>
                        )}
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={resetTemplateToDefault} className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-colors px-4 py-2.5 bg-slate-50 rounded-xl" title="Reset to official preset values">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                  <button onClick={saveEditedTemplate} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-black transition-all active:scale-95">Save Changes</button>
                  <button onClick={() => { setEditingTemplate(null); setIsNewTemplate(false); }} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all"><X className="w-6 h-6" /></button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
                
                {/* Visual Workspace Area */}
                <div className="flex-1 overflow-auto p-12 flex flex-col items-center relative">
                  
                  {/* Page Navigation */}
                  <div className="sticky top-0 bg-white shadow-xl px-8 py-4 rounded-[2rem] mb-8 z-30 border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <button onClick={() => setEditorPage(p => Math.max(1, p - 1))} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><ChevronLeft className="w-6 h-6"/></button>
                      <div className="flex items-center gap-2 px-4 border-x border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">PAGE</span>
                        <input 
                          type="number" 
                          min="1" 
                          value={editorPage} 
                          onChange={(e) => setEditorPage(parseInt(e.target.value) || 1)} 
                          className="w-10 text-center bg-transparent font-black text-indigo-600 focus:outline-none" 
                        />
                      </div>
                      <button onClick={() => setEditorPage(p => p + 1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><ChevronRight className="w-6 h-6"/></button>
                    </div>

                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Sig</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Name</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Highlight</div>
                    </div>
                  </div>

                  {/* A4 Canvas */}
                  <div className="bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] relative flex-shrink-0" style={{ width: A4_WIDTH * PREVIEW_SCALE, height: A4_HEIGHT * PREVIEW_SCALE }}>
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                       <span className="text-[200px] font-black text-slate-900 select-none">{editorPage}</span>
                    </div>

                    {/* Draggable Employee Signatures */}
                    {editingTemplate.employeeSignatures.filter(p => p.page === editorPage).map((pos, _) => {
                      const idx = editingTemplate.employeeSignatures.indexOf(pos);
                      return (
                      <div key={`sig-${idx}`} className="absolute border-2 border-indigo-600 bg-indigo-100/60 flex items-center justify-center cursor-move shadow-lg group z-10"
                        style={{ left: (pos.x || 0) * PREVIEW_SCALE, top: pdfYToCssTop(pos.y || 0, pos.height || 40), width: (pos.width || 120) * PREVIEW_SCALE, height: (pos.height || 40) * PREVIEW_SCALE }}
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                          if (!rect) return;
                          const onMouseMove = (m: MouseEvent) => {
                            const nx = Math.round((m.clientX - rect.left) / PREVIEW_SCALE);
                            const ny = Math.round(cssTopToPdfY(m.clientY - rect.top, pos.height));
                            updateZone('sig', idx, { x: Math.max(0, nx), y: Math.max(0, ny) });
                          };
                          const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                          window.addEventListener('mousemove', onMouseMove);
                          window.addEventListener('mouseup', onMouseUp);
                        }}
                      >
                        <div className="absolute -top-8 left-0 bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
                          X:{pos.x} Y:{pos.y}
                        </div>
                        <PenTool className="w-4 h-4 text-indigo-600 opacity-50" />
                      </div>
                    )})}

                    {/* Draggable Print Name Zones */}
                    {editingTemplate.printNameZones.filter(p => p.page === editorPage).map((pos, _) => {
                      const idx = editingTemplate.printNameZones.indexOf(pos);
                      return (
                      <div key={`name-${idx}`} className="absolute border-2 border-emerald-600 bg-emerald-100/60 flex items-center justify-center cursor-move shadow-lg group z-10"
                        style={{ left: (pos.x || 0) * PREVIEW_SCALE, top: pdfYToCssTop(pos.y || 0, pos.height || 40), width: (pos.width || 120) * PREVIEW_SCALE, height: (pos.height || 40) * PREVIEW_SCALE }}
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                          if (!rect) return;
                          const onMouseMove = (m: MouseEvent) => {
                            const nx = Math.round((m.clientX - rect.left) / PREVIEW_SCALE);
                            const ny = Math.round(cssTopToPdfY(m.clientY - rect.top, pos.height));
                            updateZone('printName', idx, { x: Math.max(0, nx), y: Math.max(0, ny) });
                          };
                          const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                          window.addEventListener('mousemove', onMouseMove);
                          window.addEventListener('mouseup', onMouseUp);
                        }}
                      >
                        <div className="absolute -top-8 left-0 bg-emerald-600 text-white text-[9px] px-3 py-1 rounded-full font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
                          X:{pos.x} Y:{pos.y}
                        </div>
                        <Type className="w-3 h-3 text-emerald-600 opacity-50" />
                      </div>
                    )})}

                    {/* Draggable Highlights */}
                    {editingTemplate.clientHighlights.filter(p => p.page === editorPage).map((pos, _) => {
                      const idx = editingTemplate.clientHighlights.indexOf(pos);
                      return (
                      <div key={`high-${idx}`} className="absolute border-2 border-amber-500 bg-amber-200/60 flex items-center justify-center cursor-move shadow-lg group z-10"
                        style={{ left: (pos.x || 0) * PREVIEW_SCALE, top: pdfYToCssTop(pos.y || 0, pos.height || 40), width: (pos.width || 120) * PREVIEW_SCALE, height: (pos.height || 40) * PREVIEW_SCALE }}
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                          if (!rect) return;
                          const onMouseMove = (m: MouseEvent) => {
                            const nx = Math.round((m.clientX - rect.left) / PREVIEW_SCALE);
                            const ny = Math.round(cssTopToPdfY(m.clientY - rect.top, pos.height));
                            updateZone('highlight', idx, { x: Math.max(0, nx), y: Math.max(0, ny) });
                          };
                          const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                          window.addEventListener('mousemove', onMouseMove);
                          window.addEventListener('mouseup', onMouseUp);
                        }}
                      >
                        <div className="absolute -top-8 left-0 bg-amber-600 text-white text-[9px] px-3 py-1 rounded-full font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
                          X:{pos.x} Y:{pos.y}
                        </div>
                        <span className="text-[10px] font-black text-amber-900/40 uppercase">HL</span>
                      </div>
                    )})}
                  </div>
                </div>
                
                {/* Sidebar Controls */}
                <div className="w-full lg:w-[450px] bg-white border-l border-slate-200 p-8 overflow-y-auto space-y-12 shadow-2xl relative">
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Building2 className="w-5 h-5 text-slate-900" />
                       <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-widest">Company Info</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase px-1">Branding Name</label>
                        <input 
                          type="text" 
                          value={editingTemplate.companyName} 
                          onChange={(e) => setEditingTemplate({...editingTemplate, companyName: e.target.value})} 
                          className="w-full p-4 bg-slate-50 rounded-2xl font-black focus:ring-4 focus:ring-indigo-500/10 border-0 text-lg transition-all" 
                          placeholder="e.g. GB" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase px-1">Description</label>
                        <input 
                          type="text" 
                          value={editingTemplate.description} 
                          onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})} 
                          className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-0 text-sm" 
                          placeholder="Short label for this layout" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Signatures List */}
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center text-indigo-600">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4" />
                        <h3 className="font-black uppercase text-[11px] tracking-widest">Signatures</h3>
                      </div>
                      <button onClick={() => addZone('sig')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100">+ Page {editorPage}</button>
                    </div>
                    <div className="space-y-4">
                      {editingTemplate.employeeSignatures.map((pos, idx) => (
                        <div key={idx} className={`p-5 rounded-3xl border-2 transition-all ${pos.page === editorPage ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-50 bg-slate-50/50 opacity-40'}`}>
                          <div className="flex justify-between items-start mb-4">
                             <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-tighter">SIG #{idx+1}</span>
                             <button onClick={() => removeZone('sig', idx)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Page</span><input type="number" value={pos.page} onChange={(e) => updateZone('sig', idx, { page: parseInt(e.target.value) || 1 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">X</span><input type="number" value={pos.x} onChange={(e) => updateZone('sig', idx, { x: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Y</span><input type="number" value={pos.y} onChange={(e) => updateZone('sig', idx, { y: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Print Zones List */}
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center text-emerald-600">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        <h3 className="font-black uppercase text-[11px] tracking-widest">Name Areas</h3>
                      </div>
                      <button onClick={() => addZone('printName')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100">+ Page {editorPage}</button>
                    </div>
                    <div className="space-y-4">
                      {editingTemplate.printNameZones.map((pos, idx) => (
                        <div key={idx} className={`p-5 rounded-3xl border-2 transition-all ${pos.page === editorPage ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-50 bg-slate-50/50 opacity-40'}`}>
                          <div className="flex justify-between items-start mb-4">
                             <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-tighter">NAME #{idx+1}</span>
                             <button onClick={() => removeZone('printName', idx)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Page</span><input type="number" value={pos.page} onChange={(e) => updateZone('printName', idx, { page: parseInt(e.target.value) || 1 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">X</span><input type="number" value={pos.x} onChange={(e) => updateZone('printName', idx, { x: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Y</span><input type="number" value={pos.y} onChange={(e) => updateZone('printName', idx, { y: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Font</span><input type="number" value={pos.fontSize} onChange={(e) => updateZone('printName', idx, { fontSize: parseInt(e.target.value) || 12 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights List */}
                  <div className="space-y-6 pt-6 border-t border-slate-50 pb-20">
                    <div className="flex justify-between items-center text-amber-500">
                      <div className="flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4" />
                        <h3 className="font-black uppercase text-[11px] tracking-widest">Client Sign Here</h3>
                      </div>
                      <button onClick={() => addZone('highlight')} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-amber-100">+ Page {editorPage}</button>
                    </div>
                    <div className="space-y-4">
                      {editingTemplate.clientHighlights.map((pos, idx) => (
                        <div key={idx} className={`p-5 rounded-3xl border-2 transition-all ${pos.page === editorPage ? 'border-amber-100 bg-amber-50/20' : 'border-slate-50 bg-slate-50/50 opacity-40'}`}>
                          <div className="flex justify-between items-start mb-4">
                             <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-tighter">HL #{idx+1}</span>
                             <button onClick={() => removeZone('highlight', idx)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Page</span><input type="number" value={pos.page} onChange={(e) => updateZone('highlight', idx, { page: parseInt(e.target.value) || 1 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">X</span><input type="number" value={pos.x} onChange={(e) => updateZone('highlight', idx, { x: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                             <div><span className="text-[9px] font-black text-slate-400 uppercase px-1">Y</span><input type="number" value={pos.y} onChange={(e) => updateZone('highlight', idx, { y: parseInt(e.target.value) || 0 })} className="w-full p-2 bg-white rounded-xl border text-xs font-black" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
