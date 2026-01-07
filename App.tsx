
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
  ChevronRight,
  History,
  Clock,
  Type,
  MousePointer2,
  CloudDownload,
  Link,
  UserCheck,
  Edit3
} from 'lucide-react';
import { ViewMode, ContractTemplate, Coordinate, ProcessedDocument, TextZone } from './types';
import { processContract } from './services/pdfService';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PREVIEW_SCALE = 0.5;

const INITIAL_TEMPLATES: ContractTemplate[] = [
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
    id: 'bns-preset',
    companyName: 'BNS',
    description: 'Bank of Nova Scotia Standard Layout',
    employeeSignatures: [
      { x: 396, y: 100, width: 120, height: 40, page: 4 }
    ],
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
    id: 'td-preset',
    companyName: 'TD',
    description: 'TD Bank Standard Layout',
    employeeSignatures: [
      { x: 90, y: 50, width: 120, height: 40, page: 6 }
    ],
    clientHighlights: [
      { x: 324, y: 290, width: 120, height: 40, page: 6 },
      { x: 200, y: 290, width: 120, height: 40, page: 6 },
      { x: 200, y: 330, width: 120, height: 40, page: 10 },
      { x: 420, y: 330, width: 120, height: 40, page: 10 }
    ],
    printNameZones: [],
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
    id: 'gb-preset',
    companyName: 'GB',
    description: 'Global Business Standard Layout',
    employeeSignatures: [
      { x: 234, y: 160, width: 120, height: 40, page: 1 },
      { x: 74, y: 180, width: 120, height: 40, page: 11 },
      { x: 72, y: 110, width: 120, height: 40, page: 12 }
    ],
    clientHighlights: [
      { x: 102, y: 570, width: 120, height: 40, page: 11 },
      { x: 382, y: 570, width: 120, height: 40, page: 11 },
      { x: 70, y: 120, width: 120, height: 40, page: 14 },
      { x: 252, y: 120, width: 120, height: 40, page: 14 }
    ],
    printNameZones: [
      { x: 202, y: 150, width: 120, height: 15, page: 1, fontSize: 15 },
      { x: 388, y: 190, width: 120, height: 15, page: 11, fontSize: 15 },
      { x: 376, y: 121, width: 120, height: 15, page: 12, fontSize: 15 }
    ],
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
    id: 'bnc-preset',
    companyName: 'BNC',
    description: 'BNC Standard Layout',
    employeeSignatures: [
      { x: 60, y: 590, width: 120, height: 40, page: 13 },
      { x: 83, y: 270, width: 120, height: 40, page: 14 },
      { x: 87, y: 300, width: 120, height: 40, page: 17 }
    ],
    clientHighlights: [
      { x: 200, y: 470, width: 120, height: 40, page: 13 },
      { x: 200, y: 360, width: 120, height: 40, page: 13 },
      { x: 520, y: 694, width: 50, height: 20, page: 15 },
      { x: 520, y: 670, width: 50, height: 20, page: 15 },
      { x: 85, y: 410, width: 120, height: 40, page: 17 },
      { x: 85, y: 462, width: 120, height: 40, page: 17 }
    ],
    printNameZones: [
      { x: 243, y: 300, width: 120, height: 40, page: 17, fontSize: 15 }
    ],
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
    id: 'ia-preset',
    companyName: 'iA',
    description: 'iA Standard Layout',
    employeeSignatures: [
      { x: 60, y: 180, width: 120, height: 40, page: 5 }
    ],
    clientHighlights: [
      { x: 56, y: 540, width: 150, height: 30, page: 5 },
      { x: 334, y: 540, width: 150, height: 30, page: 5 },
      { x: 35, y: 80, width: 150, height: 30, page: 6 },
      { x: 35, y: 60, width: 150, height: 30, page: 6 }
    ],
    printNameZones: [],
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
    id: 'santander-preset',
    companyName: 'Santander',
    description: 'Santander Standard Layout',
    employeeSignatures: [
      { x: 320, y: 145, width: 100, height: 30, page: 11 }
    ],
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
    printNameZones: [
      { x: 320, y: 135, width: 100, height: 30, page: 11, fontSize: 15 }
    ],
    createdAt: Date.now()
  }
];

