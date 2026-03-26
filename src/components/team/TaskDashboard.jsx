import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Circle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import DocumentAttachments from './DocumentAttachments';

export default function TaskDashboard({ user }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!user) return [];
      const allTasks = await base44.entities.TeamTask.list();
      return allTasks.filter(t => t.assigned_to_email === user.email || t.created_by_email === user.email);
    },
    enabled: !!user,
    initialData: [],
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamTask.update(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    setIsUploading(true);

    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        const attachment = {
          file_url: response.file_url,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        };
        setAttachedFiles(prev => [...prev, attachment]);

        // Save to database
        await base44.entities.TaskAttachment.create({
          task_id: selectedTask.id,
          file_url: attachment.file_url,
          file_name: attachment.file_name,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          uploaded_by_email: user.email,
        });
      } catch (error) {
        // silently ignore upload error
      }
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Get upcoming deadlines (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = tasks
    .filter(t => t.due_date && new Date(t.due_date) > today && new Date(t.due_date) <= nextWeek && t.status !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  // Chart data
  const statusChartData = [
    { status: 'Todo', count: stats.todo, fill: '#64748b' },
    { status: 'In Progress', count: stats.inProgress, fill: '#3b82f6' },
    { status: 'Completed', count: stats.completed, fill: '#10b981' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-slate-600';
      case 'in_progress': return 'bg-blue-600';
      case 'completed': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={18} className="text-green-500" />;
      case 'in_progress': return <Clock size={18} className="text-blue-500" />;
      default: return <Circle size={18} className="text-slate-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Task Dashboard</h1>
          <p className="text-blue-50">Track your progress and stay on top of deadlines</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
          <p className="text-slate-400 text-sm mb-1">Total Tasks</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
          <p className="text-slate-400 text-sm mb-1">To Do</p>
          <p className="text-3xl font-bold text-slate-400">{stats.todo}</p>
        </div>
        <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
          <p className="text-slate-400 text-sm mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
          <p className="text-slate-400 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="rounded-xl p-8 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6">Completion Rate</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-300">{completionRate}% Complete</p>
            <p className="text-3xl font-bold text-white">{completionRate}%</p>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="status" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar size={20} /> Upcoming Deadlines
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-semibold flex-1">{task.title}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">
                    {isOverdue(task.due_date) ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} /> Overdue
                      </span>
                    ) : (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskMutation.mutate({ id: task.id, status: 'completed' });
                    }}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-all"
                  >
                    Mark Complete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-6">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* All Tasks List */}
      <div className="rounded-xl p-6 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-6">All Tasks</h2>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskListItem key={task.id} task={task} />)
          ) : (
            <p className="text-slate-400 text-center py-6">No tasks assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline TaskListItem component
const TaskListItem = ({ task }) => (
  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon(task.status)}
          <p className="text-white font-semibold">{task.title}</p>
          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <p className="text-slate-400 text-sm ml-6">{task.description}</p>
        {task.due_date && (
          <p className="text-slate-500 text-sm ml-6 mt-1">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {task.status !== 'completed' && (
          <>
            {task.status === 'todo' && (
              <button
                onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'in_progress' })}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all"
              >
                Start
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'completed' })}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-all"
              >
                Complete
              </button>
            )}
          </>
        )}
        {task.status === 'completed' && (
          <span className="text-xs bg-green-600 text-white px-3 py-1 rounded">Completed</span>
        )}
      </div>
    </div>
  </div>
);