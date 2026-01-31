import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users } from 'lucide-react';

export const UsersPage = () => {
  return (
    <Layout>
      <div data-testid="users-page">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-600 mt-1">Manage system users and roles</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">User Management Coming Soon</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Advanced user management features including user creation, role assignment, 
                permissions management, and activity monitoring will be available in the next update.
              </p>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md max-w-md mx-auto">
                <p className="text-sm text-blue-900">
                  <strong>Current Capability:</strong> Users can self-register through the registration page. 
                  Admins can manage roles during the registration process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};