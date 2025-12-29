import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Plus, 
  Check, 
  X, 
  Zap, 
  Clock, 
  MoreVertical, 
  Bell,
  Search,
  ChevronRight,
  Clipboard,
  Calendar,
  Lock,
  Tag,
  Fingerprint,
  Filter,
  RefreshCw,
  Cpu,
  Monitor,
  Wifi,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  ChevronLeft,
  Trash2,
  Download,
  FileText
} from 'lucide-react';

// --- Mock Data ---
const INITIAL_POLICIES = [
  { id: 'pol_1', name: 'NYC_Warehouse_ESP', pin: '8821-X', maxClients: 50, enrolled: 42, autoApprove: true, status: 'Active', expiry: '2025-12-31', allowedIdentifiers: [] },
  { id: 'pol_2', name: 'London_Office_App', pin: '4412-B', maxClients: 10, enrolled: 1, autoApprove: false, status: 'Active', expiry: '2025-11-15', allowedIdentifiers: ['ios-app-v1', 'android-client-prod'] },
  { id: 'pol_3', name: 'Legacy_Hardware', pin: '9001-Z', maxClients: 100, enrolled: 100, autoApprove: true, status: 'Full', expiry: '2024-12-01', allowedIdentifiers: [] },
];

const INITIAL_CLIENTS = [
  { id: 'cli_1', identifier: 'esp8266-9912', type: 'Hardware', protocol: 'WebSocket', status: 'Online', lastSeen: 'Just now', policy: 'NYC_Warehouse_ESP', ip: '192.168.1.45', firmware: 'v2.1.0' },
  { id: 'cli_2', identifier: 'ios-app-pro', type: 'Application', protocol: 'HTTP', status: 'Online', lastSeen: '45s ago', policy: 'London_Office_App', ip: '72.14.21.9', version: '1.4.2' },
  { id: 'cli_3', identifier: 'esp32-temp-04', type: 'Hardware', protocol: 'WebSocket', status: 'Offline', lastSeen: '2h ago', policy: 'NYC_Warehouse_ESP', ip: '192.168.1.112', firmware: 'v1.0.8' },
  { id: 'cli_4', identifier: 'dashboard-web', type: 'Application', protocol: 'WebSocket', status: 'Online', lastSeen: '1m ago', policy: 'Default', ip: '108.12.5.1', version: 'N/A' },
];

const INITIAL_LOGS = [
  { id: 'log_1', timestamp: '2025-12-28 10:42:01', level: 'Info', source: 'System', event: 'System Startup', details: 'Dashboard initialized successfully.' },
  { id: 'log_2', timestamp: '2025-12-28 10:45:12', level: 'Success', source: 'Admin', event: 'Policy Created', details: 'Policy "NYC_Warehouse_ESP" created with PIN 8821-X.' },
  { id: 'log_3', timestamp: '2025-12-28 11:20:05', level: 'Warning', source: 'esp8266-9912', event: 'High Latency', details: 'Client reported 450ms latency.' },
  { id: 'log_4', timestamp: '2025-12-28 11:30:00', level: 'Error', source: 'Auth', event: 'Invalid PIN', details: 'Failed enrollment attempt from IP 192.168.1.100.' },
  { id: 'log_5', timestamp: '2025-12-28 12:00:01', level: 'Success', source: 'Admin', event: 'Client Approved', details: 'Manual approval for client "esp8266-new-04".' },
];

const MOCK_MESSAGES = [
  { id: 1, type: 'uplink', payload: '{"temp": 24.5, "humidity": 60}', timestamp: '12:04:01' },
  { id: 2, type: 'downlink', payload: '{"led": "ON"}', timestamp: '12:04:15' },
  { id: 3, type: 'uplink', payload: '{"status": "OK", "uptime": 3600}', timestamp: '12:05:01' },
];

