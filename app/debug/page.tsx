'use client';

import { useState } from 'react';
import { resetAdminUser, clearAllData, getUsers } from '@/lib/localStorage';
import { loginWithCredentials } from '@/lib/auth';

export default function DebugPage() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const handleResetAdmin = () => {
    resetAdminUser();
    setMessage('Admin user has been reset with proper password hash');
    loadUsers();
  };

  const handleClearAll = () => {
    clearAllData();
    setMessage('All data cleared');
    setUsers([]);
  };

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
  };

  const testAdminLogin = async () => {
    try {
      const result = await loginWithCredentials({
        email: 'admin@blockvote.com',
        password: 'admin123'
      });
      
      if (result.success) {
        setMessage('✅ Admin login test PASSED');
      } else {
        setMessage(`❌ Admin login test FAILED: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Admin login test ERROR: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Debug Tools
        </h1>
        
        {message && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-blue-800 dark:text-blue-300">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Tools */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Admin Tools
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleResetAdmin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Reset Admin User
              </button>
              <button
                onClick={testAdminLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Test Admin Login
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Admin Credentials:</strong></p>
                <p>Email: admin@blockvote.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>

          {/* Data Tools */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Tools
            </h2>
            <div className="space-y-3">
              <button
                onClick={loadUsers}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Load All Users
              </button>
              <button
                onClick={handleClearAll}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        {users.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              All Users ({users.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Password Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                        {user.passwordHash.length > 20 ? `${user.passwordHash.substring(0, 20)}...` : user.passwordHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
