
import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Wallet, 
  Cpu, 
  CheckCircle2, 
  ExternalLink,
  Info,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowLeft,
  Settings,
  Lock,
  Copy,
  Hash,
  QrCode
} from 'lucide-react';
import { BlockchainNetwork, TokenConfig, DeploymentStatus, AIAnalysis, AdminSettings } from './types';
import { analyzeTokenomics, generateTokenMetadata } from './services/geminiService';

// --- Constants & Defaults ---
const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  solanaWallet: 'ADminSoLanaWaLLetAddr3ssHeresm7v5G',
  ethereumWallet: '0xADminEthWaLLetAddr3ssHeres67891',
  xrpWallet: 'rADminXrpWaLLetAddr3ssHeresX123',
  serviceFee: 0.01
};

// --- Helper for QR Code URL ---
const getQrUrl = (address: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&bgcolor=ffffff&color=030712&margin=10`;

// --- Sub-components ---

const NetworkCard = ({ network, selected, onSelect }: { 
  network: BlockchainNetwork, 
  selected: boolean, 
  onSelect: (n: BlockchainNetwork) => void 
}) => {
  const configs = {
    [BlockchainNetwork.SOLANA]: {
      name: 'Solana',
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      desc: 'Ultra-fast, low cost, high throughput.',
      color: 'border-purple-500/50 hover:border-purple-400'
    },
    [BlockchainNetwork.ETHEREUM]: {
      name: 'Ethereum',
      icon: <Cpu className="w-8 h-8 text-blue-400" />,
      desc: 'The gold standard for smart contracts.',
      color: 'border-blue-500/50 hover:border-blue-400'
    },
    [BlockchainNetwork.XRP]: {
      name: 'XRP Ledger',
      icon: <Coins className="w-8 h-8 text-green-400" />,
      desc: 'Efficient, sustainable, and scalable.',
      color: 'border-green-500/50 hover:border-green-400'
    }
  };

  const c = configs[network];

  return (
    <button 
      onClick={() => onSelect(network)}
      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col gap-4 group ${
        selected ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : `bg-gray-900/50 ${c.color}`
      }`}
    >
      <div className={`p-3 rounded-xl bg-gray-800 w-fit group-hover:scale-110 transition-transform`}>
        {c.icon}
      </div>
      <div>
        <h3 className="text-xl font-bold">{c.name}</h3>
        <p className="text-gray-400 text-sm mt-1">{c.desc}</p>
      </div>
    </button>
  );
};

const SuccessCelebration = ({ config, status }: { config: TokenConfig, status: DeploymentStatus }) => {
  return (
    <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
      <div className="relative inline-block">
        <div className="absolute inset-0 animate-ping bg-green-500/20 rounded-full"></div>
        <CheckCircle2 className="w-24 h-24 text-green-400 relative z-10 mx-auto" />
      </div>
      <h2 className="text-3xl font-extrabold mt-8 mb-2">Token Successfully Minted!</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-8">
        Your new asset <strong>{config.name} ({config.symbol})</strong> is now live on the {config.network} mainnet.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left max-w-lg mx-auto mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold">Contract Address</label>
            <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg mt-1">
              <code className="text-indigo-400 text-sm truncate mr-2">{status.contractAddress}</code>
              <button className="text-xs text-gray-400 hover:text-white underline" onClick={() => navigator.clipboard.writeText(status.contractAddress || '')}>Copy</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold">Transaction Hash</label>
            <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg mt-1">
              <code className="text-gray-400 text-sm truncate mr-2">{status.txHash}</code>
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
        >
          Create Another Token
        </button>
        <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-all border border-gray-700">
          View Portfolio
        </button>
      </div>
    </div>
  );
};