// --- Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Full: 'bg-red-500/10 text-red-400 border-red-500/20',
    Expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Offline: 'bg-zinc-500/10 text-zinc-500 border-zinc-800',
    Info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Error: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-1 text-[10px] font-bold border rounded-full uppercase tracking-tighter ${styles[status] || styles.Expired}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-[#1A1A1A] border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
    <div>
      <p className="text-zinc-500 text-[11px] font-black uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white leading-none">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={20} />
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('clients'); 
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  
  const [newPolicy, setNewPolicy] = useState({
    name: '', maxClients: 10, autoApprove: false, expiry: '', customPin: '', allowedIdentifiersStr: '' 
  });

  const handleCreatePolicy = (e) => {
    e.preventDefault();
    const finalPin = newPolicy.customPin.trim() !== '' 
      ? newPolicy.customPin.toUpperCase() 
      : Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 3).toUpperCase();

    const policy = {
      id: `pol_${Date.now()}`,
      name: newPolicy.name,
      maxClients: newPolicy.maxClients,
      autoApprove: newPolicy.autoApprove,
      expiry: newPolicy.expiry || 'No Expiry',
      pin: finalPin,
      allowedIdentifiers: newPolicy.allowedIdentifiersStr.split(',').map(i => i.trim()).filter(i => i),
      enrolled: 0,
      status: 'Active'
    };

    setPolicies([policy, ...policies]);
    
    // Add Log Entry
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      level: 'Success',
      source: 'Admin',
      event: 'Policy Created',
      details: `Policy "${policy.name}" created with PIN ${policy.pin}.`
    };
    setLogs([newLog, ...logs]);

    setShowCreateModal(false);
    setNewPolicy({ name: '', maxClients: 10, autoApprove: false, expiry: '', customPin: '', allowedIdentifiersStr: '' });
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      type: 'downlink',
      payload: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour12: false })
    };
    setMessages([...messages, newMsg]);
    setMessageInput('');
  };

  const filteredPolicies = policies.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredClients = clients.filter(c => c.identifier.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLogs = logs.filter(l => 
    l.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-zinc-300 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col bg-[#0F0F0F]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]">W</div>
          <span className="text-xl font-bold tracking-tight text-white italic">wbskt</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => {setActiveTab('clients'); setSelectedClient(null);}} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            <Users size={18} />
            <span className="font-medium text-sm">Clients</span>
          </button>
          <button onClick={() => {setActiveTab('policies'); setSelectedClient(null);}} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'policies' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            <Shield size={18} />
            <span className="font-medium text-sm">Policies</span>
          </button>
          <button onClick={() => {setActiveTab('approvals'); setSelectedClient(null);}} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'approvals' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            <Zap size={18} />
            <span className="font-medium text-sm flex-1 text-left">Approvals</span>
            <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]">2</span>
          </button>
          <button onClick={() => {setActiveTab('logs'); setSelectedClient(null);}} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:bg-zinc-800'}`}>
            <FileText size={18} />
            <span className="font-medium text-sm">Logs</span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-700"></div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] text-zinc-500">Free Tier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-[#0F0F0F]">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {selectedClient && (
              <button onClick={() => setSelectedClient(null)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 mr-2">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Platform / {activeTab === 'policies' ? 'Policies' : activeTab === 'clients' ? (selectedClient ? 'Client Detail' : 'Clients') : activeTab === 'approvals' ? 'Approvals' : 'System Logs'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-zinc-500 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-bold uppercase tracking-widest">
              <RefreshCw size={14} /> Sync
            </button>
            <div className="w-px h-4 bg-zinc-800"></div>
            <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* --- CLIENTS VIEW --- */}
          {activeTab === 'clients' && !selectedClient && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Clients" value={clients.length} icon={Users} colorClass="bg-blue-500/20 text-blue-400" />
                <StatCard title="Online Now" value={clients.filter(c => c.status === 'Online').length} icon={Activity} colorClass="bg-emerald-500/20 text-emerald-400" />
                <StatCard title="Hardware" value={clients.filter(c => c.type === 'Hardware').length} icon={Cpu} colorClass="bg-zinc-500/20 text-zinc-400" />
                <StatCard title="Applications" value={clients.filter(c => c.type === 'Application').length} icon={Monitor} colorClass="bg-zinc-500/20 text-zinc-400" />
              </div>

              {/* Toolbar & Table Section */}
              <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#151515] border-b border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input 
                        type="text" placeholder="Search identifiers, IPs, or policies..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 font-medium"
                      />
                    </div>
                    <button className="p-2 bg-[#0F0F0F] border border-zinc-800 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                      <Filter size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#151515] text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4">Identifier</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-center">Protocol</th>
                        <th className="px-6 py-4">Policy</th>
                        <th className="px-6 py-4">Last Seen</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm">
                      {filteredClients.map((c) => (
                        <tr 
                          key={c.id} 
                          onClick={() => setSelectedClient(c)}
                          className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded bg-zinc-800/50 text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors`}>
                                {c.type === 'Hardware' ? <Cpu size={16} /> : <Monitor size={16} />}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{c.identifier}</p>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-0.5">{c.ip}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{c.type}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/40 border border-zinc-800 rounded text-[9px] font-black uppercase text-zinc-500">
                              <Wifi size={10} className={c.protocol === 'WebSocket' ? 'text-blue-400' : 'text-amber-400'} />
                              {c.protocol}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                              <Shield size={12} className="text-emerald-500/50" />
                              {c.policy}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-zinc-500 text-xs font-medium">
                            {c.lastSeen}
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="p-2 text-zinc-700 hover:text-white transition-colors bg-transparent hover:bg-zinc-800 rounded-lg">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* --- CLIENT DETAIL VIEW (MINIMAL REVISION) --- */}
          {activeTab === 'clients' && selectedClient && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
              
              {/* Minimal Header */}
              <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                    {selectedClient.type === 'Hardware' ? <Cpu size={24} /> : <Monitor size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{selectedClient.identifier}</h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-1.5"><Shield size={10} className="text-emerald-500" /> {selectedClient.policy}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                      <span>{selectedClient.protocol}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                      <span>{selectedClient.ip}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 border-l border-zinc-800 pl-6 h-10">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Status</p>
                    <StatusBadge status={selectedClient.status} />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Latency</p>
                    <p className="text-xs font-bold text-emerald-400">12ms</p>
                  </div>
                  <button className="p-2 text-zinc-600 hover:text-white transition-colors bg-zinc-900 rounded-lg border border-zinc-800">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Minimal Console Section */}
              <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl flex flex-col h-[550px] overflow-hidden shadow-xl">
                <div className="p-3 bg-[#151515] border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Messaging Feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-[9px] font-black text-zinc-600 hover:text-white uppercase flex items-center gap-1 transition-colors">
                      <Trash2 size={12} /> Clear
                    </button>
                    <button className="text-[9px] font-black text-zinc-600 hover:text-white uppercase flex items-center gap-1 transition-colors">
                      <Download size={12} /> Export
                    </button>
                  </div>
                </div>

                {/* Console Log Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px] bg-[#0F0F0F]/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-4 py-1 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 px-2 rounded">
                      <span className="text-zinc-600 w-16 shrink-0">[{msg.timestamp}]</span>
                      <span className={`w-16 shrink-0 font-black tracking-tighter uppercase text-center ${msg.type === 'uplink' ? 'text-zinc-500' : 'text-emerald-500/80'}`}>
                        {msg.type}
                      </span>
                      <span className="text-zinc-400 break-all">{msg.payload}</span>
                    </div>
                  ))}
                </div>

                {/* Simplified Input Area */}
                <div className="p-4 bg-[#151515] border-t border-zinc-800">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Send command to client..." 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-xl py-3 pl-4 pr-16 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500/30 transition-colors font-mono placeholder:text-zinc-700"
                    />
                    <button 
                      onClick={sendMessage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 transition-all active:scale-95"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- POLICIES VIEW --- */}
          {activeTab === 'policies' && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Policies" value={policies.filter(p => p.status === 'Active').length} icon={Shield} colorClass="bg-emerald-500/20 text-emerald-400" />
                <StatCard title="Enrolled" value="143" icon={Users} colorClass="bg-blue-500/20 text-blue-400" />
                <StatCard title="Manual Checks" value={policies.filter(p => !p.autoApprove).length} icon={Zap} colorClass="bg-amber-500/20 text-amber-400" />
                <StatCard title="Limit" value="250" icon={Lock} colorClass="bg-zinc-500/20 text-zinc-400" />
              </div>

              {/* Table Section */}
              <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#151515] border-b border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input 
                        type="text" placeholder="Search policy name or PIN..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 font-medium"
                      />
                    </div>
                    <button className="p-2 bg-[#0F0F0F] border border-zinc-800 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                      <Filter size={16} />
                    </button>
                  </div>
                  <button onClick={() => setShowCreateModal(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter flex items-center gap-2 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)]">
                    <Plus size={16} /> New Policy
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#151515] text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4">Policy Configuration</th>
                        <th className="px-6 py-4 text-center">Enrollment PIN</th>
                        <th className="px-6 py-4">Usage</th>
                        <th className="px-6 py-4 text-center">Auto-Enroll</th>
                        <th className="px-6 py-4 text-center">Identifiers</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm">
                      {filteredPolicies.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${p.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`}></div>
                              <div>
                                <p className="font-bold text-white text-sm">{p.name}</p>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-0.5">Expires: {p.expiry}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-black border border-zinc-800 rounded font-mono text-xs group-hover:border-emerald-500/30 transition-all">
                              <span className="text-emerald-500 font-bold tracking-widest">{p.pin}</span>
                              <button className="text-zinc-700 hover:text-emerald-400 transition-colors"><Clipboard size={12} /></button>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5 w-36">
                              <div className="flex justify-between text-[10px] text-zinc-500 font-black uppercase">
                                <span>{p.enrolled} Enrolled</span>
                                <span>{p.maxClients} Max</span>
                              </div>
                              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${p.status === 'Full' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(p.enrolled / p.maxClients) * 100}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {p.autoApprove ? <Zap size={14} className="text-emerald-500 mx-auto" /> : <Clock size={14} className="text-zinc-600 mx-auto" />}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {p.allowedIdentifiers?.length > 0 ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/50 border border-zinc-700 rounded text-[10px] text-zinc-400 font-bold">
                                <Lock size={10} /> {p.allowedIdentifiers.length} Restricted
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-700 font-medium">Open Access</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-xs font-bold"><StatusBadge status={p.status} /></td>
                          <td className="px-6 py-5 text-right"><button className="text-zinc-700 hover:text-white transition-colors"><MoreVertical size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* --- APPROVALS VIEW --- */}
          {activeTab === 'approvals' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]">
               <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                 <Clock size={20} />
               </div>
               <div>
                 <h4 className="text-amber-500 font-bold text-sm">Pending Authorizations</h4>
                 <p className="text-xs text-amber-500/80">These clients have provided a valid PIN but require manual approval based on policy settings.</p>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {/* Reusing existing pending logic */}
                <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-500/5">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                    <Zap size={24} />
                  </div>
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <h4 className="text-white font-bold flex items-center gap-2 justify-center md:justify-start">
                      esp8266-new-04
                      <StatusBadge status="Pending" />
                    </h4>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1.5"><Shield size={12} /> Policy: <span className="text-emerald-400">London_Office_App</span></span>
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> Requested: 2m ago</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> IP: 192.168.1.55</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-zinc-800 hover:border-red-500/30">Reject</button>
                    <button className="px-6 py-2 rounded-lg text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-lg active:scale-95 shadow-emerald-500/20">Approve Enrollment</button>
                  </div>
                </div>
             </div>
           </div>
          )}
          
          {/* --- LOGS VIEW --- */}
          {activeTab === 'logs' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             
             {/* Toolbar & Filter */}
             <div className="bg-[#1A1A1A] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#151515] border-b border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input 
                        type="text" placeholder="Search logs (event, source, details)..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 font-medium"
                      />
                    </div>
                    <button className="p-2 bg-[#0F0F0F] border border-zinc-800 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                      <Filter size={16} />
                    </button>
                    <button className="p-2 bg-[#0F0F0F] border border-zinc-800 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#151515] text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Level</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Event</th>
                        <th className="px-6 py-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-6 py-5 text-zinc-500 text-xs font-mono">{log.timestamp}</td>
                          <td className="px-6 py-5"><StatusBadge status={log.level} /></td>
                          <td className="px-6 py-5 text-xs font-bold text-zinc-400">{log.source}</td>
                          <td className="px-6 py-5 text-sm font-bold text-white">{log.event}</td>
                          <td className="px-6 py-5 text-xs text-zinc-400">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
             </div>
          )}
        </div>
      </main>

      {/* --- Create Policy Modal --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#1A1A1A] border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">Create Enrollment Policy</h3>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Security Blueprint</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreatePolicy} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">Policy Name</label>
                  <input autoFocus required type="text" placeholder="e.g. Warehouse_ESP_Batch_A" value={newPolicy.name} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Custom PIN</label>
                    <input type="text" placeholder="AUTO-GEN" maxLength={12} value={newPolicy.customPin} onChange={e => setNewPolicy({...newPolicy, customPin: e.target.value})} className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Max Clients</label>
                    <input type="number" value={newPolicy.maxClients} onChange={e => setNewPolicy({...newPolicy, maxClients: parseInt(e.target.value) || 0})} className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Allowed Identifiers</label>
                  <input type="text" placeholder="esp32-v1, app-ios-prod..." value={newPolicy.allowedIdentifiersStr} onChange={e => setNewPolicy({...newPolicy, allowedIdentifiersStr: e.target.value})} className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Expiry Date</label>
                    <input type="date" value={newPolicy.expiry} onChange={e => setNewPolicy({...newPolicy, expiry: e.target.value})} className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-zinc-400" />
                  </div>
                  <div className="bg-[#0F0F0F] px-4 py-2.5 rounded-xl border border-zinc-800 flex items-center justify-between self-end h-[50px]">
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-white uppercase tracking-tighter">Auto-Enroll</span></div>
                    <button type="button" onClick={() => setNewPolicy({...newPolicy, autoApprove: !newPolicy.autoApprove})} className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-1 ${newPolicy.autoApprove ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 border border-zinc-700'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow-lg transition-transform ${newPolicy.autoApprove ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors border border-zinc-700">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-[0.98]">Create Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}