import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-xl">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Access Denied</h1>
        <p className="text-gray-600">
          You do not have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