// --- Admin Subpage Component ---
const AdminPanel = ({ settings, onUpdate, onBack }: { settings: AdminSettings, onUpdate: (s: AdminSettings) => void, onBack: () => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [passInput, setPassInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleSave = () => {
    onUpdate(localSettings);
    alert('Settings updated successfully!');
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-in fade-in duration-500">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black">Admin Access Required</h2>
          <div className="space-y-2">
            <input 
              type="password" 
              placeholder="Enter Admin Password"
              className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={passInput}
              onChange={e => setPassInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (passInput === 'Goodnews123' ? setIsUnlocked(true) : alert('Wrong password'))}
            />
            <button 
              onClick={() => passInput === 'Goodnews123' ? setIsUnlocked(true) : alert('Wrong password')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
            >
              Unlock Dashboard
            </button>
          </div>
          <button onClick={onBack} className="text-gray-500 hover:text-white text-sm">Return to Site</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to TokenLabs
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-10">
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Configure receiver wallets and platform fees.</p>
          </div>
          <Settings className="w-10 h-10 text-gray-700" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: 'Solana Receiver', key: 'solanaWallet', icon: <Zap className="w-4 h-4 text-purple-400" />, address: localSettings.solanaWallet },
            { label: 'Ethereum Receiver', key: 'ethereumWallet', icon: <Cpu className="w-4 h-4 text-blue-400" />, address: localSettings.ethereumWallet },
            { label: 'XRP Receiver', key: 'xrpWallet', icon: <Coins className="w-4 h-4 text-green-400" />, address: localSettings.xrpWallet }
          ].map((item) => (
            <div key={item.key} className="space-y-4">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                {item.icon} {item.label}
              </label>
              <div className="flex gap-4 items-start">
                <input 
                  className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-indigo-400 mono text-sm"
                  value={item.address}
                  onChange={e => setLocalSettings({...localSettings, [item.key as keyof AdminSettings]: e.target.value} as AdminSettings)}
                />
                <div className="w-16 h-16 bg-white rounded-lg p-1 shrink-0 overflow-hidden">
                  <img src={getQrUrl(item.address)} alt="QR Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          ))}
          
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Service Fee (Base)
            </label>
            <input 
              type="number"
              step="0.001"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-yellow-400 font-bold"
              value={localSettings.serviceFee}
              onChange={e => setLocalSettings({...localSettings, serviceFee: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('tokenlabs_admin_v1');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_SETTINGS;
  });

  const [step, setStep] = useState<DeploymentStatus['step']>('setup');
  const [network, setNetwork] = useState<BlockchainNetwork>(BlockchainNetwork.SOLANA);
  const [config, setConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 9,
    totalSupply: '1000000000',
    description: '',
    network: BlockchainNetwork.SOLANA
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState<DeploymentStatus>({ step: 'setup' });
  const [paymentHash, setPaymentHash] = useState('');

  useEffect(() => {
    setConfig(prev => ({ ...prev, network }));
  }, [network]);

  const updateAdminSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    localStorage.setItem('tokenlabs_admin_v1', JSON.stringify(newSettings));
  };

  const handleAIAnalysis = async () => {
    if (!config.name || !config.symbol || !config.description) {
      alert("Please fill in Name, Symbol, and Description first.");
      return;
    }
    setIsAnalyzing(true);
    const result = await analyzeTokenomics(config);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleNextToPayment = () => {
    if (!config.name || !config.symbol) return;
    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!paymentHash.trim()) {
      alert("Please enter the payment transaction hash for verification.");
      return;
    }
    setStep('minting');
    setIsMinting(true);
    
    // Simulate Blockchain Magic
    await new Promise(r => setTimeout(r, 4000));
    
    const fakeAddress = network === BlockchainNetwork.SOLANA 
      ? '7nE8v5G...p9w2k' 
      : '0x71C765...67891';
    
    const fakeHash = '5f2d6...3e9a';

    setStatus({
      step: 'success',
      contractAddress: fakeAddress,
      txHash: fakeHash,
      paymentTxHash: paymentHash
    });
    setStep('success');
    setIsMinting(false);
  };

  const getTargetWallet = () => {
    switch(network) {
      case BlockchainNetwork.SOLANA: return adminSettings.solanaWallet;
      case BlockchainNetwork.ETHEREUM: return adminSettings.ethereumWallet;
      case BlockchainNetwork.XRP: return adminSettings.xrpWallet;
    }
  };

  const getCurrency = () => {
    switch(network) {
      case BlockchainNetwork.SOLANA: return 'SOL';
      case BlockchainNetwork.ETHEREUM: return 'ETH';
      case BlockchainNetwork.XRP: return 'XRP';
    }
  };

  if (isAdminView) {
    return <AdminPanel settings={adminSettings} onUpdate={updateAdminSettings} onBack={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform">
            <Rocket className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            TOKENLABS
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); setIsAdminView(true); }}>Admin</a>
        </div>
        <button className="px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        
        {/* Progress Bar */}
        {step !== 'success' && (
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              {['Configuration', 'Payment', 'Minting'].map((s, i) => {
                const stepIdx = i === 0 ? 'setup' : i === 1 ? 'payment' : 'minting';
                const isActive = step === stepIdx;
                const isPast = (step === 'payment' && i === 0) || (step === 'minting' && i <= 1);
                return (
                  <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                      isActive ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/20' : 
                      isPast ? 'bg-green-500 border-green-500' : 'bg-gray-900 border-gray-800 text-gray-600'
                    }`}>
                      {isPast ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}>
                      {s}
                    </span>
                    {i < 2 && (
                       <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 z-0 ${
                        isPast ? 'bg-green-500' : 'bg-gray-800'
                       }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- STEP: SETUP --- */}
        {step === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Create your token.</h1>
                <p className="text-gray-400 text-lg">Choose your network and configure your asset parameters.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Select Network</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <NetworkCard network={BlockchainNetwork.SOLANA} selected={network === BlockchainNetwork.SOLANA} onSelect={setNetwork} />
                  <NetworkCard network={BlockchainNetwork.ETHEREUM} selected={network === BlockchainNetwork.ETHEREUM} onSelect={setNetwork} />
                  <NetworkCard network={BlockchainNetwork.XRP} selected={network === BlockchainNetwork.XRP} onSelect={setNetwork} />
                </div>
              </section>

              <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Token Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Galactic Credits"
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={config.name}
                      onChange={e => setConfig({...config, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Symbol (Ticker)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GALA"
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={config.symbol}
                      onChange={e => setConfig({...config, symbol: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Total Supply</label>
                    <input 
                      type="number" 
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={config.totalSupply}
                      onChange={e => setConfig({...config, totalSupply: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Decimals</label>
                    <input 
                      type="number" 
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={config.decimals}
                      onChange={e => setConfig({...config, decimals: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-300">Description & Roadmap</label>
                    <button 
                      onClick={async () => {
                        const enhanced = await generateTokenMetadata(config);
                        setConfig({...config, description: enhanced});
                      }}
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Enhance
                    </button>
                  </div>
                  <textarea 
                    rows={4}
                    placeholder="Describe what your token is for..."
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    value={config.description}
                    onChange={e => setConfig({...config, description: e.target.value})}
                  />
                </div>
              </section>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={handleNextToPayment}
                  disabled={!config.name || !config.symbol}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-lg flex items-center gap-2 transition-all group"
                >
                  Review & Pay
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Sidebar: AI Advisor */}
            <div className="space-y-6">
              <div className="gradient-border">
                <div className="gradient-border-content p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-indigo-400 uppercase tracking-widest text-xs">AI Token Advisor</h3>
                  </div>
                  
                  {!analysis ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400">
                        Let Gemini analyze your token configuration for potential red flags and market viability.
                      </p>
                      <button 
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className="w-full py-2.5 bg-indigo-600/20 border border-indigo-500/50 rounded-xl text-indigo-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600/30 transition-all"
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Analyze Tokenomics
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Viability Score:</span>
                        <span className={`text-lg font-black ${analysis.viabilityScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {analysis.viabilityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${analysis.viabilityScore > 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${analysis.viabilityScore}%` }}
                        />
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex gap-2">
                          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-300 leading-relaxed italic">"{analysis.marketAnalysis.substring(0, 100)}..."</p>
                        </div>
                        {analysis.riskWarnings.length > 0 && (
                          <div className="flex gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400 font-medium">{analysis.riskWarnings[0]}</p>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => setAnalysis(null)}
                        className="text-xs text-gray-500 hover:text-white underline mt-2"
                      >
                        Reset Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  Estimated Costs
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Gas Fee</span>
                    <span>~0.005 {getCurrency()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creation Fee</span>
                    <span>{adminSettings.serviceFee.toFixed(3)} {getCurrency()}</span>
                  </div>
                  <div className="h-px bg-gray-800 my-2" />
                  <div className="flex justify-between font-bold text-lg text-white">
                    <span>Total</span>
                    <span className="text-indigo-400">{(adminSettings.serviceFee + 0.005).toFixed(3)} {getCurrency()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP: PAYMENT --- */}
        {step === 'payment' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setStep('setup')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Configuration
            </button>

            <section className="text-center">
              <h2 className="text-4xl font-black mb-2">Complete Payment</h2>
              <p className="text-gray-400">Scan the QR code or copy the address below to authorize minting.</p>
            </section>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12">
              {/* QR Side */}
              <div className="md:col-span-4 bg-white p-8 flex flex-col items-center justify-center gap-4">
                 <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-gray-100">
                    <img src={getQrUrl(getTargetWallet())} alt="Receiver QR Code" className="w-full h-full object-contain" />
                 </div>
                 <div className="flex items-center gap-2 text-[#030712]">
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Scan to Pay</span>
                 </div>
              </div>

              {/* Details Side */}
              <div className="md:col-span-8 p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-6">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">Payment Amount</h3>
                      <div className="text-4xl font-black">{(adminSettings.serviceFee + 0.005).toFixed(3)} {getCurrency()}</div>
                    </div>
                    <div className="px-4 py-2 bg-gray-800 rounded-full text-[10px] font-black border border-gray-700 uppercase tracking-widest text-gray-300">
                       Network: {network}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Receiver Address</label>
                    <div className="bg-black/50 border border-gray-700 rounded-2xl p-4 flex items-center justify-between gap-4 group hover:border-indigo-500/50 transition-colors">
                      <code className="text-indigo-400 text-sm md:text-base truncate select-all mono">{getTargetWallet()}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(getTargetWallet() || '');
                          alert('Address copied!');
                        }}
                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all shrink-0"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                    <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                    <p className="text-xs text-yellow-500/80 leading-relaxed">
                      Ensure you send exactly <strong>{(adminSettings.serviceFee + 0.005).toFixed(3)} {getCurrency()}</strong>. Deployment starts immediately after hash verification.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Transaction Hash (TXID)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Paste your transaction ID here"
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={paymentHash}
                      onChange={e => setPaymentHash(e.target.value)}
                    />
                    <button 
                      onClick={handlePaymentSubmit}
                      disabled={!paymentHash.trim()}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      Verify & Start Minting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP: MINTING (LOADING) --- */}
        {step === 'minting' && (
          <div className="max-w-xl mx-auto text-center py-20 animate-in fade-in duration-700">
             <div className="relative w-40 h-40 mx-auto mb-12">
                <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-4 border-b-4 border-purple-500 rounded-full animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="w-12 h-12 text-indigo-400 animate-bounce" />
                </div>
             </div>
             <h2 className="text-3xl font-black mb-4">Minting Asset...</h2>
             <div className="space-y-4 max-w-sm mx-auto">
                <p className="text-gray-400 animate-pulse">Communicating with {network} validators</p>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>DEPLOYMENT STATUS</span>
                      <span>85%</span>
                   </div>
                   <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-[progress_5s_ease-in-out]" />
                   </div>
                </div>
                <p className="text-[10px] text-gray-600 italic">Verifying payment hash {paymentHash.substring(0, 12)}...</p>
             </div>
          </div>
        )}

        {/* --- STEP: SUCCESS --- */}
        {step === 'success' && status && (
          <SuccessCelebration config={config} status={status} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 bg-black/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-600 rounded">
                  <Rocket className="w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tighter">TOKENLABS</span>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
               The premier multi-chain asset factory. Secure, fast, and intelligent token creation for everyone.
             </p>
          </div>
          <div className="space-y-4">
             <h5 className="font-bold text-sm">Product</h5>
             <ul className="text-xs text-gray-500 space-y-2">
                <li className="hover:text-white cursor-pointer transition-colors">Launchpad</li>
                <li className="hover:text-white cursor-pointer transition-colors">Smart Locker</li>
                <li className="hover:text-white cursor-pointer transition-colors">Analytics</li>
             </ul>
          </div>
          <div className="space-y-4">
             <h5 className="font-bold text-sm">Legal</h5>
             <ul className="text-xs text-gray-500 space-y-2">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors font-bold text-indigo-400" onClick={() => setIsAdminView(true)}>Admin Portal</li>
             </ul>
          </div>
          <div className="space-y-4">
             <h5 className="font-bold text-sm">Social</h5>
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-all cursor-pointer">
                   <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-all cursor-pointer">
                   <ShieldCheck className="w-4 h-4 text-gray-400" />
                </div>
             </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          © 2024 TokenLabs Protocols Inc. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
