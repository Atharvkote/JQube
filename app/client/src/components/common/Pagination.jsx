import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[#FF3B3B]/15 pt-4 mt-4 text-xs text-[#A1A1AA]">
      <div className="font-semibold text-white">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3.5 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl font-semibold text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all ${
              currentPage === i + 1
                ? 'bg-[#FF3B3B] text-white shadow-md shadow-[#FF3B3B]/20'
                : 'bg-[#0F1117] border border-[#FF3B3B]/15 text-[#A1A1AA] hover:text-white'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3.5 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl font-semibold text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
