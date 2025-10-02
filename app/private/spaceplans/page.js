// Enhanced UI code with TailwindCSS and @heroicons/react support
import React from 'react';
import { IconName } from '@heroicons/react/outline';

const SpacePlansPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Space Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Example space plan card */}
                <div className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <IconName className="h-6 w-6 text-blue-500" />
                    <h2 className="text-xl font-semibold">Plan A</h2>
                    <p className="text-gray-700">Description of Plan A.</p>
                </div>
            </div>
        </div>
    );
};

export default SpacePlansPage;