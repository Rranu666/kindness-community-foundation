import { useState } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useProfiles, useUpdateProfile, useDeleteProfile } from '@/hooks/useProfiles';
import { useDonations } from '@/hooks/useDonations';
import { useVolunteerHours } from '@/hooks/useVolunteer';
import { toast } from 'sonner';
import { format } from 'date-fns';

function EditModal({ user, onClose }) {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [role, setRole] = useState(user.role || 'member');
  const update = useUpdateProfile();

  const handleSave = async () => {
    await update.mutateAsync({ id: user.id, updates: { full_name: fullName, role } });
    toast.success('User updated');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Edit User</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="pt-1">
            <p className="text-xs text-gray-400">Email: {user.email}</p>
            <p className="text-xs text-gray-400">Joined: {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '—'}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={update.isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityDrawer({ user, onClose, donations, hours }) {
  const userDonations = donations.filter(d => d.user_email === user.email);
  const userHours = hours.filter(h => h.user_email === user.email || h.user === user.id);
  const totalDonated = userDonations.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const totalHours = userHours.reduce((s, h) => s + (parseFloat(h.hours) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="w-64 bg-black/40 flex-1" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-xl overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">User Activity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-700">${totalDonated.toFixed(0)}</p>
            <p className="text-xs text-green-600">Total Donated</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-purple-700">{totalHours.toFixed(0)}h</p>
            <p className="text-xs text-purple-600">Volunteer Hours</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Donations</h4>
          {userDonations.length === 0 ? <p className="text-sm text-gray-400">No donations</p> : (
            <ul className="space-y-2">
              {userDonations.slice(0, 5).map(d => (
                <li key={d.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{d.cause || 'General'}</span>
                  <span className="font-medium text-green-700">${d.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: donations = [] } = useDonations();
  const { data: hours = [] } = useVolunteerHours();
  const deleteProfile = useDeleteProfile();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState(null);
  const [activityUser, setActivityUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = profiles.filter(p => {
    const matchSearch = !search || p.email?.toLowerCase().includes(search.toLowerCase()) || p.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDelete = async () => {
    await deleteProfile.mutateAsync(deleteTarget.id);
    toast.success('User deleted');
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${profiles.length} total users`} />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No users found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                      {p.full_name?.[0]?.toUpperCase() || p.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.role} /></td>
                <td className="px-4 py-3 text-gray-500">{p.created_at ? format(new Date(p.created_at), 'MMM d, yyyy') : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActivityUser(p)} className="text-xs text-blue-600 hover:underline">Activity</button>
                    <button onClick={() => setEditUser(p)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} />}
      {activityUser && <ActivityDrawer user={activityUser} onClose={() => setActivityUser(null)} donations={donations} hours={hours} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.full_name || deleteTarget?.email}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteProfile.isPending}
      />
    </div>
  );
}
