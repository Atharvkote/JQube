import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
  // Desktop sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans selection:bg-[#FF3B3B] selection:text-white">
      {/* Navbar at top (64px) */}
      <Navbar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main container flex: Sidebar + Content Area */}
      <div className="flex flex-1 min-w-0">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <motion.main
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar bg-[#09090B]"
        >
          <div className="max-w-[1400px] mx-auto w-full space-y-8">
            {children || <Outlet />}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
