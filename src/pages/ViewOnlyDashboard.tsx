import React from 'react';
import Index from './Index';

const ViewOnlyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-blue-800 font-medium">
            Anda memiliki akses terbatas — transaksi hanya dapat dilihat (read-only)
          </p>
        </div>
        <Index isAdmin={false} />
      </div>
    </div>
  );
};

export default ViewOnlyDashboard;
