import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { User } from '../types/crm';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Trash2,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userRight: z.coerce.number().int().min(0).max(1),
});

type UserFormData = z.infer<typeof userSchema>;

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser, isSuperAdmin } = useAuth();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userRight: 0,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => api.createUser(data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast(`User "${newUser.name}" created successfully`);
      setIsAddUserModalOpen(false);
      reset();
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to create user', 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast('User deleted successfully');
      setDeletingUser(null);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to delete user', 'error');
    },
  });

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center">
        <ShieldCheck className="w-10 h-10 mx-auto text-amber-600 mb-2" />
        <h3 className="font-bold text-lg">Super Admin Privilege Required</h3>
        <p className="text-sm text-amber-700 mt-1 max-w-md mx-auto">
          User management is restricted to Super Admin accounts (<code>userRight = 1</code>). Please sign in as a Super Admin to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Rights Management</h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Super Admin Control Panel — Add new users and assign role privileges
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Loading user accounts...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-rose-600 text-center text-sm">
            Error loading users: {(error as Error)?.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">User Privilege (userRight)</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users?.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {usr.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{usr.name}</span>
                        {usr.id === currentUser?.id && (
                          <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{usr.email}</td>

                    <td className="py-3.5 px-4">
                      {usr.userRight === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Shield className="w-3 h-3 mr-1 text-indigo-600" />
                          Super Admin (userRight = 1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <UserIcon className="w-3 h-3 mr-1 text-slate-500" />
                          Normal User (userRight = 0)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {usr.createdAt ? format(new Date(usr.createdAt), 'MMM d, yyyy') : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeletingUser(usr)}
                        disabled={usr.id === currentUser?.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={usr.id === currentUser?.id ? 'Cannot delete logged in account' : 'Delete User'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <Modal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          title="Add New User Account"
          subtitle="Create credentials and assign user right privileges"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maria Garcia"
                {...register('name')}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. maria@crm.com"
                {...register('email')}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                User Right Level <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('userRight')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={0}>0 — Normal User (Sales Rep / Agent)</option>
                <option value={1}>1 — Super Admin (Full Control & User Management)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createUserMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Create User</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Dialog */}
      {deletingUser && (
        <ConfirmDialog
          isOpen={Boolean(deletingUser)}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => deleteUserMutation.mutate(deletingUser.id)}
          title="Delete User Account"
          message={`Are you sure you want to delete user account "${deletingUser.name}" (${deletingUser.email})?`}
          confirmText="Delete User"
          isLoading={deleteUserMutation.isPending}
        />
      )}
    </div>
  );
};
