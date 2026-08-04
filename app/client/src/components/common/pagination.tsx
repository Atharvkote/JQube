// JQube — Pagination Component (TSX)

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-end pt-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${currentPage === i + 1
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
          className="px-3 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
