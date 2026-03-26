import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Calendar, Clock, Award, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

export default function VolunteerPersonalDashboard() {
  const [user, setUser] = useState(null);
  const [signups, setSignups] = useState([]);
  const [hours, setHours] = useState([]);
  const [badges, setBadges] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (!currentUser) return;

        // Fetch volunteer signups
        const userSignups = await base44.entities.VolunteerSignup.filter({
          user_email: currentUser.email,
        });
        setSignups(userSignups);

        // Fetch volunteer hours
        const userHours = await base44.entities.VolunteerHours.filter({
          user_email: currentUser.email,
        });
        setHours(userHours);

        // Fetch badges
        const userBadges = await base44.entities.VolunteerBadge.filter({
          user_email: currentUser.email,
        });
        setBadges(userBadges);

        // Fetch assigned tasks
        const assignedTasks = await base44.entities.TeamTask.filter({
          assigned_to_email: currentUser.email,
        });
        setTasks(assignedTasks);
      } catch (error) {
        // silently ignore — loading state handles feedback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const totalHours = hours.reduce((sum, h) => sum + (h.hours || 0), 0);
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const activeTasks = tasks.filter((t) => t.status !== "completed").length;

    return { totalHours, completedTasks, activeTasks, totalBadges: badges.length };
  }, [hours, tasks, badges]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== "completed")
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      })
      .slice(0, 5);
  }, [tasks]);

  const recentActivity = useMemo(() => {
    return hours
      .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date))
      .slice(0, 6);
  }, [hours]);

  const badgeInfo = {
    first_steps: { label: "First Steps", hours: 5, icon: "🌱" },
    champion: { label: "Champion", hours: 25, icon: "⭐" },
    leader: { label: "Leader", hours: 50, icon: "👑" },
    ambassador: { label: "Ambassador", hours: 100, icon: "🚀" },
    lifetime: { label: "Lifetime", hours: 250, icon: "💎" },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-slate-600 mt-2">Track your volunteer journey and impact</p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalHours}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.completedTasks}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.activeTasks}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Badges Earned</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalBadges}</p>
              </div>
              <Award className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Tasks */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Upcoming Tasks</h2>
              </div>

              {upcomingTasks.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No upcoming tasks assigned</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      whileHover={{ x: 4 }}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-3 mt-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                task.status === "todo"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {task.status === "todo" ? "To Do" : "In Progress"}
                            </span>
                            {task.priority && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.due_date && (
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-xs text-slate-500">Due</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Badges Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">Badges</h2>
              </div>

              <div className="space-y-3">
                {Object.entries(badgeInfo).map(([key, info]) => {
                  const earned = badges.some((b) => b.badge_type === key);
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        earned
                          ? "border-amber-300 bg-amber-50"
                          : "border-slate-200 bg-slate-50 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">
                            {info.label}
                          </p>
                          <p className="text-xs text-slate-600">{info.hours}h required</p>
                        </div>
                        {earned && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No logged hours yet</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{activity.initiative_name}</p>
                      {activity.description && (
                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4 text-right">
                      <p className="text-2xl font-bold text-slate-900">{activity.hours}</p>
                      <p className="text-xs text-slate-500">hours</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}