const App: React.FC = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('contract_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      const existingIds = new Set(parsed.map((t: any) => t.id));
      const missingInitial = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
      return [...parsed, ...missingInitial];
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
  
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/15lNxwzZVhZxd_OO-4gY4a4yNkGOTVPWZpAB4naAyiFM/edit?usp=sharing');
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSyncFromSheets = async () => {
    setIsSyncing(true);
    try {
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) throw new Error("Invalid Google Sheets URL");
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error("Failed to fetch sheet data.");
      
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      const newTemplates: ContractTemplate[] = rows.slice(1)
        .filter(row => row[0])
        .map((row, index) => ({
          id: `sheet-${index}-${Date.now()}`,
          companyName: row[0] || 'Imported Template',
          description: row[1] || 'Imported from Google Sheets',
          employeeSignatures: row[2] ? [{ x: parseInt(row[2]), y: parseInt(row[3]), width: parseInt(row[4]), height: parseInt(row[5]), page: parseInt(row[6]) }] : [],
          clientHighlights: row[7] ? [{ x: parseInt(row[7]), y: parseInt(row[8]), width: parseInt(row[9]), height: parseInt(row[10]), page: parseInt(row[11]) }] : [],
          printNameZones: row[12] ? [{ x: parseInt(row[12]), y: parseInt(row[13]), width: 150, height: 15, fontSize: parseInt(row[14]) || 10, page: parseInt(row[15]) || 1 }] : [],
          createdAt: Date.now()
        }));

      setTemplates(prev => [...prev, ...newTemplates]);
      alert(`Imported ${newTemplates.length} templates!`);
      setShowSyncModal(false);
    } catch (error: any) {
      alert(`Sync Failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
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
    setEditingTemplate({
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      companyName: '',
      description: 'Custom Layout',
      employeeSignatures: [],
      clientHighlights: [],
      printNameZones: [],
      createdAt: Date.now()
    });
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
      setEditingTemplate({ ...editingTemplate, employeeSignatures: editingTemplate.employeeSignatures.filter((_, i) => i !== index) });
    } else if (type === 'highlight') {
      setEditingTemplate({ ...editingTemplate, clientHighlights: editingTemplate.clientHighlights.filter((_, i) => i !== index) });
    } else {
      setEditingTemplate({ ...editingTemplate, printNameZones: editingTemplate.printNameZones.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">ContractSigner Pro</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Secure Local Processing
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setShowSyncModal(true)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Sync Layouts">
               <CloudDownload className="w-5 h-5" />
             </button>
             {processedHistory.length > 0 && (
               <div className="relative group">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                   <History className="w-5 h-5" />
                 </button>
                 <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Recent Session</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                       {processedHistory.slice(0, 5).map(doc => (
                         <div key={doc.id} className="text-[11px] font-medium text-slate-600 border-b border-slate-50 pb-1">
                           {doc.fileName.slice(0, 30)}...
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Integrated Identity Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 pb-4">
            <UserCheck className="w-5 h-5 text-indigo-500" /> Step 1: My Profile
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Print Name</label>
               <input 
                 type="text" 
                 value={printName} 
                 onChange={(e) => setPrintName(e.target.value)} 
                 placeholder="Sarah J. Smith, Manager"
                 className="w-full p-4 bg-slate-50 border-0 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
               />
               <p className="text-[10px] text-slate-400 italic">Name added as clear text to signature areas.</p>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Signature PNG</label>
               <div className="relative h-20 w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center group transition-all hover:border-indigo-200">
                  {employeeSignature ? (
                    <img src={employeeSignature} className="max-h-full max-w-full p-4 object-contain" />
                  ) : (
                    <PenTool className="w-6 h-6 text-slate-200" />
                  )}
                  <input type="file" accept="image/png" onChange={handleSignatureUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Main Process Card */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm space-y-12">
          
          {/* File Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-900 font-black text-xs uppercase tracking-widest">
              <FileText className="w-5 h-5 text-indigo-500" /> Step 2: Upload Document
            </div>
            <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all bg-slate-50 group ${selectedFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-400'}`}>
              <input type="file" accept=".pdf" onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setProcessedPdfUrl(null);
              }} className="hidden" id="pdf-upload" />
              <label htmlFor="pdf-upload" className="cursor-pointer block">
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ready to sign • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    <p className="text-base font-bold text-slate-900">Choose PDF Contract</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-900 font-black text-xs uppercase tracking-widest">
                <Layout className="w-5 h-5 text-indigo-500" /> Step 3: Select Layout
              </div>
              {selectedTemplate && (
                <button onClick={() => {
                  const t = templates.find(temp => temp.id === selectedTemplate);
                  if (t) setEditingTemplate({...t});
                }} className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:underline">
                  <Edit3 className="w-3.5 h-3.5" /> Customize Layout
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <select value={selectedTemplate} onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setProcessedPdfUrl(null);
               }} className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-white font-black text-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:outline-none">
                  <option value="">-- Choose Preset Layout --</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.companyName}</option>)}
               </select>
               <button onClick={() => { setIsNewTemplate(true); startNewTemplate(); }} className="p-5 border-2 border-dashed border-slate-200 rounded-2xl font-black text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Create Custom Preset
               </button>
            </div>
          </div>

          {/* Execution */}
          <div className="pt-6">
            <button 
              disabled={!selectedFile || !selectedTemplate || !employeeSignature || isProcessing} 
              onClick={handleProcess} 
              className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-[0.98]"
            >
              {isProcessing ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <><ShieldCheck className="w-7 h-7" /> Process Signed PDF</>}
            </button>
          </div>

          {/* Output */}
          {processedPdfUrl && (
            <div className="p-10 bg-emerald-50 rounded-[3rem] text-center border-4 border-emerald-100 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
              <h3 className="text-emerald-900 font-black text-2xl mb-2">Success!</h3>
              <p className="text-emerald-700 text-sm mb-10 font-medium italic">Identity markers applied to your PDF locally.</p>
              <a href={processedPdfUrl} download={`Signed_${selectedFile?.name}`} className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
                <Download className="w-6 h-6" /> Download Result
              </a>
            </div>
          )}
        </div>

        {/* Visual Editor Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Building2 className="w-6 h-6" /></div>
                   <h2 className="text-xl font-black text-slate-900">Layout Preset: {editingTemplate.companyName || 'Custom'}</h2>
                </div>
                <button onClick={() => setEditingTemplate(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Canvas */}
                <div className="flex-1 bg-slate-100 p-12 overflow-auto flex justify-center items-start">
                  <div className="bg-white shadow-2xl relative flex-shrink-0 ring-8 ring-white" style={{ width: A4_WIDTH * PREVIEW_SCALE, height: A4_HEIGHT * PREVIEW_SCALE }}>
                    {/* Markers */}
                    {editingTemplate.employeeSignatures.map((pos, idx) => (
                      <div key={`sig-${idx}`} className="absolute border-2 border-indigo-600 bg-indigo-100/80 flex items-center justify-center cursor-move shadow-lg ring-4 ring-indigo-500/10"
                        style={{ left: (pos.x || 0) * PREVIEW_SCALE, top: pdfYToCssTop(pos.y || 0, pos.height || 40), width: (pos.width || 120) * PREVIEW_SCALE, height: (pos.height || 40) * PREVIEW_SCALE }}
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
                      ><span className="text-[10px] font-black text-indigo-900 uppercase">Sign</span></div>
                    ))}
                    
                    {editingTemplate.printNameZones.map((pos, idx) => (
                      <div key={`name-${idx}`} className="absolute border-2 border-emerald-600 bg-emerald-100/80 flex items-center justify-center cursor-move shadow-lg ring-4 ring-emerald-500/10"
                        style={{ left: (pos.x || 0) * PREVIEW_SCALE, top: pdfYToCssTop(pos.y || 0, pos.height || 15), width: (pos.width || 150) * PREVIEW_SCALE, height: (pos.height || 15) * PREVIEW_SCALE }}
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
                      ><span className="text-[10px] font-black text-emerald-900 uppercase">Name</span></div>
                    ))}
                    
                    {editingTemplate.clientHighlights.map((pos, idx) => (
                      <div key={`high-${idx}`} className="absolute border-2 border-amber-500 bg-amber-200/80 flex items-center justify-center cursor-move shadow-lg ring-4 ring-amber-500/10"
                        style={{ left: (pos.x || 0) * PREVIEW_SCALE, top: pdfYToCssTop(pos.y || 0, pos.height || 50), width: (pos.width || 150) * PREVIEW_SCALE, height: (pos.height || 50) * PREVIEW_SCALE }}
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
                      ><span className="text-[10px] font-black text-amber-900 uppercase">HL</span></div>
                    ))}
                  </div>
                </div>
                
                {/* Sidebar Controls */}
                <div className="w-full lg:w-[420px] bg-slate-50 border-l border-slate-100 p-8 overflow-y-auto space-y-8 shadow-2xl z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preset Info</label>
                    <input type="text" value={editingTemplate.companyName} onChange={(e) => setEditingTemplate({...editingTemplate, companyName: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-black shadow-sm border-0 focus:ring-4 focus:ring-indigo-500/10" placeholder="e.g. Acme Corp" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Employee Signatures</label><button onClick={() => addZone('sig')} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-black">+ Add</button></div>
                    {editingTemplate.employeeSignatures.map((pos, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-5 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="col-span-2 flex justify-between font-bold"><span>Pos #{idx+1}</span><button onClick={() => removeZone('sig', idx)} className="text-red-400"><Trash2 className="w-3 h-3"/></button></div>
                        <input type="number" value={pos.page} onChange={(e) => {
                          const updated = [...editingTemplate.employeeSignatures];
                          updated[idx] = { ...updated[idx], page: parseInt(e.target.value) || 1 };
                          setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                        }} className="p-2 border-slate-100 border rounded" placeholder="P" />
                        <input type="number" value={pos.width} onChange={(e) => {
                          const updated = [...editingTemplate.employeeSignatures];
                          updated[idx] = { ...updated[idx], width: parseInt(e.target.value) || 0 };
                          setEditingTemplate({...editingTemplate, employeeSignatures: updated});
                        }} className="p-2 border-slate-100 border rounded" placeholder="W" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Print Names</label><button onClick={() => addZone('printName')} className="text-[10px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-black">+ Add</button></div>
                    {editingTemplate.printNameZones.map((pos, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-5 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="col-span-2 flex justify-between font-bold"><span>Name Pos #{idx+1}</span><button onClick={() => removeZone('printName', idx)} className="text-red-400"><Trash2 className="w-3 h-3"/></button></div>
                        <input type="number" value={pos.page} onChange={(e) => {
                          const updated = [...editingTemplate.printNameZones];
                          updated[idx] = { ...updated[idx], page: parseInt(e.target.value) || 1 };
                          setEditingTemplate({...editingTemplate, printNameZones: updated});
                        }} className="p-2 border-slate-100 border rounded" placeholder="P" />
                        <input type="number" value={pos.fontSize} onChange={(e) => {
                          const updated = [...editingTemplate.printNameZones];
                          updated[idx] = { ...updated[idx], fontSize: parseInt(e.target.value) || 10 };
                          setEditingTemplate({...editingTemplate, printNameZones: updated});
                        }} className="p-2 border-slate-100 border rounded" placeholder="Size" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Highlights</label><button onClick={() => addZone('highlight')} className="text-[10px] bg-amber-500 text-white px-3 py-1.5 rounded-lg font-black">+ Add</button></div>
                    {editingTemplate.clientHighlights.map((pos, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-2xl shadow-sm border border-amber-5 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="col-span-2 flex justify-between font-bold"><span>HL Area #{idx+1}</span><button onClick={() => removeZone('highlight', idx)} className="text-red-400"><Trash2 className="w-3 h-3"/></button></div>
                        <input type="number" value={pos.page} onChange={(e) => {
                          const updated = [...editingTemplate.clientHighlights];
                          updated[idx] = { ...updated[idx], page: parseInt(e.target.value) || 1 };
                          setEditingTemplate({...editingTemplate, clientHighlights: updated});
                        }} className="p-2 border-slate-100 border rounded" placeholder="P" />
                        <input type="number" value={pos.height} onChange={(e) => {
                          const updated = [...editingTemplate.clientHighlights];
                          updated[idx] = { ...updated[idx], height: parseInt(e.target.value) || 0 };
                          setEditingTemplate({...editingTemplate, clientHighlights: updated});
                        }} className="p-2 border-slate-100 border rounded" placeholder="H" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-slate-200 sticky bottom-0 bg-slate-50 flex gap-4">
                    <button onClick={saveEditedTemplate} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">Save Template</button>
                    <button onClick={() => setEditingTemplate(null)} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Modal */}
        {showSyncModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3"><CloudDownload className="w-6 h-6 text-emerald-600" /><h2 className="text-xl font-black text-slate-900">Import Presets</h2></div>
                <button onClick={() => setShowSyncModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Google Sheet URL..." />
                <button onClick={handleSyncFromSheets} disabled={isSyncing} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl">
                  {isSyncing ? "Syncing..." : "Sync from Sheets"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
