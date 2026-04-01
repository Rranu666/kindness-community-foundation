import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, MessageSquare, Mail, FileText, Megaphone,
  Users, User, Sparkles, Bell, Globe, LogOut, Menu, X,
  CheckSquare, Plus, Heart
} from 'lucide-react';
import SocialWall from '@/components/synergy/SocialWall';
import GroupChat from '@/components/synergy/GroupChat';
import DirectMessages from '@/components/synergy/DirectMessages';
import AskKindra from '@/components/synergy/AskKindra';
import KindraFloat from '@/components/synergy/KindraFloat';

function Avatar({ name, size = 32 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['from-rose-500 to-pink-500', 'from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wall', label: 'Social Wall', icon: Globe },
  { id: 'messages', label: 'Team Chat', icon: MessageSquare },
  { id: 'dm', label: 'Direct Messages', icon: Mail },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'directory', label: 'Team Directory', icon: Users },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'ai', label: 'Ask Kindra', icon: Sparkles },
];

export default function TeamPortal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { navigate('/jointeam'); return; }
      setCurrentUser(u);
      setAuthChecked(true);
    }).catch(() => navigate('/jointeam'));
  }, [navigate]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list(),
    enabled: authChecked,
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => base44.entities.TeamAnnouncement.list('-created_date'),
    enabled: authChecked,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.TeamTask.list('-created_date'),
    enabled: authChecked,
  });
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.TeamDocument.list(),
    enabled: authChecked,
  });
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list(),
    enabled: authChecked,
  });

  const createTaskMutation = useMutation({
    mutationFn: () => base44.entities.TeamTask.create({
      title: newTask.title,
      description: newTask.description,
      created_by_email: currentUser.email,
      created_by_name: currentUser.full_name,
      task_type: 'team',
      status: 'todo',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskModal(false);
      setNewTask({ title: '', description: '' });
    },
    onError: () => {
      alert('Failed to create task. Please try again.');
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TeamTask.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    onError: () => {
      alert('Failed to update task status. Please try again.');
    },
  });

  const markNotifRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => { /* silently ignore notification read failures */ },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
      <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
    </div>
  );

  const pageTitles = {
    dashboard: 'Dashboard', wall: 'Social Wall', messages: 'Team Chat',
    dm: 'Direct Messages', tasks: 'Tasks', documents: 'Documents',
    announcements: 'Announcements', directory: 'Team Directory',
    profile: 'My Profile', ai: 'Ask Kindra',
  };

  const bg = '#030712';
  const surface = 'rgba(255,255,255,0.03)';
  const border = 'rgba(255,255,255,0.07)';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, color: 'white', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:relative z-50 lg:z-auto flex flex-col h-full transition-transform duration-300 border-r ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: 240, minWidth: 240, background: 'rgba(3,7,18,0.95)', borderColor: border, backdropFilter: 'blur(20px)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-sm leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Kindness<br />Synergy Hub</span>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User */}
        {currentUser && (
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: border }}>
            <Avatar name={currentUser.full_name} size={34} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{currentUser.full_name}</div>
              <div className="text-xs text-white/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-left text-sm font-medium ${active ? 'text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                style={active ? { background: 'rgba(244,63,94,0.12)', color: '#f43f5e' } : {}}>
                <Icon className="w-4 h-4 flex-shrink-0" style={active ? { color: '#f43f5e' } : {}} />
                {item.label}
                {item.id === 'ai' && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>AI</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t space-y-2" style={{ borderColor: border }}>
          <Link to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-all w-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Globe className="w-4 h-4 text-rose-400 flex-shrink-0" />
            Back to Website
          </Link>
          <button onClick={() => base44.auth.logout('/')} className="flex items-center gap-2 text-xs text-white/30 hover:text-rose-400 transition-colors px-2">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b flex-shrink-0" style={{ borderColor: border, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)' }}>
          <button className="lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-black text-white text-base flex-1" style={{ fontFamily: "'Syne', sans-serif" }}>{pageTitles[page]}</h1>
          <div className="flex items-center gap-2">
            <Link to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              Website
            </Link>
            <button onClick={() => setPage('notifications')} className="relative w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: '#f43f5e' }}>{unreadCount}</span>}
            </button>
            <button onClick={() => setTaskModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {/* DASHBOARD */}
          {page === 'dashboard' && (
            <div className="h-full overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl p-5 border" style={{ background: 'rgba(244,63,94,0.06)', borderColor: 'rgba(244,63,94,0.2)' }}>
                <h2 className="text-white font-black text-xl mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Welcome back, {currentUser?.full_name?.split(' ')[0]}! 👋
                </h2>
                <p className="text-white/50 text-sm">You're part of the Kindness Synergy Hub. Keep spreading kindness!</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Tasks', value: tasks.length, sub: `${tasks.filter(t => t.status === 'todo').length} pending`, color: '#f43f5e' },
                  { label: 'Team Members', value: teamMembers.length, sub: 'in directory', color: '#6366f1' },
                  { label: 'Documents', value: documents.length, sub: 'uploaded', color: '#10b981' },
                  { label: 'Announcements', value: announcements.length, sub: 'total', color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-4 border" style={{ background: surface, borderColor: border }}>
                    <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                    <div className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</div>
                    <div className="text-xs text-white/30 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
              {announcements.length > 0 && (
                <div>
                  <h3 className="text-white font-bold text-sm mb-3">Latest Announcements</h3>
                  <div className="space-y-2">
                    {announcements.slice(0, 3).map(ann => (
                      <div key={ann.id} className="flex items-start gap-3 rounded-xl p-4 border" style={{ background: surface, borderColor: border }}>
                        <Megaphone className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-semibold text-sm">{ann.title}</div>
                          <div className="text-white/40 text-xs mt-0.5 line-clamp-1">{ann.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm">Recent Tasks</h3>
                  <button onClick={() => setPage('tasks')} className="text-xs text-rose-400 hover:text-rose-300">View all</button>
                </div>
                {tasks.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-center gap-3 rounded-xl p-3 border mb-2" style={{ background: surface, borderColor: border }}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === 'completed' ? 'bg-emerald-400' : task.status === 'in_progress' ? 'bg-amber-400' : 'bg-white/20'}`} />
                    <span className="text-white/70 text-sm flex-1 truncate">{task.title}</span>
                    <span className="text-xs text-white/30 capitalize">{task.status?.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SOCIAL WALL */}
          {page === 'wall' && (
            <div className="h-full overflow-y-auto">
              <SocialWall currentUser={currentUser} />
            </div>
          )}

          {/* GROUP CHAT */}
          {page === 'messages' && (
            <div className="h-full">
              <GroupChat currentUser={currentUser} />
            </div>
          )}

          {/* DMs */}
          {page === 'dm' && (
            <div className="h-full">
              <DirectMessages currentUser={currentUser} />
            </div>
          )}

          {/* AI */}
          {page === 'ai' && (
            <div className="h-full">
              <AskKindra currentUser={currentUser} />
            </div>
          )}

          {/* TASKS */}
          {page === 'tasks' && (
            <div className="h-full overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-3">
                  {['todo', 'in_progress', 'completed'].map(s => (
                    <span key={s} className="text-xs text-white/40">
                      <span className={`font-bold ${s === 'todo' ? 'text-white/60' : s === 'in_progress' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {tasks.filter(t => t.status === s).length}
                      </span> {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <button onClick={() => setTaskModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center text-white/30 py-16 text-sm">No tasks yet. Create one to get started!</div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="rounded-2xl p-4 border flex items-start gap-4" style={{ background: surface, borderColor: border }}>
                    <select value={task.status} onChange={e => updateTaskStatus.mutate({ id: task.id, status: e.target.value })}
                      className="text-xs rounded-lg px-2 py-1 border-none outline-none font-semibold cursor-pointer"
                      style={{ background: task.status === 'completed' ? 'rgba(16,185,129,0.15)' : task.status === 'in_progress' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)', color: task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#f59e0b' : 'rgba(255,255,255,0.5)' }}>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Done</option>
                    </select>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-white/30' : 'text-white'}`}>{task.title}</div>
                      {task.description && <div className="text-xs text-white/40 mt-1">{task.description}</div>}
                      <div className="text-xs text-white/25 mt-1">by {task.created_by_name}</div>
                    </div>
                    {task.priority && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: task.priority === 'high' ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.07)', color: task.priority === 'high' ? '#f43f5e' : 'rgba(255,255,255,0.4)' }}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {page === 'documents' && (
            <div className="h-full overflow-y-auto p-6 space-y-3">
              {documents.length === 0 ? (
                <div className="text-center text-white/30 py-16 text-sm">No documents uploaded yet.</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="rounded-2xl p-4 border flex items-start gap-4" style={{ background: surface, borderColor: border }}>
                    <FileText className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{doc.title}</div>
                      {doc.description && <div className="text-xs text-white/40 mt-1">{doc.description}</div>}
                      <div className="text-xs text-white/25 mt-1">by {doc.uploaded_by_name}</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>{doc.category}</span>
                    {doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-400 hover:text-rose-300">View</a>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {page === 'announcements' && (
            <div className="h-full overflow-y-auto p-6 space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center text-white/30 py-16 text-sm">No announcements yet.</div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="rounded-2xl p-5 border" style={{ background: surface, borderColor: ann.is_pinned ? 'rgba(244,63,94,0.25)' : border }}>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={ann.author_name} size={36} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ann.title}</span>
                          {ann.is_pinned && <span className="text-xs text-rose-400">📌</span>}
                          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${ann.priority === 'high' ? 'bg-red-500/15 text-red-400' : ann.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-white/40'}`}>
                            {ann.priority}
                          </span>
                        </div>
                        <div className="text-xs text-white/30">{ann.author_name}</div>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* DIRECTORY */}
          {page === 'directory' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.length === 0 ? (
                  <div className="text-center text-white/30 py-16 text-sm col-span-3">No team members found.</div>
                ) : (
                  teamMembers.map(m => (
                    <div key={m.id} className="rounded-2xl p-4 border flex items-start gap-3 hover:border-rose-500/20 transition-all" style={{ background: surface, borderColor: border }}>
                      <Avatar name={m.full_name} size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm">{m.full_name}</div>
                        <div className="text-xs text-rose-400 font-semibold mt-0.5">{m.department || 'Team Member'}</div>
                        <div className="text-xs text-white/30 mt-0.5 truncate">{m.email}</div>
                        {m.about && <div className="text-xs text-white/40 mt-2 line-clamp-2">{m.about}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {page === 'profile' && currentUser && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-lg mx-auto">
                <div className="rounded-2xl overflow-hidden border" style={{ background: surface, borderColor: border }}>
                  <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(236,72,153,0.1))' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 80% at 30% 50%, rgba(244,63,94,0.15) 0%, transparent 70%)' }} />
                  </div>
                  <div className="px-6 pb-6 -mt-8">
                    <Avatar name={currentUser.full_name} size={64} />
                    <h2 className="text-white font-black text-2xl mt-3" style={{ fontFamily: "'Syne', sans-serif" }}>{currentUser.full_name}</h2>
                    <p className="text-white/40 text-sm">{currentUser.email}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-3 rounded-xl px-4 py-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: border }}>
                        <span className="text-xs text-white/30 w-16">Role</span>
                        <span className="text-sm font-semibold text-white capitalize">{currentUser.role || 'team_member'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {page === 'notifications' && (
            <div className="h-full overflow-y-auto p-6 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center text-white/30 py-16 text-sm">No notifications yet.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => !n.is_read && markNotifRead.mutate(n.id)}
                    className={`rounded-2xl p-4 border cursor-pointer transition-all hover:border-rose-500/20 ${n.is_read ? 'opacity-50' : ''}`}
                    style={{ background: surface, borderColor: n.is_read ? border : 'rgba(244,63,94,0.2)' }}>
                    <div className="font-semibold text-white text-sm">{n.title}</div>
                    <div className="text-white/40 text-xs mt-1">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Kindra Float — visible from every section */}
      {page !== 'ai' && (
        <KindraFloat
          currentUser={currentUser}
          onOpenFull={() => setPage('ai')}
        />
      )}

      {/* Task Modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" style={{ backdropFilter: 'blur(8px)' }} onClick={() => setTaskModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 border" style={{ background: '#0d1117', borderColor: 'rgba(244,63,94,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-black text-lg mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>Create New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 font-semibold mb-1.5 block">Task Title *</label>
                <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white border outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: border }} />
              </div>
              <div>
                <label className="text-xs text-white/40 font-semibold mb-1.5 block">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Add details..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white border outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: border }} rows={3} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setTaskModal(false)} className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white border border-white/10 transition-all">Cancel</button>
                <button onClick={() => newTask.title.trim() && createTaskMutation.mutate()} disabled={!newTask.title.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}